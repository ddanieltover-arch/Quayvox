import {
  Ship,
  Plane,
  Truck,
  ShoppingBag,
  Pill,
  Factory,
  type LucideIcon,
} from 'lucide-react';

export interface SolutionCapability {
  title: string;
  description: string;
}

export interface SolutionPage {
  slug: string;
  title: string;
  shortTitle: string;
  cardDescription: string;
  homeDescription: string;
  icon: LucideIcon;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  image: string;
  imageAlt: string;
  overview: string[];
  capabilities: SolutionCapability[];
  outcomes: { label: string; detail: string }[];
  workflows: { title: string; description: string }[];
  ctaTitle: string;
  ctaDescription: string;
}

export const solutions: SolutionPage[] = [
  {
    slug: 'ocean-freight',
    title: 'Ocean freight',
    shortTitle: 'Ocean freight',
    cardDescription:
      'Vessel schedules, port events, and container milestones in one timeline.',
    homeDescription: 'Port events and vessel milestones.',
    icon: Ship,
    eyebrow: 'OCEAN FREIGHT',
    heroTitle: 'Container visibility from gate-in to discharge.',
    heroDescription:
      'Unify vessel schedules, port events, and container milestones so planners stop chasing carrier portals and start acting on one trusted ocean timeline.',
    image: '/images/visibility_aerial.jpg',
    imageAlt: 'Aerial view of ocean freight corridors',
    overview: [
      'Ocean freight still runs on fragmented carrier notices, terminal updates, and spreadsheet ETAs. Quayvox collapses that noise into a single shipment timeline your ops team can trust.',
      'From booking confirmation through vessel departure, transshipment, and final discharge, every milestone lands in one place — with exceptions surfaced before demurrage and detention start ticking.',
    ],
    capabilities: [
      {
        title: 'Vessel & sailing schedule sync',
        description:
          'Track booked sailings, rollovers, and blank sailings against the live plan so capacity changes never surprise planners.',
      },
      {
        title: 'Port & terminal events',
        description:
          'Gate-in, loaded on vessel, vessel departed, arrived, and discharged — normalized across carriers and terminals.',
      },
      {
        title: 'Container milestone timeline',
        description:
          'One chronological view per booking or container, shareable with customers via public track links.',
      },
      {
        title: 'Exception & dwell alerts',
        description:
          'Flag late arrivals, missed connections, and extended terminal dwell before costs and SLAs slip.',
      },
    ],
    outcomes: [
      { label: 'Fewer portal hops', detail: 'One timeline instead of carrier-by-carrier checks' },
      { label: 'Earlier exceptions', detail: 'Act before demurrage and customer escalations' },
      { label: 'Clearer ETAs', detail: 'Share confident ocean ETAs with sales and customers' },
    ],
    workflows: [
      {
        title: 'Import or create bookings',
        description:
          'Bring ocean bookings into Quayvox once — keep carrier relationships where they are.',
      },
      {
        title: 'Monitor sailings & ports',
        description:
          'Watch vessel progress and terminal events from a shared control tower.',
      },
      {
        title: 'Notify stakeholders',
        description:
          'Auto-email status changes and hand customers a live track page for every container.',
      },
    ],
    ctaTitle: 'Ready to tighten your ocean lanes?',
    ctaDescription: 'Talk through your ports and carriers — or start with a free evaluation.',
  },
  {
    slug: 'air-cargo',
    title: 'Air cargo',
    shortTitle: 'Air cargo',
    cardDescription:
      'AWB status, hub handoffs, and ETA confidence for time-critical freight.',
    homeDescription: 'AWB handoffs and hub ETAs.',
    icon: Plane,
    eyebrow: 'AIR CARGO',
    heroTitle: 'AWB status and hub handoffs you can trust.',
    heroDescription:
      'Give time-critical freight the visibility it deserves — AWB events, hub transfers, and ETA confidence in one ops-ready view.',
    image: '/images/global_cargo_plane.jpg',
    imageAlt: 'Global air cargo network',
    overview: [
      'Air cargo moves fast, but visibility often lags. Quayvox keeps AWB status, hub handoffs, and recovery options visible so ops can protect SLAs on the clock.',
      'Whether you run express parcels, pharma air, or high-value manufacturing parts, one timeline replaces scattered airline and forwarder updates.',
    ],
    capabilities: [
      {
        title: 'AWB event tracking',
        description:
          'Booked, received, departed, arrived, and delivered events normalized into a single airway-bill timeline.',
      },
      {
        title: 'Hub handoff visibility',
        description:
          'See transfer status between origin, gateway, and destination hubs before freight sits too long.',
      },
      {
        title: 'ETA confidence signals',
        description:
          'Surface schedule risk early so customer service can reset expectations without guesswork.',
      },
      {
        title: 'Priority exception queues',
        description:
          'Rank delayed or at-risk air shipments so planners clear the hottest AWBs first.',
      },
    ],
    outcomes: [
      { label: 'Faster recovery', detail: 'Spot missed connections while recovery options remain' },
      { label: 'Stronger SLAs', detail: 'Protect time-critical lanes with live hub status' },
      { label: 'Cleaner handoffs', detail: 'Align air ops, road pickup, and customer promises' },
    ],
    workflows: [
      {
        title: 'Capture AWB bookings',
        description: 'Create or import air shipments with AWB, route, and service level.',
      },
      {
        title: 'Watch hubs in real time',
        description: 'Monitor handoffs and dwell so delays do not silently burn the clock.',
      },
      {
        title: 'Alert on the minute',
        description: 'Push status emails and public track updates as milestones change.',
      },
    ],
    ctaTitle: 'Need tighter air cargo control?',
    ctaDescription: 'Walk us through your express lanes — or explore plans that fit your volume.',
  },
  {
    slug: 'road-last-mile',
    title: 'Road & last mile',
    shortTitle: 'Road & last mile',
    cardDescription: 'Dispatch visibility and exception alerts before customers call.',
    homeDescription: 'Dispatch visibility and exceptions.',
    icon: Truck,
    eyebrow: 'ROAD & LAST MILE',
    heroTitle: 'Dispatch visibility before the customer calls.',
    heroDescription:
      'Track linehaul and last-mile legs with exception alerts that reach ops first — so delivery promises stay intact.',
    image: '/images/route_highway.jpg',
    imageAlt: 'Highway freight and last-mile corridors',
    overview: [
      'Road and last mile are where customer experience is won or lost. Quayvox gives dispatch and customer teams the same live picture of status, ETA, and exceptions.',
      'From depot departure through delivery attempt, exceptions surface early — failed delivery, address issues, weather holds — before the inbox fills with “where is my order?”',
    ],
    capabilities: [
      {
        title: 'Dispatch & stop status',
        description:
          'See assigned, out for delivery, attempted, and delivered events across carriers and fleets.',
      },
      {
        title: 'Exception-first alerts',
        description:
          'Prioritize failed attempts, delays, and missing POD so agents resolve issues before customers escalate.',
      },
      {
        title: 'Customer-ready track pages',
        description:
          'Share a clean public timeline so recipients check status themselves instead of calling support.',
      },
      {
        title: 'Multi-leg continuity',
        description:
          'Connect ocean or air arrival to road pickup so the handoff never falls into a black hole.',
      },
    ],
    outcomes: [
      { label: 'Fewer WISMO calls', detail: 'Customers self-serve with live track links' },
      { label: 'Faster recovery', detail: 'Failed deliveries and delays hit ops first' },
      { label: 'Cleaner handoffs', detail: 'Linehaul and last mile stay on one timeline' },
    ],
    workflows: [
      {
        title: 'Connect road legs',
        description: 'Attach road and last-mile segments to inbound ocean or air arrivals.',
      },
      {
        title: 'Monitor dispatch live',
        description: 'Watch out-for-delivery and exception queues from one dashboard.',
      },
      {
        title: 'Close the loop',
        description: 'Capture POD and notify stakeholders the moment delivery completes.',
      },
    ],
    ctaTitle: 'Want fewer delivery surprises?',
    ctaDescription: 'Tell us about your dispatch network — or start tracking on a free plan.',
  },
  {
    slug: 'retail-ecommerce',
    title: 'Retail & e-commerce',
    shortTitle: 'Retail & e-commerce',
    cardDescription: 'SKU-level promises backed by live carrier data across regions.',
    homeDescription: 'Promise dates backed by live data.',
    icon: ShoppingBag,
    eyebrow: 'RETAIL & E-COMMERCE',
    heroTitle: 'Promise dates backed by live carrier truth.',
    heroDescription:
      'Keep store and digital teams aligned with SKU-level visibility, carrier data across regions, and customer track pages that reduce WISMO load.',
    image: '/images/feature_tracking.jpg',
    imageAlt: 'Retail shipment tracking visibility',
    overview: [
      'Retail and e-commerce live on promise dates. Quayvox backs those promises with live multi-carrier data so merchandising, fulfillment, and CX share one version of the truth.',
      'From inbound replenishment to outbound parcel, status updates and public track links keep customers informed without burning support capacity.',
    ],
    capabilities: [
      {
        title: 'Multi-carrier visibility',
        description:
          'Normalize events across regional carriers so one dashboard covers every lane you sell into.',
      },
      {
        title: 'Promise-date confidence',
        description:
          'Tie live ETAs to what customers were promised — and flag risk before checkout trust erodes.',
      },
      {
        title: 'Customer self-service tracking',
        description:
          'Branded public track pages cut “where is my order?” volume without adding agent headcount.',
      },
      {
        title: 'Inbound + outbound in sync',
        description:
          'See DC replenishment and customer shipments together so stock and delivery stay aligned.',
      },
    ],
    outcomes: [
      { label: 'Lower WISMO', detail: 'Customers track without contacting support' },
      { label: 'Better promises', detail: 'ETAs reflect carrier reality, not guesswork' },
      { label: 'Regional coverage', detail: 'One view across markets and carriers' },
    ],
    workflows: [
      {
        title: 'Connect fulfillment flows',
        description: 'Bring inbound DC freight and outbound parcels into one control tower.',
      },
      {
        title: 'Protect promise dates',
        description: 'Watch at-risk orders and reset expectations before delivery day.',
      },
      {
        title: 'Share live track links',
        description: 'Email status updates and let shoppers follow every milestone.',
      },
    ],
    ctaTitle: 'Ready to protect every promise date?',
    ctaDescription: 'Show us your carrier mix — or compare plans for retail volume.',
  },
  {
    slug: 'pharma-cold-chain',
    title: 'Pharma & cold chain',
    shortTitle: 'Pharma & cold chain',
    cardDescription: 'Temperature-aware workflows and compliance-ready documentation.',
    homeDescription: 'Cold-chain aware workflows.',
    icon: Pill,
    eyebrow: 'PHARMA & COLD CHAIN',
    heroTitle: 'Temperature-aware freight with audit-ready records.',
    heroDescription:
      'Run pharma and cold-chain lanes with exception urgency, documentation discipline, and timelines built for regulated cargo.',
    image: '/images/feature_compliance.jpg',
    imageAlt: 'Compliance and cold-chain documentation',
    overview: [
      'Pharma and cold chain cannot treat delays like ordinary freight. Quayvox prioritizes temperature-sensitive workflows, documentation readiness, and fast exception escalation.',
      'Ops teams get a control tower that respects product integrity — with timelines, alerts, and paperwork context that stand up to audits.',
    ],
    capabilities: [
      {
        title: 'Cold-chain aware milestones',
        description:
          'Highlight handoffs and dwell that matter for temperature-controlled product integrity.',
      },
      {
        title: 'Compliance-ready documentation',
        description:
          'Keep customs, certificates, and shipment records attached to the same shipment record.',
      },
      {
        title: 'High-urgency exception paths',
        description:
          'Route temperature and delay exceptions to the right owners before product risk grows.',
      },
      {
        title: 'Chain-of-custody timeline',
        description:
          'Maintain a clear event history from origin to destination for QA and partner reviews.',
      },
    ],
    outcomes: [
      { label: 'Faster escalation', detail: 'Critical exceptions reach owners immediately' },
      { label: 'Audit readiness', detail: 'Docs and milestones live on one shipment record' },
      { label: 'Lower integrity risk', detail: 'Dwell and handoff issues surface early' },
    ],
    workflows: [
      {
        title: 'Flag regulated shipments',
        description: 'Mark pharma and cold-chain cargo so workflows and alerts stay elevated.',
      },
      {
        title: 'Watch integrity-critical events',
        description: 'Monitor handoffs, holds, and delays with temperature-aware urgency.',
      },
      {
        title: 'Close with documentation',
        description: 'Keep compliance paperwork tied to delivery and share status with partners.',
      },
    ],
    ctaTitle: 'Need cold-chain visibility you can defend?',
    ctaDescription: 'Discuss regulated lanes with our team — or review Enterprise options.',
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    shortTitle: 'Manufacturing',
    cardDescription: 'Inbound parts and outbound finished goods on a shared control tower.',
    homeDescription: 'Inbound and outbound in sync.',
    icon: Factory,
    eyebrow: 'MANUFACTURING',
    heroTitle: 'Inbound parts and outbound goods on one tower.',
    heroDescription:
      'Synchronize supplier inbound, plant transfers, and finished-goods outbound so production and distribution share the same logistics truth.',
    image: '/images/ops_center_bg.jpg',
    imageAlt: 'Manufacturing logistics control tower',
    overview: [
      'Manufacturing supply chains break when inbound parts and outbound finished goods live in separate systems. Quayvox gives planners one control tower across both.',
      'See supplier shipments feeding the line and customer deliveries leaving the plant — with exceptions that protect production schedules and OTIF targets.',
    ],
    capabilities: [
      {
        title: 'Inbound parts visibility',
        description:
          'Track supplier freight against production need dates so shortages and expedites are visible early.',
      },
      {
        title: 'Outbound finished goods',
        description:
          'Follow customer and DC shipments from plant gate to delivery on the same platform.',
      },
      {
        title: 'Plant & DC coordination',
        description:
          'Align transfers between facilities with live ETAs and exception queues.',
      },
      {
        title: 'OTIF-focused alerts',
        description:
          'Surface late inbound and outbound risk before it hits schedule or customer SLAs.',
      },
    ],
    outcomes: [
      { label: 'Fewer line stops', detail: 'Inbound risk visible before parts run out' },
      { label: 'Stronger OTIF', detail: 'Outbound exceptions caught before customers feel them' },
      { label: 'One ops language', detail: 'Procurement, plant, and logistics share one timeline' },
    ],
    workflows: [
      {
        title: 'Map inbound suppliers',
        description: 'Bring critical part shipments into Quayvox against production calendars.',
      },
      {
        title: 'Unify plant outbound',
        description: 'Track finished goods from dock to customer or distribution center.',
      },
      {
        title: 'Run one exception queue',
        description: 'Prioritize the shipments that threaten schedule or customer OTIF.',
      },
    ],
    ctaTitle: 'Ready for one manufacturing control tower?',
    ctaDescription: 'Walk us through inbound and outbound lanes — or start with a free trial.',
  },
];

export function getSolutionBySlug(slug: string): SolutionPage | undefined {
  return solutions.find((s) => s.slug === slug);
}

export function getSolutionPath(slug: string): string {
  return `/solutions/${slug}`;
}
