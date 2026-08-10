import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Bell,
  ArrowRight,
  Layers,
  Navigation,
  Wind,
  CloudRain,
  Anchor,
  type LucideIcon,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '@/assets/images';

gsap.registerPlugin(ScrollTrigger);

type LayerName = 'Traffic' | 'Weather' | 'Ports';

const shipmentData = [
  {
    id: 'SH-7842',
    from: 'Shanghai',
    to: 'Los Angeles',
    progress: 68,
    status: 'In Transit',
    eta: '2 days',
    congestion: 'Moderate',
  },
  {
    id: 'SH-7843',
    from: 'Rotterdam',
    to: 'New York',
    progress: 42,
    status: 'In Transit',
    eta: '5 days',
    congestion: 'Light',
  },
  {
    id: 'SH-7844',
    from: 'Singapore',
    to: 'Sydney',
    progress: 89,
    status: 'Arriving',
    eta: '8 hours',
    congestion: 'Heavy',
  },
  {
    id: 'SH-7845',
    from: 'Hamburg',
    to: 'Dubai',
    progress: 23,
    status: 'In Transit',
    eta: '7 days',
    congestion: 'Light',
  },
];

const weatherData = [
  { region: 'North Pacific', condition: 'Gale warning', impact: 'ETA +14h', severity: 'high' },
  { region: 'North Atlantic', condition: 'Clear seas', impact: 'On schedule', severity: 'low' },
  { region: 'South China Sea', condition: 'Heavy rain', impact: 'Port delay risk', severity: 'medium' },
  { region: 'Arabian Sea', condition: 'Calm', impact: 'On schedule', severity: 'low' },
];

const portData = [
  { name: 'Los Angeles', wait: '18h', berths: '92%', status: 'Congested' },
  { name: 'Rotterdam', wait: '6h', berths: '71%', status: 'Normal' },
  { name: 'Singapore', wait: '11h', berths: '84%', status: 'Busy' },
  { name: 'Shanghai', wait: '4h', berths: '63%', status: 'Normal' },
];

const mapLayers: { name: LayerName; icon: LucideIcon }[] = [
  { name: 'Traffic', icon: Navigation },
  { name: 'Weather', icon: Wind },
  { name: 'Ports', icon: Layers },
];

const layerMeta: Record<
  LayerName,
  { overlay: string; footerLabel: string; footerValue: string }
> = {
  Traffic: {
    overlay: 'from-navy-900/80 via-navy-900/40 to-transparent',
    footerLabel: 'Active lanes',
    footerValue: `${shipmentData.length} shipments`,
  },
  Weather: {
    overlay: 'from-sky-950/85 via-navy-900/50 to-transparent',
    footerLabel: 'Watch zones',
    footerValue: '2 advisories',
  },
  Ports: {
    overlay: 'from-navy-900/85 via-emerald-950/35 to-transparent',
    footerLabel: 'Port network',
    footerValue: `${portData.length} hubs live`,
  },
};

const severityClass = (severity: string) => {
  if (severity === 'high') return 'bg-red-500/20 text-red-400';
  if (severity === 'medium') return 'bg-amber-500/20 text-amber-400';
  return 'bg-emerald-500/20 text-emerald-400';
};

const portStatusClass = (status: string) => {
  if (status === 'Congested') return 'bg-red-500/20 text-red-400';
  if (status === 'Busy') return 'bg-amber-500/20 text-amber-400';
  return 'bg-emerald-500/20 text-emerald-400';
};

const Visibility = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<LayerName>('Traffic');
  const [selectedShipment, setSelectedShipment] = useState(shipmentData[0]);
  const [selectedWeather, setSelectedWeather] = useState(weatherData[0]);
  const [selectedPort, setSelectedPort] = useState(portData[0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

  const meta = layerMeta[activeLayer];

  return (
    <section
      ref={sectionRef}
      id="visibility"
      className="relative w-full bg-navy-800 min-h-screen py-20 lg:py-0 lg:min-h-[90vh]"
    >
      <div
        ref={lineRef}
        className="absolute left-[60vw] top-[10vh] h-[70vh] w-[2px] bg-cobalt hidden lg:block"
        style={{ transformOrigin: 'top' }}
      />

      <div
        ref={mediaRef}
        className="relative lg:absolute left-[4vw] top-[10vh] w-[92vw] lg:w-[54vw] h-[60vh] lg:h-[80vh] rounded-3xl overflow-hidden shadow-card mx-auto lg:mx-0"
      >
        <img
          src={images.visibilityAerial}
          alt="Real-time Visibility"
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            transform:
              activeLayer === 'Weather'
                ? 'scale(1.06)'
                : activeLayer === 'Ports'
                  ? 'scale(1.03)'
                  : 'scale(1)',
          }}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-r transition-colors duration-500 ${meta.overlay}`}
        />

        <div className="absolute inset-4 lg:inset-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900/90 backdrop-blur-sm border border-white/10">
              <Map className="w-4 h-4 text-cobalt" />
              <span className="text-xs font-mono text-text-primary">LIVE MAP</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end" role="tablist" aria-label="Map layers">
              {mapLayers.map((layer) => {
                const isActive = activeLayer === layer.name;
                return (
                  <button
                    key={layer.name}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveLayer(layer.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-cobalt text-white border border-white/30'
                        : 'bg-navy-900/80 text-text-secondary border border-white/10 hover:border-cobalt/40 hover:text-text-primary'
                    }`}
                  >
                    <layer.icon className="w-3 h-3" />
                    {layer.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={activeLayer} className="flex-1 overflow-auto">
            {activeLayer === 'Traffic' && (
              <div className="space-y-2">
                {shipmentData.map((shipment) => (
                  <button
                    key={shipment.id}
                    type="button"
                    onClick={() => setSelectedShipment(shipment)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedShipment.id === shipment.id
                        ? 'bg-cobalt/20 border border-cobalt/40'
                        : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-cobalt">{shipment.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          shipment.status === 'Arriving'
                            ? 'bg-success/20 text-success'
                            : 'bg-cobalt/20 text-cobalt'
                        }`}
                      >
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
            )}

            {activeLayer === 'Weather' && (
              <div className="space-y-2">
                {weatherData.map((item) => (
                  <button
                    key={item.region}
                    type="button"
                    onClick={() => setSelectedWeather(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedWeather.region === item.region
                        ? 'bg-sky-500/15 border border-sky-400/40'
                        : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-sky-300">{item.region}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityClass(item.severity)}`}>
                        {item.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <CloudRain className="w-3.5 h-3.5 text-sky-300" />
                      <span>Lane impact: {item.impact}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeLayer === 'Ports' && (
              <div className="space-y-2">
                {portData.map((port) => (
                  <button
                    key={port.name}
                    type="button"
                    onClick={() => setSelectedPort(port)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedPort.name === port.name
                        ? 'bg-emerald-500/15 border border-emerald-400/40'
                        : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-2 text-sm font-mono text-emerald-300">
                        <Anchor className="w-3.5 h-3.5" />
                        {port.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${portStatusClass(port.status)}`}>
                        {port.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>Avg wait {port.wait}</span>
                      <span>Berth util {port.berths}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-navy-900/90 backdrop-blur-sm border border-white/10">
            {activeLayer === 'Traffic' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Selected shipment</p>
                  <p className="text-sm font-mono text-text-primary">{selectedShipment.id}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Congestion: {selectedShipment.congestion}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary mb-1">Progress</p>
                  <p className="text-sm font-mono text-cobalt">{selectedShipment.progress}%</p>
                </div>
              </div>
            )}
            {activeLayer === 'Weather' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Selected zone</p>
                  <p className="text-sm font-mono text-text-primary">{selectedWeather.region}</p>
                  <p className="text-xs text-text-secondary mt-1">{selectedWeather.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary mb-1">Impact</p>
                  <p className="text-sm font-mono text-sky-300">{selectedWeather.impact}</p>
                </div>
              </div>
            )}
            {activeLayer === 'Ports' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Selected port</p>
                  <p className="text-sm font-mono text-text-primary">{selectedPort.name}</p>
                  <p className="text-xs text-text-secondary mt-1">{selectedPort.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary mb-1">{meta.footerLabel}</p>
                  <p className="text-sm font-mono text-emerald-300">{meta.footerValue}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        className="relative lg:absolute left-[4vw] lg:left-[62vw] top-[4vh] lg:top-[18vh] w-[92vw] lg:w-[34vw] mt-6 lg:mt-0 mx-auto lg:mx-0"
      >
        <span className="eyebrow mb-4 block">VISIBILITY</span>
        <h2 className="font-display font-bold text-[clamp(28px,3vw,44px)] text-text-primary leading-tight mb-6">
          See it as it moves.
        </h2>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          From port to porch, get live location, ETA changes, and exceptions—without switching tabs.
        </p>

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

        <Link to="/track" className="btn-primary inline-flex items-center gap-2 min-h-11">
          <span>Explore tracking</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default Visibility;
