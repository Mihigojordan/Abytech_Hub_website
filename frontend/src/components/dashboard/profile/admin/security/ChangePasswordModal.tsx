import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import adminAuthService from '../../../../../services/adminAuthService';
import { useDashboardTheme } from '../../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminId: string;
}

interface FormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface Errors {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, adminId }) => {
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();
    const [formData, setFormData] = useState<FormData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const validateOldPassword = (password: string): string => {
        if (!password) return 'Current password is required';
        return '';
    };

    const validateNewPassword = (password: string): string => {
        if (!password) return 'New password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Must include an uppercase letter';
        if (!/[a-z]/.test(password)) return 'Must include a lowercase letter';
        if (!/[0-9]/.test(password)) return 'Must include a number';
        if (!/[!@#$%^&*]/.test(password)) return 'Must include a special character';
        return '';
    };

    const validateConfirmPassword = (confirmPassword: string, newPassword: string): string => {
        if (!confirmPassword) return 'Please confirm your new password';
        if (confirmPassword !== newPassword) return 'Passwords do not match';
        return '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const nextFormData = { ...formData, [name]: value };
        setFormData(nextFormData);

        const newErrors: Errors = {
            oldPassword: name === 'oldPassword' ? validateOldPassword(value) : validateOldPassword(nextFormData.oldPassword),
            newPassword: name === 'newPassword' ? validateNewPassword(value) : validateNewPassword(nextFormData.newPassword),
        };

        if (name === 'confirmPassword' || name === 'newPassword') {
            newErrors.confirmPassword = validateConfirmPassword(nextFormData.confirmPassword, nextFormData.newPassword);
        }

        Object.keys(newErrors).forEach((key) => {
            if (!newErrors[key as keyof Errors]) delete newErrors[key as keyof Errors];
        });
        setErrors(newErrors);
    };

    const handleSave = async () => {
        const newErrors: Errors = {
            oldPassword: validateOldPassword(formData.oldPassword),
            newPassword: validateNewPassword(formData.newPassword),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.newPassword),
        };

        if (Object.values(newErrors).some(Boolean)) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await adminAuthService.changePassword({
                currentPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });
            Swal.fire({
                title: 'Password Updated',
                text: 'Your security credentials have been changed.',
                icon: 'success',
                confirmButtonColor: ORG,
            }).then(() => {
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setErrors({});
                onClose();
            });
        } catch (error: any) {
            Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to update password.',
                icon: 'error',
                confirmButtonColor: '#e84040',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
        onClose();
    };

    const InputField = ({ label, name, value, error, show, onToggle, placeholder }: any) => (
        <div style={{ marginBottom: 20 }}>
            <label style={{ ...bc(11, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }) }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px 40px 12px 12px',
                        background: bg3,
                        border: `1px solid ${error ? '#e84040' : border}`,
                        borderRadius: 4,
                        color: textC,
                        ...ba(14, 400),
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: text3, cursor: 'pointer' }}
                >
                    {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
            </div>
            {error && <p style={{ ...ba(11, 400, { color: '#e84040', margin: '4px 0 0' }) }}>{error}</p>}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        style={{
                            width: '100%',
                            maxWidth: 440,
                            background: bg,
                            border: `1px solid ${border}`,
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: bg2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Lock style={{ width: 18, height: 18, color: ORG }} />
                                <h2 style={{ ...bc(18, 700, { color: textC, margin: 0 }) }}>Update Password</h2>
                            </div>
                            <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer' }}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '32px' }}>
                            <InputField
                                label="Current Password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                error={errors.oldPassword}
                                show={showPasswords.oldPassword}
                                onToggle={() => setShowPasswords(p => ({ ...p, oldPassword: !p.oldPassword }))}
                                placeholder="••••••••"
                            />

                            <InputField
                                label="New Password"
                                name="newPassword"
                                value={formData.newPassword}
                                error={errors.newPassword}
                                show={showPasswords.newPassword}
                                onToggle={() => setShowPasswords(p => ({ ...p, newPassword: !p.newPassword }))}
                                placeholder="••••••••"
                            />

                            <InputField
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                error={errors.confirmPassword}
                                show={showPasswords.confirmPassword}
                                onToggle={() => setShowPasswords(p => ({ ...p, confirmPassword: !p.confirmPassword }))}
                                placeholder="••••••••"
                            />

                            <div style={{ 
                                padding: '16px', 
                                background: isDark ? 'rgba(232,98,26,.05)' : '#fffbf0', 
                                border: `1px solid ${isDark ? 'rgba(232,98,26,.2)' : '#fde68a'}`, 
                                borderRadius: 4,
                                display: 'flex',
                                gap: 12,
                                marginTop: 8
                            }}>
                                <AlertCircle style={{ width: 16, height: 16, color: ORG, flexShrink: 0, marginTop: 2 }} />
                                <p style={{ ...ba(12, 400, { color: isDark ? text2 : '#92400e', lineHeight: 1.5, margin: 0 }) }}>
                                    Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '24px 32px', background: bg2, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                style={{
                                    padding: '10px 24px',
                                    ...bc(12, 700, { color: text2, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }),
                                    background: 'none',
                                    border: `1px solid ${border}`,
                                    borderRadius: 4,
                                }}
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isLoading || Object.values(errors).some(Boolean)}
                                style={{
                                    padding: '10px 32px',
                                    ...bc(12, 700, { color: '#fff', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }),
                                    background: ORG,
                                    border: 'none',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    opacity: (isLoading || Object.values(errors).some(Boolean)) ? 0.6 : 1
                                }}
                            >
                                {isLoading ? <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} /> : 'Update Password'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
};

export default ChangePasswordModal;