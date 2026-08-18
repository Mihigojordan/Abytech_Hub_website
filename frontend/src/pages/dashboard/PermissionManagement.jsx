import React, { useState, useEffect } from 'react';
import {
    Search, RefreshCw, XCircle, CheckCircle,
    Eye, User, AlertCircle, X, Shield, ShieldAlert,
    Save, Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminAuthService from '../../services/adminAuthService';
import permissionService from '../../services/permissionService';
import { API_URL } from '../../api/api';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

function handleReportUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.includes('://')) return trimmed;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const path = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return base + path;
}

const AdminAvatar = ({ admin, size = 'md', border, bg3 }) => {
    const imageUrl = handleReportUrl(admin.profileImage);
    const [hasError, setHasError] = useState(false);

    const dims =
        size === 'sm' ? 32 :
        size === 'lg' ? 48 :
        size === 'xl' ? 96 : 40;

    const iconSize =
        size === 'sm' ? 'w-4 h-4' :
        size === 'lg' ? 'w-6 h-6' :
        size === 'xl' ? 'w-12 h-12' :
        'w-5 h-5';

    if (imageUrl && !hasError) {
        return (
            <img
                src={imageUrl}
                alt={admin.adminName || 'Admin'}
                style={{ width: dims, height: dims, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + border, flexShrink: 0 }}
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div
            style={{ width: dims, height: dims, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,98,26,.1)', border: '2px solid rgba(232,98,26,.2)', flexShrink: 0, color: ORG }}
        >
            <User className={iconSize} />
        </div>
    );
};

const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard_home',        label: 'Dashboard Home',             locked: true },
    { id: 'company_registration_management', label: 'Company Registers',          locked: false, desc: 'Review, approve or reject business sign-up requests' },
    { id: 'module_access_management', label: 'Modules & Access',                 locked: false, desc: 'Toggle module access and plan assignment per tenant' },
    { id: 'subscription_plan_management', label: 'Subscription Plans',           locked: false, desc: 'Manage the plan catalog: pricing, billing cycle, bundled modules' },
    { id: 'subscription_billing_management', label: 'Subscriptions & Payments',  locked: false, desc: 'Manage tenant subscriptions, invoices and payments' },
    { id: 'report_management',     label: 'Report Management',          locked: false, desc: 'View all reports vs just own' },
    { id: 'expense_management',    label: 'Expense Management',         locked: false },
    { id: 'salary_management',     label: 'Salary Management',          locked: false },
    { id: 'employee_management',   label: 'Employee Management',        locked: false },
    { id: 'chat_management',       label: 'Chat Management',            locked: false },
    { id: 'meeting_management',    label: 'Meeting Management',         locked: false },
    { id: 'weekly_management',     label: 'Weekly Goals Management',    locked: false },
    { id: 'research_management',   label: 'Research Management',        locked: false },
    { id: 'hosted_website',        label: 'Hosted Website Management',  locked: false },
    { id: 'internship_management', label: 'Internship Management',      locked: false },
    { id: 'data_export_management',label: 'Data Export & Import',       locked: false, desc: 'Export backups and import data' },
];

const PermissionManagement = () => {
    const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [operationStatus, setOperationStatus] = useState(null);

    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => { loadData(); }, []);

    const showOperationStatus = (type, message, duration = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await adminAuthService.getAllAdmins();
            const list = Array.isArray(data) ? data : [];
            setAdmins(list);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load admins');
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedPermissions = async () => {
        try {
            setIsSeeding(true);
            await permissionService.seedPermissions();
            showOperationStatus('success', 'Permissions seeded successfully!');
            await loadData();
        } catch (err) {
            showOperationStatus('error', err.message || 'Failed to seed permissions');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSelectAdmin = async (admin) => {
        try {
            setLoading(true);
            const permsData = await permissionService.getAdminPermissions(admin.id);
            setSelectedAdmin(admin);
            setIsSuperAdmin(permsData.isSuperAdmin);
            setSelectedPermissions(permsData.permissions || []);
        } catch (err) {
            showOperationStatus('error', err.message || 'Failed to load admin permissions');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (permId) => {
        if (isSuperAdmin) return;
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
        );
    };

    const handleSave = async () => {
        if (!selectedAdmin) return;
        try {
            setIsSaving(true);
            await permissionService.toggleSuperAdmin(selectedAdmin.id, isSuperAdmin);
            if (!isSuperAdmin) {
                await permissionService.setAdminPermissions(selectedAdmin.id, selectedPermissions);
            }
            showOperationStatus('success', `Permissions updated for ${selectedAdmin.adminName || 'Admin'}`);
            await loadData();
        } catch (err) {
            showOperationStatus('error', err.message || 'Failed to save permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredAdmins = admins.filter(a =>
        !searchTerm ||
        a.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ background: bg }}>
            {/* Header */}
            <div style={{ background: bg2, borderBottom: '1px solid ' + border }}>
                <div className="mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 style={{ ...bb(32, { color: ORG, lineHeight: 1, margin: 0 }) }}>Permission Management</h1>
                            <p style={{ ...ba(12, 400, { color: text2, marginTop: 4 }) }}>Manage access control and super admin status</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={handleSeedPermissions}
                                disabled={isSeeding}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: isSeeding ? 'not-allowed' : 'pointer', opacity: isSeeding ? 0.6 : 1 }}
                            >
                                {isSeeding
                                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    : <Sprout className="w-3.5 h-3.5" />
                                }
                                <span className="hidden sm:inline">Seed Permissions</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={loadData}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                            >
                                <RefreshCw className={`w-3.5 h-3.5${loading ? ' animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6" style={{ height: 'calc(100vh - 140px)' }}>

                {/* Left Column - Admin List */}
                <div className="w-full md:w-1/3 flex flex-col overflow-hidden" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}>
                    <div className="p-4" style={{ borderBottom: '1px solid ' + border }}>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
                            <input
                                type="text"
                                placeholder="Search admins..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ background: bg }}>
                        {loading && !selectedAdmin ? (
                            <div style={{ padding: 32, textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>Loading admins...</div>
                        ) : filteredAdmins.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>No admins found.</div>
                        ) : (
                            filteredAdmins.map(admin => (
                                <button
                                    key={admin.id}
                                    onClick={() => handleSelectAdmin(admin)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 12,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        transition: 'all .15s',
                                        ...(selectedAdmin?.id === admin.id
                                            ? { background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)' }
                                            : { background: bg2, border: '1px solid ' + border }),
                                    }}
                                    onMouseEnter={e => { if (selectedAdmin?.id !== admin.id) e.currentTarget.style.background = bg3; }}
                                    onMouseLeave={e => { if (selectedAdmin?.id !== admin.id) e.currentTarget.style.background = bg2; }}
                                >
                                    <AdminAvatar admin={admin} size="md" border={border} bg3={bg3} />
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div style={{ ...ba(13, 600, { color: textC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }) }}>
                                            {admin.adminName || 'Unnamed Admin'}
                                        </div>
                                        <div style={{ ...ba(11, 400, { color: text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }) }}>
                                            {admin.adminEmail}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Editor */}
                <div className="w-full md:w-2/3 flex flex-col overflow-hidden relative" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}>
                    {!selectedAdmin ? (
                        <div className="flex-1 flex items-center justify-center p-8 text-center">
                            <div>
                                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
                                <h3 style={{ ...ba(17, 600, { color: textC, marginBottom: 8 }) }}>Select an Admin</h3>
                                <p style={{ ...ba(13, 400, { color: text2 }) }}>Choose an administrator from the list to view and manage their permissions.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Selected Admin Header */}
                            <div className="p-6 flex items-start justify-between" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                                <div className="flex items-center gap-4">
                                    <AdminAvatar admin={selectedAdmin} size="xl" border={border} bg3={bg3} />
                                    <div>
                                        <h2 style={{ ...ba(20, 700, { color: textC, margin: 0 }) }}>{selectedAdmin.adminName || 'Unnamed'}</h2>
                                        <p style={{ ...ba(13, 400, { color: text2, marginBottom: 10 }) }}>{selectedAdmin.adminEmail}</p>

                                        {/* Super Admin Toggle */}
                                        <div className="inline-flex items-center p-2" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}>
                                            <label className="flex items-center cursor-pointer px-2">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={isSuperAdmin}
                                                        onChange={(e) => setIsSuperAdmin(e.target.checked)}
                                                    />
                                                    <div
                                                        style={{ width: 40, height: 24, borderRadius: 12, transition: 'background .2s', background: isSuperAdmin ? ORG : bg3, border: isSuperAdmin ? 'none' : '1px solid ' + border }}
                                                    />
                                                    <div
                                                        style={{ position: 'absolute', left: 4, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: isSuperAdmin ? 'translateX(16px)' : 'translateX(0)', transition: 'transform .2s' }}
                                                    />
                                                </div>
                                                <div className="ml-3 flex items-center gap-1" style={{ ...ba(13, 700, { color: textC }) }}>
                                                    <ShieldAlert className="w-4 h-4" style={{ color: isSuperAdmin ? ORG : text2 }} />
                                                    <span>Super Admin Access</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                                >
                                    {isSaving
                                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                                        : <Save className="w-4 h-4" />
                                    }
                                    <span>Save Changes</span>
                                </motion.button>
                            </div>

                            {/* Permissions Grid */}
                            <div className="flex-1 overflow-y-auto p-6 relative">

                                {/* Super Admin Overlay */}
                                <AnimatePresence>
                                    {isSuperAdmin && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-10 flex items-center justify-center p-6"
                                            style={{ background: isDark ? 'rgba(7,20,24,.75)' : 'rgba(245,239,230,.8)', backdropFilter: 'blur(1px)' }}
                                        >
                                            <div style={{ background: bg2, border: '1px solid rgba(232,98,26,.3)', borderRadius: 4, padding: '24px 32px', textAlign: 'center', maxWidth: 340 }}>
                                                <ShieldAlert className="w-12 h-12 mx-auto mb-3" style={{ color: ORG }} />
                                                <h3 style={{ ...ba(17, 700, { color: textC, marginBottom: 8 }) }}>Full Access Granted</h3>
                                                <p style={{ ...ba(13, 400, { color: text2 }) }}>
                                                    As a Super Admin, this user automatically has access to all features and modules. Individual permission settings are ignored.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                                    <span style={bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Module Permissions</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isChecked = perm.locked || isSuperAdmin || selectedPermissions.includes(perm.id);

                                        return (
                                            <div
                                                key={perm.id}
                                                onClick={() => !perm.locked && togglePermission(perm.id)}
                                                style={{
                                                    position: 'relative',
                                                    padding: 16,
                                                    borderRadius: 4,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 12,
                                                    cursor: perm.locked ? 'not-allowed' : 'pointer',
                                                    transition: 'all .15s',
                                                    ...(perm.locked
                                                        ? { background: bg3, border: '1px solid ' + border, opacity: 0.7 }
                                                        : isChecked
                                                            ? { background: 'rgba(232,98,26,.08)', border: '2px solid rgba(232,98,26,.4)' }
                                                            : { background: bg2, border: '1px solid ' + border }),
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        marginTop: 2,
                                                        transition: 'background .15s',
                                                        ...(isChecked
                                                            ? { background: ORG, border: 'none' }
                                                            : { background: bg3, border: '1px solid ' + border }),
                                                    }}
                                                >
                                                    {isChecked && <CheckCircle className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                                                </div>
                                                <div>
                                                    <h4 style={bc(13, 700, { color: isChecked ? ORG : textC, margin: 0 })}>
                                                        {perm.label}
                                                    </h4>
                                                    {perm.desc && (
                                                        <p style={{ ...ba(11, 400, { color: text2, marginTop: 4 }) }}>{perm.desc}</p>
                                                    )}
                                                    {perm.locked && (
                                                        <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(232,98,26,.1)', color: ORG, padding: '2px 8px', borderRadius: 20 }}>
                                                            Always Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Error Banner */}
                    {error && !selectedAdmin && (
                        <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-2 p-3" style={{ background: 'rgba(232,64,64,.15)', borderBottom: '1px solid #e84040', color: '#e84040', fontSize: 12 }}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {operationStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: .95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: .95 }}
                            className="fixed top-4 right-4 z-50"
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, border: '1px solid',
                                ...(operationStatus.type === 'success'
                                    ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
                                    : { background: 'rgba(232,64,64,.15)',  borderColor: '#e84040', color: '#e84040' }),
                            }}>
                                {operationStatus.type === 'success'
                                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 flex-shrink-0" />
                                }
                                <span>{operationStatus.message}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setOperationStatus(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2, marginLeft: 8 }}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PermissionManagement;
