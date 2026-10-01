export default function Home() {
  const gateUrl =
    typeof window !== "undefined"
      ? `${window.location.origin.replace(/\/$/, "")}/gate`
      : "/gate";

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Native Windows · Hospital-ready</p>
        <h1>DicomViewer</h1>
        <p className="lede">
          A lightweight DICOM workstation for opening studies, measuring, archiving,
          and talking to PACS — without a heavy install stack.
        </p>
        <div className="cta-row">
          <a className="btn primary" href="#features">
            See features
          </a>
          <a className="btn ghost" href="/control">
            Manage license gate
          </a>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Built for daily radiology work</h2>
        <p className="section-note">Everything clinicians need on one fast desktop app.</p>
        <div className="feature-list">
          {[
            ["2D viewing & tools", "Window/level, pan, zoom, scroll, invert, presets, overlays, and multi-viewport layouts."],
            ["Measurements & annotations", "Distance, angle, ROI, arrows, and key images for reporting workflows."],
            ["Local archive", "Import from folder, CD/DVD, or USB. Search studies, open series, keep cases on disk."],
            ["PACS / DICOM network", "Query/Retrieve, C-ECHO test, AE configuration, and listener options for hospital PACS."],
            ["3D / MPR", "Multi-planar reconstruction and volume views when series support it."],
            ["Export", "Save viewport images and DICOM Secondary Capture for sharing and archiving."],
            ["L3D ultrasound", "Open BK-style L3D circular reconstructions alongside conventional DICOM."],
            ["Licensing control", "14-day PC-tied trial, paid unlock, and a remote yes/no gate you control from this site."],
          ].map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="workflow">
        <h2>How the license gate works</h2>
        <ol>
          <li>DicomViewer asks your gate URL on startup.</li>
          <li>
            If the response is <strong>yes</strong>, the app opens without a license prompt.
          </li>
          <li>
            If the response is <strong>no</strong>, the app requires the paid license key.
          </li>
          <li>
            You flip that value anytime from the <a href="/control">License gate</a> page.
          </li>
        </ol>
        <p className="endpoint-hint">
          App URL to configure:
          <br />
          <code>{gateUrl}</code>
        </p>
      </section>
    </main>
  );
}
