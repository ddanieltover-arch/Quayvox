import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/context/AuthContext';
import { ShipmentProvider } from '@/context/ShipmentContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicLayout from '@/layouts/PublicLayout';

import Home from '@/pages/Home';
import Product from '@/pages/Product';
import Solutions from '@/pages/Solutions';
import SolutionDetail from '@/pages/SolutionDetail';
import Pricing from '@/pages/Pricing';
import Track from '@/pages/Track';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import Coverage from '@/pages/Coverage';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Login from '@/pages/Login';
import TrackResult from '@/pages/TrackResult';

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

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-right" richColors closeButton />;
}

function App() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;

    if (prefersReducedMotion || isMobile) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      return;
    }

    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      if (pinned.length === 0) return;
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll) return;

      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;
            const target = pinnedRanges.reduce(
              (closest, r) =>
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

    const handleResize = () => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.vars.snap) st.kill();
        });
      }
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ShipmentProvider>
          <BrowserRouter>
            <AppToaster />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Product />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/solutions/:slug" element={<SolutionDetail />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/track" element={<Track />} />
                <Route path="/track/:trackingNumber" element={<TrackResult />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/coverage" element={<Coverage />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Route>

              <Route path="/login" element={<Login />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
