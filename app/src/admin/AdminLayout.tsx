import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  BarChart3,
  PlusCircle,
  Globe,
  Bell,
  Calculator,
  FileText,
  Users,
  Palette,
  Brain,
  MessageSquare,
  Smartphone,
  Search,
  Menu,
  X,
  ShipIcon,
  LogOut,
} from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationPanel from '@/components/notifications/NotificationPanel';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/shipments', label: 'Shipments', icon: Ship },
  { path: '/admin/map', label: 'Live Map', icon: Globe },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/create', label: 'New Shipment', icon: PlusCircle },
  { path: '/admin/globe', label: '3D Globe', icon: Globe },
  { path: '/admin/calculator', label: 'Cost Calculator', icon: Calculator },
  { path: '/admin/documents', label: 'Documents', icon: FileText },
  { path: '/admin/team', label: 'Team', icon: Users },
  { path: '/admin/portal', label: 'Customer Portal', icon: Palette },
  { path: '/admin/predictions', label: 'AI Predictions', icon: Brain },
  { path: '/admin/chat', label: 'Live Chat', icon: MessageSquare },
  { path: '/admin/mobile', label: 'Mobile App', icon: Smartphone },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { unreadCount } = useShipments();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const initials = (user?.email?.[0] || 'A').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-navy-900' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 ${
          isDark ? 'bg-navy-800 border-r border-white/5' : 'bg-white border-r border-gray-200'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cobalt flex items-center justify-center">
              <ShipIcon className="w-4 h-4 text-white" />
            </div>
            <span className={`font-display font-bold ${isDark ? 'text-text-primary' : 'text-gray-900'}`}>
              Quay<span className="text-cobalt">vox</span>
            </span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/5"
          >
            <X className={`w-5 h-5 ${isDark ? 'text-text-secondary' : 'text-gray-500'}`} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-64px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cobalt/20 text-cobalt border border-cobalt/20'
                    : isDark
                    ? 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header
          className={`sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center justify-between ${
            isDark ? 'bg-navy-900/90 border-b border-white/5' : 'bg-white/90 border-b border-gray-200'
          } backdrop-blur-xl`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <Menu className={`w-5 h-5 ${isDark ? 'text-text-primary' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                isDark
                  ? 'bg-navy-800 text-text-secondary hover:text-text-primary'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search shipments...</span>
              <kbd className={`hidden sm:inline ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-navy-700' : 'bg-gray-200'}`}>
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-lg border-0" />

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-text-secondary' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex flex-col items-end mr-1 max-w-[140px]">
              <span className={`text-xs truncate ${isDark ? 'text-text-secondary' : 'text-gray-600'}`}>
                {user?.email}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-cobalt/20 flex items-center justify-center border border-cobalt/30">
              <span className="text-xs font-semibold text-cobalt">{initials}</span>
            </div>

            <button
              onClick={handleSignOut}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-text-secondary' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default AdminLayout;
