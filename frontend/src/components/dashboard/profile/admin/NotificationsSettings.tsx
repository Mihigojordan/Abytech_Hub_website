import React from 'react';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { Bell, BellOff, RefreshCw, Smartphone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

function NotificationSettings() {
    const {
        subscribeToNotifications,
        unsubscribeFromNotifications,
        isSubscribedToNotifications,
    } = useAdminAuth();

    const { bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
    const [loading, setLoading] = React.useState(false);

    const handleToggleNotifications = async () => {
        setLoading(true);
        try {
            if (isSubscribedToNotifications) {
                await unsubscribeFromNotifications();
            } else {
                await subscribeToNotifications();
            }
        } catch (err: any) {
            console.error('Notification error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ maxWidth: 600 }}>
                {/* Main Toggle Card */}
                <div style={{ 
                    background: bg3, 
                    border: `1px solid ${border}`, 
                    borderRadius: 4, 
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    marginBottom: 24
                }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ 
                            width: 48, 
                            height: 48, 
                            background: isSubscribedToNotifications ? 'rgba(232,98,26,.1)' : 'rgba(255,255,255,.05)', 
                            borderRadius: 4, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            {isSubscribedToNotifications ? (
                                <Bell style={{ width: 20, height: 20, color: ORG }} />
                            ) : (
                                <BellOff style={{ width: 20, height: 20, color: text3 }} />
                            )}
                        </div>
                        <div>
                            <h3 style={{ ...bc(16, 700, { color: textC, margin: 0 }) }}>Browser Push Notifications</h3>
                            <p style={{ ...ba(13, 400, { color: text2, margin: 0 }) }}>
                                {isSubscribedToNotifications 
                                    ? 'Notifications are currently enabled for this device.' 
                                    : 'Enable to receive real-time updates and alerts.'}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleToggleNotifications}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            ...bc(12, 700, { 
                                textTransform: 'uppercase', 
                                letterSpacing: 1,
                                color: '#fff',
                                background: isSubscribedToNotifications ? '#e84040' : ORG,
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                opacity: loading ? 0.7 : 1
                            })
                        }}
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} />
                        ) : isSubscribedToNotifications ? (
                            <>
                                <BellOff style={{ width: 14, height: 14 }} />
                                Disable
                            </>
                        ) : (
                            <>
                                <Bell style={{ width: 14, height: 14 }} />
                                Enable
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Info Card */}
                <div style={{ 
                    padding: '16px 20px', 
                    background: 'rgba(26,92,120,.05)', 
                    border: `1px solid rgba(26,92,120,.2)`, 
                    borderRadius: 4,
                    display: 'flex',
                    gap: 12
                }}>
                    <AlertCircle style={{ width: 16, height: 16, color: TEAL, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ ...ba(12, 400, { color: text2, lineHeight: 1.5 }) }}>
                        <p style={{ margin: '0 0 4px' }}>
                            <strong>Device Specific:</strong> Notification settings are managed per browser and device. To receive alerts on multiple devices, you must enable them individually.
                        </p>
                        <p style={{ margin: 0 }}>
                            If you're not receiving notifications, please ensure they are allowed in your browser settings.
                        </p>
                    </div>
                </div>

                {/* Additional Settings placeholders */}
                <div style={{ marginTop: 40 }}>
                    <h4 style={{ ...bc(14, 700, { color: textC, marginBottom: 20, letterSpacing: 0.5 }) }}>EMAIL NOTIFICATIONS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'System Alerts', desc: 'Critical infrastructure and security updates' },
                            { label: 'Task Assignments', desc: 'When a new task is assigned to you' },
                            { label: 'Chat Messages', desc: 'Direct messages and channel mentions' },
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${border}` }}>
                                <div>
                                    <p style={{ ...ba(13, 600, { color: textC, margin: 0 }) }}>{item.label}</p>
                                    <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }}>{item.desc}</p>
                                </div>
                                <div style={{ 
                                    width: 32, 
                                    height: 18, 
                                    background: ORG, 
                                    borderRadius: 9, 
                                    position: 'relative', 
                                    cursor: 'pointer' 
                                }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        right: 2, 
                                        top: 2, 
                                        width: 14, 
                                        height: 14, 
                                        background: '#fff', 
                                        borderRadius: '50%' 
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationSettings;