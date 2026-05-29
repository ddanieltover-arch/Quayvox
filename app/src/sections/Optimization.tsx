import { useEffect, useRef, useState } from 'react';
import { GitCompare, Zap, ArrowRight, Fuel, Clock, Leaf } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const routeOptions = [
  { name: 'Fastest', time: '3d 4h', cost: '$2,400', carbon: 'High', active: false },
  { name: 'Balanced', time: '4d 2h', cost: '$1,800', carbon: 'Medium', active: true },
  { name: 'Green', time: '5d 8h', cost: '$1,600', carbon: 'Low', active: false },
];

const Optimization = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [selectedRoute, setSelectedRoute] = useState(routeOptions[1]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Media card entrance from right
      gsap.fromTo(
        mediaRef.current,
        { x: '8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 40%',
            scrub: true,
          },
        }
      );

      // Accent line
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          transformOrigin: 'top',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content block from left
      gsap.fromTo(
        contentRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: 'top 40%',
            scrub: true,
          },
        }
      );

      // Bullets stagger
      gsap.fromTo(
        '.opt-bullet',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-navy-900 min-h-screen py-20 lg:py-0 lg:min-h-[90vh]"
    >
      {/* Vertical Accent Line */}
      <div
        ref={lineRef}
        className="absolute left-[40vw] top-[10vh] h-[70vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      {/* Left Content Block */}
      <div
        ref={contentRef}
        className="relative lg:absolute left-[4vw] top-[4vh] lg:top-[18vh] w-[92vw] lg:w-[34vw] mx-auto lg:mx-0"
      >
        <span className="eyebrow mb-4 block">OPTIMIZATION</span>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary leading-tight mb-6">
          Take the smarter route.
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          Compare alternatives by cost, carbon, and reliability—then push updates to
          drivers in one click.
        </p>

        {/* Feature Bullets */}
        <div className="space-y-4 mb-8">
          <div className="opt-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <GitCompare className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">SIMULATE</h4>
              <p className="text-sm text-text-secondary">
                What-if scenarios with live traffic and fuel pricing.
              </p>
            </div>
          </div>

          <div className="opt-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">AUTOMATE</h4>
              <p className="text-sm text-text-secondary">
                Rules that re-route around delays automatically.
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <span>See how it works</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Media Card - Route Comparison */}
      <div
        ref={mediaRef}
        className="relative lg:absolute left-[4vw] lg:left-[42vw] top-[4vh] lg:top-[10vh] w-[92vw] lg:w-[54vw] h-auto lg:h-[80vh] rounded-3xl overflow-hidden shadow-card mx-auto lg:mx-0 mt-8 lg:mt-0"
      >
        <img
          src="/images/route_highway.jpg"
          alt="Route Optimization"
          className="w-full h-64 lg:h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-navy-900/90 via-navy-900/50 to-transparent" />

        {/* Route Comparison Overlay */}
        <div className="absolute inset-4 lg:inset-6 flex flex-col justify-center">
          <div className="glass-card p-4 lg:p-6 max-w-md ml-auto">
            <h3 className="font-display font-semibold text-lg text-text-primary mb-4">
              Route Options
            </h3>

            <div className="space-y-3">
              {routeOptions.map((route) => (
                <button
                  key={route.name}
                  onClick={() => setSelectedRoute(route)}
                  className={`w-full p-3 rounded-xl transition-all text-left ${
                    selectedRoute.name === route.name
                      ? 'bg-cobalt/20 border border-cobalt/40'
                      : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          route.name === 'Fastest'
                            ? 'bg-amber-500'
                            : route.name === 'Green'
                            ? 'bg-success'
                            : 'bg-cobalt'
                        }`}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {route.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-text-secondary">{route.time}</span>
                      <span className="text-cobalt font-mono">{route.cost}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Route Details */}
            <div className="mt-4 p-4 rounded-xl bg-navy-900/80 border border-white/10">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Clock className="w-5 h-5 text-cobalt mx-auto mb-1" />
                  <p className="text-xs text-text-secondary">Time</p>
                  <p className="text-sm font-mono text-text-primary">{selectedRoute.time}</p>
                </div>
                <div className="text-center">
                  <Fuel className="w-5 h-5 text-cobalt mx-auto mb-1" />
                  <p className="text-xs text-text-secondary">Cost</p>
                  <p className="text-sm font-mono text-text-primary">{selectedRoute.cost}</p>
                </div>
                <div className="text-center">
                  <Leaf className="w-5 h-5 text-cobalt mx-auto mb-1" />
                  <p className="text-xs text-text-secondary">Carbon</p>
                  <p className="text-sm font-mono text-text-primary">{selectedRoute.carbon}</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 btn-primary flex items-center justify-center gap-2">
              <span>Apply Route</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Optimization;
