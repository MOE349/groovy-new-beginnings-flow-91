import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? defaultDuration,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return updated.slice(0, maxNotifications);
      });

      // Auto-remove after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    [defaultDuration, maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { removeNotification } = useNotifications();

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all',
        colors[notification.type],
        'animate-in slide-in-from-right duration-300'
      )}
    >
      <div className="flex-shrink-0">{icons[notification.type]}</div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-sm">{notification.title}</p>
        {notification.message && (
          <p className="text-sm opacity-90">{notification.message}</p>
        )}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="text-xs font-medium underline hover:no-underline"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Convenience hooks for different notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: 'success', title, message });
    },
    [addNotification]
  );
};

export const useErrorNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: 'error', title, message });
    },
    [addNotification]
  );
};

export const useWarningNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: 'warning', title, message });
    },
    [addNotification]
  );
};

export const useInfoNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      addNotification({ ...options, type: 'info', title, message });
    },
    [addNotification]
  );
};