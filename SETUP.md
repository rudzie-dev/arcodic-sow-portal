# Arcodic Client Portal — Setup

## ⚠️ Rotate exposed credentials first

Before anything else: this repo's git history contains a **Supabase
service-role key** and a **Resend API key** committed in plain text
(previously hardcoded in `api/complete-sow.js` / `api/send-sow.js`). Those
have been removed from the source in this change, but the old values are
still live and still recoverable from git history/GitHub, so they must be
**rotated**, not just removed from a new commit:

- Supabase → Project Settings → API → regenerate the `service_role` key.
- Resend → API Keys → revoke the old key, create a new one.

Then set the new values as environment variables (never back in source —
see `.env.example`).

## 1. Database

Run `supabase/migrations/0001_client_portal_init.sql` against your
Supabase project — either paste it into the SQL Editor in the dashboard,
or via the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates `profiles`, `clients`, `projects`, `sow_documents`,
`deliverables`, `revisions`, `settings`, the enums/RLS policies, and a
trigger that auto-creates a `profiles` row (role defaults to `client`) the
first time someone signs in.

## 2. Enable email OTP

Supabase Dashboard → Authentication → Providers → Email: enable
"Email OTP" (or confirm "Confirm email" + OTP is on for the Email
provider — the app calls `signInWithOtp` / `verifyOtp`, no magic-link
redirect needed).

## 3. Promote admin accounts

New sign-ins default to `role = 'client'`. To give Rudz/Kaleb admin
access, after they've signed in once via `/login`, run:

```sql
update profiles set role = 'admin' where id = (
  select id from auth.users where email = 'rudz@arcodic.com'
);
```

## 4. Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same
(server-only) values in Vercel → Project → Settings → Environment
Variables for production.

## 5. Deploy the SignWell webhook (Supabase Edge Function)

```bash
supabase functions deploy signwell-webhook --no-verify-jwt
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... RESEND_API_KEY=... PORTAL_URL=https://your-portal.vercel.app SIGNWELL_WEBHOOK_SECRET=some-random-string
```

Then in SignWell → Settings → API → Webhooks, register:

```
https://<project-ref>.supabase.co/functions/v1/signwell-webhook?secret=some-random-string
```

**Verify the payload shape.** `supabase/functions/signwell-webhook/index.ts`
was written against SignWell's commonly-documented webhook shape, but live
API docs weren't reachable while building this — send a test webhook from
the SignWell dashboard, check the Edge Function logs, and adjust
`extractDocumentId` / `isSignedEvent` in that file if the real payload
looks different.

## 6. SignWell API key

Admin → Settings → SignWell → paste the API key. It's stored in the
`settings` table (admin-only RLS) and read server-side by
`api/send-contract.js`. `SIGNWELL_API_KEY` in env is a fallback if that
field is left blank.

## What's where

- `src/pages/client/` — client dashboard (OTP-gated, one active project)
- `src/pages/admin/` — admin dashboard (Home, Projects, Clients, Payments,
  Contracts, Settings)
- `src/lib/contractTemplate.js` — the locked master SOW terms
- `api/send-contract.js` — renders the contract to PDF, sends via SignWell
- `supabase/functions/signwell-webhook/` — flips status on signature,
  emails the client their portal invite
- `src/legacy/` — the original manual SOW builder/dashboard/sign flow,
  kept reachable at `/legacy` and `/legacy/dashboard` for continuity but no
  longer linked from the new portal nav
