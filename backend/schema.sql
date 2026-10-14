-- Supabase / PostgreSQL. Execută în SQL Editor, apoi activează hook-ul din Dashboard.
create table if not exists public.pa_progress (user_id uuid primary key references auth.users(id) on delete cascade, payload jsonb not null default '{}'::jsonb, revision bigint not null default 0, updated_at timestamptz not null default now(), constraint pa_payload_size check (octet_length(payload::text) <= 5000000), constraint pa_payload_object check (jsonb_typeof(payload) = 'object'));
alter table public.pa_progress enable row level security;
revoke all on public.pa_progress from anon, authenticated;
grant select on public.pa_progress to authenticated;
-- Identitatea furnizorului este administrată de Auth, nu user_metadata modificabil de utilizator.
create or replace function public.pa_account_allowed() returns boolean language sql stable security definer set search_path = '' as $$ select exists (select 1 from auth.users u join auth.identities i on i.user_id = u.id where u.id = auth.uid() and u.email_confirmed_at is not null and i.provider = 'azure' and lower(u.email) ~ '^[^@[:space:]]+@(s[.]unibuc[.]ro|unibuc[.]ro)$' and lower(i.identity_data->>'email') = lower(u.email)); $$;
revoke all on function public.pa_account_allowed() from public, anon;
grant execute on function public.pa_account_allowed() to authenticated;
drop policy if exists pa_read_own on public.pa_progress;
create policy pa_read_own on public.pa_progress for select to authenticated using (user_id = (select auth.uid()) and (select public.pa_account_allowed()));
-- Scriere numai prin RPC: control versiune pentru a evita suprascrierea altui dispozitiv.
create or replace function public.pa_save_progress(p_expected_revision bigint, p_payload jsonb) returns bigint language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_revision bigint;
begin
if v_user is null or not public.pa_account_allowed() then raise exception 'Cont universitar Microsoft necesar' using errcode = '42501'; end if;
if p_payload is null or jsonb_typeof(p_payload) <> 'object' or (p_payload->>'version') is distinct from '1' or jsonb_typeof(p_payload->'drafts') is distinct from 'object' or jsonb_typeof(p_payload->'journey') is distinct from 'object' or octet_length(p_payload::text) > 5000000 then raise exception 'Progres invalid' using errcode = '22023'; end if;
insert into public.pa_progress (user_id) values (v_user) on conflict do nothing;
select revision into v_revision from public.pa_progress where user_id = v_user for update;
if p_expected_revision is distinct from v_revision then raise exception 'Conflict de versiune' using errcode = '40001'; end if;
update public.pa_progress set payload = p_payload, revision = v_revision + 1, updated_at = now() where user_id = v_user;
return v_revision + 1;
end; $$;
revoke all on function public.pa_save_progress(bigint,jsonb) from public, anon;
grant execute on function public.pa_save_progress(bigint,jsonb) to authenticated;
create or replace function public.pa_before_user_created(event jsonb) returns jsonb language plpgsql set search_path = '' as $$
begin
if coalesce(event->'user'->'app_metadata'->>'provider','') <> 'azure' or coalesce(lower(event->'user'->>'email'),'') !~ '^[^@[:space:]]+@(s[.]unibuc[.]ro|unibuc[.]ro)$' then return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','Folosește contul Microsoft @s.unibuc.ro sau @unibuc.ro.')); end if;
return '{}'::jsonb;
end; $$;
revoke all on function public.pa_before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.pa_before_user_created(jsonb) to supabase_auth_admin;
