# Pulse Engineering Memory System (PEMS) — Quayvox

**PEMS Version:** 1.0  
**Last Updated:** 2026-08-11  
**Updated By:** Pulse Senior Full Stack Engineer  

---

## Context Snapshot

| Field | Value |
|---|---|
| Project | Quayvox |
| Current version | 0.1.0 (production completion) |
| Current sprint / phase | Build / Launch |
| Architecture (one line) | Vite SPA + Neon Postgres + Vercel serverless auth/API (Resend) |
| Tech stack (one line) | React 19, Vite 7, Tailwind 3, Neon, Resend, Vercel |
| Design system | Custom navy/cobalt tokens + shadcn/ui |
| Primary risks | Missing env/secrets block deploy; cookie auth misconfig |
| Open decisions | None — Neon + env admin auth locked |
| Recent changes | Migrated admin/data from Supabase to Neon + cookie sessions |
| Next priorities | Domain DNS + Resend verify, Deploy QA, set ADMIN_PASSWORD_HASH |

---

## 1. Project Profile

| Field | Value |
|---|---|
| Name | Quayvox |
| Description | Global shipping company + logistics visibility site/admin for shipment tracking |
| Goals | Admin login, real tracking, contact email, mobile UX, Vercel deploy |
| Target users | Logistics operators (admin); customers (public track + contact) |
| Industry / domain | Freight / logistics SaaS |
| Key features | Auth-gated admin, CRUD shipments, public track timeline, contact form |
| Phase | Build / Launch |
| Ownership | Client / Pulse delivery |
| Brand URL | https://www.quayvox.com |
| Contact email | info@quayvox.com |
| Contact phone / WhatsApp | +1 972-383-9794 (`tel:` + `wa.me`) |
| Branches | USA, UK, Japan, Australia, Russia, Egypt, Mexico (all continents) |
| Success metrics | Protected admin; track by number; Resend email; mobile usable; live on Vercel |

---

## 2. Technology Profile

| Layer | Choice | Notes / version |
|---|---|---|
| Language(s) | TypeScript ~5.9 | |
| Web framework | Vite 7 + React 19 | SPA, not Next.js |
| Backend | Vercel serverless `api/` | Auth, shipments, track, contact, notify |
| Database | Neon Postgres | `@neondatabase/serverless` |
| Auth | Env admin + HTTP-only cookie | `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` |
| Styling | Tailwind 3.4 + shadcn | |
| Forms | react-hook-form + zod | |
| Animation | GSAP + Framer Motion | Pin/snap disabled on mobile |
| Hosting | Vercel | SPA rewrites + API |
| Email | Resend | Server-only API key; from `Quayvox <noreply@quayvox.com>` |

**Documented exceptions to PSEF:** Vite SPA instead of Next.js — preserve existing UI; APIs via Vercel functions.

---

## 3. Architecture Profile

| Field | Value |
|---|---|
| Architecture style | SPA + Neon + thin serverless edge |
| Folder structure | `app/src` UI; `api/` Vercel; `neon/migrations` SQL |
| Routing | react-router-dom (`/`, `/login`, `/track/:id`, `/solutions/:slug`, `/coverage`, `/admin/*`) |
| API strategy | Cookie-gated `/api/shipments*`; public `/api/track/:id`; `/api/contact`, `/api/notify-shipment` |
| Auth model | Single admin from env; signed `qv_session` cookie |
| State management | AuthContext + ShipmentContext + ThemeContext |
| Multi-tenancy | None (single org) |

---

## 4. Design Profile

| Field | Value |
|---|---|
| Brand / product name | Quayvox |
| Color tokens | Navy / cobalt via CSS vars in `index.css` (light + dark); Tailwind maps `navy-*` / `text-*` |
| Typography | Sora / Inter / IBM Plex Mono |
| Component library | shadcn/ui under `app/src/components/ui` |
| Icon set | lucide-react |
| Theming | `ThemeProvider` + `ThemeToggle`; class on `<html>` (`dark`/`light`); localStorage `quayvox-theme` |
| Page templates | Shared full-bleed `PageHero` (image + overlay + GSAP); `PageCta` band; `LegalDoc` for Privacy/Terms. Home keeps bespoke `Hero`. |
| Wordmark | `Quay` + cobalt `vox` accent in nav/admin/login/footer |

---

## 5. Engineering Standards

Follow Pulse Engineering Framework naming and commit conventions. Branch: feature/fix from main. No secrets in git.

---

## 6. Project Decisions

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-10 | Keep Vite SPA | Avoid full Next rewrite; ship production path faster |
| 2026-08-10 | Resend via Vercel API | Keep API keys off client |
| 2026-08-10 | No public admin signup | Invite-only admins |
| 2026-08-10 | App-wide light/dark theme | Persist preference; CSS tokens so public + admin share one toggle |
| 2026-08-10 | Full-bleed secondary PageHero | Unify About/Contact/Track/Pricing/legal/product/solutions heroes; Home stays unique |
| 2026-08-10 | Rebrand to Quayvox | ShipTrack Pro collided with existing products; quayvox.com + info@quayvox.com locked |
| 2026-08-10 | Solution detail pages | Six mode/industry pages under `/solutions/:slug` with shared catalog in `data/solutions.ts` |
| 2026-08-11 | Neon + cookie admin auth | Replace Supabase; use existing Neon DATABASE_URL; env-based single admin |

---

## 7. Known Constraints

- Resend requires verified **quayvox.com** domain for production from-address
- Local admin/track APIs need `vercel dev` (Vite proxies `/api`)
- Demo features (AI chat, faux map) remain non-production

---

## 8. Active Work

Neon migration complete in code; apply SQL to Neon project; set AUTH_* in `.env` + Vercel.

---

## 9. Reusable Assets

- `Shipment` type + status helpers in `app/src/data/mockShipments.ts`
- Admin layout + shadcn primitives
- Row mappers in `app/src/lib/shipments.ts`
- API helpers in `api/_lib/*`
- `ThemeContext` + `ThemeToggle` for light/dark mode
- `PageHero`, `PageCta`, `LegalDoc` for secondary public pages
- Solution catalog + detail template in `app/src/data/solutions.ts` / `SolutionDetail.tsx`

---

## 10. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Open admin without env | Critical | ProtectedRoute + fail closed if auth not configured |
| DATABASE_URL leak | Critical | Server-only env; never VITE_ |
| Spam on contact | Medium | Honeypot + basic rate limit |
| SPA refresh 404 | High | vercel.json rewrite to index.html |

---

## 11. Improvement Backlog

- Real map/GPS, document storage, multi-tenant orgs, carrier APIs, CI tests, multi-admin table

---

## 12. Collaboration Notes / Env Inventory

**Client (Vite):** none required for DB/auth  
**Server (Vercel / vercel dev):** `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `PUBLIC_APP_URL`  
**Brand:** `PUBLIC_APP_URL=https://www.quayvox.com`, `CONTACT_TO_EMAIL=info@quayvox.com`
