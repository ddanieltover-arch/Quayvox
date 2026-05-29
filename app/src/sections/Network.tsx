import { useEffect, useRef, useState } from 'react';
import { Globe, Wallet, ArrowRight, Plane, Ship, Train, Truck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const coverageStats = [
  { icon: Plane, label: 'Air', count: '340+', routes: 'Airports' },
  { icon: Ship, label: 'Ocean', count: '850+', routes: 'Ports' },
  { icon: Train, label: 'Rail', count: '120+', routes: 'Terminals' },
  { icon: Truck, label: 'Road', count: '15K+', routes: 'Carriers' },
];

const Network = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState('Ocean');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Media card entrance
      gsap.fromTo(
        mediaRef.current,
        { x: '-8vw', opacity: 0 },
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

      // Content block
      gsap.fromTo(
        contentRef.current,
        { x: '6vw', opacity: 0 },
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
        '.network-bullet',
        { x: 30, opacity: 0 },
        {
          x: 0,
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
      className="relative w-full bg-navy-800 min-h-screen py-20 lg:py-0 lg:min-h-[90vh]"
    >
      {/* Vertical Accent Line */}
      <div
        ref={lineRef}
        className="absolute left-[60vw] top-[10vh] h-[70vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      {/* Left Media Card */}
      <div
        ref={mediaRef}
        className="relative lg:absolute left-[4vw] top-[10vh] w-[92vw] lg:w-[54vw] h-[50vh] lg:h-[80vh] rounded-3xl overflow-hidden shadow-card mx-auto lg:mx-0"
      >
        <img
          src="/images/global_cargo_plane.jpg"
          alt="Global Network"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/70 via-navy-900/30 to-transparent" />

        {/* Coverage Stats Overlay */}
        <div className="absolute inset-4 lg:inset-6 flex flex-col justify-end">
          <div className="glass-card p-4 lg:p-6">
            <h3 className="font-display font-semibold text-base lg:text-lg text-text-primary mb-4">
              Global Coverage
            </h3>

            {/* Transport Mode Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {coverageStats.map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setActiveMode(stat.label)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    activeMode === stat.label
                      ? 'bg-cobalt text-white'
                      : 'bg-navy-900/60 text-text-secondary border border-white/10'
                  }`}
                >
                  <stat.icon className="w-3.5 h-3.5" />
                  {stat.label}
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {coverageStats
                .filter((s) => s.label === activeMode)
                .map((stat) => (
                  <div key={stat.label} className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-cobalt" />
                      </div>
                      <div>
                        <p className="text-2xl font-display font-bold text-text-primary">
                          {stat.count}
                        </p>
                        <p className="text-xs text-text-secondary">{stat.routes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">Connected</p>
                      <p className="text-sm font-mono text-cobalt">120+ Countries</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Block */}
      <div
        ref={contentRef}
        className="relative lg:absolute left-[4vw] lg:left-[62vw] top-[4vh] lg:top-[18vh] w-[92vw] lg:w-[34vw] mt-6 lg:mt-0 mx-auto lg:mx-0"
      >
        <span className="eyebrow mb-4 block">NETWORK</span>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary leading-tight mb-6">
          Every lane. One contract.
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          Air, ocean, rail, and road—pre-negotiated rates and unified invoicing.
        </p>

        {/* Feature Bullets */}
        <div className="space-y-4 mb-8">
          <div className="network-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">COVERAGE</h4>
              <p className="text-sm text-text-secondary">
                120+ countries with local compliance built in.
              </p>
            </div>
          </div>

          <div className="network-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">FINANCE</h4>
              <p className="text-sm text-text-secondary">
                Reconcile costs by shipment, SKU, or cost center.
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <span>View coverage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default Network;
