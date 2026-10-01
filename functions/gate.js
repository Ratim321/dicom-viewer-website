/**
 * Cloudflare Pages Function: /gate
 * Bindings (dashboard or wrangler.toml):
 *   GATE_KV        — KV namespace
 *   GATE_PASSWORD  — secret / var
 */
const KEY = "license_gate";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

async function readGate(env) {
  if (!env.GATE_KV) return "yes";
  return ((await env.GATE_KV.get(KEY)) || "yes").trim().toLowerCase();
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method === "GET") {
    const value = await readGate(env);
    return new Response(value + "\n", {
      headers: { ...corsHeaders(), "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (request.method === "POST") {
    try {
      const data = await request.json();
      const password = env.GATE_PASSWORD || "DicomGate2026";
      if (data.password !== password) {
        return Response.json({ error: "Wrong password" }, { status: 401, headers: corsHeaders() });
      }
      const value = String(data.value || "").trim().toLowerCase();
      if (value !== "yes" && value !== "no") {
        return Response.json({ error: "value must be yes or no" }, { status: 400, headers: corsHeaders() });
      }
      if (!env.GATE_KV) {
        return Response.json(
          { error: "GATE_KV binding missing — add a KV namespace in Cloudflare Pages settings" },
          { status: 500, headers: corsHeaders() },
        );
      }
      await env.GATE_KV.put(KEY, value);
      return Response.json({ ok: true, value }, { headers: corsHeaders() });
    } catch (e) {
      return Response.json({ error: e.message || "Bad request" }, { status: 400, headers: corsHeaders() });
    }
  }

  return new Response("Method not allowed\n", { status: 405, headers: corsHeaders() });
}
