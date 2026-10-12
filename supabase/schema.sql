-- CivicSnap hackathon demo schema. Apply in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.campus_reports (
  id uuid primary key default gen_random_uuid(),
  tracking_token uuid not null unique,
  title text not null,
  description text not null,
  category text not null default 'Other',
  priority text not null default 'Standard' check (priority in ('Low','Standard','Urgent')),
  status text not null default 'Received' check (status in ('Received','Assigned','In progress','Resolved')),
  campus text not null default 'North Campus',
  location text not null,
  image_path text not null,
  voice_transcript text not null default '',
  resolution_note text,
  response_target_minutes integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campus_report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.campus_reports(id) on delete cascade,
  status text not null check (status in ('Received','Assigned','In progress','Resolved')),
  note text not null,
  author text not null,
  created_at timestamptz not null default now()
);

alter table public.campus_reports enable row level security;
alter table public.campus_report_updates enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campus-report-photos', 'campus-report-photos', false, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 4194304;
