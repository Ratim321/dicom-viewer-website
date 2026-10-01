const currentEl = document.getElementById("current");
const passwordEl = document.getElementById("password");
const msgEl = document.getElementById("msg");
const gateUrlEl = document.getElementById("gate-url");

const gateUrl = location.origin.replace(/\/$/, "") + "/gate";
gateUrlEl.textContent = gateUrl;

function setMsg(text, kind) {
  msgEl.textContent = text || "";
  msgEl.className = "msg" + (kind ? " " + kind : "");
}

function paint(value) {
  const v = (value || "").trim().toLowerCase();
  currentEl.textContent = v || "?";
  currentEl.className = "pill " + (v === "yes" ? "yes" : v === "no" ? "no" : "unknown");
}

async function refresh() {
  setMsg("Loading…");
  try {
    const res = await fetch("/gate", { cache: "no-store" });
    const text = (await res.text()).trim();
    paint(text);
    setMsg("Loaded current gate value.", "ok");
  } catch (e) {
    paint("");
    setMsg("Could not read /gate — is the server running?", "err");
  }
}

async function setValue(value) {
  const password = passwordEl.value;
  if (!password) {
    setMsg("Enter the admin password first.", "err");
    return;
  }
  setMsg("Saving…");
  try {
    const res = await fetch("/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Save failed", "err");
      return;
    }
    paint(data.value || value);
    setMsg("Gate set to " + (data.value || value).toUpperCase() + ".", "ok");
  } catch (e) {
    setMsg("Network error while saving.", "err");
  }
}

document.getElementById("btn-yes").addEventListener("click", () => setValue("yes"));
document.getElementById("btn-no").addEventListener("click", () => setValue("no"));
document.getElementById("btn-refresh").addEventListener("click", refresh);

refresh();
