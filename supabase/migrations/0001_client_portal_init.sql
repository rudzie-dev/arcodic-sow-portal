-- ============================================================================
-- Arcodic Client Portal — initial schema
-- Two-sided portal: admin dashboard (Rudz) + client dashboard (per client).
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_tier as enum ('landing', 'starter', 'business', 'custom');
exception when duplicate_object then null; end $$;

-- Full pipeline (admin-visible). Only a subset is ever shown to clients —
-- see src/lib/stages.js for the client-facing mapping.
do $$ begin
  create type project_stage as enum (
    'lead',
    'discovery',
    'quote_sent',
    'contract_sent',
    'signed',
    'deposit_due',
    'in_progress',
    'delivered',
    'support',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sow_status as enum ('draft', 'sent', 'signed', 'expired');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- One row per Supabase Auth user. Created automatically on first sign-in
-- (see handle_new_user trigger below). role defaults to 'client'; promote
-- to 'admin' manually in the dashboard for Rudz/Kaleb's accounts.
-- client_id's FK to clients(id) is added below, after `clients` exists.
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'client',
  client_id   uuid,
  full_name   text,
  created_at  timestamptz not null default now()
);

create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  business_name text,
  email         text not null unique,
  phone         text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- profiles.client_id references clients, but clients is declared after
-- profiles above for readability — fix the forward reference here.
alter table profiles
  drop constraint if exists profiles_client_id_fkey,
  add constraint profiles_client_id_fkey foreign key (client_id) references clients(id) on delete set null;

create table if not exists projects (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  name                text not null,
  tier                project_tier not null default 'custom',
  price               numeric(12,2) not null default 0,
  currency            text not null default 'USD',
  stage               project_stage not null default 'lead',
  deposit_paid        boolean not null default false,
  balance_paid        boolean not null default false,
  support_window_days integer not null default 14,
  delivered_at        timestamptz,
  created_at          timestamptz not null default now()
);

create table if not exists sow_documents (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  content             text not null default '',
  status              sow_status not null default 'draft',
  signwell_envelope_id text,
  signing_url         text,
  sent_at             timestamptz,
  signed_at           timestamptz,
  created_at          timestamptz not null default now()
);

create table if not exists deliverables (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  file_url    text not null,
  label       text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists revisions (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  round_number  integer not null default 1,
  description   text not null,
  requested_at  timestamptz not null default now()
);

-- Singleton-ish settings table (admin only). One row per business — MVP
-- assumes a single business (Arcodic), so the app always reads/writes id=1.
-- NOTE: signwell_api_key lives here for MVP convenience so it's editable
-- from Settings. It is never exposed to the client role (see RLS below).
-- Prefer moving it to Supabase Vault / a server-only env var once this
-- portal handles more than one operator.
create table if not exists settings (
  id                  integer primary key default 1,
  business_name       text not null default 'Arcodic',
  business_email      text,
  business_address    text,
  signwell_api_key    text,
  notify_on_signature boolean not null default true,
  notify_on_payment   boolean not null default true,
  updated_at          timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- HELPERS
-- ----------------------------------------------------------------------------

-- security definer so it can read `profiles` without recursing into the
-- RLS policies defined on `profiles` itself.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function current_client_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select client_id from profiles where id = auth.uid();
$$;

-- Auto-create a profile row on first login. If the signing-in email
-- matches an existing `clients.email`, link it and set role='client'.
-- Everyone else defaults to role='client' with no client_id — promote to
-- 'admin' by hand in the Supabase table editor for internal accounts.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_client_id uuid;
begin
  select id into matched_client_id from clients where email = new.email limit 1;

  insert into profiles (id, role, client_id, full_name)
  values (new.id, 'client', matched_client_id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table profiles      enable row level security;
alter table clients       enable row level security;
alter table projects      enable row level security;
alter table sow_documents enable row level security;
alter table deliverables  enable row level security;
alter table revisions     enable row level security;
alter table settings      enable row level security;

-- profiles: everyone can read their own row; admins can read/update all.
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_select_admin" on profiles for select using (is_admin());
create policy "profiles_update_admin" on profiles for update using (is_admin());

-- clients: admin full access; client can see only their own record.
create policy "clients_all_admin" on clients for all using (is_admin()) with check (is_admin());
create policy "clients_select_self" on clients for select using (id = current_client_id());

-- projects: admin full access; client sees only their own projects.
create policy "projects_all_admin" on projects for all using (is_admin()) with check (is_admin());
create policy "projects_select_self" on projects for select using (client_id = current_client_id());

-- sow_documents: admin full access; client sees documents on their projects.
create policy "sow_documents_all_admin" on sow_documents for all using (is_admin()) with check (is_admin());
create policy "sow_documents_select_self" on sow_documents for select using (
  project_id in (select id from projects where client_id = current_client_id())
);

-- deliverables: admin full access; client sees deliverables on their projects.
create policy "deliverables_all_admin" on deliverables for all using (is_admin()) with check (is_admin());
create policy "deliverables_select_self" on deliverables for select using (
  project_id in (select id from projects where client_id = current_client_id())
);

-- revisions: admin full access; client can read (v1 has no in-portal request form).
create policy "revisions_all_admin" on revisions for all using (is_admin()) with check (is_admin());
create policy "revisions_select_self" on revisions for select using (
  project_id in (select id from projects where client_id = current_client_id())
);

-- settings: admin only, never exposed to clients.
create policy "settings_all_admin" on settings for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
create index if not exists idx_projects_client_id on projects(client_id);
create index if not exists idx_projects_stage on projects(stage);
create index if not exists idx_sow_documents_project_id on sow_documents(project_id);
create index if not exists idx_deliverables_project_id on deliverables(project_id);
create index if not exists idx_revisions_project_id on revisions(project_id);
create index if not exists idx_profiles_client_id on profiles(client_id);
