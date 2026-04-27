import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Bell, Shield, ChevronRight, Smartphone, RefreshCw, Download, CheckCircle, AlertCircle, Wifi, WifiOff, MonitorSmartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettings from '../../components/dashboard/profile/admin/NotificationsSettings';
import SecuritySettings from '../../components/dashboard/profile/admin/SecuritySettings';
import ProfileSettings from '../../components/dashboard/profile/admin/ProfileSettings';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

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
    const { bg, bg2, bg3, textC, text2, border, isDark } = useDashboardTheme();
    const [isInstalled, setIsInstalled] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
    const [checkMsg, setCheckMsg] = useState<string | null>(null);

    useEffect(() => {
        // Detect install state
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
        setIsInstalled(isPWA);

        // Detect installability
        const onInstallable = () => setCanInstall(true);
        const onInstalled = () => { setCanInstall(false); setIsInstalled(true); };
        window.addEventListener('pwa-installable', onInstallable);
        window.addEventListener('pwa-installed', onInstalled);

        // Check if deferred prompt already available
        if ((window as any).installPWA && !isPWA) setCanInstall(true);

        // Network
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        // Service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                setSwReg(reg);
                reg.addEventListener('updatefound', () => {
                    const newSW = reg.installing;
                    if (!newSW) return;
                    newSW.addEventListener('statechange', () => {
                        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                            setUpdateAvailable(true);
                        }
                    });
                });
            });

            const onMessage = (e: MessageEvent) => {
                if (e.data?.type === 'UPDATE_AVAILABLE') setUpdateAvailable(true);
            };
            navigator.serviceWorker.addEventListener('message', onMessage);
            return () => {
                navigator.serviceWorker.removeEventListener('message', onMessage);
            };
        }

        return () => {
            window.removeEventListener('pwa-installable', onInstallable);
            window.removeEventListener('pwa-installed', onInstalled);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    const checkForUpdate = useCallback(async () => {
        setChecking(true);
        setCheckMsg(null);
        try {
            if (swReg) {
                await swReg.update();
                setTimeout(() => {
                    setChecking(false);
                    if (!updateAvailable) setCheckMsg('You are on the latest version.');
                }, 1500);
            } else {
                setChecking(false);
                setCheckMsg('Service worker not available.');
            }
        } catch {
            setChecking(false);
            setCheckMsg('Could not check for updates.');
        }
    }, [swReg, updateAvailable]);

    const applyUpdate = useCallback(() => {
        if (swReg?.waiting) {
            swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    }, [swReg]);

    const installApp = useCallback(async () => {
        setInstalling(true);
        const ok = await (window as any).installPWA?.();
        setInstalling(false);
        if (ok) setIsInstalled(true);
    }, []);

    const card = (children: React.ReactNode) => (
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20, marginBottom: 16 }}>
            {children}
        </div>
    );

    const row = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
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

    return (
        <div>
            {/* Header */}
            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone style={{ width: 20, height: 20, color: ORG }} />
                    </div>
                    <div>
                        <h2 style={{ ...bc(18, 700, { color: textC, margin: 0, letterSpacing: 0.5 }) }}>PWA App Manager</h2>
                        <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Install, update, and manage the Abytech Hub app</p>
                    </div>
                </div>

                <div style={{ padding: 20 }}>
                    {row(
                        <MonitorSmartphone style={{ width: 16, height: 16, color: text2 }} />,
                        'Install mode',
                        badge(isInstalled ? ORG : text2, isInstalled ? 'Installed as App' : 'Running in Browser')
                    )}
                    {row(
                        isOnline
                            ? <Wifi style={{ width: 16, height: 16, color: '#22c55e' }} />
                            : <WifiOff style={{ width: 16, height: 16, color: '#ef4444' }} />,
                        'Network',
                        badge(isOnline ? '#22c55e' : '#ef4444', isOnline ? 'Online' : 'Offline')
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <RefreshCw style={{ width: 16, height: 16, color: text2 }} />
                            <span style={{ ...bc(13, 500, { color: text2 }) }}>Service Worker</span>
                        </div>
                        {badge('serviceWorker' in navigator ? '#22c55e' : '#ef4444', 'serviceWorker' in navigator ? 'Supported' : 'Unsupported')}
                    </div>
                </div>
            </div>

            {/* Update card */}
            {card(
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <RefreshCw style={{ width: 18, height: 18, color: updateAvailable ? ORG : text2 }} />
                        <span style={{ ...bc(15, 700, { color: textC }) }}>App Version</span>
                        {updateAvailable && badge(ORG, 'Update Ready')}
                    </div>

                    {updateAvailable ? (
                        <div style={{ background: 'rgba(232,98,26,.08)', border: `1px solid ${ORG}40`, borderRadius: 4, padding: 16, marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <AlertCircle style={{ width: 16, height: 16, color: ORG }} />
                                <span style={{ ...bc(13, 600, { color: ORG }) }}>A new version is available</span>
                            </div>
                            <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>
                                Reload the app to apply the latest update. Your session will be preserved.
                            </p>
                        </div>
                    ) : checkMsg ? (
                        <div style={{ background: 'rgba(34,197,94,.08)', border: `1px solid #22c55e40`, borderRadius: 4, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle style={{ width: 16, height: 16, color: '#22c55e' }} />
                            <span style={{ ...bc(13, 500, { color: '#22c55e' }) }}>{checkMsg}</span>
                        </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {updateAvailable ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={applyUpdate}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', ...bc(13, 600) }}
                            >
                                <RefreshCw style={{ width: 14, height: 14 }} />
                                Update & Reload
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={checkForUpdate}
                                disabled={checking || !isOnline}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', color: textC, border: `1px solid ${border}`, borderRadius: 4, cursor: checking ? 'default' : 'pointer', opacity: (!isOnline) ? 0.5 : 1, ...bc(13, 600) }}
                            >
                                <RefreshCw style={{ width: 14, height: 14, animation: checking ? 'spin 1s linear infinite' : 'none' }} />
                                {checking ? 'Checking…' : 'Check for Updates'}
                            </motion.button>
                        )}
                    </div>
                </>
            )}

            {/* Install card */}
            {!isInstalled && card(
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <Download style={{ width: 18, height: 18, color: TEAL }} />
                        <span style={{ ...bc(15, 700, { color: textC }) }}>Install as App</span>
                    </div>
                    <p style={{ ...ba(13, 400, { color: text2, marginBottom: 16 }) }}>
                        Install Abytech Hub on your device for a faster, offline-capable experience — no browser chrome, direct from your home screen.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {canInstall ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={installApp}
                                disabled={installing}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: TEAL, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', ...bc(13, 600) }}
                            >
                                <Download style={{ width: 14, height: 14 }} />
                                {installing ? 'Installing…' : 'Install App'}
                            </motion.button>
                        ) : (
                            <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)', border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
                                <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>
                                    To install on iOS: tap the <strong style={{ color: textC }}>Share</strong> button → <strong style={{ color: textC }}>Add to Home Screen</strong>.
                                    On Android/Desktop: look for the install icon in the address bar.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Already installed */}
            {isInstalled && card(
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(34,197,94,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle style={{ width: 18, height: 18, color: '#22c55e' }} />
                    </div>
                    <div>
                        <div style={{ ...bc(14, 600, { color: textC }) }}>App installed</div>
                        <div style={{ ...ba(12, 400, { color: text2 }) }}>Abytech Hub is running as an installed PWA on this device.</div>
                    </div>
                </div>
            )}

            {/* Spin keyframe */}
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
