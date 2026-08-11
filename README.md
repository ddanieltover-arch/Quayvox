# Quayvox

Production logistics marketing site + admin dashboard.

**Site:** [www.quayvox.com](https://www.quayvox.com) · **Contact:** info@quayvox.com

**Stack:** Vite 7 · React 19 · Tailwind · Neon Postgres · Vercel serverless · Resend

---

## Quick start (local)

```bash
# Root (API deps for Vercel functions)
npm install
cp .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, Resend vars

# Apply schema in Neon SQL Editor (or psql):
#   neon/migrations/001_init.sql
#   neon/migrations/002_seed_shipments.sql

# Generate password hash:
node -e "require('bcryptjs').hash('YOUR_PASSWORD',10).then(console.log)"

# API (port 3000) — required for auth, track, contact, shipments
npx vercel dev

# App (separate terminal)
cd app
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to `vercel dev` on port 3000.

---

## Neon setup

1. Create a project at [neon.tech](https://neon.tech) and copy the connection string into `DATABASE_URL`.
2. In the Neon **SQL Editor**, run in order:
   - [`neon/migrations/001_init.sql`](neon/migrations/001_init.sql)
   - [`neon/migrations/002_seed_shipments.sql`](neon/migrations/002_seed_shipments.sql)
3. Set admin auth in root `.env`:

```bash
# random secret
openssl rand -hex 32

# bcrypt hash of your admin password (from repo root after npm install)
node -e "require('bcryptjs').hash('YOUR_PASSWORD',10).then(console.log)"
```

```env
AUTH_SECRET=...
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=$2a$10$...
```

Demo tracking numbers after seed: `SH-2026-7842`, `SH-2026-7843`, …

---

## Resend setup

1. Create an API key at [resend.com](https://resend.com).
2. Verify **quayvox.com** as a sending domain (or use `onboarding@resend.dev` for tests).
3. Set Vercel env vars (see below).

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel (root of the repo).
3. `vercel.json` already sets build/output/install and SPA rewrites.
4. Add environment variables:

| Variable | Where | Notes |
|----------|--------|--------|
| `DATABASE_URL` | Runtime | Neon connection string |
| `AUTH_SECRET` | Runtime | Session signing secret |
| `ADMIN_EMAIL` | Runtime | Single admin login email |
| `ADMIN_PASSWORD_HASH` | Runtime | bcrypt hash of admin password |
| `RESEND_API_KEY` | Runtime | Resend secret |
| `RESEND_FROM_EMAIL` | Runtime | e.g. `Quayvox <noreply@quayvox.com>` |
| `CONTACT_TO_EMAIL` | Runtime | `info@quayvox.com` |
| `PUBLIC_APP_URL` | Runtime | `https://www.quayvox.com` |

5. Deploy. Confirm:

- [ ] `/` loads
- [ ] `/admin` redirects to `/login`
- [ ] Admin login works
- [ ] Create / edit / delete shipment persists
- [ ] `/track/SH-2026-7842` shows status + timeline
- [ ] Contact form saves + emails (if Resend configured)
- [ ] Status update with customer email triggers notify API

---

## Project layout

```
api/                 Vercel serverless (auth, shipments, track, contact, notify)
app/                 Vite React SPA
neon/migrations      Neon Postgres schema + seed
docs/pems.md         Pulse engineering memory
vercel.json          Deploy + SPA fallback
```

---

## Security notes

- Admin routes require an HTTP-only session cookie signed with `AUTH_SECRET`.
- Credentials are env-based (`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`); no public signup.
- Public tracking is `GET /api/track/:trackingNumber` (exact match only).
- Neon `DATABASE_URL` and Resend keys stay on the server only.
