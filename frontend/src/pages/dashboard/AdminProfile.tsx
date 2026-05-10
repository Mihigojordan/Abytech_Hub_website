import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Bell, Shield, ChevronRight, Smartphone, RefreshCw, Download, CheckCircle, AlertCircle, Wifi, WifiOff, MonitorSmartphone, Bell as BellIcon, Laptop, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettings from '../../components/dashboard/profile/admin/NotificationsSettings';
import SecuritySettings from '../../components/dashboard/profile/admin/SecuritySettings';
import ProfileSettings from '../../components/dashboard/profile/admin/ProfileSettings';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { usePWA } from '../../context/PWAContext';

function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handle = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handle);
        return () => window.removeEventListener('resize', handle);
    }, []);
    return width;
}

/* ── PWA Panel ──────────────────────────────────────────── */
function PWAPanel() {
    const { bg2, bg3, textC, text2, border, isDark } = useDashboardTheme();
    const {
        appVersion, isInstalled, isInstallable, updateAvailable,
        swStatus, notifPermission, platform, browser, displayMode,
        features, install, update, checkForUpdate, requestNotifPermission,
    } = usePWA();

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [checkMsg, setCheckMsg] = useState<string | null>(null);
    const [requestingNotif, setRequestingNotif] = useState(false);

    useEffect(() => {
        const onOnline  = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    const handleCheckForUpdate = useCallback(async () => {
        setChecking(true);
        setCheckMsg(null);
        try {
            await checkForUpdate();
            setTimeout(() => {
                setChecking(false);
                if (!updateAvailable) setCheckMsg('You are on the latest version.');
            }, 1500);
        } catch {
            setChecking(false);
            setCheckMsg('Could not check for updates.');
        }
    }, [checkForUpdate, updateAvailable]);

    const handleInstall = useCallback(async () => {
        setInstalling(true);
        await install();
        setInstalling(false);
    }, [install]);

    const handleRequestNotif = useCallback(async () => {
        setRequestingNotif(true);
        await requestNotifPermission();
        setRequestingNotif(false);
    }, [requestNotifPermission]);

    // ── Helpers ──
    const card = (children: React.ReactNode) => (
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20, marginBottom: 16 }}>
            {children}
        </div>
    );

    const row = (icon: React.ReactNode, label: string, value: React.ReactNode, last = false) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon}
                <span style={{ ...bc(13, 500, { color: text2 }) }}>{label}</span>
            </div>
            {value}
        </div>
    );

    const badge = (color: string, label: string) => (
        <span style={{ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 10px', ...bc(11, 600) }}>
            {label}
        </span>
    );

    const chip = (ok: boolean, label: string) => (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 4,
            background: ok ? 'rgba(34,197,94,.1)' : isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
            border: `1px solid ${ok ? '#22c55e40' : border}`,
            ...bc(11, 600, { color: ok ? '#22c55e' : text2 }),
        }}>
            {ok ? '✓' : '✗'} {label}
        </span>
    );

    // SW status dot
    const swDotColor = swStatus === 'active' ? '#22c55e' : swStatus === 'installing' || swStatus === 'waiting' ? '#f59e0b' : swStatus === 'error' ? '#ef4444' : text2;
    const swLabel    = swStatus === 'active' ? 'Active' : swStatus === 'installing' ? 'Installing…' : swStatus === 'waiting' ? 'Update Waiting' : swStatus === 'error' ? 'Error' : swStatus === 'unsupported' ? 'Unsupported' : 'Checking…';

    return (
        <div>
            {/* ── Update banner ── */}
            {updateAvailable && (
                <div style={{ background: 'rgba(232,98,26,.08)', border: `1px solid ${ORG}50`, borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle style={{ width: 16, height: 16, color: ORG, flexShrink: 0 }} />
                        <span style={{ ...bc(13, 600, { color: ORG }) }}>A new version of Abytech Hub is ready</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={update}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', flexShrink: 0, ...bc(12, 600) }}>
                        <RefreshCw style={{ width: 13, height: 13 }} /> Update & Reload
                    </motion.button>
                </div>
            )}

            {/* ── App Status card ── */}
            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 4, background: 'linear-gradient(135deg, rgba(232,98,26,.2), rgba(26,92,120,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Smartphone style={{ width: 22, height: 22, color: ORG }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h2 style={{ ...bc(17, 700, { color: textC, margin: 0 }) }}>PWA App Manager</h2>
                            <span style={{ background: 'rgba(26,92,120,.1)', color: TEAL, border: `1px solid ${TEAL}30`, borderRadius: 4, padding: '2px 8px', ...bc(10, 700) }}>
                                v{appVersion}
                            </span>
                        </div>
                        <p style={{ ...ba(12, 400, { color: text2, margin: 0, marginTop: 2 }) }}>Install, update, and manage the Abytech Hub app</p>
                    </div>
                </div>

                <div style={{ padding: '4px 20px 8px' }}>
                    {row(
                        <MonitorSmartphone style={{ width: 15, height: 15, color: text2 }} />,
                        'Install mode',
                        badge(isInstalled ? '#22c55e' : text2, isInstalled ? 'Installed as App' : 'Running in Browser')
                    )}
                    {row(
                        isOnline
                            ? <Wifi style={{ width: 15, height: 15, color: '#22c55e' }} />
                            : <WifiOff style={{ width: 15, height: 15, color: '#ef4444' }} />,
                        'Network',
                        badge(isOnline ? '#22c55e' : '#ef4444', isOnline ? 'Online' : 'Offline')
                    )}
                    {row(
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: swDotColor, flexShrink: 0, boxShadow: swStatus === 'active' ? `0 0 0 3px ${swDotColor}30` : 'none' }} />,
                        'Service Worker',
                        badge(swDotColor, swLabel)
                    )}
                    {row(
                        <Globe style={{ width: 15, height: 15, color: text2 }} />,
                        'Display Mode',
                        badge(displayMode === 'Standalone' ? ORG : text2, displayMode),
                        true
                    )}
                </div>

                <div style={{ padding: '12px 20px 16px', borderTop: `1px solid ${border}` }}>
                    {checkMsg && !updateAvailable && (
                        <div style={{ background: 'rgba(34,197,94,.08)', border: `1px solid #22c55e40`, borderRadius: 4, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle style={{ width: 14, height: 14, color: '#22c55e' }} />
                            <span style={{ ...bc(12, 500, { color: '#22c55e' }) }}>{checkMsg}</span>
                        </div>
                    )}
                    {!updateAvailable && (
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                            onClick={handleCheckForUpdate}
                            disabled={checking || !isOnline}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', color: textC, border: `1px solid ${border}`, borderRadius: 4, cursor: checking ? 'default' : 'pointer', opacity: !isOnline ? 0.5 : 1, ...bc(12, 600) }}
                        >
                            <RefreshCw style={{ width: 13, height: 13, animation: checking ? 'spin 1s linear infinite' : 'none' }} />
                            {checking ? 'Checking…' : 'Check for Updates'}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* ── Install card ── */}
            {!isInstalled && card(
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <Download style={{ width: 18, height: 18, color: TEAL }} />
                        <span style={{ ...bc(15, 700, { color: textC }) }}>Install as App</span>
                    </div>
                    <p style={{ ...ba(13, 400, { color: text2, marginBottom: 14 }) }}>
                        Get a dedicated app experience — no browser chrome, works directly from your home screen or taskbar.
                    </p>
                    {isInstallable ? (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={handleInstall}
                            disabled={installing}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: TEAL, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', ...bc(13, 600) }}
                        >
                            <Download style={{ width: 14, height: 14 }} />
                            {installing ? 'Installing…' : 'Install App'}
                        </motion.button>
                    ) : (
                        <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)', border: `1px solid ${border}`, borderRadius: 4, padding: '12px 16px' }}>
                            <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>
                                <strong style={{ color: textC }}>iOS Safari:</strong> tap Share → Add to Home Screen<br />
                                <strong style={{ color: textC }}>Android / Desktop:</strong> look for the install icon in the address bar
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* ── Installed confirmation ── */}
            {isInstalled && card(
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(34,197,94,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle style={{ width: 18, height: 18, color: '#22c55e' }} />
                    </div>
                    <div>
                        <div style={{ ...bc(14, 600, { color: textC }) }}>App installed</div>
                        <div style={{ ...ba(12, 400, { color: text2 }) }}>Abytech Hub is running as an installed PWA on this device.</div>
                    </div>
                </div>
            )}

            {/* ── Notifications card ── */}
            {card(
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BellIcon style={{ width: 18, height: 18, color: ORG }} />
                            <span style={{ ...bc(15, 700, { color: textC }) }}>Push Notifications</span>
                        </div>
                        {badge(
                            notifPermission === 'granted' ? '#22c55e' : notifPermission === 'denied' ? '#ef4444' : text2,
                            notifPermission === 'granted' ? 'Enabled' : notifPermission === 'denied' ? 'Blocked' : notifPermission === 'unsupported' ? 'Unsupported' : 'Not set'
                        )}
                    </div>
                    {notifPermission === 'default' && (
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                            onClick={handleRequestNotif}
                            disabled={requestingNotif}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', ...bc(13, 600) }}
                        >
                            <BellIcon style={{ width: 13, height: 13 }} />
                            {requestingNotif ? 'Requesting…' : 'Enable Notifications'}
                        </motion.button>
                    )}
                    {notifPermission === 'denied' && (
                        <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>
                            Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications for this site.
                        </p>
                    )}
                    {notifPermission === 'granted' && (
                        <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Push notifications are active. You will receive alerts even when the app is in the background.</p>
                    )}
                </>
            )}

            {/* ── Device & Browser card ── */}
            {card(
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Laptop style={{ width: 18, height: 18, color: TEAL }} />
                        <span style={{ ...bc(15, 700, { color: textC }) }}>Device & Browser</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', marginBottom: 16 }}>
                        {[
                            ['Platform',     platform],
                            ['Browser',      browser],
                            ['Display Mode', displayMode],
                            ['Version',      `v${appVersion}`],
                        ].map(([label, value]) => (
                            <div key={label} style={{ padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                                <div style={{ ...ba(11, 400, { color: text2 }) }}>{label}</div>
                                <div style={{ ...bc(13, 600, { color: textC }) }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ ...ba(11, 600, { color: text2, marginBottom: 8 }) }}>Feature Support</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {chip(features.pushNotifications, 'Push')}
                        {chip(features.badgeAPI,          'Badge API')}
                        {chip(features.backgroundSync,    'Background Sync')}
                        {chip(features.shareAPI,          'Share API')}
                        {chip(features.periodicSync,      'Periodic Sync')}
                    </div>
                </>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────── */
const AdminProfilePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { bg, bg2, bg3, textC, text2, border, isDark } = useDashboardTheme();
    const width = useWindowWidth();
    const isMobile = width < 768;

    const validTabs = ['profile', 'notifications', 'security', 'pwa'] as const;
    const initialTab = validTabs.includes(searchParams.get('tab') as any)
        ? (searchParams.get('tab') as typeof validTabs[number])
        : 'profile';
    const [activeTab, setActiveTab] = useState<typeof validTabs[number]>(initialTab);

    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    const getCurrentAdminId = () => {
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                return parsed.id || parsed._id;
            } catch (e) {
                console.error('Error parsing admin data:', e);
            }
        }
        return null;
    };

    const adminId = getCurrentAdminId();

    const menuItems = [
        { id: 'profile',       label: 'Profile',       icon: User,       desc: 'View and manage your public profile' },
        { id: 'notifications', label: 'Notifications', icon: Bell,       desc: 'Manage push and email alerts' },
        { id: 'security',      label: 'Security',      icon: Shield,     desc: 'Passwords, 2FA, and active sessions' },
        { id: 'pwa',           label: 'PWA App',       icon: Smartphone, desc: 'Install & update the app' },
    ];

    const tabContent = (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'profile' && <ProfileSettings />}

                {activeTab === 'notifications' && (
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bell style={{ width: 20, height: 20, color: ORG }} />
                            </div>
                            <div>
                                <h2 style={{ ...bc(18, 700, { color: textC, margin: 0, letterSpacing: 0.5 }) }}>Notification Settings</h2>
                                <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Configure how you receive alerts and updates</p>
                            </div>
                        </div>
                        <NotificationSettings />
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(26,92,120,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield style={{ width: 20, height: 20, color: TEAL }} />
                            </div>
                            <div>
                                <h2 style={{ ...bc(18, 700, { color: textC, margin: 0, letterSpacing: 0.5 }) }}>Security & Access</h2>
                                <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Protect your account with advanced security features</p>
                            </div>
                        </div>
                        <SecuritySettings />
                    </div>
                )}

{activeTab === 'pwa' && <PWAPanel />}
            </motion.div>
        </AnimatePresence>
    );

    /* ── Mobile layout ── */
    if (isMobile) {
        return (
            <div style={{ background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Mobile header */}
                <div style={{ background: bg2, borderBottom: `1px solid ${border}`, padding: '16px 16px 0' }}>
                    <div style={{ marginBottom: 12 }}>
                        <h2 style={{ ...bb(22, { color: ORG, margin: 0 }) }}>Account</h2>
                        <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }}>Manage your settings & profile</p>
                    </div>
                    {/* Horizontal scrollable tabs */}
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0, scrollbarWidth: 'none' }}>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '8px 14px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    borderBottom: activeTab === item.id ? `2px solid ${ORG}` : '2px solid transparent',
                                    transition: 'border-color 0.2s',
                                    flexShrink: 0,
                                }}
                            >
                                <item.icon style={{ width: 18, height: 18, color: activeTab === item.id ? ORG : text2 }} />
                                <span style={{ ...bc(11, 600, { color: activeTab === item.id ? ORG : text2 }) }}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
                    {tabContent}
                </div>
            </div>
        );
    }

    /* ── Desktop layout ── */
    return (
        <div style={{ background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{
                    width: 260,
                    background: bg2,
                    borderRight: `1px solid ${border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    flexShrink: 0,
                }}>
                    <div style={{ marginBottom: 32, paddingLeft: 8 }}>
                        <h2 style={{ ...bb(24, { color: ORG, margin: 0 }) }}>Account</h2>
                        <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Manage your settings & profile</p>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {menuItems.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(item.id as any)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    borderRadius: 4,
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    background: activeTab === item.id ? (isDark ? 'rgba(232,98,26,.1)' : 'rgba(232,98,26,.05)') : 'transparent',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: ORG, borderRadius: '0 4px 4px 0' }}
                                    />
                                )}
                                <item.icon style={{ width: 18, height: 18, color: activeTab === item.id ? ORG : text2 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ ...bc(13, 600, { color: activeTab === item.id ? ORG : textC, letterSpacing: 0.5 }) }}>{item.label}</div>
                                </div>
                                {activeTab === item.id && <ChevronRight style={{ width: 14, height: 14, color: ORG }} />}
                            </motion.button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div style={{  margin: '0 auto' }}>
                        {tabContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
