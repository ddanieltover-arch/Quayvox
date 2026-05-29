import { useState } from 'react';
import { Download, QrCode, Bell, Map, Package, Star } from 'lucide-react';

const features = [
  { icon: Map, title: 'Live Tracking', desc: 'Real-time GPS tracking on the go' },
  { icon: Bell, title: 'Push Notifications', desc: 'Instant alerts for shipment updates' },
  { icon: Package, title: 'Barcode Scan', desc: 'Scan barcodes to quickly find shipments' },
  { icon: Star, title: 'Favorites', desc: 'Save frequently tracked shipments' },
];

const reviews = [
  { user: 'Logistics Manager', rating: 5, text: 'The best logistics app I\'ve ever used. Tracking is seamless.' },
  { user: 'Supply Chain Director', rating: 5, text: 'Push notifications save us hours every day. Highly recommended.' },
  { user: 'Warehouse Operator', rating: 4, text: 'Barcode scanning feature is a game changer for our workflow.' },
];

const Mobile = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Mobile App</h1>
          <p className="text-sm text-text-secondary mt-1">Track shipments from anywhere</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            App Store
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Play Store
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phone Mockup */}
        <div className="lg:col-span-1 flex justify-center">
          <div className="relative w-[280px] h-[560px] bg-navy-800 rounded-[40px] border-4 border-navy-700 p-3 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-navy-700 rounded-b-2xl z-10" />
            
            {/* Screen */}
            <div className="w-full h-full bg-navy-900 rounded-[32px] overflow-hidden relative">
              {/* Status Bar */}
              <div className="h-8 flex items-center justify-between px-6 pt-2">
                <span className="text-[10px] text-text-primary">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-text-secondary/30" />
                  <div className="w-3 h-3 rounded-full bg-text-secondary/30" />
                </div>
              </div>

              {/* App Content */}
              <div className="p-4">
                <h4 className="text-lg font-display font-bold text-text-primary mb-4">ShipTrack</h4>

                {activeScreen === 'dashboard' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-cobalt/20 border border-cobalt/30">
                      <p className="text-xs text-cobalt">Active Shipments</p>
                      <p className="text-2xl font-bold text-text-primary">5</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-navy-800 border border-white/5">
                        <p className="text-xs text-text-secondary">Delivered</p>
                        <p className="text-lg font-bold text-emerald-400">2</p>
                      </div>
                      <div className="p-3 rounded-xl bg-navy-800 border border-white/5">
                        <p className="text-xs text-text-secondary">Pending</p>
                        <p className="text-lg font-bold text-amber-400">3</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-xs text-text-secondary">Recent</p>
                      {['SH-2026-7842', 'SH-2026-7844', 'SH-2026-7848'].map(t => (
                        <div key={t} className="flex items-center justify-between p-2 rounded-lg bg-navy-800 border border-white/5">
                          <span className="text-xs font-mono text-cobalt">{t}</span>
                          <span className="text-[10px] text-emerald-400">In Transit</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeScreen === 'map' && (
                  <div className="h-80 rounded-xl bg-navy-800 border border-white/5 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-8 h-8 text-cobalt mx-auto mb-2" />
                      <p className="text-xs text-text-secondary">Live Map</p>
                      <div className="mt-4 space-y-2">
                        {['Shanghai → LA', 'Rotterdam → NY', 'Singapore → Sydney'].map(route => (
                          <div key={route} className="text-[10px] text-text-primary">{route}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-navy-800/90 backdrop-blur flex items-center justify-around border-t border-white/5">
                {[
                  { id: 'dashboard', icon: Package },
                  { id: 'map', icon: Map },
                  { id: 'notifications', icon: Bell },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveScreen(item.id)}
                    className={`p-2 rounded-lg ${activeScreen === item.id ? 'text-cobalt' : 'text-text-secondary'}`}>
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Features */}
          <div className="card-surface p-6">
            <h3 className="font-display font-semibold text-text-primary mb-4">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-navy-900/60 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-cobalt" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{f.title}</p>
                    <p className="text-xs text-text-secondary">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="card-surface p-6">
            <h3 className="font-display font-semibold text-text-primary mb-4">Quick Download</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="w-24 h-24 text-navy-900" />
              </div>
              <div>
                <p className="text-sm text-text-primary mb-2">Scan to download</p>
                <p className="text-xs text-text-secondary">Available on iOS and Android</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-navy-900 text-text-secondary border border-white/5">iOS 14+</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-navy-900 text-text-secondary border border-white/5">Android 10+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="card-surface p-6">
            <h3 className="font-display font-semibold text-text-primary mb-4">Reviews</h3>
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="p-3 rounded-xl bg-navy-900/60 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-navy-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary">{review.user}</span>
                  </div>
                  <p className="text-sm text-text-primary">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mobile;
