import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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
    updates: Partial<ShipmentWithExtras>,
    options?: { notifyCustomer?: boolean; eventMessage?: string; eventLocation?: string }
  ) => Promise<boolean>;
  deleteShipment: (id: string) => Promise<boolean>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, session } = useAuth();
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
    if (!isSupabaseConfigured || !isAdmin) {
      if (!isSupabaseConfigured) {
        setShipments(generateMockShipments());
      } else {
        setShipments([]);
      }
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to load shipments');
      setLoading(false);
      return;
    }

    setShipments((data as ShipmentRow[]).map(mapShipmentRow));
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    void refreshShipments();
  }, [refreshShipments, session?.access_token]);

  const addShipment = useCallback(
    async (shipmentData: NewShipmentInput) => {
      if (!isSupabaseConfigured || !isAdmin) {
        toast.error('Admin session required to create shipments');
        return null;
      }

      const payload = toShipmentInsert(shipmentData);
      const { data, error } = await supabase.from('shipments').insert(payload).select('*').single();

      if (error || !data) {
        toast.error(error?.message || 'Failed to create shipment');
        return null;
      }

      const mapped = mapShipmentRow(data as ShipmentRow);

      await supabase.from('shipment_events').insert({
        shipment_id: mapped.id,
        status: mapped.status,
        location: mapped.origin,
        message: 'Shipment created',
      });

      setShipments((prev) => [mapped, ...prev]);
      addNotification({
        title: 'New Shipment Created',
        message: `Shipment ${mapped.trackingNumber} has been created.`,
        type: 'success',
      });
      toast.success(`Created ${mapped.trackingNumber}`);
      return mapped;
    },
    [addNotification, isAdmin]
  );

  const updateShipment = useCallback(
    async (
      id: string,
      updates: Partial<ShipmentWithExtras>,
      options?: { notifyCustomer?: boolean; eventMessage?: string; eventLocation?: string }
    ) => {
      if (!isSupabaseConfigured || !isAdmin) {
        toast.error('Admin session required to update shipments');
        return false;
      }

      const existing = shipments.find((s) => s.id === id);
      const row = toShipmentUpdate(updates);
      const { data, error } = await supabase
        .from('shipments')
        .update(row)
        .eq('id', id)
        .select('*')
        .single();

      if (error || !data) {
        toast.error(error?.message || 'Failed to update shipment');
        return false;
      }

      const mapped = mapShipmentRow(data as ShipmentRow);
      setShipments((prev) => prev.map((s) => (s.id === id ? mapped : s)));

      const statusChanged = updates.status && existing && updates.status !== existing.status;
      if (statusChanged || options?.eventMessage) {
        await supabase.from('shipment_events').insert({
          shipment_id: id,
          status: mapped.status,
          location: options?.eventLocation || mapped.destination,
          message:
            options?.eventMessage ||
            `Status updated to ${mapped.status}`,
        });
      }

      if (options?.notifyCustomer && mapped.customerEmail && statusChanged) {
        try {
          await fetch('/api/notify-shipment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({
              trackingNumber: mapped.trackingNumber,
              status: mapped.status,
              customerEmail: mapped.customerEmail,
              origin: mapped.origin,
              destination: mapped.destination,
            }),
          });
        } catch (err) {
          console.warn('Status email failed', err);
        }
      }

      addNotification({
        title: 'Shipment Updated',
        message: `${mapped.trackingNumber} has been updated.`,
        type: 'info',
      });
      toast.success('Shipment updated');
      return true;
    },
    [addNotification, isAdmin, session?.access_token, shipments]
  );

  const deleteShipment = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured || !isAdmin) {
        toast.error('Admin session required to delete shipments');
        return false;
      }

      const { error } = await supabase.from('shipments').delete().eq('id', id);
      if (error) {
        toast.error(error.message);
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
    },
    [addNotification, isAdmin]
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
