import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ShipmentProvider } from '@/context/ShipmentContext';

// Public Pages
import Navigation from '@/components/Navigation';
import Hero from '@/sections/Hero';
import Features from '@/sections/Features';
import Visibility from '@/sections/Visibility';
import Optimization from '@/sections/Optimization';
import Network from '@/sections/Network';
import Dashboard from '@/sections/Dashboard';
import Operations from '@/sections/Operations';
import Stats from '@/sections/Stats';
import CTA from '@/sections/CTA';

// Admin Pages
import AdminLayout from '@/admin/AdminLayout';
import AdminDashboard from '@/admin/Dashboard';
import Shipments from '@/admin/Shipments';
import LiveMap from '@/admin/LiveMap';
import Analytics from '@/admin/Analytics';
import CreateShipment from '@/admin/CreateShipment';
import Globe3D from '@/admin/Globe3D';
import Calculator from '@/admin/Calculator';
import Documents from '@/admin/Documents';
import Team from '@/admin/Team';
import Portal from '@/admin/Portal';
import Predictions from '@/admin/Predictions';
import Chat from '@/admin/Chat';
import Mobile from '@/admin/Mobile';

gsap.registerPlugin(ScrollTrigger);

// Public Layout
const PublicLayout = () => (
  <div className="relative bg-navy-900 min-h-screen">
    <Navigation />
    <main>
      <Hero />
      <Features />
      <Visibility />
      <Optimization />
      <Network />
      <Dashboard />
      <Operations />
      <Stats />
      <CTA />
    </main>
  </div>
);

function App() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      ScrollTrigger.getAll().forEach(st => st.kill());
      return;
    }

    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll().filter(st => st.vars.pin).sort((a, b) => a.start - b.start);
      if (pinned.length === 0) return;
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 100);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <ShipmentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="create" element={<CreateShipment />} />
            <Route path="globe" element={<Globe3D />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="documents" element={<Documents />} />
            <Route path="team" element={<Team />} />
            <Route path="portal" element={<Portal />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="chat" element={<Chat />} />
            <Route path="mobile" element={<Mobile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ShipmentProvider>
  );
}

export default App;
