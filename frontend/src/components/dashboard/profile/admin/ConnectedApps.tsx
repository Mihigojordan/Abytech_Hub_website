import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Globe } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

interface App {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    isConnected: boolean;
    color: string;
}

const ConnectedApps: React.FC = () => {
    const { bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

    const [apps, setApps] = useState<App[]>([
        {
            id: 'slack',
            name: 'Slack',
            description: 'Team communication platform with channels for group discussions and direct messaging.',
            icon: (
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523c0-1.393 1.127-2.52 2.52-2.52h2.52v2.52c0 1.396-1.127 2.523-2.52 2.523" />
                    <path fill="#36C5F0" d="M8.562 15.165c-1.393 0-2.52-1.127-2.52-2.523V5.52c0-1.393 1.127-2.52 2.52-2.52c1.396 0 2.523 1.127 2.523 2.52v7.122c0 1.396-1.127 2.523-2.523 2.523" />
                    <path fill="#2EB67D" d="M8.562 18.958a2.528 2.528 0 0 1-2.52-2.52c0-1.393 1.127-2.523 2.52-2.523h2.52v2.523c0 1.393-1.127 2.52-2.52 2.52" />
                    <path fill="#ECB22E" d="M8.562 5.52c0-1.393 1.127-2.52 2.523-2.52c1.393 0 2.52 1.127 2.52 2.52v2.52h-2.52c-1.396 0-2.523-1.127-2.523-2.52" />
                </svg>
            ),
            isConnected: true,
            color: '#4A154B',
        },
        {
            id: 'gmail',
            name: 'Gmail',
            description: 'Gmail is a free email service by Google that offers robust spam protection & 15GB of storage.',
            icon: (
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path fill="#4285F4" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.909L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z" />
                    <path fill="#34A853" d="M0 5.457v1.027l12 7.5 12-7.5V5.457c0-.904-.732-1.636-1.636-1.636L12 10.09 1.636 3.821C.732 3.821 0 4.553 0 5.457z" />
                </svg>
            ),
            isConnected: true,
            color: '#EA4335',
        },
        {
            id: 'google-calendar',
            name: 'Google Calendar',
            description: 'Google Calendar is a web-based scheduling tool that allows users to manage and share events.',
            icon: (
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path fill="#1a73e8" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
            ),
            isConnected: true,
            color: '#4285F4',
        },
        {
            id: 'github',
            name: 'Github',
            description: 'Github is a web-based platform for version control and collaboration, allowing developers to host code.',
            icon: (
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} fill={isDark ? "#fff" : "#24292e"}>
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            ),
            isConnected: false,
            color: '#24292e',
        },
    ]);

    const handleToggleConnection = (appId: string) => {
        setApps((prev) =>
            prev.map((app) =>
                app.id === appId ? { ...app, isConnected: !app.isConnected } : app
            )
        );
    };

    const loginWithGoogle = (popup = true) => {
        const redirectUri = 'http://localhost:5173/admin/dashboard/profile?tab=security';
        const stateObj = { redirectUri, popup };
        const stateParam = encodeURIComponent(JSON.stringify(stateObj));
        const googleUrl = `http://localhost:7000/admin/google?state=${stateParam}`;

        if (popup) {
            window.open(googleUrl, 'Google Login', 'width=500,height=600');
        } else {
            window.location.href = googleUrl;
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
                {apps.map((app) => (
                    <div
                        key={app.id}
                        style={{
                            background: bg3,
                            border: `1px solid ${border}`,
                            borderRadius: 4,
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Status Ribbon */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '4px 12px',
                            background: app.isConnected ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.05)',
                            ...bc(9, 700, { color: app.isConnected ? '#10b981' : text3, textTransform: 'uppercase', letterSpacing: 1 })
                        }}>
                            {app.isConnected ? 'Connected' : 'Disconnected'}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div style={{ 
                                    width: 48, 
                                    height: 48, 
                                    background: isDark ? 'rgba(255,255,255,.05)' : '#f8f9fa', 
                                    borderRadius: 4, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: `1px solid ${border}`
                                }}>
                                    {app.icon}
                                </div>
                                <h3 style={{ ...bc(18, 700, { color: textC, margin: 0 }) }}>{app.name}</h3>
                            </div>
                            <p style={{ ...ba(13, 400, { color: text2, margin: 0, lineHeight: 1.5 }) }}>
                                {app.description}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 16, borderTop: `1px solid ${border}`, marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: app.isConnected ? '#10b981' : '#e84040' }} />
                                <span style={{ ...ba(11, 600, { color: text3, textTransform: 'uppercase' }) }}>
                                    {app.isConnected ? 'Active Sync' : 'Inactive'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                    onClick={() => handleToggleConnection(app.id)}
                                    style={{
                                        background: 'none',
                                        border: `1px solid ${app.isConnected ? '#e84040' : ORG}`,
                                        borderRadius: 4,
                                        padding: '6px 12px',
                                        ...bc(11, 700, { color: app.isConnected ? '#e84040' : ORG, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 })
                                    }}
                                >
                                    {app.isConnected ? 'Disconnect' : 'Connect'}
                                </button>
                                {app.isConnected && (
                                    <button style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer' }}>
                                        <ExternalLink style={{ width: 14, height: 14 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / Add More */}
            <div style={{ 
                marginTop: 40, 
                padding: '40px', 
                border: `1px dashed ${border}`, 
                borderRadius: 4, 
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.01)'
            }}>
                <Globe style={{ width: 40, height: 40, color: text3, margin: '0 auto 16px', opacity: 0.5 }} />
                <h4 style={{ ...bc(16, 700, { color: textC, margin: '0 0 8px' }) }}>Explore More Integrations</h4>
                <p style={{ ...ba(13, 400, { color: text2, margin: '0 0 24px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }) }}>
                    Connect your favorite productivity tools to streamline your workflow and sync data across platforms.
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loginWithGoogle(true)}
                    style={{
                        padding: '12px 32px',
                        ...bc(13, 700, { color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }),
                        background: ORG,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Connect New Application
                </motion.button>
            </div>

            {/* Info Box */}
            <div style={{ 
                marginTop: 32, 
                padding: '16px 20px', 
                background: 'rgba(26,92,120,.05)', 
                border: `1px solid rgba(26,92,120,.2)`, 
                borderRadius: 4,
                display: 'flex',
                gap: 12
            }}>
                <AlertCircle style={{ width: 16, height: 16, color: TEAL, flexShrink: 0, marginTop: 2 }} />
                <p style={{ ...ba(12, 400, { color: text2, lineHeight: 1.5, margin: 0 }) }}>
                    <strong>Security Note:</strong> These applications have been granted access to specific parts of your account data. You can revoke access at any time by disconnecting the app. Disconnecting will stop all future data synchronization.
                </p>
            </div>
        </div>
    );
};

export default ConnectedApps;
};

export default ConnectedApps;