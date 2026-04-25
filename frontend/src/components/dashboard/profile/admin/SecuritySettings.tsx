import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Settings, Trash2, Power, Lock, Smartphone, Mail, Activity, SmartphoneNfc, RefreshCw, Key, ChevronRight, Globe } from 'lucide-react';
import useAdminAuth from '../../../../context/AdminAuthContext';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import ChangePasswordModal from './security/ChangePasswordModal';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

interface AdminUser {
    id: string;
    adminName?: string;
    adminEmail?: string;
    isLocked?: boolean;
    createdAt?: string;
    profileImage?: string;
    phone?: string;
    is2FA?: boolean;
    google_id?: string;
}

const SecuritySettings: React.FC = () => {
    const { user, updateAdmin, loginWithGoogle } = useAdminAuth() as {
        user: AdminUser | null;
        updateAdmin: (updateData: Partial<AdminUser>) => Promise<AdminUser>;
        loginWithGoogle: (popup?: boolean, uri?: string | null) => void;
    };

    const { bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.is2FA || false);
    const [googleConnected, setGoogleConnected] = useState(!!user?.google_id);
    const [isLoading, setIsLoading] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setGoogleConnected(!!user?.google_id);
    }, [user?.google_id]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get("status");
        const acceptance = queryParams.get("acceptance");

        if (status === "notfound" && acceptance === "0") {
            Swal.fire({
                title: "Account Not Found",
                text: "The Google account you tried to use is not associated with any admin account.",
                icon: "error",
                confirmButtonColor: ORG,
            }).then(() => {
                navigate(location.pathname, { replace: true });
            });
        }
    }, [location.search, navigate]);

    const handleEnableTwoFactor = async () => {
        const action = twoFactorEnabled ? 'disable' : 'enable';
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} 2FA?`,
            text: twoFactorEnabled ? 'Security level will be reduced.' : 'Security will be enhanced with OTP.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: twoFactorEnabled ? '#e84040' : ORG,
            cancelButtonColor: text3,
            confirmButtonText: `Yes, ${action}`
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                if (!user?.id) throw new Error('No admin ID');
                await updateAdmin({ id: user.id, is2FA: !twoFactorEnabled });
                setTwoFactorEnabled(!twoFactorEnabled);
                Swal.fire({ title: 'Success', icon: 'success', confirmButtonColor: ORG });
            } catch (error: any) {
                Swal.fire({ title: 'Error', text: error.message, icon: 'error', confirmButtonColor: '#e84040' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoogleToggle = async () => {
        if (!googleConnected) {
            loginWithGoogle(true, window.location.href);
            return;
        }

        const result = await Swal.fire({
            title: 'Disconnect Google?',
            text: 'You will no longer be able to sign in using Google.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e84040',
            confirmButtonText: 'Yes, disconnect'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                if (!user?.id) throw new Error('No admin ID');
                await updateAdmin({ id: user.id, google_id: '' });
                setGoogleConnected(false);
                Swal.fire({ title: 'Disconnected', icon: 'success', confirmButtonColor: ORG });
            } catch (error: any) {
                Swal.fire({ title: 'Error', text: error.message, icon: 'error', confirmButtonColor: '#e84040' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const SecurityCard = ({ icon: Icon, title, desc, status, action, actionText, actionLoading = false, danger = false }: any) => (
        <div style={{ 
            padding: '24px', 
            background: bg3, 
            border: `1px solid ${border}`, 
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24
        }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                <div style={{ 
                    width: 48, 
                    height: 48, 
                    background: isDark ? 'rgba(255,255,255,.05)' : '#f8f9fa', 
                    borderRadius: 4, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `1px solid ${border}`,
                    color: danger ? '#e84040' : TEAL
                }}>
                    <Icon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ ...bc(16, 700, { color: textC, margin: 0 }) }}>{title}</h3>
                        {status && (
                            <span style={{ 
                                ...bc(9, 700, { 
                                    background: 'rgba(16,185,129,.1)', 
                                    color: '#10b981', 
                                    padding: '1px 6px', 
                                    borderRadius: 4, 
                                    textTransform: 'uppercase' 
                                }) 
                            }}>
                                {status}
                            </span>
                        )}
                    </div>
                    <p style={{ ...ba(13, 400, { color: text2, margin: 0 }) }}>{desc}</p>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action}
                disabled={actionLoading}
                style={{
                    padding: '10px 20px',
                    ...bc(11, 700, { 
                        textTransform: 'uppercase', 
                        letterSpacing: 1,
                        color: '#fff',
                        background: danger ? '#e84040' : ORG,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: actionLoading ? 0.7 : 1
                    })
                }}
            >
                {actionLoading ? <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} /> : actionText}
            </motion.button>
        </div>
    );

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
                <SecurityCard 
                    icon={Key} 
                    title="Account Password" 
                    desc="Regularly update your password to keep your account secure." 
                    action={() => setIsChangePasswordModalOpen(true)}
                    actionText="Change Password"
                />

                <SecurityCard 
                    icon={SmartphoneNfc} 
                    title="Two-Factor Authentication" 
                    desc="Add an extra layer of security to your account with OTP." 
                    status={twoFactorEnabled ? "Active" : ""}
                    action={handleEnableTwoFactor}
                    actionText={twoFactorEnabled ? "Disable" : "Enable"}
                    actionLoading={isLoading && !googleConnected}
                    danger={twoFactorEnabled}
                />

                <SecurityCard 
                    icon={Globe} 
                    title="Google Authentication" 
                    desc="Sign in quickly and securely with your Google account." 
                    status={googleConnected ? "Connected" : ""}
                    action={handleGoogleToggle}
                    actionText={googleConnected ? "Disconnect" : "Connect"}
                    actionLoading={isLoading && googleConnected}
                    danger={googleConnected}
                />

                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                        { icon: Smartphone, title: 'Verified Mobile', value: user?.phone || '+99 264 710 583', action: () => {} },
                        { icon: Mail, title: 'Primary Email', value: user?.adminEmail || 'admin@abyteckhub.com', action: () => {} },
                    ].map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <item.icon style={{ width: 16, height: 16, color: TEAL }} />
                                <div>
                                    <p style={{ ...ba(10, 600, { color: text3, margin: 0, textTransform: 'uppercase' }) }}>{item.title}</p>
                                    <p style={{ ...ba(13, 500, { color: textC, margin: 0 }) }}>{item.value}</p>
                                </div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: ORG, ...bc(10, 700, { cursor: 'pointer', textTransform: 'uppercase' }) }}>Change</button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 40 }}>
                    <h4 style={{ ...bc(14, 700, { color: textC, marginBottom: 20, letterSpacing: 0.5 }) }}>ACCOUNT MANAGEMENT</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { icon: Activity, title: 'Session Activity', desc: 'Monitor and manage your active login sessions.' },
                            { icon: Trash2, title: 'Delete Account', desc: 'Permanently remove your account and all associated data.', danger: true },
                        ].map((item, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '16px 20px', 
                                background: item.danger ? 'rgba(232,64,64,.05)' : bg2, 
                                border: `1px solid ${item.danger ? 'rgba(232,64,64,.2)' : border}`, 
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <item.icon style={{ width: 18, height: 18, color: item.danger ? '#e84040' : text3 }} />
                                    <div>
                                        <p style={{ ...ba(14, 600, { color: item.danger ? '#e84040' : textC, margin: 0 }) }}>{item.title}</p>
                                        <p style={{ ...ba(12, 400, { color: text3, margin: 0 }) }}>{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight style={{ width: 16, height: 16, color: text3 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                adminId={user?.id || ''}
            />
        </div>
    );
};

export default SecuritySettings;