# Arcodic Client Portal — Setup

## Supabase project

A fresh Supabase project was created for this portal (the old project
referenced by the previous prototype is no longer used by this codebase):

- Project ref: `roscpquoxcplknwsbqjl`
- URL: `https://roscpquoxcplknwsbqjl.supabase.co`
- Org: Rudz-dev-2

The schema migrations (`supabase/migrations/`) are already applied to it,
and the `signwell-webhook` Edge Function is already deployed to it.

## ⚠️ Old project — rotate/retire it

The **previous** Supabase project (the one the old SOW-builder prototype
pointed at, ref `ctjwqktzdvbfijoqnxvo`) had its service-role key and a
Resend API key committed to this repo's git history in plain text. That
project isn't used by this app anymore, but the exposed keys are still
live until you act on them:

- Supabase → that project → Project Settings → API → regenerate (or just
  pause/delete the project if nothing else depends on it).
- Resend → API Keys → revoke the old key, create a new one for this app.

## 1. Environment variables

Frontend (`.env.local`, and in Vercel as `VITE_...`):

```
VITE_SUPABASE_URL=https://roscpquoxcplknwsbqjl.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key — get from Supabase dashboard → Project Settings → API,
                         or ask Claude to run get_publishable_keys again>
```

Server-only, set in Vercel → Project → Settings → Environment Variables
(never in a committed file):

```
SUPABASE_URL=https://roscpquoxcplknwsbqjl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role secret — Supabase dashboard → Project Settings → API.
                            Not retrievable via the Supabase MCP tools for security reasons —
                            copy it from the dashboard yourself.>
RESEND_API_KEY=<your new Resend key>
```

See `.env.example` for the full list, including the optional
`SIGNWELL_API_KEY`/`SIGNWELL_TEST_MODE` fallback.

## 2. Enable email OTP

Supabase Dashboard → Authentication → Providers → Email: confirm OTP
sign-in is enabled (this isn't configurable via the Supabase MCP tools, so
verify it by hand — it's on by default for new projects).

## 3. Promote your admin account

Sign in once via `/login` on the deployed app with your real email (this
creates your `profiles` row, defaulted to `role='client'`), then run in
the SQL editor:

```sql
update profiles set role = 'admin' where id = (
  select id from auth.users where email = 'rudz@arcodic.com'
);
```

## 4. SignWell webhook

`signwell-webhook` is deployed. It still needs its secrets set (Supabase
MCP tools can't set Edge Function secrets — do this via the CLI or
dashboard, once linked locally):

```bash
supabase link --project-ref roscpquoxcplknwsbqjl
supabase secrets set RESEND_API_KEY=... PORTAL_URL=https://your-portal.vercel.app SIGNWELL_WEBHOOK_SECRET=some-random-string
```

(`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected into every
Edge Function by Supabase — no need to set those two.)

Then in SignWell → Settings → API → Webhooks, register:

```
https://roscpquoxcplknwsbqjl.supabase.co/functions/v1/signwell-webhook?secret=some-random-string
```

**Verify the payload shape** — `supabase/functions/signwell-webhook/index.ts`
was written against SignWell's commonly-documented webhook shape, but live
API docs weren't reachable while building this. Send a test webhook from
the SignWell dashboard, check the Edge Function logs, and adjust
`extractDocumentId` / `isSignedEvent` in that file if the real payload
looks different — then redeploy.

## 5. SignWell API key

Admin → Settings → SignWell → paste the API key. It's stored in the
`settings` table (admin-only RLS) and read server-side by
`api/send-contract.js`.

## What's where

- `src/pages/client/` — client dashboard (OTP-gated, one active project)
- `src/pages/admin/` — admin dashboard (Home, Projects, Clients, Payments,
  Contracts, Settings)
- `src/lib/contractTemplate.js` — the locked master SOW terms
- `api/send-contract.js` — renders the contract to PDF, sends via SignWell
- `supabase/functions/signwell-webhook/` — flips status on signature,
  emails the client their portal invite
- `supabase/migrations/` — schema, RLS, and the `app_private` hardening
  pass that moved the RLS helper functions out of the exposed API schema
