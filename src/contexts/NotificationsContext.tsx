import { createContext, useContext, useState, type ReactNode } from 'react';

export interface AppNotification {
  id: string;
  message: string;
  type: 'post' | 'connect' | 'community' | 'event' | 'system';
  read: boolean;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unread: number;
  add: (message: string, type: AppNotification['type']) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unread = notifications.filter(n => !n.read).length;

  const add = (message: string, type: AppNotification['type']) => {
    const n: AppNotification = {
      id: String(Date.now()),
      message,
      type,
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [n, ...prev]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unread, add, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
