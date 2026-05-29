import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Filter, Download, ArrowRight, BarChart3, Package, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const dashboardWidgets = [
  { name: 'Active Shipments', value: '1,245', change: '+12%', icon: Package },
  { name: 'Exceptions', value: '23', change: '-5%', icon: AlertCircle },
  { name: 'On-Time Rate', value: '94.7%', change: '+2.3%', icon: BarChart3 },
];

const filters = ['All', 'Air', 'Ocean', 'Express', 'Delayed'];

const Dashboard = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Media card entrance from right
      gsap.fromTo(
        mediaRef.current,
        { x: '10vw', opacity: 0 },
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
        '.dash-bullet',
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
        <span className="eyebrow mb-4 block">DASHBOARD</span>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary leading-tight mb-6">
          Control tower. Zero noise.
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          A clean interface that shows what matters—exceptions, ETAs, and next best
          actions.
        </p>

        {/* Feature Bullets */}
        <div className="space-y-4 mb-8">
          <div className="dash-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">FILTERS</h4>
              <p className="text-sm text-text-secondary">
                Slice by lane, carrier, priority, or tag.
              </p>
            </div>
          </div>

          <div className="dash-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">EXPORT</h4>
              <p className="text-sm text-text-secondary">
                Share reports without building spreadsheets.
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <span>Try the demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Media Card - Dashboard Preview */}
      <div
        ref={mediaRef}
        className="relative lg:absolute left-[4vw] lg:left-[42vw] top-[4vh] lg:top-[10vh] w-[92vw] lg:w-[54vw] h-auto lg:h-[80vh] rounded-3xl overflow-hidden shadow-card mx-auto lg:mx-0 mt-8 lg:mt-0"
      >
        <img
          src="/images/dashboard_ui.jpg"
          alt="Dashboard"
          className="w-full h-64 lg:h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-navy-900/80 via-navy-900/40 to-transparent" />

        {/* Dashboard Widget Overlay */}
        <div className="absolute inset-4 lg:inset-6 flex flex-col justify-center">
          <div className="glass-card p-4 lg:p-6 max-w-md ml-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-cobalt" />
                <span className="font-display font-semibold text-text-primary">
                  Overview
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-cobalt hover:text-cobalt-light transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? 'bg-cobalt text-white'
                      : 'bg-navy-900/60 text-text-secondary border border-white/5 hover:bg-navy-900/80'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Widget Grid */}
            <div className="space-y-3">
              {dashboardWidgets.map((widget) => (
                <div
                  key={widget.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cobalt/10 flex items-center justify-center">
                      <widget.icon className="w-4 h-4 text-cobalt" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">{widget.name}</p>
                      <p className="text-lg font-mono font-semibold text-text-primary">
                        {widget.value}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-mono ${
                      widget.change.startsWith('+') ? 'text-success' : 'text-amber-500'
                    }`}
                  >
                    {widget.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Mini Chart Placeholder */}
            <div className="mt-4 p-3 rounded-xl bg-navy-900/60 border border-white/5">
              <p className="text-xs text-text-secondary mb-2">Weekly Volume</p>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-cobalt/40 hover:bg-cobalt transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
