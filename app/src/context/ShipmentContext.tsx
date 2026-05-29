import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Shipment } from '@/data/mockShipments';
import { generateMockShipments } from '@/data/mockShipments';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface ShipmentContextType {
  shipments: Shipment[];
  notifications: Notification[];
  unreadCount: number;
  addShipment: (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('shiptrack_shipments');
    return saved ? JSON.parse(saved) : generateMockShipments();
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    localStorage.setItem('shiptrack_shipments', JSON.stringify(shipments));
  }, [shipments]);

  const addShipment = useCallback((shipmentData: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt'>) => {
    const newShipment: Shipment = {
      ...shipmentData,
      id: uuidv4(),
      trackingNumber: `SH-2026-${Math.floor(7000 + Math.random() * 999)}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setShipments(prev => [newShipment, ...prev]);
    addNotification({
      title: 'New Shipment Created',
      message: `Shipment ${newShipment.trackingNumber} has been created.`,
      type: 'success',
    });
  }, []);

  const updateShipment = useCallback((id: string, updates: Partial<Shipment>) => {
    setShipments(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : s))
    );
    addNotification({
      title: 'Shipment Updated',
      message: `Shipment has been updated.`,
      type: 'info',
    });
  }, []);

  const deleteShipment = useCallback((id: string) => {
    setShipments(prev => prev.filter(s => s.id !== id));
    addNotification({
      title: 'Shipment Deleted',
      message: 'Shipment has been removed.',
      type: 'warning',
    });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate incoming notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const statuses = ['In Transit', 'Customs', 'Delivered'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        addNotification({
          title: 'Shipment Update',
          message: `A shipment status changed to ${randomStatus}.`,
          type: 'info',
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        notifications,
        unreadCount,
        addShipment,
        updateShipment,
        deleteShipment,
        addNotification,
        markNotificationRead,
        markAllRead,
        theme,
        toggleTheme,
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
