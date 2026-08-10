import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Radar,
  Route,
  FileCheck,
  Quote,
  Search,
  LayoutDashboard,
  Bell,
  Check,
  PackageSearch,
} from 'lucide-react';
import Hero from '@/sections/Hero';
import ContactForm from '@/components/ContactForm';
import { solutions, getSolutionPath } from '@/data/solutions';

const highlights = [
  {
    icon: Radar,
    title: 'Real-time tracking',
    description: 'GPS, AIS, and carrier updates unified into a single shipment timeline.',
  },
  {
    icon: Route,
    title: 'Route optimization',
    description: 'Smarter lanes that cut fuel, transit time, and emissions across modes.',
  },
  {
    icon: FileCheck,
    title: 'Customs & docs',
    description: 'Auto-ready paperwork, duties context, and audit trails without the chase.',
  },
];

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Connect your lanes',
    description: 'Import bookings or create shipments once — carriers stay where they are.',
  },
  {
    icon: LayoutDashboard,
    step: '02',
    title: 'See one control tower',
    description: 'Status, ETA, and exceptions land in a single dashboard your ops team trusts.',
  },
  {
    icon: Bell,
    step: '03',
    title: 'Alert customers automatically',
    description: 'Share public track links and email status changes when milestones move.',
  },
];

const proof = [
  { value: '2.4M', label: 'Shipments tracked monthly' },
  { value: '120+', label: 'Countries covered' },
  { value: '99.97%', label: 'Uptime SLA' },
  { value: '<120s', label: 'Avg support response' },
];

const quotes = [
  { quote: 'We cut ETA disputes by 70%.', author: 'Logistics Lead', company: 'Retail Brand' },
  {
    quote: 'Our planners actually trust the data now.',
    author: 'VP Ops',
    company: 'Manufacturer',
  },
  {
    quote: 'Onboarding took a day, not a quarter.',
    author: 'Head of Supply Chain',
    company: 'Pharma',
  },
];

const pricingTeasers = [
  {
    name: 'Starter',
    price: '$0',
    detail: '14-day evaluation',
    points: ['50 active shipments', 'Public track pages'],
  },
  {
    name: 'Pro',
    price: '$299',
    detail: 'per month',
    points: ['Unlimited shipments', 'Status emails', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'network scale',
    points: ['SSO & SLAs', 'Dedicated success'],
  },
];

const Home = () => (
  <>
    <Hero />

    {/* Product highlights */}
    <section className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-3">PRODUCT</p>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary">
            Everything ops needs in one place
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-3 max-w-xl leading-relaxed">
            Replace scattered carrier portals with one logistics OS — tracking, planning, and
            documentation that stay in sync.
          </p>
        </div>
        <Link
          to="/product"
          className="btn-secondary inline-flex items-center gap-2 min-h-11 self-start"
        >
          Explore product
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((item) => (
          <div key={item.title} className="card-surface p-6">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-cobalt" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section className="relative w-full py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">HOW IT WORKS</p>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary">
          Live in days, not quarters
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((item) => (
          <div key={item.step} className="relative">
            <p className="font-mono text-xs text-cobalt mb-3">{item.step}</p>
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-cobalt" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Solutions preview */}
    <section className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-3">SOLUTIONS</p>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary">
            Built for how freight actually moves
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-3 max-w-xl leading-relaxed">
            Ocean, air, road, and industry workflows — one platform that adapts to your network.
          </p>
        </div>
        <Link
          to="/solutions"
          className="btn-secondary inline-flex items-center gap-2 min-h-11 self-start"
        >
          See all solutions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {solutions.map((item) => (
          <Link
            key={item.slug}
            to={getSolutionPath(item.slug)}
            className="card-surface p-5 sm:p-6 group hover:border-cobalt/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-cobalt" />
            </div>
            <h3 className="font-display font-semibold text-base text-text-primary mb-1 group-hover:text-cobalt transition-colors">
              {item.shortTitle}
            </h3>
            <p className="text-sm text-text-secondary">{item.homeDescription}</p>
          </Link>
        ))}
      </div>
    </section>

    {/* Track teaser */}
    <section className="relative w-full py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="card-surface p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <p className="eyebrow mb-3">PUBLIC TRACKING</p>
          <h2 className="font-display font-bold text-[clamp(26px,3vw,36px)] text-text-primary mb-3">
            Give customers a live track page
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6 max-w-md">
            Anyone with a tracking number can check status, ETA, and the full event timeline — no
            login required. Try demo number{' '}
            <span className="font-mono text-cobalt">SH-2026-7842</span>.
          </p>
          <Link to="/track" className="btn-primary inline-flex items-center gap-2 min-h-11">
            <PackageSearch className="w-4 h-4" />
            Track a shipment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-navy-800/80 border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-cobalt">SH-2026-7842</span>
            <span className="text-xs px-2 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
              In Transit
            </span>
          </div>
          <div className="text-sm text-text-secondary">
            Shanghai, CN <span className="text-text-primary">→</span> Los Angeles, US
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-2">
              <span>Progress</span>
              <span>68%</span>
            </div>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
              <div className="h-full bg-cobalt rounded-full w-[68%]" />
            </div>
          </div>
          <ul className="space-y-2 text-xs text-text-secondary border-t border-white/5 pt-4">
            <li>Vessel departed Shanghai</li>
            <li>En route — Pacific crossing</li>
            <li className="text-text-primary">ETA Jun 15, 2026</li>
          </ul>
        </div>
      </div>
    </section>

    {/* Social proof */}
    <section className="relative w-full py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="mb-10">
        <p className="eyebrow mb-3">TRUSTED BY OPS TEAMS</p>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary">
          Numbers that matter on the floor
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {proof.map((stat) => (
          <div key={stat.label}>
            <p className="font-display font-bold text-3xl lg:text-4xl text-cobalt mb-2">{stat.value}</p>
            <p className="text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quotes.map((q) => (
          <div key={q.quote} className="card-surface p-6">
            <Quote className="w-5 h-5 text-cobalt mb-3" />
            <p className="text-text-primary mb-4 leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
            <p className="text-xs text-text-secondary">
              {q.author} · {q.company}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing teaser */}
    <section className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-3">PRICING</p>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary">
            Simple plans for every stage
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-3 max-w-xl leading-relaxed">
            Start free, scale into Pro, or go Enterprise when your network needs SLAs and SSO.
          </p>
        </div>
        <Link
          to="/pricing"
          className="btn-secondary inline-flex items-center gap-2 min-h-11 self-start"
        >
          Full pricing
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {pricingTeasers.map((plan) => (
          <div
            key={plan.name}
            className={`card-surface p-6 flex flex-col ${
              plan.featured ? 'border-cobalt/40 ring-1 ring-cobalt/25' : ''
            }`}
          >
            {plan.featured && (
              <span className="text-xs font-mono uppercase text-cobalt mb-2">Most popular</span>
            )}
            <h3 className="font-display font-semibold text-lg text-text-primary">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mt-2 mb-4">
              <span className="font-display font-bold text-2xl text-text-primary">{plan.price}</span>
              <span className="text-xs text-text-secondary">{plan.detail}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-cobalt shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              to="/pricing"
              className={`${plan.featured ? 'btn-primary' : 'btn-secondary'} inline-flex justify-center min-h-11 text-sm`}
            >
              Learn more
            </Link>
          </div>
        ))}
      </div>
    </section>

    {/* Contact CTA */}
    <section className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
        <div>
          <p className="eyebrow mb-3">GET STARTED</p>
          <h2 className="font-display font-bold text-[clamp(28px,3vw,40px)] text-text-primary mb-4">
            Start shipping smarter.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed mb-6 max-w-md">
            Tell us about your lanes — or pick a plan and get going. No setup fees, no mandatory
            calls.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/pricing" className="btn-primary inline-flex items-center gap-2 min-h-11">
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-secondary inline-flex items-center gap-2 min-h-11">
              <MessageCircle className="w-4 h-4" />
              Talk to sales
            </Link>
            <Link to="/about" className="btn-secondary inline-flex items-center gap-2 min-h-11">
              About us
            </Link>
          </div>
          <p className="text-xs text-text-secondary">
            Prefer email?{' '}
            <a href="mailto:info@quayvox.com" className="text-cobalt hover:underline">
              info@quayvox.com
            </a>
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  </>
);

export default Home;
