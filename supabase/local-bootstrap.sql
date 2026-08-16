-- ─────────────────────────────────────────────────────────────────────────────
--  Amorce LOCALE — surface WCL minimale dont le portail a besoin.
--
--  Le dépôt wclplay compte 71 fichiers SQL sans ordre d'application : les
--  rejouer tous en local est un chantier à part entière (cf. D15.2 du cahier
--  technique). Ce fichier ne crée QUE ce que le portail touche, afin que la
--  démonstration soit reproductible en une commande.
--
--  ⚠️ USAGE LOCAL UNIQUEMENT. Ne jamais exécuter sur la production : la vraie
--  base possède déjà ces objets, avec des colonnes supplémentaires.
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type content_type as enum ('video','podcast','book','summary','course','biography');
exception when duplicate_object then null; end $$;

create table if not exists public.content (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text,
  description   text,
  type          content_type not null default 'book',
  media_format  text,
  access_level  text not null default 'premium' check (access_level in ('free','premium')),
  is_published  boolean default true,
  created_at    timestamptz default now()
);

create table if not exists public.book_details (
  content_id     uuid primary key references public.content(id) on delete cascade,
  editeur        text,
  isbn           text,
  nombre_pages   int,
  statut_droits  text
);

-- Table des administrateurs WCL, et le is_admin() qui garde la file de
-- validation (module D). Forme identique à la production.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

notify pgrst, 'reload schema';
