create extension if not exists pgcrypto;

create table if not exists public.users (
  uid uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  profile_image text,
  role text check (role in ('Student', 'Founder', 'Investor')),
  sector text,
  budget text,
  country text,
  experience_level text,
  goals text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  education_level text,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  available_time text,
  startup_stage text,
  team_size text,
  existing_idea text,
  revenue_status text,
  ticket_size text,
  preferred_sectors text[] not null default '{}',
  risk_level text,
  preferred_region text,
  notifications jsonb not null default '{"weeklyDigest":true,"productUpdates":true,"dealAlerts":true}'::jsonb,
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system'))
);

create table if not exists public.problems (
  id text primary key,
  title text not null,
  description text not null,
  affected_users text not null,
  sector text not null,
  real_world_context text not null default '',
  severity text not null check (severity in ('High', 'Medium', 'Emerging')),
  demand_score integer not null,
  monetization_score integer not null,
  difficulty_score integer not null,
  competition_score integer not null,
  buildynex_score integer not null,
  ai_explanation text not null,
  opportunity_tag text not null check (opportunity_tag in ('White Space', 'Infrastructure Gap', 'Behavior Shift', 'Fast-Growth')),
  why_it_exists text not null,
  pain_points text[] not null default '{}',
  market_need_summary text not null,
  target_users text[] not null default '{}',
  service_business_ideas text[] not null default '{}',
  physical_product_ideas text[] not null default '{}',
  recommendation_for text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_problems (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null references public.problems(id) on delete cascade,
  saved_at timestamptz not null default timezone('utc', now()),
  unique (user_id, problem_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  selected_problem_id text not null,
  selected_problem_title text not null,
  sector text not null,
  role text not null check (role in ('Student', 'Founder', 'Investor')),
  solution_data jsonb not null,
  roadmap_data jsonb not null,
  branding_data jsonb not null,
  progress_status text not null check (progress_status in ('Discovery', 'Planning', 'Validating', 'Building', 'Launch Ready')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.users enable row level security;
alter table public.problems enable row level security;
alter table public.saved_problems enable row level security;
alter table public.projects enable row level security;

create policy if not exists "Users can read their own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = uid);

create policy if not exists "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = uid);

create policy if not exists "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = uid)
  with check (auth.uid() = uid);

create policy if not exists "Authenticated users can read problems"
  on public.problems for select
  to authenticated
  using (true);

create policy if not exists "Authenticated users can insert problems"
  on public.problems for insert
  to authenticated
  with check (true);

create policy if not exists "Authenticated users can update problems"
  on public.problems for update
  to authenticated
  using (true)
  with check (true);

create policy if not exists "Users can read their saved problems"
  on public.saved_problems for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users can save their own problems"
  on public.saved_problems for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own saved problems"
  on public.saved_problems for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Users can read their own projects"
  on public.projects for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own projects"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own projects"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own projects"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

create policy if not exists "Public profile images are readable"
  on storage.objects for select
  to public
  using (bucket_id = 'profile-images');

create policy if not exists "Users can upload their own profile images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "Users can update their own profile images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "Users can delete their own profile images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
