-- Quayvox: unified address fields (single box per party + current location)

alter table public.shipments
  add column if not exists sender_address text not null default '',
  add column if not exists receiver_address text not null default '',
  add column if not exists current_address text;

-- Backfill sender_address from legacy split fields
update public.shipments
set sender_address = trim(both from concat_ws(', ',
  nullif(trim(sender_street), ''),
  nullif(trim(sender_city), ''),
  nullif(trim(sender_state), ''),
  nullif(trim(sender_postal), ''),
  nullif(trim(sender_country), '')
))
where coalesce(trim(sender_address), '') = ''
  and (
    coalesce(trim(sender_street), '') <> ''
    or coalesce(trim(sender_city), '') <> ''
    or coalesce(trim(sender_country), '') <> ''
  );

-- Backfill receiver_address from legacy split fields
update public.shipments
set receiver_address = trim(both from concat_ws(', ',
  nullif(trim(receiver_street), ''),
  nullif(trim(receiver_city), ''),
  nullif(trim(receiver_state), ''),
  nullif(trim(receiver_postal), ''),
  nullif(trim(receiver_country), '')
))
where coalesce(trim(receiver_address), '') = ''
  and (
    coalesce(trim(receiver_street), '') <> ''
    or coalesce(trim(receiver_city), '') <> ''
    or coalesce(trim(receiver_country), '') <> ''
  );

-- Use route labels when party address is still empty
update public.shipments
set sender_address = origin
where coalesce(trim(sender_address), '') = '' and coalesce(trim(origin), '') <> '';

update public.shipments
set receiver_address = destination
where coalesce(trim(receiver_address), '') = '' and coalesce(trim(destination), '') <> '';

-- Backfill current_address from coordinates when present
update public.shipments
set current_address = trim(both from concat(current_lat::text, ', ', current_lng::text))
where current_address is null
  and current_lat is not null
  and current_lng is not null;
