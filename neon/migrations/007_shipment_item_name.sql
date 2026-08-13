-- Quayvox: name / item being shipped on each shipment

alter table public.shipments
  add column if not exists item_name text not null default '';
