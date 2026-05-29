import { useState } from 'react';
import { Eye, Globe, Copy, Check } from 'lucide-react';

const themes = [
  { name: 'Ocean Blue', primary: '#4F6DF5', bg: '#070A12', accent: '#27C26A' },
  { name: 'Emerald', primary: '#10B981', bg: '#064E3B', accent: '#34D399' },
  { name: 'Sunset', primary: '#F59E0B', bg: '#451A03', accent: '#FBBF24' },
  { name: 'Rose', primary: '#F43F5E', bg: '#4C0519', accent: '#FB7185' },
  { name: 'Violet', primary: '#8B5CF6', bg: '#2E1065', accent: '#A78BFA' },
];

const Portal = () => {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [companyName, setCompanyName] = useState('Your Company');
  const [logoUrl, setLogoUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const trackingUrl = `https://track.shiptrack.io/${companyName.toLowerCase().replace(/\s/g, '-')}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">Customer Portal</h1>
        <p className="text-sm text-text-secondary mt-1">Create a branded tracking experience for your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div className="card-surface p-6 space-y-4">
            <h3 className="font-display font-semibold text-text-primary">Branding</h3>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">COMPANY NAME</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1.5">LOGO URL</label>
              <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/5 text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-cobalt/50" />
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            <h3 className="font-display font-semibold text-text-primary">Theme</h3>
            <div className="grid grid-cols-5 gap-3">
              {themes.map(theme => (
                <button key={theme.name} onClick={() => setSelectedTheme(theme)}
                  className={`p-3 rounded-xl border-2 transition-all ${selectedTheme.name === theme.name ? 'border-cobalt' : 'border-white/5 hover:border-white/20'}`}>
                  <div className="w-full h-8 rounded-lg mb-2" style={{ background: theme.primary }} />
                  <span className="text-[10px] text-text-secondary">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            <h3 className="font-display font-semibold text-text-primary">Tracking URL</h3>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-900 border border-white/5">
              <Globe className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <span className="text-sm text-text-primary flex-1 truncate">{trackingUrl}</span>
              <button onClick={copyUrl} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-text-primary">Preview</h3>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Live preview
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: selectedTheme.bg }}>
            {/* Mock Portal Header */}
            <div className="p-4 flex items-center justify-between" style={{ background: `${selectedTheme.primary}20` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedTheme.primary }}>
                  <span className="text-white text-xs font-bold">
                    {companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-primary">{companyName}</span>
              </div>
              <span className="text-xs text-text-secondary">Tracking</span>
            </div>

            {/* Mock Portal Content */}
            <div className="p-6">
              <h4 className="text-lg font-display font-semibold text-text-primary text-center mb-2">
                Track Your Shipment
              </h4>
              <p className="text-xs text-text-secondary text-center mb-4">
                Enter your tracking number to get real-time updates
              </p>
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="Enter tracking number" disabled
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm" />
                <button className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: selectedTheme.primary }}>
                  Track
                </button>
              </div>

              {/* Mock Tracking Result */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${selectedTheme.accent}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: selectedTheme.accent }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-primary font-medium">In Transit</p>
                    <p className="text-[10px] text-text-secondary">Los Angeles, US</p>
                  </div>
                  <span className="text-[10px] text-text-secondary">2 hours ago</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '68%', background: selectedTheme.primary }} />
                </div>
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Shipped</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portal;
