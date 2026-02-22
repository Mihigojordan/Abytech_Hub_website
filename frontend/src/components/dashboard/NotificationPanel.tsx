import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Check, ChevronLeft, ChevronRight, Settings, Smartphone, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import useAdminAuth from '../../context/AdminAuthContext';
import { getClientDescription } from '../../stores/detectDevice';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTimeAgo = (dateString: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
const NotificationSettings: React.FC = () => {
  const {
    isSubscribedToNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    unsubscribeAllDevices,
    getSubscriptions,
  } = useAdminAuth();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deviceLabel, setDeviceLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentEndpoint = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setCurrentEndpoint(sub?.endpoint || null);
    } catch {
      setCurrentEndpoint(null);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchCurrentEndpoint();

    // Pre-fill label with device description
    const client = getClientDescription();
    setDeviceLabel(client?.description || '');
  }, [isSubscribedToNotifications]);

  const handleSubscribe = async () => {
    setActionLoading(true);
    try {
      const result = await subscribeToNotifications(deviceLabel.trim() || undefined);
      showToast('success', result.message);
      setShowLabelInput(false);
      await fetchSubscriptions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to subscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Unsubscribe this device from notifications?')) return;
    setActionLoading(true);
    try {
      const result = await unsubscribeFromNotifications();
      showToast('success', result.message);
      await fetchSubscriptions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to unsubscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!confirm('Unsubscribe ALL devices? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const result = await unsubscribeAllDevices();
      showToast('success', result.message);
      await fetchSubscriptions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to unsubscribe all');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success'
            ? <Check className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current device status */}
      <div className="bg-theme-bg-secondary rounded-xl border border-theme-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-theme-text-primary text-sm">This Device</h3>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isSubscribedToNotifications
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {isSubscribedToNotifications
              ? <><Bell className="w-3 h-3" /> Active</>
              : <><BellOff className="w-3 h-3" /> Inactive</>}
          </span>
        </div>

        <p className="text-xs text-theme-text-secondary mb-4">
          {isSubscribedToNotifications
            ? 'This device will receive push notifications.'
            : 'Enable notifications to receive alerts on this device.'}
        </p>

        {!isSubscribedToNotifications ? (
          showLabelInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                placeholder="Device label (e.g. Work Laptop)"
                className="w-full px-3 py-2 text-sm bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubscribe}
                  disabled={actionLoading}
                  className="flex-1 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Bell className="w-4 h-4" />}
                  Enable
                </button>
                <button
                  onClick={() => setShowLabelInput(false)}
                  className="px-3 py-2 text-sm border border-theme-border rounded-lg text-theme-text-secondary hover:bg-theme-bg-tertiary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLabelInput(true)}
              className="w-full py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </button>
          )
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={actionLoading}
            className="w-full py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <BellOff className="w-4 h-4" />}
            Disable Notifications
          </button>
        )}
      </div>

      {/* Subscribed devices */}
      <div className="bg-theme-bg-secondary rounded-xl border border-theme-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-theme-text-primary text-sm">
            Subscribed Devices ({subscriptions.length})
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchSubscriptions}
              disabled={loading}
              className="p-1.5 hover:bg-theme-bg-tertiary rounded-lg text-theme-text-secondary"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {subscriptions.length > 0 && (
              <button
                onClick={handleUnsubscribeAll}
                disabled={actionLoading}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500"
                title="Unsubscribe all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCw className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Smartphone className="w-10 h-10 text-theme-text-tertiary mb-2" />
            <p className="text-sm text-theme-text-secondary">No devices subscribed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub) => {
              const isCurrent = currentEndpoint === sub.endpoint;
              return (
                <div
                  key={sub.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isCurrent
                      ? 'border-primary-300 bg-primary-500/5'
                      : 'border-theme-border'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-primary-100' : 'bg-theme-bg-tertiary'}`}>
                    <Smartphone className={`w-4 h-4 ${isCurrent ? 'text-primary-600' : 'text-theme-text-secondary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text-primary truncate">
                      {sub.label || 'Unnamed Device'}
                    </p>
                    <p className="text-xs text-theme-text-tertiary">
                      {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      This Device
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl text-xs text-theme-text-secondary">
        <AlertCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
        <p>Each device is managed independently. Unsubscribing one device won't affect others.</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────
export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    getUnreadNotifications,
    page,
    limit,
    totalPages,
    totalNotifications,
    updatePagination,
    updateSearch,
    search,
  } = useNotifications();

  const [tab, setTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (isOpen && tab === 'notifications') fetchNotifications();
  }, [isOpen, page, limit, search, tab]);

  useEffect(() => {
    const timer = setTimeout(() => updateSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    updatePagination(1);
  };

  const displayed = filter === 'unread' ? getUnreadNotifications() : notifications;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99]" onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`fixed top-0 bg-white right-0 h-full w-full md:w-96  shadow-2xl z-[100] flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-theme-text-primary" />
            <h2 className="text-lg font-semibold text-theme-text-primary">Notifications</h2>
            {unreadCount > 0 && tab === 'notifications' && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Settings toggle */}
            <button
              onClick={() => setTab((t) => t === 'settings' ? 'notifications' : 'settings')}
              className={`p-2 rounded-lg ${tab === 'settings' ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-theme-bg-secondary text-theme-text-secondary'}`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-theme-bg-secondary rounded-lg">
              <X className="w-5 h-5 text-theme-text-secondary" />
            </button>
          </div>
        </div>

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && <NotificationSettings />}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'notifications' && (
          <>
            {/* Search */}
            <div className="p-4 border-b border-theme-border flex-shrink-0">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search notifications..."
                className="w-full px-3 py-2 text-sm bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-theme-border flex-shrink-0">
              <button
                onClick={() => handleFilterChange('all')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                All
                {totalNotifications > 0 && (
                  <span className="ml-1 text-xs opacity-75">({totalNotifications})</span>
                )}
              </button>
              <button
                onClick={() => handleFilterChange('unread')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${
                  filter === 'unread'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <div className="px-4 py-3 border-b border-theme-border flex-shrink-0">
                <button
                  onClick={markAllAsRead}
                  className="w-full py-2 px-3 text-sm bg-theme-bg-secondary hover:bg-theme-bg-tertiary text-theme-text-primary rounded-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </div>
              ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-theme-text-tertiary mb-3" />
                  <p className="text-theme-text-secondary font-medium">No notifications</p>
                  <p className="text-theme-text-tertiary text-sm mt-1">
                    {search ? 'No results for your search.' : "You're all caught up!"}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {displayed.map((notification) => {
                    const isUnread = notification.read === false;
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border ${
                          isUnread
                            ? 'bg-primary-500/5 border-primary-500/20'
                            : 'bg-theme-bg-secondary border-theme-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isUnread && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <h3 className="font-semibold text-theme-text-primary mb-1 truncate">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-theme-text-secondary line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="text-xs text-primary-500 hover:underline mt-1 inline-block"
                                onClick={onClose}
                              >
                                View details →
                              </a>
                            )}
                            <p className="text-xs text-theme-text-tertiary mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 hover:bg-theme-bg-tertiary rounded-lg flex-shrink-0"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-theme-text-secondary" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 border-t border-theme-border px-4 py-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => updatePagination(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="p-2 rounded-lg bg-theme-bg-secondary hover:bg-theme-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-theme-text-primary" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-theme-text-tertiary text-sm">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => updatePagination(item as number)}
                          disabled={isLoading}
                          className={`w-8 h-8 rounded-lg text-sm font-medium ${
                            page === item
                              ? 'bg-primary-500 text-white'
                              : 'bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-bg-tertiary'
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                </div>

                <button
                  onClick={() => updatePagination(page + 1)}
                  disabled={page === totalPages || isLoading}
                  className="p-2 rounded-lg bg-theme-bg-secondary hover:bg-theme-bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-theme-text-primary" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};