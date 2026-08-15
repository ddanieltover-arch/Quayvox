-- Allow shipment status "On Hold"

alter table public.shipments drop constraint if exists shipments_status_check;

alter table public.shipments
  add constraint shipments_status_check
  check (status in ('Pending', 'In Transit', 'Customs', 'On Hold', 'Delivered', 'Exception'));
