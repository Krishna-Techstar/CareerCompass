-- ==============================================================================
-- CareerCompass - Supabase Database Schema with Row Level Security (RLS)
-- Copy and paste this script directly into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create PROFILES Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  segment text,
  stream text,
  is_minor boolean default false,
  parental_consent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Policies for profiles: Users can only read, insert, update, and delete their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
  on public.profiles
  for delete
  using (auth.uid() = id);


-- 2. Create ASSESSMENTS Table
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  segment text not null,
  answers jsonb default '[]'::jsonb,
  profile jsonb default '{}'::jsonb,
  report jsonb,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on assessments
alter table public.assessments enable row level security;

-- Policies for assessments: Users can only read, insert, update, and delete their own assessment records
drop policy if exists "Users can view own assessments" on public.assessments;
create policy "Users can view own assessments"
  on public.assessments
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own assessments" on public.assessments;
create policy "Users can insert own assessments"
  on public.assessments
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own assessments" on public.assessments;
create policy "Users can update own assessments"
  on public.assessments
  for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own assessments" on public.assessments;
create policy "Users can delete own assessments"
  on public.assessments
  for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists assessments_user_id_idx on public.assessments (user_id);
create index if not exists assessments_status_idx on public.assessments (status);


-- 3. Automatic Profile Creation on Signup (Email & Google OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute handle_new_user on every auth.users signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
