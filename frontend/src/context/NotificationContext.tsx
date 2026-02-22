import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useSocket, useSocketEvent } from './SocketContext';
import notificationService from '../services/notificationService';

// ────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────

export type RecipientType = 'ADMIN' | 'USER';

export interface Recipient {
  id: string;
  type: RecipientType;
  read: boolean;
  link?: string | null;
}

export interface Notification {
  id: string;
  recipients: Recipient[];
  senderId?: string | null;
  senderType?: 'ADMIN' | 'USER' | null;
  title: string;
  message: string;
  createdAt: string;
  // flat fields exposed by backend per-recipient
  read?: boolean;
  link?: string | null;
}

interface CreateNotificationInput {
  recipients: Recipient[];
  title: string;
  message: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  recipientId: string | null;
  recipientType: RecipientType | null;
  page: number;
  limit: number;
  search: string;
  totalPages: number;
  totalNotifications: number;
  setRecipient: (id: string, type: RecipientType) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (data: CreateNotificationInput) => Promise<Notification | null>;
  clearError: () => void;
  getUnreadNotifications: () => Notification[];
  getReadNotifications: () => Notification[];
  updatePagination: (newPage?: number, newLimit?: number) => void;
  updateSearch: (searchTerm: string) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// ────────────────────────────────────────────────────────
// CREATE CONTEXT
// ────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ────────────────────────────────────────────────────────
// SERVICE WORKER BADGE UTILITIES
// ────────────────────────────────────────────────────────

const updateServiceWorkerBadge = (count: number): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_BADGE',
      count,
    });
    console.log(`📤 [Badge] Updated badge to: ${count}`);
  }
};

const notifyServiceWorkerNotificationRead = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'NOTIFICATION_READ',
    });
    console.log('📤 [Badge] Notified notification read');
  }
};

// ────────────────────────────────────────────────────────
// NOTIFICATION PROVIDER
// ────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isConnected } = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<RecipientType | null>(null);

  // ── Pagination & Search ──
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  // ────────────────────────────────
  // SET RECIPIENT (call after login)
  // ────────────────────────────────

  const setRecipient = useCallback((id: string, type: RecipientType): void => {
    setRecipientId(id);
    setRecipientType(type);
  }, []);

  // ────────────────────────────────
  // PAGINATION CONTROLS
  // ────────────────────────────────

  const updatePagination = useCallback((newPage?: number, newLimit?: number): void => {
    if (newPage !== undefined) setPage(newPage);
    if (newLimit !== undefined) {
      setLimit(newLimit);
      setPage(1);
    }
  }, []);

  const updateSearch = useCallback((searchTerm: string): void => {
    setSearch(searchTerm);
    setPage(1);
  }, []);

  // ────────────────────────────────
  // UNREAD COUNT (computed)
  // ────────────────────────────────

  const unreadCount = useMemo(() => {
    if (!recipientId || !recipientType) return 0;
    return notifications.filter((notif) =>
      // backend exposes flat `read` per recipient OR check inside recipients array
      notif.read === false ||
      notif.recipients?.some(
        (r) => r.id === recipientId && r.type === recipientType && !r.read,
      ),
    ).length;
  }, [notifications, recipientId, recipientType]);

  // ── Sync badge with service worker ──
  useEffect(() => {
    updateServiceWorkerBadge(unreadCount);
  }, [unreadCount]);

  // ────────────────────────────────
  // FETCH NOTIFICATIONS
  // ────────────────────────────────

  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!recipientId || !recipientType) {
      console.warn('Cannot fetch notifications: recipient not set');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, meta }: { data: Notification[]; meta: PaginationMeta } =
        await notificationService.getNotifications({ page, limit, search });

      setNotifications(data);

      if (meta) {
        setTotalPages(meta.totalPages ?? 0);
        setTotalNotifications(meta.total ?? 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, recipientType, page, limit, search]);

  // ────────────────────────────────
  // MARK SINGLE AS READ
  // ────────────────────────────────

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!recipientId || !recipientType) {
      console.warn('Cannot mark as read: recipient not set');
      return;
    }

    try {
      await notificationService.markAsRead(notificationId);

      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) => {
          if (notif.id !== notificationId) return notif;
          return {
            ...notif,
            read: true, // flat field
            recipients: notif.recipients?.map((r) =>
              r.id === recipientId && r.type === recipientType
                ? { ...r, read: true }
                : r,
            ),
          };
        }),
      );

      notifyServiceWorkerNotificationRead();
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  }, [recipientId, recipientType]);

  // ────────────────────────────────
  // MARK ALL AS READ
  // ────────────────────────────────

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!recipientId || !recipientType) {
      console.warn('Cannot mark all as read: recipient not set');
      return;
    }

    try {
      await notificationService.markAllAsRead();

      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read: true,
          recipients: notif.recipients?.map((r) =>
            r.id === recipientId && r.type === recipientType
              ? { ...r, read: true }
              : r,
          ),
        })),
      );

      notifyServiceWorkerNotificationRead();
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, [recipientId, recipientType]);

  // ────────────────────────────────
  // CREATE NOTIFICATION
  // ────────────────────────────────

  const createNotification = useCallback(
    async (data: CreateNotificationInput): Promise<Notification | null> => {
      if (!recipientId || !recipientType) {
        console.warn('Cannot create notification: recipient not set');
        return null;
      }

      try {
        const newNotification = await notificationService.createNotification(data);

        const isRecipient = newNotification.recipients?.some(
          (r: Recipient) => r.id === recipientId && r.type === recipientType,
        );

        if (isRecipient) {
          setNotifications((prev) => [newNotification, ...prev]);
        }

        return newNotification;
      } catch (err: any) {
        console.error('Failed to create notification:', err);
        setError(err.message || 'Failed to create notification');
        return null;
      }
    },
    [recipientId, recipientType],
  );

  // ────────────────────────────────
  // HELPERS
  // ────────────────────────────────

  const clearError = useCallback((): void => setError(null), []);

  const getUnreadNotifications = useCallback((): Notification[] => {
    if (!recipientId || !recipientType) return [];
    return notifications.filter(
      (notif) =>
        notif.read === false ||
        notif.recipients?.some(
          (r) => r.id === recipientId && r.type === recipientType && !r.read,
        ),
    );
  }, [notifications, recipientId, recipientType]);

  const getReadNotifications = useCallback((): Notification[] => {
    if (!recipientId || !recipientType) return [];
    return notifications.filter(
      (notif) =>
        notif.read === true ||
        notif.recipients?.some(
          (r) => r.id === recipientId && r.type === recipientType && r.read,
        ),
    );
  }, [notifications, recipientId, recipientType]);

  // ────────────────────────────────
  // SOCKET EVENT HANDLERS
  // ────────────────────────────────

  useSocketEvent('new-notification', (notification: Notification) => {
    if (!recipientId || !recipientType) return;

    const isRecipient = notification.recipients?.some(
      (r) => r.id === recipientId && r.type === recipientType,
    );

    if (isRecipient) {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) return prev;
        // attach flat read/link for this recipient
        const mySlice = notification.recipients.find(
          (r) => r.id === recipientId && r.type === recipientType,
        );
        return [{ ...notification, read: mySlice?.read ?? false, link: mySlice?.link ?? null }, ...prev];
      });
    }
  });

  useSocketEvent('notification-read', (data: { notificationId: string; recipientId: string }) => {
    if (!recipientId || !recipientType) return;

    if (data.recipientId === recipientId) {
      setNotifications((prev) =>
        prev.map((notif) => {
          if (notif.id !== data.notificationId) return notif;
          return {
            ...notif,
            read: true,
            recipients: notif.recipients?.map((r) =>
              r.id === recipientId && r.type === recipientType ? { ...r, read: true } : r,
            ),
          };
        }),
      );
    }
  });

  // ────────────────────────────────
  // EFFECTS
  // ────────────────────────────────

  useEffect(() => {
    if (recipientId && recipientType && isConnected) {
      fetchNotifications();
    }
  }, [recipientId, recipientType, isConnected, fetchNotifications]);

  // ────────────────────────────────
  // CONTEXT VALUE
  // ────────────────────────────────

  const contextValue: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    error,
    recipientId,
    recipientType,
    page,
    limit,
    search,
    totalPages,
    totalNotifications,
    setRecipient,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    clearError,
    getUnreadNotifications,
    getReadNotifications,
    updatePagination,
    updateSearch,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};