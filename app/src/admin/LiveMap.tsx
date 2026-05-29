import { useEffect, useRef, useState } from 'react';
import { Layers, Wind, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { getStatusColor } from '@/data/mockShipments';

const mapLayers = [
  { name: 'Traffic', icon: Navigation, active: true },
  { name: 'Weather', icon: Wind, active: false },
  { name: 'Ports', icon: Layers, active: true },
];

const portCoordinates: Record<string, [number, number]> = {
  'Shanghai, CN': [31.2, 121.5],
  'Rotterdam, NL': [51.9, 4.5],
  'Singapore, SG': [1.3, 103.8],
  'Hamburg, DE': [53.5, 9.9],
  'Tokyo, JP': [35.7, 139.7],
  'Mumbai, IN': [19.1, 72.9],
  'Sao Paulo, BR': [-23.5, -46.6],
  'Busan, KR': [35.2, 129.1],
  'Melbourne, AU': [-37.8, 144.9],
  'Dubai, AE': [25.2, 55.3],
  'Los Angeles, US': [34.1, -118.2],
  'New York, US': [40.7, -74.0],
  'Sydney, AU': [-33.9, 151.2],
  'London, UK': [51.5, -0.1],
  'Nairobi, KE': [-1.3, 36.8],
  'Miami, US': [25.8, -80.2],
  'Auckland, NZ': [-36.8, 174.8],
  'Lagos, NG': [6.5, 3.4],
};

const LiveMap = () => {
  const { shipments } = useShipments();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['Traffic', 'Ports']);
  const [selectedShipment, setSelectedShipment] = useState(shipments[0]);
  const [zoom, setZoom] = useState(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  const toggleLayer = (name: string) => {
    setActiveLayers(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]);
  };

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width + offsetRef.current.x;
    const y = ((90 - lat) / 180) * height + offsetRef.current.y;
    return [x * zoom, y * zoom];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationFrame: number;
    const animate = (time: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Dark world map background
      ctx.fillStyle = '#0B1020';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(79, 109, 245, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 12; i++) {
        const x = (i / 12) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const y = (i / 6) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated routes
      if (activeLayers.includes('Traffic')) {
        shipments.forEach((shipment, idx) => {
          const from = portCoordinates[shipment.origin];
          const to = portCoordinates[shipment.destination];
          if (!from || !to) return;

          const [x1, y1] = latLngToCanvas(from[0], from[1], w, h);
          const [x2, y2] = latLngToCanvas(to[0], to[1], w, h);

          // Curved path
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 30;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(midX, midY, x2, y2);
          ctx.strokeStyle = shipment.status === 'Delivered'
            ? 'rgba(39, 194, 106, 0.3)'
            : shipment.status === 'Exception'
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(79, 109, 245, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Animated dot along path
          const progress = (shipment.progress / 100);
          const t = ((time * 0.0001 * (idx + 1)) % 1);
          const adjustedT = t * progress;
          const dotX = (1 - adjustedT) * (1 - adjustedT) * x1 + 2 * (1 - adjustedT) * adjustedT * midX + adjustedT * adjustedT * x2;
          const dotY = (1 - adjustedT) * (1 - adjustedT) * y1 + 2 * (1 - adjustedT) * adjustedT * midY + adjustedT * adjustedT * y2;

          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#4F6DF5';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 109, 245, 0.2)';
          ctx.fill();
        });
      }

      // Port markers
      if (activeLayers.includes('Ports')) {
        Object.entries(portCoordinates).forEach(([, coords]) => {
          const [x, y] = latLngToCanvas(coords[0], coords[1], w, h);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 109, 245, 0.6)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 109, 245, 0.1)';
          ctx.fill();
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [activeLayers, zoom, shipments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Live Map</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time shipment tracking worldwide</p>
        </div>
        <div className="flex items-center gap-2">
          {mapLayers.map(layer => (
            <button
              key={layer.name}
              onClick={() => toggleLayer(layer.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeLayers.includes(layer.name)
                  ? 'bg-cobalt text-white'
                  : 'bg-navy-800 text-text-secondary border border-white/5'
              }`}
            >
              <layer.icon className="w-3.5 h-3.5" />
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Canvas */}
        <div className="lg:col-span-3 card-surface relative overflow-hidden" style={{ height: '65vh' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ cursor: 'grab' }}
          />
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 rounded-lg bg-navy-900/90 border border-white/10 text-text-secondary hover:text-cobalt">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 rounded-lg bg-navy-900/90 border border-white/10 text-text-secondary hover:text-cobalt">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shipment List */}
        <div className="card-surface p-4 overflow-auto" style={{ maxHeight: '65vh' }}>
          <h3 className="font-display font-semibold text-sm text-text-primary mb-3">Active Shipments</h3>
          <div className="space-y-2">
            {shipments.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedShipment(s)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedShipment?.id === s.id
                    ? 'bg-cobalt/20 border border-cobalt/40'
                    : 'bg-navy-900/60 border border-white/5 hover:bg-navy-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-cobalt">{s.trackingNumber}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getStatusColor(s.status)}`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-[10px] text-text-secondary">{s.origin} → {s.destination}</div>
                <div className="mt-1 h-1 bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cobalt rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
