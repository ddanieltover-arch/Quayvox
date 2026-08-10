import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';
import BranchLocations from '@/components/BranchLocations';
import { images } from '@/assets/images';

const values = [
  {
    title: 'Global reach',
    description:
      'Branches in the USA, UK, Japan, Australia, Russia, Egypt, and Mexico — coverage across every continent.',
  },
  {
    title: 'Ops-first',
    description: 'We design for planners and control-tower teams who live in exceptions, not decks.',
  },
  {
    title: 'Truth over noise',
    description: 'One trusted timeline beats a dozen carrier portals and spreadsheet reconciliations.',
  },
];

const About = () => (
  <>
    <PageHero
      eyebrow="ABOUT"
      title="A global shipping company."
      description="Quayvox moves freight worldwide with local branches on every continent — and one visibility layer for every shipment."
      image={images.visibilityAerial}
      imageAlt="Aerial view of global logistics corridors"
    >
      <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
        Get in touch
        <ArrowRight className="w-4 h-4" />
      </Link>
    </PageHero>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <div className="max-w-3xl space-y-4 text-text-secondary leading-relaxed">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-4">Our mission</h2>
        <p>
          Give shippers and operations teams a single source of truth for freight — from booking to
          delivery — wherever their cargo moves across our global network.
        </p>
        <p>
          Quayvox is a global shipping company with branches in the USA, UK, Japan, Australia,
          Russia, Egypt, and Mexico. We combine local presence on every continent with shared
          tracking, status notifications, and customer-facing track pages across ocean, air, rail,
          and road.
        </p>
      </div>
    </section>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 border-t border-white/5">
      <p className="eyebrow mb-3">NETWORK</p>
      <h2 className="font-display font-bold text-2xl text-text-primary mb-2">Branches worldwide</h2>
      <p className="text-sm text-text-secondary mb-8 max-w-xl leading-relaxed">
        Local teams on every continent — connected through one Quayvox network.
      </p>
      <BranchLocations variant="grid" />
    </section>

    <section className="relative w-full min-h-[36vh] lg:min-h-[44vh] overflow-hidden">
      <img
        src={images.opsCenterBg}
        alt="Control tower operations"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/55 to-navy-900/30" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20 max-w-2xl">
        <p className="eyebrow mb-4">CONTROL TOWER</p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary leading-tight mb-3">
          One calm dashboard for every lane.
        </h2>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          From Americas to Asia-Pacific, we unify carrier events so planners spend less time
          reconciling portals and more time moving freight.
        </p>
      </div>
    </section>

    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
      <h2 className="font-display font-bold text-2xl text-text-primary mb-6">What we value</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {values.map((v) => (
          <div key={v.title} className="card-surface p-6">
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">{v.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{v.description}</p>
          </div>
        ))}
      </div>
    </section>

    <PageCta
      title="Want to work with us?"
      description="See the product or message the team at any branch."
      primary={{ label: 'See the product', to: '/product' }}
      secondary={{ label: 'Contact', to: '/contact' }}
    />
  </>
);

export default About;
