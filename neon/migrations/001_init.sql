-- Quayvox Neon schema: shipments, events, contact_messages
-- Auth is env-based (ADMIN_EMAIL + ADMIN_PASSWORD_HASH); no auth.users / RLS.

create extension if not exists "pgcrypto";

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  origin text not null,
  destination text not null,
  carrier text not null,
  status text not null check (status in ('Pending', 'In Transit', 'Customs', 'On Hold', 'Delivered', 'Exception')),
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

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status text,
  location text,
  message text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shipment_events_shipment_id_idx
  on public.shipment_events (shipment_id, occurred_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();
