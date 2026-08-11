-- Seed demo shipments + timeline events (stable IDs for QA)

insert into public.shipments (
  id, tracking_number, origin, destination, carrier, status, weight,
  dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
  shipper, consignee, documents, tags, customer_email, notes, created_at, updated_at
) values
(
  'a1000001-0000-4000-8000-000000000001',
  'SH-2026-7842',
  'Shanghai, CN', 'Los Angeles, US', 'Maersk', 'In Transit', 12500,
  40, 8, 8.5, 4200, '2026-06-15', 68, 'Ocean', 'Standard',
  'TechParts Ltd.', 'Global Electronics Inc.',
  array['BOL-7842.pdf', 'Invoice-7842.pdf'],
  array['electronics', 'priority'],
  'receiving@globalelectronics.example',
  'Ocean FCL electronics',
  '2026-05-01T10:00:00Z', '2026-05-28T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000002',
  'SH-2026-7843',
  'Rotterdam, NL', 'New York, US', 'Hapag-Lloyd', 'Customs', 8500,
  20, 8, 8, 3100, '2026-06-08', 42, 'Ocean', 'Express',
  'European Goods BV', 'NY Imports LLC',
  array['BOL-7843.pdf'],
  array['consumer-goods'],
  'ops@nyimports.example',
  null,
  '2026-05-10T10:00:00Z', '2026-05-27T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000003',
  'SH-2026-7844',
  'Singapore, SG', 'Sydney, AU', 'DHL Express', 'In Transit', 450,
  4, 3, 2, 890, '2026-05-30', 89, 'Air', 'Express',
  'Asia Pharma Co.', 'MedSupply Australia',
  array['AWB-7844.pdf', 'Invoice-7844.pdf', 'SDS-7844.pdf'],
  array['pharma', 'temperature-controlled'],
  'warehouse@medsupply.example',
  null,
  '2026-05-25T10:00:00Z', '2026-05-29T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000004',
  'SH-2026-7845',
  'Hamburg, DE', 'Dubai, AE', 'DB Schenker', 'Pending', 22000,
  60, 8, 9, 5600, '2026-07-01', 23, 'Rail', 'Economy',
  'AutoParts GmbH', 'Desert Motors Trading',
  array['CMR-7845.pdf'],
  array['automotive'],
  null,
  null,
  '2026-05-20T10:00:00Z', '2026-05-26T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000005',
  'SH-2026-7846',
  'Tokyo, JP', 'London, UK', 'FedEx', 'Delivered', 120,
  2, 1.5, 1, 450, '2026-05-25', 100, 'Air', 'Express',
  'Sony Electronics', 'TechWorld UK',
  array['AWB-7846.pdf', 'Invoice-7846.pdf'],
  array['electronics'],
  'receiving@techworld.example',
  null,
  '2026-05-18T10:00:00Z', '2026-05-25T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000006',
  'SH-2026-7847',
  'Mumbai, IN', 'Nairobi, KE', 'Safmarine', 'Exception', 15000,
  40, 8, 8.5, 3800, '2026-06-20', 35, 'Ocean', 'Standard',
  'Textile Mills Ltd.', 'East African Traders',
  array['BOL-7847.pdf'],
  array['textiles', 'delayed'],
  'ops@eastafrican.example',
  'Port congestion delay',
  '2026-05-05T10:00:00Z', '2026-05-28T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000007',
  'SH-2026-7848',
  'Sao Paulo, BR', 'Miami, US', 'LATAM Cargo', 'In Transit', 3500,
  15, 6, 6, 2100, '2026-06-02', 78, 'Air', 'Standard',
  'Coffee Exporters SA', 'Miami Coffee Roasters',
  array['AWB-7848.pdf', 'Phytosanitary-7848.pdf'],
  array['food', 'perishable'],
  null,
  null,
  '2026-05-22T10:00:00Z', '2026-05-29T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000008',
  'SH-2026-7849',
  'Busan, KR', 'Hamburg, DE', 'ONE Line', 'In Transit', 18000,
  40, 8, 8.5, 4800, '2026-06-28', 52, 'Ocean', 'Economy',
  'Korea Steel Corp', 'EuroSteel GmbH',
  array['BOL-7849.pdf', 'Invoice-7849.pdf'],
  array['industrial'],
  null,
  null,
  '2026-05-08T10:00:00Z', '2026-05-27T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-000000000009',
  'SH-2026-7850',
  'Melbourne, AU', 'Auckland, NZ', 'Toll Group', 'Delivered', 800,
  6, 4, 3, 320, '2026-05-28', 100, 'Road', 'Express',
  'AusFresh Produce', 'NZ Grocers Ltd.',
  array['CMR-7850.pdf'],
  array['food', 'perishable'],
  null,
  null,
  '2026-05-26T10:00:00Z', '2026-05-28T14:00:00Z'
),
(
  'a1000001-0000-4000-8000-00000000000a',
  'SH-2026-7851',
  'Dubai, AE', 'Lagos, NG', 'Emirates SkyCargo', 'Pending', 2000,
  10, 5, 4, 1500, '2026-06-10', 12, 'Air', 'Standard',
  'Gulf Electronics', 'Nigeria Tech Hub',
  array['AWB-7851.pdf'],
  array['electronics'],
  null,
  null,
  '2026-05-28T10:00:00Z', '2026-05-29T14:00:00Z'
)
on conflict (tracking_number) do nothing;

insert into public.shipment_events (id, shipment_id, status, location, message, occurred_at)
values
  ('b1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'Pending', 'Shanghai, CN', 'Shipment booked and label created', '2026-05-01T12:00:00Z'),
  ('b1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', 'In Transit', 'Shanghai Port', 'Container gated in at origin terminal', '2026-05-05T08:00:00Z'),
  ('b1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000001', 'In Transit', 'Pacific Ocean', 'Vessel departed Shanghai for Los Angeles', '2026-05-08T16:00:00Z'),
  ('b1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000001', 'In Transit', 'En route', 'Vessel position update — 68% complete', '2026-05-28T10:00:00Z'),
  ('b1000001-0000-4000-8000-000000000010', 'a1000001-0000-4000-8000-000000000002', 'Pending', 'Rotterdam, NL', 'Shipment created', '2026-05-10T09:00:00Z'),
  ('b1000001-0000-4000-8000-000000000011', 'a1000001-0000-4000-8000-000000000002', 'In Transit', 'Rotterdam Port', 'Loaded on vessel', '2026-05-14T11:00:00Z'),
  ('b1000001-0000-4000-8000-000000000012', 'a1000001-0000-4000-8000-000000000002', 'Customs', 'New York, US', 'Arrived at destination — customs hold', '2026-05-27T15:00:00Z'),
  ('b1000001-0000-4000-8000-000000000020', 'a1000001-0000-4000-8000-000000000003', 'Pending', 'Singapore, SG', 'Air waybill issued', '2026-05-25T07:00:00Z'),
  ('b1000001-0000-4000-8000-000000000021', 'a1000001-0000-4000-8000-000000000003', 'In Transit', 'Singapore Changi', 'Departed origin hub', '2026-05-26T02:00:00Z'),
  ('b1000001-0000-4000-8000-000000000022', 'a1000001-0000-4000-8000-000000000003', 'In Transit', 'Sydney, AU', 'Arrived destination hub — out for final mile', '2026-05-29T06:00:00Z'),
  ('b1000001-0000-4000-8000-000000000030', 'a1000001-0000-4000-8000-000000000005', 'Pending', 'Tokyo, JP', 'Pickup scheduled', '2026-05-18T08:00:00Z'),
  ('b1000001-0000-4000-8000-000000000031', 'a1000001-0000-4000-8000-000000000005', 'In Transit', 'Narita', 'Departed origin', '2026-05-19T14:00:00Z'),
  ('b1000001-0000-4000-8000-000000000032', 'a1000001-0000-4000-8000-000000000005', 'Delivered', 'London, UK', 'Delivered to consignee', '2026-05-25T11:30:00Z'),
  ('b1000001-0000-4000-8000-000000000040', 'a1000001-0000-4000-8000-000000000006', 'Pending', 'Mumbai, IN', 'Shipment booked', '2026-05-05T10:00:00Z'),
  ('b1000001-0000-4000-8000-000000000041', 'a1000001-0000-4000-8000-000000000006', 'In Transit', 'Mumbai Port', 'Vessel departed', '2026-05-12T18:00:00Z'),
  ('b1000001-0000-4000-8000-000000000042', 'a1000001-0000-4000-8000-000000000006', 'Exception', 'Mombasa approach', 'Delay due to port congestion — ETA revised', '2026-05-28T09:00:00Z')
on conflict (id) do nothing;
