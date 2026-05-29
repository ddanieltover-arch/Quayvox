import { X, Bell, Check, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useShipments } from '@/context/ShipmentContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: Props) => {
  const { notifications, markNotificationRead, markAllRead } = useShipments();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-cobalt" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute top-full right-4 mt-2 w-80 max-h-[500px] card-surface z-50 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cobalt" />
            <span className="font-display font-semibold text-sm text-text-primary">Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cobalt text-white text-[10px]">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-cobalt" title="Mark all read">
              <CheckCheck className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                    !notification.read ? 'bg-cobalt/5' : ''
                  } hover:bg-white/[0.02]`}
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-text-secondary/50 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 rounded-full bg-cobalt flex-shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
