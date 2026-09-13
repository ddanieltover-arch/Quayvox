-- Quayvox: optional shipment cost currency (default USD)

alter table public.shipments
  add column if not exists cost_currency text not null default 'USD';
