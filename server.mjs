import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const GATE_FILE = path.join(DATA_DIR, "gate.txt");
const PORT = Number(process.env.PORT || 8787);
const PASSWORD = process.env.GATE_PASSWORD || "DicomGate2026";

function ensureGateFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(GATE_FILE)) fs.writeFileSync(GATE_FILE, "yes\n", "utf8");
}

function readGate() {
  ensureGateFile();
  return fs.readFileSync(GATE_FILE, "utf8").trim().toLowerCase();
}

function writeGate(value) {
  ensureGateFile();
  const v = value.trim().toLowerCase();
  if (v !== "yes" && v !== "no") throw new Error("value must be yes or no");
  fs.writeFileSync(GATE_FILE, v + "\n", "utf8");
  return v;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".ico": "image/x-icon",
      ".txt": "text/plain; charset=utf-8",
      ".json": "application/json; charset=utf-8",
    }[ext] || "application/octet-stream"
  );
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function safeJoin(root, urlPath) {
  const cleaned = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const full = path.normalize(path.join(root, cleaned || "index.html"));
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  // CORS for local testing from other origins if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return send(res, 204, "");

  if (url.pathname === "/gate") {
    if (req.method === "GET") {
      return send(res, 200, readGate() + "\n", { "Content-Type": "text/plain; charset=utf-8" });
    }
    if (req.method === "POST") {
      try {
        const raw = await readBody(req);
        const data = JSON.parse(raw || "{}");
        if (data.password !== PASSWORD) {
          return send(res, 401, { error: "Wrong password" }, { "Content-Type": "application/json" });
        }
        const value = writeGate(String(data.value || ""));
        return send(res, 200, { ok: true, value }, { "Content-Type": "application/json" });
      } catch (e) {
        return send(
          res,
          400,
          { error: e.message || "Bad request" },
          { "Content-Type": "application/json" },
        );
      }
    }
    return send(res, 405, "Method not allowed\n", { "Content-Type": "text/plain" });
  }

  let filePath = safeJoin(PUBLIC, url.pathname === "/" ? "/index.html" : url.pathname);
  if (!filePath) return send(res, 403, "Forbidden");
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return send(res, 404, "Not found\n", { "Content-Type": "text/plain" });
  }
  return send(res, 200, fs.readFileSync(filePath), { "Content-Type": contentType(filePath) });
});

ensureGateFile();
server.listen(PORT, () => {
  console.log(`DicomViewer website listening on http://localhost:${PORT}`);
  console.log(`Features:  http://localhost:${PORT}/`);
  console.log(`Control:   http://localhost:${PORT}/control.html`);
  console.log(`Gate GET:  http://localhost:${PORT}/gate   (now: ${readGate()})`);
  console.log(`Password:  GATE_PASSWORD env (default DicomGate2026)`);
});
