-- Quayvox: sender/receiver party details, schedule, freight extras for new shipment form

alter table public.shipments
  add column if not exists sender_name text not null default '',
  add column if not exists sender_phone text not null default '',
  add column if not exists sender_email text,
  add column if not exists sender_street text not null default '',
  add column if not exists sender_city text not null default '',
  add column if not exists sender_state text,
  add column if not exists sender_postal text,
  add column if not exists sender_country text not null default '',
  add column if not exists receiver_name text not null default '',
  add column if not exists receiver_phone text not null default '',
  add column if not exists receiver_email text,
  add column if not exists receiver_street text not null default '',
  add column if not exists receiver_city text not null default '',
  add column if not exists receiver_state text,
  add column if not exists receiver_postal text,
  add column if not exists receiver_country text not null default '',
  add column if not exists departure_at timestamptz,
  add column if not exists delivery_at timestamptz,
  add column if not exists volume numeric not null default 0,
  add column if not exists payment_method text not null default '';

-- Backfill party names from legacy shipper/consignee where empty
update public.shipments
set sender_name = shipper
where coalesce(trim(sender_name), '') = '' and coalesce(trim(shipper), '') <> '';

update public.shipments
set receiver_name = consignee
where coalesce(trim(receiver_name), '') = '' and coalesce(trim(consignee), '') <> '';

update public.shipments
set receiver_email = customer_email
where receiver_email is null and customer_email is not null;
