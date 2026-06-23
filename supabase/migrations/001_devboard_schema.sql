-- DevBoard schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key default gen_random_uuid(),
  github_id text unique not null,
  username text not null,
  avatar_url text,
  bio text,
  created_at timestamp default now()
);

create table public.commits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  repo_name text not null,
  commit_count integer default 0,
  date date not null,
  created_at timestamp default now()
);

create table public.xp_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  total_xp integer default 0,
  streak integer default 0,
  last_active date,
  updated_at timestamp default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index commits_user_id_idx on public.commits (user_id);
create index commits_date_idx on public.commits (date);

-- ---------------------------------------------------------------------------
-- Helper: resolve app user from GitHub OAuth session
-- GitHub provider_id is stored in auth.jwt() user_metadata after sign-in.
-- ---------------------------------------------------------------------------

create or replace function public.current_devboard_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id')
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.commits enable row level security;
alter table public.xp_stats enable row level security;

-- users
create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

create policy "Users can insert own profile"
  on public.users
  for insert
  to authenticated
  with check (github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'))
  with check (github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

create policy "Users can delete own profile"
  on public.users
  for delete
  to authenticated
  using (github_id = (auth.jwt() -> 'user_metadata' ->> 'provider_id'));

-- commits
create policy "Users can read own commits"
  on public.commits
  for select
  to authenticated
  using (user_id = public.current_devboard_user_id());

create policy "Users can insert own commits"
  on public.commits
  for insert
  to authenticated
  with check (user_id = public.current_devboard_user_id());

create policy "Users can update own commits"
  on public.commits
  for update
  to authenticated
  using (user_id = public.current_devboard_user_id())
  with check (user_id = public.current_devboard_user_id());

create policy "Users can delete own commits"
  on public.commits
  for delete
  to authenticated
  using (user_id = public.current_devboard_user_id());

-- xp_stats
create policy "Users can read own xp stats"
  on public.xp_stats
  for select
  to authenticated
  using (user_id = public.current_devboard_user_id());

create policy "Users can insert own xp stats"
  on public.xp_stats
  for insert
  to authenticated
  with check (user_id = public.current_devboard_user_id());

create policy "Users can update own xp stats"
  on public.xp_stats
  for update
  to authenticated
  using (user_id = public.current_devboard_user_id())
  with check (user_id = public.current_devboard_user_id());

create policy "Users can delete own xp stats"
  on public.xp_stats
  for delete
  to authenticated
  using (user_id = public.current_devboard_user_id());
