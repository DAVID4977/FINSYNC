import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import Notification from "@/components/ui/notification";

interface NotificationData {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface NotificationContextType {
  showNotification: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: NotificationData = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
