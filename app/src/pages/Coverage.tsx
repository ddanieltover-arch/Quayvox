import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Globe,
  Plane,
  Ship,
  Train,
  Truck,
  MapPin,
  ShieldCheck,
  Clock,
  Network,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';
import { BRANCHES } from '@/lib/contact';
import { getSolutionPath } from '@/data/solutions';

const modes = [
  {
    icon: Plane,
    label: 'Air',
    count: '340+',
    unit: 'Airports',
    description:
      'Gateway and hub connectivity for time-critical freight — AWB events and handoffs under one timeline.',
    href: getSolutionPath('air-cargo'),
  },
  {
    icon: Ship,
    label: 'Ocean',
    count: '850+',
    unit: 'Ports',
    description:
      'Major trade lanes and terminals covered with vessel schedules, port events, and container milestones.',
    href: getSolutionPath('ocean-freight'),
  },
  {
    icon: Train,
    label: 'Rail',
    count: '120+',
    unit: 'Terminals',
    description:
      'Intermodal corridors that bridge ocean arrivals and inland distribution without losing visibility.',
    href: '/solutions',
  },
  {
    icon: Truck,
    label: 'Road',
    count: '15K+',
    unit: 'Carriers',
    description:
      'Linehaul and last-mile partners for dispatch visibility, exceptions, and delivery confirmation.',
    href: getSolutionPath('road-last-mile'),
  },
];

const branchDetails: Record<
  string,
  { hub: string; focus: string }
> = {
  USA: {
    hub: 'Americas operations hub',
    focus: 'Trans-Pacific and trans-Atlantic lanes, domestic road, and customer track pages.',
  },
  Mexico: {
    hub: 'North America nearshore',
    focus: 'Cross-border road freight, manufacturing inbound, and USMCA-aligned documentation.',
  },
  UK: {
    hub: 'Europe gateway',
    focus: 'Short-sea, air express into Europe, and customs context for UK–EU flows.',
  },
  Russia: {
    hub: 'Eurasia corridor',
    focus: 'East–west rail and multimodal connections across Europe and Asia.',
  },
  Egypt: {
    hub: 'Africa & Middle East',
    focus: 'Mediterranean ocean gateways and regional road distribution.',
  },
  Japan: {
    hub: 'Asia-Pacific hub',
    focus: 'Export ocean and air from Japan, plus regional Asia lane visibility.',
  },
  Australia: {
    hub: 'Oceania operations',
    focus: 'Trans-Pacific ocean, air cargo, and last-mile coverage across Australia.',
  },
};

const pillars = [
  {
    icon: Globe,
    title: 'Every continent',
    description:
      'Seven branches spanning North America, Europe, Africa, Asia, and Oceania — local teams, one Quayvox network.',
  },
  {
    icon: Network,
    title: 'All modes, one tower',
    description:
      'Air, ocean, rail, and road share a single control tower so handoffs never fall into a black hole.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance built in',
    description:
      'Documentation and audit trails travel with the shipment — not in a separate folder chase.',
  },
  {
    icon: Clock,
    title: 'Live ETA confidence',
    description:
      'Customers and ops see the same milestones and exceptions, in real time, from any branch.',
  },
];

const Coverage = () => (
  <>
    <PageHero
      eyebrow="COVERAGE"
      title="Every continent. One network."
      description="Branches in the USA, UK, Japan, Australia, Russia, Egypt, and Mexico — air, ocean, rail, and road under one Quayvox network."
      image="/images/global_cargo_plane.jpg"
      imageAlt="Global Quayvox cargo network"
    >
      <div className="flex flex-wrap gap-3">
        <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
          Talk to a branch
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/track" className="btn-secondary inline-flex items-center gap-2 min-h-11">
          Track a shipment
        </Link>
      </div>
    </PageHero>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <div className="max-w-3xl space-y-4 text-text-secondary leading-relaxed">
        <p className="eyebrow mb-3">NETWORK</p>
        <h2 className="font-display font-bold text-2xl text-text-primary mb-4">
          Local presence. Shared visibility.
        </h2>
        <p>
          Quayvox operates as a global shipping company with branches on every continent. Local teams
          handle bookings, compliance, and customer care — while every shipment feeds one shared
          timeline your ops team can trust.
        </p>
        <p>
          Whether freight starts in Tokyo, clears in London, or delivers in Dallas, status, ETA, and
          exceptions stay aligned across modes and borders.
        </p>
      </div>
    </section>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
      <p className="eyebrow mb-3">MODES</p>
      <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
        Coverage across how freight moves
      </h2>
      <p className="text-sm text-text-secondary mb-8 max-w-xl leading-relaxed">
        Connected airports, ports, rail terminals, and road carriers — with visibility that follows
        the cargo, not the carrier portal.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {modes.map((mode) => (
          <Link
            key={mode.label}
            to={mode.href}
            className="card-surface p-5 sm:p-6 group hover:border-cobalt/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center">
                <mode.icon className="w-5 h-5 text-cobalt" />
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-2xl text-text-primary">{mode.count}</p>
                <p className="text-xs text-text-secondary">{mode.unit}</p>
              </div>
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2 group-hover:text-cobalt transition-colors">
              {mode.label}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{mode.description}</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-cobalt">
              Explore
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
      <p className="eyebrow mb-3">BRANCHES</p>
      <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
        Seven branches. All continents.
      </h2>
      <p className="text-sm text-text-secondary mb-8 max-w-xl leading-relaxed">
        Local teams where your freight originates or arrives — connected through one Quayvox
        network.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BRANCHES.map((branch) => {
          const detail = branchDetails[branch.country];
          return (
            <div key={branch.country} className="card-surface p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-cobalt/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cobalt" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-text-primary">
                    {branch.country}
                  </h3>
                  <p className="text-xs text-text-secondary">{branch.continent}</p>
                </div>
              </div>
              {detail && (
                <>
                  <p className="text-xs font-mono uppercase text-cobalt mb-1">{detail.hub}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{detail.focus}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>

    <section className="relative w-full min-h-[36vh] lg:min-h-[44vh] overflow-hidden">
      <img
        src="/images/visibility_aerial.jpg"
        alt="Global logistics corridors"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/55 to-navy-900/30" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20 max-w-2xl">
        <p className="eyebrow mb-4">CONTROL TOWER</p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary leading-tight mb-3">
          One calm view from every branch.
        </h2>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
          From Americas to Asia-Pacific, carrier events unify so planners spend less time reconciling
          portals and more time moving freight.
        </p>
        <Link to="/product" className="btn-primary inline-flex items-center gap-2 min-h-11">
          See the product
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <p className="eyebrow mb-3">WHY IT MATTERS</p>
      <h2 className="font-display font-bold text-2xl text-text-primary mb-8">
        What global coverage delivers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {pillars.map((item) => (
          <div key={item.title} className="card-surface p-5 sm:p-6">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-cobalt" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>

    <PageCta
      title="Need coverage on your lanes?"
      description="Tell us where you ship — or explore solutions for your modes and industries."
      primary={{ label: 'Contact sales', to: '/contact' }}
      secondary={{ label: 'View solutions', to: '/solutions' }}
    />
  </>
);

export default Coverage;
