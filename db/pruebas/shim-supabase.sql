-- Lo minimo de Supabase que las migraciones dan por sentado, para poder correr
-- las pruebas en un Postgres en proceso. En el proyecto de verdad esto ya existe:
-- acá solo se recrea lo que las migraciones tocan.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  aud text,
  role text,
  created_at timestamptz not null default now()
);

-- La de Supabase lee el claim `sub` del JWT que el pooler deja en la sesion.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$ select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid $$;

do $$ begin
  create role anon nologin noinherit;
exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin noinherit;
exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role nologin noinherit bypassrls;
exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase trae esto configurado de fabrica: sin los grants, `authenticated` no
-- llega ni a evaluar las politicas — se choca antes con un permiso denegado.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
