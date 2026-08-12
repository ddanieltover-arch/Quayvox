-- Quayvox: geo columns + position history for live map tracking

alter table public.shipments
  add column if not exists origin_lat double precision,
  add column if not exists origin_lng double precision,
  add column if not exists destination_lat double precision,
  add column if not exists destination_lng double precision,
  add column if not exists current_lat double precision,
  add column if not exists current_lng double precision,
  add column if not exists current_location_updated_at timestamptz;

create table if not exists public.shipment_positions (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  label text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shipment_positions_shipment_id_recorded_at_idx
  on public.shipment_positions (shipment_id, recorded_at desc);

-- Backfill OD coords for known port names (idempotent where null)
update public.shipments set origin_lat = 31.2, origin_lng = 121.5
  where origin = 'Shanghai, CN' and origin_lat is null;
update public.shipments set destination_lat = 31.2, destination_lng = 121.5
  where destination = 'Shanghai, CN' and destination_lat is null;

update public.shipments set origin_lat = 51.9, origin_lng = 4.5
  where origin = 'Rotterdam, NL' and origin_lat is null;
update public.shipments set destination_lat = 51.9, destination_lng = 4.5
  where destination = 'Rotterdam, NL' and destination_lat is null;

update public.shipments set origin_lat = 1.3, origin_lng = 103.8
  where origin = 'Singapore, SG' and origin_lat is null;
update public.shipments set destination_lat = 1.3, destination_lng = 103.8
  where destination = 'Singapore, SG' and destination_lat is null;

update public.shipments set origin_lat = 53.5, origin_lng = 9.9
  where origin = 'Hamburg, DE' and origin_lat is null;
update public.shipments set destination_lat = 53.5, destination_lng = 9.9
  where destination = 'Hamburg, DE' and destination_lat is null;

update public.shipments set origin_lat = 35.7, origin_lng = 139.7
  where origin = 'Tokyo, JP' and origin_lat is null;
update public.shipments set destination_lat = 35.7, destination_lng = 139.7
  where destination = 'Tokyo, JP' and destination_lat is null;

update public.shipments set origin_lat = 19.1, origin_lng = 72.9
  where origin = 'Mumbai, IN' and origin_lat is null;
update public.shipments set destination_lat = 19.1, destination_lng = 72.9
  where destination = 'Mumbai, IN' and destination_lat is null;

update public.shipments set origin_lat = -23.5, origin_lng = -46.6
  where origin = 'Sao Paulo, BR' and origin_lat is null;
update public.shipments set destination_lat = -23.5, destination_lng = -46.6
  where destination = 'Sao Paulo, BR' and destination_lat is null;

update public.shipments set origin_lat = 35.2, origin_lng = 129.1
  where origin = 'Busan, KR' and origin_lat is null;
update public.shipments set destination_lat = 35.2, destination_lng = 129.1
  where destination = 'Busan, KR' and destination_lat is null;

update public.shipments set origin_lat = -37.8, origin_lng = 144.9
  where origin = 'Melbourne, AU' and origin_lat is null;
update public.shipments set destination_lat = -37.8, destination_lng = 144.9
  where destination = 'Melbourne, AU' and destination_lat is null;

update public.shipments set origin_lat = 25.2, origin_lng = 55.3
  where origin = 'Dubai, AE' and origin_lat is null;
update public.shipments set destination_lat = 25.2, destination_lng = 55.3
  where destination = 'Dubai, AE' and destination_lat is null;

update public.shipments set origin_lat = 34.1, origin_lng = -118.2
  where origin = 'Los Angeles, US' and origin_lat is null;
update public.shipments set destination_lat = 34.1, destination_lng = -118.2
  where destination = 'Los Angeles, US' and destination_lat is null;

update public.shipments set origin_lat = 40.7, origin_lng = -74.0
  where origin = 'New York, US' and origin_lat is null;
update public.shipments set destination_lat = 40.7, destination_lng = -74.0
  where destination = 'New York, US' and destination_lat is null;

update public.shipments set origin_lat = -33.9, origin_lng = 151.2
  where origin = 'Sydney, AU' and origin_lat is null;
update public.shipments set destination_lat = -33.9, destination_lng = 151.2
  where destination = 'Sydney, AU' and destination_lat is null;

update public.shipments set origin_lat = 51.5, origin_lng = -0.1
  where origin = 'London, UK' and origin_lat is null;
update public.shipments set destination_lat = 51.5, destination_lng = -0.1
  where destination = 'London, UK' and destination_lat is null;

update public.shipments set origin_lat = -1.3, origin_lng = 36.8
  where origin = 'Nairobi, KE' and origin_lat is null;
update public.shipments set destination_lat = -1.3, destination_lng = 36.8
  where destination = 'Nairobi, KE' and destination_lat is null;

update public.shipments set origin_lat = 25.8, origin_lng = -80.2
  where origin = 'Miami, US' and origin_lat is null;
update public.shipments set destination_lat = 25.8, destination_lng = -80.2
  where destination = 'Miami, US' and destination_lat is null;

update public.shipments set origin_lat = -36.8, origin_lng = 174.8
  where origin = 'Auckland, NZ' and origin_lat is null;
update public.shipments set destination_lat = -36.8, destination_lng = 174.8
  where destination = 'Auckland, NZ' and destination_lat is null;

update public.shipments set origin_lat = 6.5, origin_lng = 3.4
  where origin = 'Lagos, NG' and origin_lat is null;
update public.shipments set destination_lat = 6.5, destination_lng = 3.4
  where destination = 'Lagos, NG' and destination_lat is null;
