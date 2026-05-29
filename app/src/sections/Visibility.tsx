import { useEffect, useRef, useState } from 'react';
import { Map, Bell, ArrowRight, Layers, Navigation, Wind } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Simulated shipment data for the live map
const shipmentData = [
  { id: 'SH-7842', from: 'Shanghai', to: 'Los Angeles', progress: 68, status: 'In Transit', eta: '2 days' },
  { id: 'SH-7843', from: 'Rotterdam', to: 'New York', progress: 42, status: 'In Transit', eta: '5 days' },
  { id: 'SH-7844', from: 'Singapore', to: 'Sydney', progress: 89, status: 'Arriving', eta: '8 hours' },
  { id: 'SH-7845', from: 'Hamburg', to: 'Dubai', progress: 23, status: 'In Transit', eta: '7 days' },
];

const mapLayers = [
  { name: 'Traffic', icon: Navigation, active: true },
  { name: 'Weather', icon: Wind, active: false },
  { name: 'Ports', icon: Layers, active: true },
];

const Visibility = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState('Traffic');
  const [selectedShipment, setSelectedShipment] = useState(shipmentData[0]);

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
        '.visibility-bullet',
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
      id="visibility"
      className="relative w-full bg-navy-800 min-h-screen py-20 lg:py-0 lg:min-h-[90vh]"
    >
      {/* Vertical Accent Line */}
      <div
        ref={lineRef}
        className="absolute left-[60vw] top-[10vh] h-[70vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      {/* Left Media Card - Live Map */}
      <div
        ref={mediaRef}
        className="relative lg:absolute left-[4vw] top-[10vh] w-[92vw] lg:w-[54vw] h-[60vh] lg:h-[80vh] rounded-3xl overflow-hidden shadow-card mx-auto lg:mx-0"
      >
        <img
          src="/images/visibility_aerial.jpg"
          alt="Real-time Visibility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/40 to-transparent" />

        {/* Live Map Overlay */}
        <div className="absolute inset-4 lg:inset-6 flex flex-col">
          {/* Map Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/90 backdrop-blur-sm border border-white/10">
              <Map className="w-4 h-4 text-cobalt" />
              <span className="text-xs font-mono text-text-primary">LIVE MAP</span>
            </div>
            <div className="flex items-center gap-2">
              {mapLayers.map((layer) => (
                <button
                  key={layer.name}
                  onClick={() => setActiveLayer(layer.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                    activeLayer === layer.name
                      ? 'bg-cobalt text-white'
                      : 'bg-navy-900/80 text-text-secondary border border-white/10'
                  }`}
                >
                  <layer.icon className="w-3 h-3" />
                  {layer.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shipment List */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {shipmentData.map((shipment) => (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedShipment.id === shipment.id
                      ? 'bg-cobalt/20 border border-cobalt/40'
                      : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-cobalt">{shipment.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      shipment.status === 'Arriving'
                        ? 'bg-success/20 text-success'
                        : 'bg-cobalt/20 text-cobalt'
                    }`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <span>{shipment.from}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{shipment.to}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cobalt rounded-full transition-all duration-500"
                        style={{ width: `${shipment.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-secondary">{shipment.eta}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Shipment Details */}
          <div className="mt-4 p-4 rounded-xl bg-navy-900/90 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary mb-1">Selected Shipment</p>
                <p className="text-sm font-mono text-text-primary">{selectedShipment.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary mb-1">Progress</p>
                <p className="text-sm font-mono text-cobalt">{selectedShipment.progress}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Block */}
      <div
        ref={contentRef}
        className="relative lg:absolute left-[4vw] lg:left-[62vw] top-[4vh] lg:top-[18vh] w-[92vw] lg:w-[34vw] mt-6 lg:mt-0 mx-auto lg:mx-0"
      >
        <span className="eyebrow mb-4 block">VISIBILITY</span>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary leading-tight mb-6">
          See it as it moves.
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          From port to porch, get live location, ETA changes, and exceptions—without
          switching tabs.
        </p>

        {/* Feature Bullets */}
        <div className="space-y-4 mb-8">
          <div className="visibility-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Map className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">LIVE MAP</h4>
              <p className="text-sm text-text-secondary">
                Multi-layer map with traffic, weather, and port congestion.
              </p>
            </div>
          </div>

          <div className="visibility-bullet flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-cobalt" />
            </div>
            <div>
              <h4 className="font-mono text-xs text-cobalt mb-1">ALERTS</h4>
              <p className="text-sm text-text-secondary">
                Notify teams via Slack, email, or webhook.
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <span>Explore tracking</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default Visibility;
