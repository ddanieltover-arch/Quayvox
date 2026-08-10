-- Quayvox schema: profiles, shipments, events, contact_messages + RLS

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shipments
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  origin text not null,
  destination text not null,
  carrier text not null,
  status text not null check (status in ('Pending', 'In Transit', 'Customs', 'Delivered', 'Exception')),
  weight numeric not null default 0,
  dim_l numeric not null default 0,
  dim_w numeric not null default 0,
  dim_h numeric not null default 0,
  cost numeric not null default 0,
  eta date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  mode text not null check (mode in ('Air', 'Ocean', 'Rail', 'Road')),
  priority text not null check (priority in ('Express', 'Standard', 'Economy')),
  shipper text not null default '',
  consignee text not null default '',
  documents text[] not null default '{}',
  tags text[] not null default '{}',
  customer_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_tracking_number_idx on public.shipments (tracking_number);
create index if not exists shipments_status_idx on public.shipments (status);
create index if not exists shipments_created_at_idx on public.shipments (created_at desc);

-- Shipment timeline events
create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status text,
  location text,
  message text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shipment_events_shipment_id_idx on public.shipment_events (shipment_id, occurred_at desc);

-- Contact form submissions
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helper (security definer to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- Shipments: authenticated admins full access
drop policy if exists "Admins manage shipments" on public.shipments;
create policy "Admins manage shipments"
  on public.shipments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public track: anon/authenticated can SELECT a single shipment by exact tracking_number
-- (Supabase client must filter .eq('tracking_number', value); listing all is not blocked by
-- this alone for authenticated non-admin — tighten with restrictive policy for anon only)
drop policy if exists "Public can select shipment by tracking filter" on public.shipments;
create policy "Public can select shipment by tracking filter"
  on public.shipments for select
  to anon, authenticated
  using (true);

-- NOTE: Broad SELECT is required for PostgREST .eq() filters to work for anon.
-- Non-admin authenticated users who are not admin still get SELECT; write is admin-only.
-- For stronger lockdown, use a SECURITY DEFINER RPC `get_shipment_by_tracking(text)`.

create or replace function public.get_shipment_by_tracking(p_tracking text)
returns setof public.shipments
language sql
stable
security definer
set search_path = public
as $$
  select * from public.shipments
  where tracking_number = upper(trim(p_tracking))
     or tracking_number = trim(p_tracking)
  limit 1;
$$;

grant execute on function public.get_shipment_by_tracking(text) to anon, authenticated;

create or replace function public.get_events_by_tracking(p_tracking text)
returns setof public.shipment_events
language sql
stable
security definer
set search_path = public
as $$
  select e.*
  from public.shipment_events e
  join public.shipments s on s.id = e.shipment_id
  where s.tracking_number = upper(trim(p_tracking))
     or s.tracking_number = trim(p_tracking)
  order by e.occurred_at desc;
$$;

grant execute on function public.get_events_by_tracking(text) to anon, authenticated;

-- Prefer RPC for public; revoke broad anon select after RPC is in place
drop policy if exists "Public can select shipment by tracking filter" on public.shipments;

drop policy if exists "Admins select all shipments" on public.shipments;
create policy "Admins select all shipments"
  on public.shipments for select
  to authenticated
  using (public.is_admin());

-- Events: admins manage; public via RPC only
drop policy if exists "Admins manage events" on public.shipment_events;
create policy "Admins manage events"
  on public.shipment_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Contact: service role / API inserts preferred; allow authenticated admin read
drop policy if exists "Admins read contacts" on public.contact_messages;
create policy "Admins read contacts"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins update contacts" on public.contact_messages;
create policy "Admins update contacts"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin());
