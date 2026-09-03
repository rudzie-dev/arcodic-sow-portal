# Arcodic Client Portal

Two-sided portal: an admin dashboard for running the business, and a
client dashboard for each client to track their project. Built with React
+ Vite, Supabase (auth, DB, storage, edge functions), Vercel hosting, and
SignWell for e-signature.

See **[SETUP.md](./SETUP.md)** for first-run setup (database migration,
enabling email OTP, promoting admin accounts, environment variables, and
deploying the SignWell webhook) — including credentials that need
**rotating**, not just removing, before this goes live.

## Stack

- **Frontend** — React 19 + Vite, React Router, Tailwind v4, lucide-react
- **Auth** — Supabase Auth, email OTP (6-digit code), no passwords
- **Database** — Supabase Postgres, RLS-scoped per role (`supabase/migrations/`)
- **E-signature** — SignWell (hosted signing page + webhook), via
  `api/send-contract.js` and `supabase/functions/signwell-webhook/`
- **Hosting** — Vercel (static frontend + `/api` serverless functions)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL/anon key
npm run dev
```

## Structure

```
src/
  context/AuthContext.jsx     OTP session + role/profile
  routes/RequireAuth.jsx      role-gated route guard
  pages/client/                client dashboard
  pages/admin/                 admin dashboard (Home, Projects, Clients,
                                Payments, Contracts, Settings)
  lib/stages.js                internal ↔ client-facing stage mapping
  lib/contractTemplate.js      locked master SOW terms
  legacy/                      original manual SOW builder — kept at
                                /legacy and /legacy/dashboard, no longer
                                linked from the new portal nav
api/
  send-contract.js             renders a contract to PDF, sends via SignWell
supabase/
  migrations/                  schema + RLS
  functions/signwell-webhook/  flips status on signature, emails the
                                client their portal invite
```
