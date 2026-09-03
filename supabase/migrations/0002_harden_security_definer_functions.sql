-- Move the RLS helper functions out of `public` so PostgREST no longer
-- exposes them as callable RPCs (Supabase's security advisor flags
-- SECURITY DEFINER functions sitting in the public/exposed schema, even
-- when — as here — they only ever return information about the calling
-- user's own row). RLS policies can still call them fine once
-- schema-qualified; only the anonymous REST route disappears.

create schema if not exists app_private;

alter function public.is_admin() set schema app_private;
alter function public.current_client_id() set schema app_private;
alter function public.handle_new_user() set schema app_private;

-- Recreate every policy that referenced the unqualified names.
drop policy if exists "profiles_select_admin" on profiles;
drop policy if exists "profiles_update_admin" on profiles;
create policy "profiles_select_admin" on profiles for select using (app_private.is_admin());
create policy "profiles_update_admin" on profiles for update using (app_private.is_admin());

drop policy if exists "clients_all_admin" on clients;
drop policy if exists "clients_select_self" on clients;
create policy "clients_all_admin" on clients for all using (app_private.is_admin()) with check (app_private.is_admin());
create policy "clients_select_self" on clients for select using (id = app_private.current_client_id());

drop policy if exists "projects_all_admin" on projects;
drop policy if exists "projects_select_self" on projects;
create policy "projects_all_admin" on projects for all using (app_private.is_admin()) with check (app_private.is_admin());
create policy "projects_select_self" on projects for select using (client_id = app_private.current_client_id());

drop policy if exists "sow_documents_all_admin" on sow_documents;
drop policy if exists "sow_documents_select_self" on sow_documents;
create policy "sow_documents_all_admin" on sow_documents for all using (app_private.is_admin()) with check (app_private.is_admin());
create policy "sow_documents_select_self" on sow_documents for select using (
  project_id in (select id from projects where client_id = app_private.current_client_id())
);

drop policy if exists "deliverables_all_admin" on deliverables;
drop policy if exists "deliverables_select_self" on deliverables;
create policy "deliverables_all_admin" on deliverables for all using (app_private.is_admin()) with check (app_private.is_admin());
create policy "deliverables_select_self" on deliverables for select using (
  project_id in (select id from projects where client_id = app_private.current_client_id())
);

drop policy if exists "revisions_all_admin" on revisions;
drop policy if exists "revisions_select_self" on revisions;
create policy "revisions_all_admin" on revisions for all using (app_private.is_admin()) with check (app_private.is_admin());
create policy "revisions_select_self" on revisions for select using (
  project_id in (select id from projects where client_id = app_private.current_client_id())
);

drop policy if exists "settings_all_admin" on settings;
create policy "settings_all_admin" on settings for all using (app_private.is_admin()) with check (app_private.is_admin());
