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

const STORAGE_KEY = 'app_notifications';

function loadStored(): AppNotification[] {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AppNotification[])
      .map(n => ({ ...n, createdAt: new Date(n.createdAt) }));
  } catch { return []; }
}

function persist(list: AppNotification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50))); } catch {}
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStored);

  const unread = notifications.filter(n => !n.read).length;

  const add = (message: string, type: AppNotification['type']) => {
    const n: AppNotification = { id: String(Date.now()), message, type, read: false, createdAt: new Date() };
    setNotifications(prev => {
      const next = [n, ...prev];
      persist(next);
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  };

  const markRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persist(next);
      return next;
    });
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
