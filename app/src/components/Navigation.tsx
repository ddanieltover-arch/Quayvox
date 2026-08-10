import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Ship, LayoutDashboard, PackageSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { label: 'Product', to: '/product' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Track', to: '/track' },
  { label: 'Contact', to: '/contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-300 ${
    isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
  }`;

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const showDashboard = Boolean(user && isAdmin);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-navy-900/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">
              Quay<span className="text-cobalt">vox</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {showDashboard ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/track"
                className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-all"
              >
                <PackageSearch className="w-4 h-4" />
                Track Now
              </Link>
            )}
            <Link to="/contact" className="btn-primary text-sm">
              Talk to sales
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            {showDashboard ? (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-all min-h-11"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-sm font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-all min-h-11"
              >
                <PackageSearch className="w-4 h-4" />
                Track Now
              </Link>
            )}
            <button
              className="p-2 text-text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-navy-900/98 backdrop-blur-xl border-b border-white/5 transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center text-base font-medium min-h-11 ${
                  isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/about"
            className="flex items-center text-base font-medium text-text-secondary hover:text-text-primary min-h-11"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </NavLink>
          {showDashboard ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-base font-medium text-cobalt min-h-11"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          ) : null}
          <Link
            to="/contact"
            className="btn-primary w-full text-sm mt-3 inline-flex justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
