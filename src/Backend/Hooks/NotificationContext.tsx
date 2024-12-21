import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Notification from '../../Components/Notification';

interface NotificationData {
  id: string;
  message: string;
  type: 'loading' | 'success' | 'error';
}

interface NotificationContextType {
  addNotification: (
    message: string,
    type: 'loading' | 'success' | 'error',
    duration?: number
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (
      message: string,
      type: 'loading' | 'success' | 'error',
      duration: number = 3000
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Remove the notification after the specified duration
      setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }, duration);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* Render Notifications */}
      <div className="fixed bottom-0 right-0 flex flex-col items-end p-4 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification key={notification.id} {...notification} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};
