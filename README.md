# DicomViewer Website

Single-page product site + remote **yes / no** license gate for the desktop DicomViewer app.

## Pages

| URL | Purpose |
|-----|---------|
| `/` | Features landing page |
| `/control.html` | Admin UI to set gate to `yes` or `no` |
| `/gate` | **Plain-text** endpoint the desktop app should call (`yes` or `no`) |

## Run locally

```bash
npm start
```

Open:

- http://localhost:8787/
- http://localhost:8787/control.html
- http://localhost:8787/gate

Default admin password: `DicomGate2026`  
Override with env var `GATE_PASSWORD`.

## Deploy

Any Node host works (Render, Railway, Fly.io, VPS):

1. Set start command: `npm start`
2. Set env `GATE_PASSWORD` to a strong secret
3. Optional: set `PORT` (platform usually injects it)

After deploy, put this URL into DicomViewer settings key `license/remote_gate_url`:

```text
https://YOUR-DOMAIN/gate
```

## Desktop app behavior

- Gate returns `yes` → app opens without license prompt  
- Gate returns `no` → app requires license key (`Paidbsh@`)  
- Gate unreachable → falls back to local 14-day / paid license logic  

## Security note

Change `GATE_PASSWORD` before production. The `/gate` GET endpoint is public on purpose so the viewer can read it; only POST (set value) is password-protected.
