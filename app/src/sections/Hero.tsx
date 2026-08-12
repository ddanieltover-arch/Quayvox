import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Search, MapPin, Truck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '@/assets/images';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(
        mediaRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9 }
      )
        .fromTo(
          lineRef.current,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.8, transformOrigin: 'top' },
          0.2
        )
        .fromTo('.hero-eyebrow', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.35)
        .fromTo(
          '.hero-headline span',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.03 },
          0.45
        )
        .fromTo('.hero-subtext', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, 0.65)
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.06 },
          0.75
        )
        .fromTo('.tracking-box', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, 0.85);

      if (isDesktop) {
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
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingId.trim();
    if (!code) return;
    setIsTracking(true);
    navigate(`/track/${encodeURIComponent(code)}`);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-navy-900 dot-grid overflow-hidden"
    >
      <div className="h-16 lg:h-20" />

      <div
        ref={lineRef}
        className="absolute left-[60vw] top-[18vh] h-[64vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      {/* Mobile / desktop: stacked on small screens, absolute composition on lg+ */}
      <div className="relative lg:min-h-[calc(100vh-5rem)] px-4 sm:px-6 lg:px-0 pb-12 lg:pb-0">
        <div
          ref={mediaRef}
          className="relative w-full lg:absolute lg:left-[4vw] lg:top-[10vh] lg:w-[54vw] h-[42vh] sm:h-[48vh] lg:h-[80vh] rounded-2xl lg:rounded-3xl overflow-hidden shadow-card mb-8 lg:mb-0"
        >
          <img
            src={images.heroMap}
            alt="Quayvox freight truck on the highway at dusk"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-navy-900/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/80 backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-text-secondary">LIVE TRACKING</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/80 backdrop-blur-sm border border-white/10">
                <Truck className="w-3.5 h-3.5 text-cobalt" />
                <span className="text-xs font-mono text-text-secondary">HIGHWAY FREIGHT</span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={contentRef}
          className="relative w-full lg:absolute lg:left-[62vw] lg:top-[16vh] lg:w-[34vw]"
        >
          <div className="hero-eyebrow eyebrow mb-4">LOGISTICS OS</div>

          <h1 className="hero-headline font-display font-bold text-[clamp(32px,4vw,56px)] text-text-primary leading-[1.05] mb-6">
            <span className="inline-block">Global</span>{' '}
            <span className="inline-block">logistics.</span>
            <br />
            <span className="inline-block">One</span>{' '}
            <span className="inline-block text-cobalt">dashboard.</span>
          </h1>

          <p className="hero-subtext text-base lg:text-lg text-text-secondary leading-relaxed mb-8 max-w-md">
            Track every container, route, and delivery in real time—across carriers, countries, and
            customs.
          </p>

          <form onSubmit={handleTrack} className="tracking-box mb-6">
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
                disabled={isTracking}
              >
                {isTracking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Tracking…</span>
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

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/pricing" className="hero-cta btn-primary flex items-center gap-2 min-h-11">
              <span>Start free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="hero-cta btn-secondary flex items-center gap-2 min-h-11">
              <MessageCircle className="w-4 h-4" />
              <span>Talk to sales</span>
            </Link>
          </div>

          <div className="hero-cta mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
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
      </div>
    </section>
  );
};

export default Hero;
