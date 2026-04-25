import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Check, ChevronLeft, ChevronRight, Settings, Smartphone, RefreshCw, Trash2, AlertCircle, Plus, Search, Trash, Zap } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import useAdminAuth from '../../context/AdminAuthContext';
import { getClientDescription } from '../../stores/detectDevice';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTimeAgo = (dateString: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'JUST NOW';
  if (diff < 60) return `${diff}M AGO`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).toUpperCase();

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

  const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
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
      setSubscriptions(subs || []);
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
    <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }} className="custom-scrollbar">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 12, 
              background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', ...ba(13, 600),
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10
            }}
          >
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{toast.message.toUpperCase()}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current device status */}
      <div style={{ background: bg2, borderRadius: 24, border: `1px solid ${border}`, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ ...bc(12, 800, { color: textC, margin: 0, letterSpacing: '0.05em' }) }}>THIS DEVICE PROTOCOL</h3>
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 10, ...bc(10, 800),
            background: isSubscribedToNotifications ? 'rgba(16,185,129,0.1)' : bg3,
            color: isSubscribedToNotifications ? '#10b981' : text3,
            border: `1px solid ${isSubscribedToNotifications ? 'rgba(16,185,129,0.2)' : border}`
          }}>
            {isSubscribedToNotifications ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <p style={{ ...ba(14, 500, { color: text2, margin: '0 0 32px', lineHeight: 1.6 }) }}>
          {isSubscribedToNotifications
            ? 'This session is configured for real-time edge notifications via WebPush.'
            : 'Initialize edge notifications to receive mission-critical updates across your registered hardware.'}
        </p>

        {!isSubscribedToNotifications ? (
          showLabelInput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={deviceLabel}
                  onChange={(e) => setDeviceLabel(e.target.value)}
                  placeholder="DEVICE IDENTIFIER (e.g. STUDIO MACBOOK)"
                  style={{ 
                    width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, 
                    borderRadius: 16, color: textC, ...ba(14, 700), outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ background: ORG }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubscribe} disabled={actionLoading}
                  style={{ 
                    flex: 1, padding: '16px', background: ORG, color: '#fff', borderRadius: 12, border: 'none', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    ...bc(12, 800), opacity: actionLoading ? 0.5 : 1, boxShadow: `0 8px 20px ${ORG}30`
                  }}
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                  INITIALIZE
                </motion.button>
                <button
                  onClick={() => setShowLabelInput(false)}
                  style={{ 
                    padding: '0 24px', background: 'none', border: `1px solid ${border}`, color: text2, 
                    borderRadius: 12, cursor: 'pointer', ...bc(11, 800)
                  }}
                >
                  DISCARD
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ background: ORG }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowLabelInput(true)}
              style={{ 
                width: '100%', padding: '16px', background: ORG, color: '#fff', borderRadius: 12, border: 'none', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                ...bc(12, 800), boxShadow: `0 8px 20px ${ORG}30`
              }}
            >
              <Bell size={18} /> ENABLE NOTIFICATIONS
            </motion.button>
          )
        ) : (
          <motion.button
            whileHover={{ background: '#dc2626' }} whileTap={{ scale: 0.98 }}
            onClick={handleUnsubscribe} disabled={actionLoading}
            style={{ 
              width: '100%', padding: '16px', background: '#ef4444', color: '#fff', borderRadius: 12, border: 'none', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              ...bc(12, 800), opacity: actionLoading ? 0.5 : 1, boxShadow: '0 8px 20px rgba(239,68,68,0.3)'
            }}
          >
            {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <BellOff size={18} />}
            DEACTIVATE DEVICE
          </motion.button>
        )}
      </div>

      {/* Subscribed devices */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ ...bc(12, 800, { color: textC, margin: 0, letterSpacing: '0.05em' }) }}>
            HARDWARE ARCHIVE ({subscriptions.length})
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchSubscriptions} disabled={loading}
              style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4 }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {subscriptions.length > 0 && (
              <button
                onClick={handleUnsubscribeAll} disabled={actionLoading}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: ORG }} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, textAlign: 'center', background: bg2, borderRadius: 24, border: `1px dashed ${border}` }}>
            <Smartphone size={32} style={{ color: text3, opacity: 0.3, marginBottom: 16 }} />
            <p style={{ ...ba(13, 500, { color: text3, margin: 0 }) }}>NO EXTERNAL DEVICES REGISTERED</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subscriptions.map((sub) => {
              const isCurrent = currentEndpoint === sub.endpoint;
              return (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 16,
                    background: isCurrent ? `${ORG}05` : bg2, border: `1px solid ${isCurrent ? ORG : border}`
                  }}
                >
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 10, background: isCurrent ? `${ORG}10` : bg3,
                    color: isCurrent ? ORG : text3, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Smartphone size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }} className="truncate">
                      {sub.label || 'LEGACY DEVICE'}
                    </p>
                    <p style={{ ...ba(11, 500, { color: text3, margin: 0 }) }}>
                      LOGGED: {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: 9, fontWeight: 900, background: ORG, color: '#fff', padding: '3px 8px', borderRadius: 6, flexShrink: 0, letterSpacing: '0.05em' }}>
                      CURRENT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Block */}
      <div style={{ display: 'flex', gap: 12, padding: 20, background: `${ORG}05`, borderRadius: 16, border: `1px solid ${ORG}15` }}>
        <AlertCircle size={18} style={{ color: ORG, flexShrink: 0 }} />
        <p style={{ ...ba(12, 500, { color: text2, margin: 0, lineHeight: 1.5 }) }}>
          Standard data rates apply for real-time edge notifications via the Abytech Hub network.
        </p>
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
    totalPages,
    totalNotifications,
    updatePagination,
    updateSearch,
    search,
  } = useNotifications();

  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const [tab, setTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (isOpen && tab === 'notifications') fetchNotifications();
  }, [isOpen, page, search, tab]);

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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(8px)' }} 
            onClick={onClose} 
          />
        )}
      </AnimatePresence>

      <div style={{ 
        position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: 460, 
        background: bg, boxShadow: '-20px 0 60px rgba(0,0,0,0.2)', zIndex: 100, 
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header Area */}
        <div style={{ padding: '32px 32px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ ...bc(24, 800, { color: textC, margin: 0 }) }}>INTELLIGENCE</h2>
            {tab === 'notifications' && (
              <p style={{ ...bc(10, 800, { color: ORG, margin: 0, letterSpacing: '0.05em', marginTop: 4 }) }}>
                {unreadCount} UNRESOLVED UPDATES
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setTab(t => t === 'settings' ? 'notifications' : 'settings')}
              style={{ 
                width: 44, height: 44, borderRadius: 12, background: tab === 'settings' ? `${ORG}10` : bg2, 
                border: 'none', color: tab === 'settings' ? ORG : text3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Settings size={20} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              style={{ width: 44, height: 44, borderRadius: 12, background: bg2, border: 'none', color: text3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {tab === 'settings' ? (
          <NotificationSettings />
        ) : (
          <>
            {/* Search & Filter Protocol */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, borderBottom: `1px solid ${border}` }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: text3 }} />
                <input
                  type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="SEARCH ARCHIVE..."
                  style={{ 
                    width: '100%', padding: '12px 16px 12px 44px', background: bg2, border: `1px solid ${border}`, 
                    borderRadius: 12, color: textC, ...bc(11, 700), outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, background: bg2, padding: 4, borderRadius: 12 }}>
                {[
                  { id: 'all', label: `ALL (${totalNotifications})` },
                  { id: 'unread', label: `UNREAD (${unreadCount})` }
                ].map(opt => (
                  <button
                    key={opt.id} onClick={() => handleFilterChange(opt.id as any)}
                    style={{ 
                      flex: 1, padding: '8px 12px', borderRadius: 10, ...bc(10, 800), border: 'none',
                      background: filter === opt.id ? ORG : 'transparent', color: filter === opt.id ? '#fff' : text3,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Scroller */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="custom-scrollbar">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ background: `${ORG}10` }} onClick={markAllAsRead}
                  style={{ 
                    width: '100%', padding: '14px', background: bg2, border: `1px solid ${ORG}30`, 
                    borderRadius: 16, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    gap: 10, cursor: 'pointer', marginBottom: 24, ...bc(11, 800)
                  }}
                >
                  <Check size={16} /> RESOLVE ALL MESSAGES
                </motion.button>
              )}

              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                  <RefreshCw size={32} className="animate-spin" style={{ color: ORG }} />
                </div>
              ) : displayed.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center' }}>
                  <BellOff size={48} style={{ color: text3, opacity: 0.2, marginBottom: 24 }} />
                  <h3 style={{ ...bc(14, 800, { color: text2, margin: 0 }) }}>SESSION CLEAR</h3>
                  <p style={{ ...ba(13, 500, { color: text3, margin: '8px 0 0' }) }}>
                    {search ? 'NO MATCHES FOUND IN SEARCH BUFFER' : 'NO NEW UPDATES LOGGED IN THIS CYCLE'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {displayed.map((notification) => {
                    const isUnread = notification.read === false;
                    return (
                      <motion.div
                        key={notification.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: 24, borderRadius: 20, background: isUnread ? `${ORG}05` : bg2,
                          border: `1px solid ${isUnread ? ORG : border}`, position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <h3 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>{notification.title?.toUpperCase()}</h3>
                              {isUnread && <div style={{ width: 6, height: 6, background: ORG, borderRadius: '50%' }} />}
                            </div>
                            <p style={{ ...ba(14, 500, { color: text2, margin: '0 0 16px', lineHeight: 1.6 }) }}>{notification.message}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ ...bc(10, 700, { color: text3 }) }}>{formatTimeAgo(notification.createdAt)}</span>
                              {notification.link && (
                                <a href={notification.link} style={{ ...bc(10, 800, { color: ORG, textDecoration: 'none' }) }} onClick={onClose}>
                                  ACCESS DATA →
                                </a>
                              )}
                            </div>
                          </div>
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4 }}
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ padding: '24px 32px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => updatePagination(page - 1)} disabled={page === 1 || isLoading}
                  style={{ background: 'none', border: `1px solid ${border}`, color: text3, cursor: 'pointer', borderRadius: 8, padding: 8, opacity: page === 1 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div style={{ ...bc(11, 800, { color: text2 }) }}>SESSION {page} / {totalPages}</div>
                <button
                  onClick={() => updatePagination(page + 1)} disabled={page === totalPages || isLoading}
                  style={{ background: 'none', border: `1px solid ${border}`, color: text3, cursor: 'pointer', borderRadius: 8, padding: 8, opacity: page === totalPages ? 0.3 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};