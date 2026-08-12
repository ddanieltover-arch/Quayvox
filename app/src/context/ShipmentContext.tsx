import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import {
  mapShipmentRow,
  toShipmentInsert,
  toShipmentUpdate,
  type ShipmentRow,
  type ShipmentWithExtras,
} from '@/lib/shipments';
import { generateMockShipments } from '@/data/mockShipments';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

type NewShipmentInput = Omit<ShipmentWithExtras, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'> & {
  trackingNumber?: string;
  customerEmail?: string | null;
  notes?: string | null;
};

interface ShipmentContextType {
  shipments: ShipmentWithExtras[];
  loading: boolean;
  notifications: Notification[];
  unreadCount: number;
  refreshShipments: () => Promise<void>;
  addShipment: (shipment: NewShipmentInput) => Promise<ShipmentWithExtras | null>;
  updateShipment: (
    id: string,
    updates: Partial<ShipmentWithExtras> & { positionLabel?: string | null },
    options?: { notifyCustomer?: boolean; eventMessage?: string; eventLocation?: string }
  ) => Promise<boolean>;
  deleteShipment: (id: string) => Promise<boolean>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, configured, user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentWithExtras[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  const refreshShipments = useCallback(async () => {
    if (!configured || !isAdmin) {
      if (!configured) {
        setShipments(generateMockShipments());
      } else {
        setShipments([]);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/shipments', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load shipments');
      }
      const data = (await res.json()) as { shipments: ShipmentRow[] };
      setShipments((data.shipments ?? []).map(mapShipmentRow));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [configured, isAdmin]);

  useEffect(() => {
    void refreshShipments();
  }, [refreshShipments, user?.email]);

  const addShipment = useCallback(
    async (shipmentData: NewShipmentInput) => {
      if (!configured || !isAdmin) {
        toast.error('Admin session required to create shipments');
        return null;
      }

      const payload = toShipmentInsert(shipmentData);
      try {
        const res = await fetch('/api/shipments', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { shipment?: ShipmentRow; error?: string };
        if (!res.ok || !data.shipment) {
          toast.error(data.error || 'Failed to create shipment');
          return null;
        }

        const mapped = mapShipmentRow(data.shipment);
        setShipments((prev) => [mapped, ...prev]);
        addNotification({
          title: 'New Shipment Created',
          message: `Shipment ${mapped.trackingNumber} has been created.`,
          type: 'success',
        });
        toast.success(`Created ${mapped.trackingNumber}`);
        return mapped;
      } catch (err) {
        console.error(err);
        toast.error('Failed to create shipment');
        return null;
      }
    },
    [addNotification, configured, isAdmin]
  );

  const updateShipment = useCallback(
    async (
      id: string,
      updates: Partial<ShipmentWithExtras> & { positionLabel?: string | null },
      options?: { notifyCustomer?: boolean; eventMessage?: string; eventLocation?: string }
    ) => {
      if (!configured || !isAdmin) {
        toast.error('Admin session required to update shipments');
        return false;
      }

      const existing = shipments.find((s) => s.id === id);
      const row = toShipmentUpdate(updates);
      const statusChanged = updates.status && existing && updates.status !== existing.status;
      const positionChanged =
        updates.currentLat !== undefined ||
        updates.currentLng !== undefined ||
        updates.currentAddress !== undefined;

      try {
        const res = await fetch(`/api/shipments/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...row,
            position_label: options?.eventLocation ?? updates.positionLabel ?? undefined,
            eventMessage:
              options?.eventMessage ||
              (statusChanged
                ? `Status updated to ${updates.status}`
                : positionChanged
                  ? 'Location updated'
                  : undefined),
            eventLocation: options?.eventLocation ?? updates.positionLabel ?? undefined,
            notifyCustomer: true,
          }),
        });
        const data = (await res.json()) as {
          shipment?: ShipmentRow;
          error?: string;
          emails?: {
            customerSent?: boolean;
            adminSent?: boolean;
            partyEmails?: string[];
          };
        };
        if (!res.ok || !data.shipment) {
          toast.error(data.error || 'Failed to update shipment');
          return false;
        }

        const mapped = mapShipmentRow(data.shipment);
        setShipments((prev) => prev.map((s) => (s.id === id ? mapped : s)));

        addNotification({
          title: 'Shipment Updated',
          message: `${mapped.trackingNumber} has been updated.`,
          type: 'info',
        });

        const addressWasUpdated =
          updates.currentAddress !== undefined &&
          Boolean(String(updates.currentAddress ?? '').trim());
        if (addressWasUpdated && (mapped.currentLat == null || mapped.currentLng == null)) {
          toast.success('Shipment updated — address could not be pinned on the map');
        } else if (addressWasUpdated) {
          toast.success('Shipment updated and pinned on the map');
        } else {
          toast.success('Shipment updated');
        }

        const partyCount = data.emails?.partyEmails?.length ?? 0;
        if (data.emails?.customerSent || data.emails?.adminSent) {
          const parts: string[] = [];
          if (data.emails.customerSent) {
            parts.push(partyCount > 1 ? 'sender & receiver' : 'customer');
          }
          if (data.emails.adminSent) parts.push('admin');
          toast.success(`Update email sent to ${parts.join(', ')}`);
        } else if (partyCount === 0) {
          toast.error('Updated, but no sender/receiver email is on file to notify');
        }

        return true;
      } catch (err) {
        console.error(err);
        toast.error('Failed to update shipment');
        return false;
      }
    },
    [addNotification, configured, isAdmin, shipments]
  );

  const deleteShipment = useCallback(
    async (id: string) => {
      if (!configured || !isAdmin) {
        toast.error('Admin session required to delete shipments');
        return false;
      }

      try {
        const res = await fetch(`/api/shipments/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          toast.error(data.error || 'Failed to delete shipment');
          return false;
        }

        setShipments((prev) => prev.filter((s) => s.id !== id));
        addNotification({
          title: 'Shipment Deleted',
          message: 'Shipment has been removed.',
          type: 'warning',
        });
        toast.success('Shipment deleted');
        return true;
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete shipment');
        return false;
      }
    },
    [addNotification, configured, isAdmin]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        loading,
        notifications,
        unreadCount,
        refreshShipments,
        addShipment,
        updateShipment,
        deleteShipment,
        addNotification,
        markNotificationRead,
        markAllRead,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipments = () => {
  const context = useContext(ShipmentContext);
  if (!context) throw new Error('useShipments must be used within ShipmentProvider');
  return context;
};
