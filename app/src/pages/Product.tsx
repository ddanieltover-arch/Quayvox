import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';
import Features from '@/sections/Features';
import Visibility from '@/sections/Visibility';
import Optimization from '@/sections/Optimization';
import Dashboard from '@/sections/Dashboard';

const Product = () => (
  <>
    <PageHero
      eyebrow="PRODUCT"
      title="One logistics OS for every shipment."
      description="Track containers, optimize routes, and keep customs paperwork in sync — across carriers, countries, and modes."
      image="/images/dashboard_ui.jpg"
      imageAlt="Quayvox operations dashboard"
    >
      <Link to="/contact" className="btn-primary inline-flex items-center gap-2 min-h-11">
        Talk to sales
        <ArrowRight className="w-4 h-4" />
      </Link>
    </PageHero>
    <Features />
    <Visibility />
    <Optimization />
    <Dashboard />
    <PageCta
      title="Ready to see it live?"
      description="Compare plans or message our team."
      primary={{ label: 'View pricing', to: '/pricing' }}
      secondary={{ label: 'Solutions', to: '/solutions' }}
    />
  </>
);

export default Product;
