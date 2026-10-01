import { useCallback, useEffect, useState } from "react";

export default function Control() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState("");

  const gateUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/\/$/, "")}/gate`
      : "/gate";

  const showMsg = (text, kind = "") => {
    setMsg(text);
    setMsgKind(kind);
  };

  const refresh = useCallback(async () => {
    showMsg("Loading…");
    try {
      const res = await fetch("/gate", { cache: "no-store" });
      const text = (await res.text()).trim().toLowerCase();
      setCurrent(text);
      showMsg("Loaded current gate value.", "ok");
    } catch {
      setCurrent("");
      showMsg("Could not read /gate — start the API (npm run dev) or deploy Functions.", "err");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setValue(value) {
    if (!password) {
      showMsg("Enter the admin password first.", "err");
      return;
    }
    showMsg("Saving…");
    try {
      const res = await fetch("/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMsg(data.error || "Save failed", "err");
        return;
      }
      const v = (data.value || value).toLowerCase();
      setCurrent(v);
      showMsg(`Gate set to ${v.toUpperCase()}.`, "ok");
    } catch {
      showMsg("Network error while saving.", "err");
    }
  }

  const pillClass =
    "pill " + (current === "yes" ? "yes" : current === "no" ? "no" : "unknown");

  return (
    <main className="control-main">
      <section className="control-card">
        <h1>License gate</h1>
        <p className="lede tight">
          DicomViewer reads this value on open. Set <strong>yes</strong> to allow without a
          key, or <strong>no</strong> to require a license.
        </p>

        <div className="status-row">
          <span className="label">Current value</span>
          <span className={pillClass}>{current || "…"}</span>
        </div>

        <label className="field">
          <span>Admin password</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="GATE_PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="cta-row">
          <button type="button" className="btn primary" onClick={() => setValue("yes")}>
            Set YES
          </button>
          <button type="button" className="btn danger" onClick={() => setValue("no")}>
            Set NO
          </button>
          <button type="button" className="btn ghost" onClick={refresh}>
            Refresh
          </button>
        </div>

        <p className={"msg" + (msgKind ? ` ${msgKind}` : "")} role="status">
          {msg}
        </p>

        <div className="endpoint-box">
          <span className="label">URL for the desktop app</span>
          <code>{gateUrl}</code>
          <p className="tiny">
            Response body is plain text: <code>yes</code> or <code>no</code>
          </p>
        </div>
      </section>
    </main>
  );
}
