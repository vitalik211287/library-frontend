import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch, hasToken } from "../../../shared/api/apiClient.js";
import { useAuth } from "../../auth/context/AuthContext.jsx";

const NotificationsContext = createContext(null);

const NotificationsProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isNotificationsLoading, setIsNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] = useState("");

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !hasToken()) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const data = await apiFetch("/api/notifications/unread-count");

      const count = Number(data?.count) || 0;

      setUnreadCount(count);

      return count;
    } catch (error) {
      console.error("Load unread notifications count error:", error);

      return null;
    }
  }, [isAuthenticated]);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !hasToken()) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError("");
      return [];
    }

    try {
      setIsNotificationsLoading(true);
      setNotificationsError("");

      const data = await apiFetch("/api/notifications");

      const loaded = Array.isArray(data?.notifications)
        ? data.notifications
        : [];

      setNotifications(loaded);

      const unread = loaded.filter(
        (notification) => !notification.isRead,
      ).length;

      setUnreadCount(unread);

      return loaded;
    } catch (error) {
      console.error("Load notifications error:", error);

      setNotifications([]);
      setNotificationsError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити сповіщення",
      );

      return [];
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await apiFetch(
          `/api/notifications/${notificationId}/read`,
          {
            method: "PATCH",
          },
        );

        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        console.error("Mark notification as read error:", error);
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError("");
      return;
    }

    refreshUnreadCount();
  }, [
    isAuthenticated,
    isAuthLoading,
    refreshUnreadCount,
  ]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,

      isNotificationsLoading,
      notificationsError,

      refreshNotifications,
      refreshUnreadCount,

      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      isNotificationsLoading,
      notificationsError,
      refreshNotifications,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  }

  return context;
};

export {
  NotificationsProvider,
  useNotifications,
};
