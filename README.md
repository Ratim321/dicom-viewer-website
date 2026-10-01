# DicomViewer Website (React + Vite)

Product landing page + remote **yes / no** license gate for the desktop app.

## Routes

| URL | Purpose |
|-----|---------|
| `/` | Features (React) |
| `/control` | Set gate to yes / no |
| `/gate` | Plain-text `yes` or `no` for DicomViewer |

## Local development

```bash
npm install
npm run dev
```

- UI: http://localhost:5173  
- API (`/gate`): http://localhost:8787 (Vite proxies `/gate`)

Default password: `DicomGate2026`

## Production (Node)

```bash
npm run build
npm start
```

Serves `dist/` + `/gate` on `PORT` (default 8787).

## Deploy to Cloudflare Pages

1. Push this repo to GitHub (already: `Ratim321/dicom-viewer-website`).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (repo root)
4. After first deploy, open the project → **Settings**:
   - **Variables and Secrets** → add `GATE_PASSWORD` (Secret)
   - **Bindings** → **KV namespace** → Variable name `GATE_KV` → create/select a namespace
5. Redeploy so the binding applies.
6. Put this URL in DicomViewer (`license/remote_gate_url`):

```text
https://YOUR-PROJECT.pages.dev/gate
```

### CLI deploy (optional)

```bash
npm run build
npx wrangler pages deploy dist --project-name=dicom-viewer-website
```

Create KV: `npx wrangler kv namespace create GATE_KV` then bind `GATE_KV` in the dashboard (or uncomment in `wrangler.toml`).

## Desktop app behavior

- `yes` → open without license prompt  
- `no` → require license key  
- unreachable → local 14-day / paid logic  

Change `GATE_PASSWORD` before production.
