import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Bell, Shield, AppWindow, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettings from '../../components/dashboard/profile/admin/NotificationsSettings';
import SecuritySettings from '../../components/dashboard/profile/admin/SecuritySettings';
import ConnectedApps from '../../components/dashboard/profile/admin/ConnectedApps';
import ProfileSettings from '../../components/dashboard/profile/admin/ProfileSettings';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const AdminProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { bg, bg2, bg3, textC, text2, border, isDark } = useDashboardTheme();

    const validTabs = ['profile', 'notifications', 'security', 'apps'] as const;
    const initialTab = validTabs.includes(searchParams.get('tab') as any)
        ? (searchParams.get('tab') as typeof validTabs[number])
        : 'profile';
    const [activeTab, setActiveTab] = useState<typeof validTabs[number]>(initialTab);

    // Sync activeTab with URL params
    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    // Get current admin ID from auth or context
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
        { id: 'profile', label: 'Profile Overview', icon: User, desc: 'View and manage your public profile' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Manage push and email alerts' },
        { id: 'security', label: 'Security', icon: Shield, desc: 'Passwords, 2FA, and active sessions' },
        { id: 'apps', label: 'Connected Apps', icon: AppWindow, desc: 'Third-party integrations' },
    ];

    return (
        <div style={{ background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar Menu */}
                <div style={{ 
                    width: 280, 
                    background: bg2, 
                    borderRight: `1px solid ${border}`, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '24px 16px'
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
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {activeTab === item.id && (
                                    <motion.div 
                                        layoutId="active-indicator"
                                        style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: ORG, borderRadius: '0 4px 4px 0' }} 
                                    />
                                )}
                                <item.icon style={{ 
                                    width: 18, 
                                    height: 18, 
                                    color: activeTab === item.id ? ORG : text2 
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ ...bc(13, 600, { color: activeTab === item.id ? ORG : textC, letterSpacing: 0.5 }) }}>{item.label}</div>
                                </div>
                                {activeTab === item.id && <ChevronRight style={{ width: 14, height: 14, color: ORG }} />}
                            </motion.button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
                                {activeTab === 'apps' && (
                                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ padding: '24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AppWindow style={{ width: 20, height: 20, color: ORG }} />
                                            </div>
                                            <div>
                                                <h2 style={{ ...bc(18, 700, { color: textC, margin: 0, letterSpacing: 0.5 }) }}>Connected Applications</h2>
                                                <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Manage third-party integrations and API access</p>
                                            </div>
                                        </div>
                                        <ConnectedApps />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
