import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import FloatingActions from '@/components/FloatingActions';

const PublicLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative bg-navy-900 min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
};

export default PublicLayout;
