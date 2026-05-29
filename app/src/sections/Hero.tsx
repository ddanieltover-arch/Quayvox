import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, Search, Package, MapPin, Truck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial load animation
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(
        mediaRef.current,
        { opacity: 0, x: -40, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 1 }
      )
        .fromTo(
          lineRef.current,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.8, transformOrigin: 'top' },
          0.2
        )
        .fromTo(
          '.hero-eyebrow',
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.4
        )
        .fromTo(
          '.hero-headline span',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.03 },
          0.5
        )
        .fromTo(
          '.hero-subtext',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.7
        )
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 },
          0.8
        )
        .fromTo(
          '.tracking-box',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.9
        );

      // Scroll-driven exit animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=130%',
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress > 0.7) {
            const exitProgress = (progress - 0.7) / 0.3;
            gsap.set(mediaRef.current, {
              x: -18 * exitProgress + 'vw',
              opacity: 1 - exitProgress * 0.75,
            });
            gsap.set(contentRef.current, {
              x: 10 * exitProgress + 'vw',
              opacity: 1 - exitProgress * 0.75,
            });
            gsap.set(lineRef.current, {
              scaleY: 1 - exitProgress,
              opacity: exitProgress > 0.95 ? 0 : 1,
            });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setIsTracking(true);
      setTimeout(() => setIsTracking(false), 2000);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-navy-900 dot-grid overflow-hidden"
    >
      {/* Navigation spacer */}
      <div className="h-16 lg:h-20" />

      {/* Vertical Accent Line */}
      <div
        ref={lineRef}
        className="absolute left-[60vw] top-[18vh] h-[64vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      {/* Left Media Card */}
      <div
        ref={mediaRef}
        className="absolute left-[4vw] top-[10vh] w-[92vw] lg:w-[54vw] h-[50vh] lg:h-[80vh] rounded-3xl overflow-hidden shadow-card"
      >
        <img
          src="/images/hero_map.jpg"
          alt="Global Logistics Network"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
        
        {/* Live Status Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/80 backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-text-secondary">LIVE</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/80 backdrop-blur-sm border border-white/10">
              <Package className="w-3.5 h-3.5 text-cobalt" />
              <span className="text-xs font-mono text-text-secondary">2.4M SHIPMENTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Block */}
      <div
        ref={contentRef}
        className="absolute left-[4vw] lg:left-[62vw] top-[62vh] lg:top-[16vh] w-[92vw] lg:w-[34vw]"
      >
        {/* Eyebrow */}
        <div className="hero-eyebrow eyebrow mb-4">LOGISTICS OS</div>

        {/* Headline */}
        <h1 className="hero-headline font-display font-bold text-[clamp(32px,4vw,56px)] text-text-primary leading-[1.05] mb-6">
          <span className="inline-block">Global</span>{' '}
          <span className="inline-block">logistics.</span>
          <br />
          <span className="inline-block">One</span>{' '}
          <span className="inline-block text-cobalt">dashboard.</span>
        </h1>

        {/* Subheadline */}
        <p className="hero-subtext text-base lg:text-lg text-text-secondary leading-relaxed mb-8 max-w-md">
          Track every container, route, and delivery in real time—across carriers,
          countries, and customs.
        </p>

        {/* Tracking Input Box */}
        <form onSubmit={handleTrack} className="tracking-box mb-6">
          <div className="glass-card p-2 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 text-text-secondary">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking number..."
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary/50 text-sm outline-none"
            />
            <button
              type="submit"
              className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
              disabled={isTracking}
            >
              {isTracking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button className="hero-cta btn-primary flex items-center gap-2">
            <span>Start free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="hero-cta btn-secondary flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>Talk to sales</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="hero-cta mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cobalt" />
            <span className="text-xs text-text-secondary">120+ Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cobalt" />
            <span className="text-xs text-text-secondary">All Carriers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
