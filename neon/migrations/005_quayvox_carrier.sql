-- Quayvox: all shipments use the house carrier

update public.shipments
set carrier = 'Quayvox - Global Logistics'
where carrier is distinct from 'Quayvox - Global Logistics';
