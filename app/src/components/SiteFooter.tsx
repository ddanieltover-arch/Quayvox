import { Link } from 'react-router-dom';
import { Ship } from 'lucide-react';
import { solutions, getSolutionPath } from '@/data/solutions';

const productLinks = [
  { label: 'Product', to: '/product' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Coverage', to: '/coverage' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Track', to: '/track' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Admin login', to: '/login' },
];

const legalLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

const SiteFooter = () => (
  <footer className="border-t border-white/5 bg-navy-900">
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">
              Quay<span className="text-cobalt">vox</span>
            </span>
          </Link>
          <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
            Global shipping with branches on every continent — USA, UK, Japan, Australia, Russia,
            Egypt, and Mexico.
          </p>
        </div>

        <div>
          <p className="text-xs font-mono uppercase text-text-secondary mb-4">Product</p>
          <ul className="space-y-2">
            {productLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase text-text-secondary mb-4">Solutions</p>
          <ul className="space-y-2">
            {solutions.map((item) => (
              <li key={item.slug}>
                <Link
                  to={getSolutionPath(item.slug)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase text-text-secondary mb-4">Company</p>
          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-mono uppercase text-text-secondary mb-4">Legal</p>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
        <p className="text-xs text-text-secondary">© 2026 Quayvox. All rights reserved.</p>
        <Link to="/contact" className="text-sm text-cobalt hover:text-cobalt/80 transition-colors">
          Talk to sales
        </Link>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
