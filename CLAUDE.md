# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Applymate is a job application tracker with three independently run parts that share one REST API: an Express backend (`backend/`, CommonJS), a React/Vite SPA (`frontend/`, ESM, plain JSX with Tailwind), and a Manifest V3 Chrome extension (`chrome-extension/`, no build step).

Production: frontend at https://applymate-henna.vercel.app, API at https://job-tracker-nghc.onrender.com.

## Commands

Each package has its own `node_modules`. Run root scripts from the repo root:

```bash
npm run install-all   # install root, backend, and frontend deps
npm run dev           # backend (nodemon) + frontend (vite) via concurrently
npm run backend       # backend only
npm run frontend      # frontend only (http://localhost:5173)
npm run build         # production build of the frontend
```

Lint runs from `frontend/` only; the backend has no linter.

```bash
cd frontend && npm run lint
```

There is no test framework in any package, so there is no way to run a single test. Verify changes by running the app.

To load the extension, use `chrome://extensions` > Developer mode > Load unpacked > select `chrome-extension/`. Reload it there after editing.

## Local setup

- `backend/.env` needs `DATABASE_URL` and `JWT_SECRET`; the server exits at startup if either is missing. `backend/generate-secret.js` generates a secret.
- The backend runs locally on **port 5001**, which is also the frontend's fallback when `VITE_API_URL` is unset. Avoid 5000 (macOS AirPlay uses it) and 5432 (Postgres).
- `models/database.js` uses SSL (`rejectUnauthorized: false`) unless `DATABASE_URL` points at localhost.
- The Supabase direct host (`db.<ref>.supabase.co`) is IPv6-only and fails with `ENOTFOUND` on networks without IPv6. Use the session pooler instead: `postgresql://postgres.<ref>:<password>@<pooler-host>.pooler.supabase.com:5432/postgres`.
- There are no migrations. The schema exists only as SQL in `README.md`; it is safe to re-run but won't alter existing tables. Schema changes must be applied by hand and the README updated to match.

## Architecture

### Backend

`index.js` mounts `/auth` and `/api/jobs`. Requests flow through `routes/` to `controllers/`, which run parameterized SQL directly through the shared `pg` pool from `models/database.js`. There is no ORM or service layer.

- All job routes sit behind `verifyToken` (`middleware/auth.js`), which sets `req.user = { id, email }` from the JWT. Every job query must filter on `user_id = req.user.id`; this is the only per-user isolation, since RLS doesn't restrict the backend when it connects as the table owner.
- `PUT /api/jobs/:id` overwrites every column, so omitted fields become null. Callers must send the full job.

### Frontend

- All HTTP goes through `authAPI` / `jobsAPI` in `src/api/`, built on the axios instance in `src/api/axios.js`, which attaches the token from `localStorage`.
- Auth state lives in `context/AuthContext.jsx`. The JWT and a `user` object are kept in `localStorage`; the login response contains only `{ token }`, so `user` is built from the submitted email.
- The axios interceptor clears the session and redirects to `/login` on **401**, which `verifyToken` returns for a missing, invalid or expired token (24h expiry).
- Routes are in `App.jsx`; protected pages are wrapped in `PrivateRoute` and `Layout`. `vercel.json` rewrites all paths to `index.html` for client-side routing.

### Chrome extension

- `content.js` runs on all URLs, scrapes job data from the page, and writes it to `chrome.storage.local`. `popup.js` reads that, lets the user edit it, and POSTs to `{apiUrl}/api/jobs`.
- It has no login of its own. `authSync.js`, a content script limited to the web app's origins, copies the JWT from `localStorage` into `chrome.storage.local` along with the matching `apiUrl`. It re-reads on page load, on `storage` events, and on the `applymate:auth-changed` event that `AuthContext` fires on login and logout. On a 401 the popup clears the token and prompts the user to sign in on the site.

### Cross-cutting

- **Adding or changing an API host or frontend origin** means updating the hardcoded lists in several places: the CORS `origin` array in `backend/index.js`, `host_permissions` and the `authSync.js` `matches` in `chrome-extension/manifest.json`, the origin-to-API map in `chrome-extension/authSync.js`, and `APP_URL` in `chrome-extension/popup.js`. The production frontend reads `VITE_API_URL` at build time.
- **`date_applied` is a date-only string.** `models/database.js` overrides the `pg` parser so `DATE` columns reach the API as `YYYY-MM-DD`. In the frontend, use the helpers in `src/utils/dateUtils.js` rather than `new Date(value)`, which reads that format as UTC and shows the previous day in timezones behind UTC.
