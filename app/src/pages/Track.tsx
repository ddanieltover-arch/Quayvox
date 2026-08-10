import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, MapPin, Clock, Bell } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PageCta from '@/components/PageCta';

const steps = [
  {
    icon: Search,
    title: 'Enter a tracking number',
    description: 'Use the shipment ID from your carrier notice or Quayvox confirmation.',
  },
  {
    icon: MapPin,
    title: 'See live status',
    description: 'Status, origin, destination, and ETA update as events land.',
  },
  {
    icon: Clock,
    title: 'Follow the timeline',
    description: 'Every milestone — booked, in transit, customs, delivered — in one place.',
  },
  {
    icon: Bell,
    title: 'Share with customers',
    description: 'Anyone with the number can open the public track page — no login required.',
  },
];

const Track = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingId.trim();
    if (!code) return;
    navigate(`/track/${encodeURIComponent(code)}`);
  };

  return (
    <>
      <PageHero
        eyebrow="TRACK"
        title="Find any shipment in seconds."
        description="Enter a tracking number to see live status, ETA, and the full event timeline."
        image="/images/feature_tracking.jpg"
        imageAlt="Shipment tracking visibility"
      >
        <form onSubmit={handleTrack} className="max-w-xl">
          <div className="glass-card p-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-h-11 px-3">
              <Search className="w-5 h-5 text-text-secondary shrink-0" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking number..."
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary/50 text-sm outline-none min-w-0"
              />
            </div>
            <button
              type="submit"
              className="btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 min-h-11 w-full sm:w-auto"
            >
              Track
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            Try a demo number like{' '}
            <button
              type="button"
              onClick={() => setTrackingId('SH-2026-7842')}
              className="font-mono text-cobalt hover:underline"
            >
              SH-2026-7842
            </button>
          </p>
        </form>
      </PageHero>

      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-3">How tracking works</h2>
        <p className="text-sm text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Public track pages pull from the same events your ops team sees in the dashboard — one
          source of truth for customers and control towers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div key={step.title} className="card-surface p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-cobalt">{String(i + 1).padStart(2, '0')}</span>
                <div className="w-9 h-9 rounded-xl bg-cobalt/10 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-cobalt" />
                </div>
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <PageCta
        title="Need shipment updates for your customers?"
        description="Quayvox gives every booking a shareable track page and optional status emails."
        primary={{ label: 'Talk to sales', to: '/contact' }}
        secondary={{ label: 'View pricing', to: '/pricing' }}
      />
    </>
  );
};

export default Track;
