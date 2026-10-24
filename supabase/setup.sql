-- Execute no SQL Editor do projeto Supabase. Não contém senhas.
begin;
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_admins enable row level security;
revoke all on public.site_admins from anon, authenticated;
grant select on public.site_admins to authenticated;
drop policy if exists "Read own admin membership" on public.site_admins;
create policy "Read own admin membership" on public.site_admins for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.site_config (
  id text primary key check (id = 'main'),
  content jsonb not null check (jsonb_typeof(content) = 'object')
);
alter table public.site_config enable row level security;
revoke all on public.site_config from anon, authenticated;
grant select on public.site_config to anon, authenticated;
grant insert, update on public.site_config to authenticated;
drop policy if exists "Public site content" on public.site_config;
create policy "Public site content" on public.site_config for select to anon, authenticated using (true);
drop policy if exists "Admins insert site content" on public.site_config;
create policy "Admins insert site content" on public.site_config for insert to authenticated with check (exists (select 1 from public.site_admins where user_id = (select auth.uid())));
drop policy if exists "Admins update site content" on public.site_config;
create policy "Admins update site content" on public.site_config for update to authenticated using (exists (select 1 from public.site_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.site_admins where user_id = (select auth.uid())));
commit;
