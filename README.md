# Quayvox

Production logistics marketing site + admin dashboard.

**Site:** [www.quayvox.com](https://www.quayvox.com) · **Contact:** info@quayvox.com

**Stack:** Vite 7 · React 19 · Tailwind · Supabase Auth/Postgres · Resend · Vercel

---

## Quick start (local)

```bash
# Root (API deps for Vercel functions)
npm install

# App
cd app
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open `http://localhost:5173`.

> Contact/notify APIs (`/api/*`) need Vercel or `vercel dev` from the repo root with server env vars set.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run in order:
   - [`supabase/migrations/20260810000001_init_schema.sql`](supabase/migrations/20260810000001_init_schema.sql)
   - [`supabase/migrations/20260810000002_seed_shipments.sql`](supabase/migrations/20260810000002_seed_shipments.sql)
3. **Authentication → Users → Add user** (email + password). Disable public signup in Auth settings.
4. Promote the user to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

5. Copy **Project URL** and **anon key** into `app/.env`.

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
| `VITE_SUPABASE_URL` | Build + Runtime | Same as Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Build + Runtime | Anon/public key |
| `SUPABASE_URL` | Runtime | Same URL (API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime | Service role — **never** expose to client |
| `SUPABASE_ANON_KEY` | Runtime | Optional; used by notify API |
| `RESEND_API_KEY` | Runtime | Resend secret |
| `RESEND_FROM_EMAIL` | Runtime | e.g. `Quayvox <noreply@quayvox.com>` |
| `CONTACT_TO_EMAIL` | Runtime | `info@quayvox.com` |
| `PUBLIC_APP_URL` | Runtime | `https://www.quayvox.com` |

5. Deploy. Confirm:

- [ ] `/` loads
- [ ] `/admin` redirects to `/login`
- [ ] Admin login works (role = admin)
- [ ] Create / edit / delete shipment persists
- [ ] `/track/SH-2026-7842` shows status + timeline
- [ ] Contact form saves + emails (if Resend configured)
- [ ] Status update with customer email triggers notify API

---

## Project layout

```
api/                 Vercel serverless (contact, notify-shipment)
app/                 Vite React SPA
supabase/migrations  Schema, RLS, seed
docs/pems.md         Pulse engineering memory
vercel.json          Deploy + SPA fallback
```

---

## Security notes

- Admin routes require Supabase session + `profiles.role = 'admin'`.
- Public tracking uses `get_shipment_by_tracking` / `get_events_by_tracking` RPCs (no list-all for anon).
- Resend and service-role keys stay on the server only.
