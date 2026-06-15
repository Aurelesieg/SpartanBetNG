import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AppNotification, NotificationPrefs } from '../../types';

interface NotificationsContextType {
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  unreadCount: number;
  addSystemNotification: (
    title: string,
    message: string,
    type?: 'bet_outcome' | 'bankroll_alert' | 'system',
    betId?: string,
    outcome?: 'won' | 'lost'
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  requestDesktopNotifications: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const L_NOTIFS = 'spartanbet_notifications';
const L_NOTIFS_PREFS = 'spartanbet_notification_prefs';

export const NotificationsProvider: React.FC<{ children: ReactNode; onToast: (msg: string, type?: 'success'|'error'|'info') => void; language: string }> = ({ children, onToast, language }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(L_NOTIFS);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => {
    const saved = localStorage.getItem(L_NOTIFS_PREFS);
    if (saved) return JSON.parse(saved);
    return {
      betOutcomes: true,
      bankrollThreshold: true,
      bankrollThresholdValue: 50,
      browserPush: false
    };
  });

  useEffect(() => {
    localStorage.setItem(L_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(L_NOTIFS_PREFS, JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const addSystemNotification = (
    title: string,
    message: string,
    type: 'bet_outcome' | 'bankroll_alert' | 'system' = 'system',
    betId?: string,
    outcome?: 'won' | 'lost'
  ) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      isRead: false,
      betId,
      outcome
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (notificationPrefs.browserPush && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          tag: 'spartanbet_push'
        });
      } catch (e) {
        console.error('Desktop notification trigger failed', e);
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    onToast(language === 'fr' ? 'Toutes les notifications lues' : 'All notifications read', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    onToast(language === 'fr' ? 'Notifications effacées' : 'Notifications cleared', 'info');
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPrefs>) => {
    setNotificationPrefs(prev => ({ ...prev, ...prefs }));
  };

  const requestDesktopNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      onToast(
        language === 'fr'
          ? "Votre navigateur actuel ne supporte pas les notifications système."
          : "Your browser does not support standard web notification interfaces.",
        'error'
      );
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onToast(
          language === 'fr' ? "Notifications système autorisées !" : "System desktop notifications allowed!",
          'success'
        );
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      notificationPrefs,
      unreadCount,
      addSystemNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,
      updateNotificationPrefs,
      requestDesktopNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationsProvider');
  return context;
};
