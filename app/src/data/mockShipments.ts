import { v4 as uuidv4 } from 'uuid';
import { QUAYVOX_CARRIER } from '@/lib/shipmentConstants';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  status: 'Pending' | 'In Transit' | 'Customs' | 'Delivered' | 'Exception';
  weight: number;
  dimensions: { l: number; w: number; h: number };
  cost: number;
  eta: string;
  progress: number;
  mode: 'Air' | 'Ocean' | 'Rail' | 'Road';
  priority: 'Express' | 'Standard' | 'Economy';
  shipper: string;
  consignee: string;
  createdAt: string;
  updatedAt: string;
  documents: string[];
  tags: string[];
  customerEmail?: string | null;
  notes?: string | null;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string | null;
  senderAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string | null;
  receiverAddress?: string;
  currentAddress?: string | null;
  departureAt?: string | null;
  deliveryAt?: string | null;
  volume?: number;
  paymentMethod?: string;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  currentLocationUpdatedAt?: string | null;
}

export const generateMockShipments = (): Shipment[] => [
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7842',
    origin: 'Shanghai, CN',
    destination: 'Los Angeles, US',
    carrier: QUAYVOX_CARRIER,
    status: 'In Transit',
    weight: 12500,
    dimensions: { l: 40, w: 8, h: 8.5 },
    cost: 4200,
    eta: '2026-06-15',
    progress: 68,
    mode: 'Ocean',
    priority: 'Standard',
    shipper: 'TechParts Ltd.',
    consignee: 'Global Electronics Inc.',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-28',
    documents: ['BOL-7842.pdf', 'Invoice-7842.pdf'],
    tags: ['electronics', 'priority'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7843',
    origin: 'Rotterdam, NL',
    destination: 'New York, US',
    carrier: QUAYVOX_CARRIER,
    status: 'Customs',
    weight: 8500,
    dimensions: { l: 20, w: 8, h: 8 },
    cost: 3100,
    eta: '2026-06-08',
    progress: 42,
    mode: 'Ocean',
    priority: 'Express',
    shipper: 'European Goods BV',
    consignee: 'NY Imports LLC',
    createdAt: '2026-05-10',
    updatedAt: '2026-05-27',
    documents: ['BOL-7843.pdf'],
    tags: ['consumer-goods'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7844',
    origin: 'Singapore, SG',
    destination: 'Sydney, AU',
    carrier: QUAYVOX_CARRIER,
    status: 'In Transit',
    weight: 450,
    dimensions: { l: 4, w: 3, h: 2 },
    cost: 890,
    eta: '2026-05-30',
    progress: 89,
    mode: 'Air',
    priority: 'Express',
    shipper: 'Asia Pharma Co.',
    consignee: 'MedSupply Australia',
    createdAt: '2026-05-25',
    updatedAt: '2026-05-29',
    documents: ['AWB-7844.pdf', 'Invoice-7844.pdf', 'SDS-7844.pdf'],
    tags: ['pharma', 'temperature-controlled'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7845',
    origin: 'Hamburg, DE',
    destination: 'Dubai, AE',
    carrier: QUAYVOX_CARRIER,
    status: 'Pending',
    weight: 22000,
    dimensions: { l: 60, w: 8, h: 9 },
    cost: 5600,
    eta: '2026-07-01',
    progress: 23,
    mode: 'Rail',
    priority: 'Economy',
    shipper: 'AutoParts GmbH',
    consignee: 'Desert Motors Trading',
    createdAt: '2026-05-20',
    updatedAt: '2026-05-26',
    documents: ['CMR-7845.pdf'],
    tags: ['automotive'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7846',
    origin: 'Tokyo, JP',
    destination: 'London, UK',
    carrier: QUAYVOX_CARRIER,
    status: 'Delivered',
    weight: 120,
    dimensions: { l: 2, w: 1.5, h: 1 },
    cost: 450,
    eta: '2026-05-25',
    progress: 100,
    mode: 'Air',
    priority: 'Express',
    shipper: 'Sony Electronics',
    consignee: 'TechWorld UK',
    createdAt: '2026-05-18',
    updatedAt: '2026-05-25',
    documents: ['AWB-7846.pdf', 'Invoice-7846.pdf'],
    tags: ['electronics'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7847',
    origin: 'Mumbai, IN',
    destination: 'Nairobi, KE',
    carrier: QUAYVOX_CARRIER,
    status: 'Exception',
    weight: 15000,
    dimensions: { l: 40, w: 8, h: 8.5 },
    cost: 3800,
    eta: '2026-06-20',
    progress: 35,
    mode: 'Ocean',
    priority: 'Standard',
    shipper: 'Textile Mills Ltd.',
    consignee: 'East African Traders',
    createdAt: '2026-05-05',
    updatedAt: '2026-05-28',
    documents: ['BOL-7847.pdf'],
    tags: ['textiles', 'delayed'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7848',
    origin: 'Sao Paulo, BR',
    destination: 'Miami, US',
    carrier: QUAYVOX_CARRIER,
    status: 'In Transit',
    weight: 3500,
    dimensions: { l: 15, w: 6, h: 6 },
    cost: 2100,
    eta: '2026-06-02',
    progress: 78,
    mode: 'Air',
    priority: 'Standard',
    shipper: 'Coffee Exporters SA',
    consignee: 'Miami Coffee Roasters',
    createdAt: '2026-05-22',
    updatedAt: '2026-05-29',
    documents: ['AWB-7848.pdf', 'Phytosanitary-7848.pdf'],
    tags: ['food', 'perishable'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7849',
    origin: 'Busan, KR',
    destination: 'Hamburg, DE',
    carrier: QUAYVOX_CARRIER,
    status: 'In Transit',
    weight: 18000,
    dimensions: { l: 40, w: 8, h: 8.5 },
    cost: 4800,
    eta: '2026-06-28',
    progress: 52,
    mode: 'Ocean',
    priority: 'Economy',
    shipper: 'Korea Steel Corp',
    consignee: 'EuroSteel GmbH',
    createdAt: '2026-05-08',
    updatedAt: '2026-05-27',
    documents: ['BOL-7849.pdf', 'Invoice-7849.pdf'],
    tags: ['industrial'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7850',
    origin: 'Melbourne, AU',
    destination: 'Auckland, NZ',
    carrier: QUAYVOX_CARRIER,
    status: 'Delivered',
    weight: 800,
    dimensions: { l: 6, w: 4, h: 3 },
    cost: 320,
    eta: '2026-05-28',
    progress: 100,
    mode: 'Road',
    priority: 'Express',
    shipper: 'AusFresh Produce',
    consignee: 'NZ Grocers Ltd.',
    createdAt: '2026-05-26',
    updatedAt: '2026-05-28',
    documents: ['CMR-7850.pdf'],
    tags: ['food', 'perishable'],
  },
  {
    id: uuidv4(),
    trackingNumber: 'SH-2026-7851',
    origin: 'Dubai, AE',
    destination: 'Lagos, NG',
    carrier: QUAYVOX_CARRIER,
    status: 'Pending',
    weight: 2000,
    dimensions: { l: 10, w: 5, h: 4 },
    cost: 1500,
    eta: '2026-06-10',
    progress: 12,
    mode: 'Air',
    priority: 'Standard',
    shipper: 'Gulf Electronics',
    consignee: 'Nigeria Tech Hub',
    createdAt: '2026-05-28',
    updatedAt: '2026-05-29',
    documents: ['AWB-7851.pdf'],
    tags: ['electronics'],
  },
];

export const carriers = [QUAYVOX_CARRIER];
export const origins = ['Shanghai, CN', 'Rotterdam, NL', 'Singapore, SG', 'Hamburg, DE', 'Tokyo, JP', 'Mumbai, IN', 'Sao Paulo, BR', 'Busan, KR', 'Melbourne, AU', 'Dubai, AE'];
export const destinations = ['Los Angeles, US', 'New York, US', 'Sydney, AU', 'Dubai, AE', 'London, UK', 'Nairobi, KE', 'Miami, US', 'Hamburg, DE', 'Auckland, NZ', 'Lagos, NG'];

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'In Transit': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Customs': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Exception': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'Air': return 'Plane';
    case 'Ocean': return 'Ship';
    case 'Rail': return 'Train';
    case 'Road': return 'Truck';
    default: return 'Package';
  }
};
