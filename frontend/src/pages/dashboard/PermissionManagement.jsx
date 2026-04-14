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

function handleReportUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.includes('://')) return trimmed;
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const path = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    return base + path;
}

const AdminAvatar = ({ admin, size = 'md' }) => {
    const imageUrl = handleReportUrl(admin.profileImage);
    const [hasError, setHasError] = useState(false);

    const sizeClass =
        size === 'sm' ? 'w-8 h-8' :
            size === 'lg' ? 'w-12 h-12' :
                size === 'xl' ? 'w-24 h-24' :
                    'w-10 h-10';

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
                className={`${sizeClass} rounded-full object-cover border-2 border-gray-200`}
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center`} style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}>
            <User className={iconSize} style={{ color: 'rgb(249, 115, 22)' }} />
        </div>
    );
};

// Available permissions defined in backend
const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard_home', label: 'Dashboard Home', locked: true }, // Always accessible
    { id: 'report_management', label: 'Report Management', locked: false, desc: 'View all reports vs just own' },
    { id: 'expense_management', label: 'Expense Management', locked: false },
    { id: 'salary_management', label: 'Salary Management', locked: false },
    { id: 'employee_management', label: 'Employee Management', locked: false },
    { id: 'chat_management', label: 'Chat Management', locked: false },
    { id: 'meeting_management', label: 'Meeting Management', locked: false },
    { id: 'weekly_management', label: 'Weekly Goals Management', locked: false },
    { id: 'research_management', label: 'Research Management', locked: false },
    { id: 'hosted_website', label: 'Hosted Website Management', locked: false },
    { id: 'internship_management', label: 'Internship Management', locked: false },
];

const PermissionManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [operationStatus, setOperationStatus] = useState(null);

    // State for the currently selected admin for editing
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
            // data already includes permissionNames if they hit the profile endpoint, but adminAuthService.getAllAdmins 
            // might just hit a basic endpoint. Let's fetch full permissions data per admin or rely on what's returned.
            // Usually getAllAdmins returns the basic list. 
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
            // Fetch full permissions for this admin
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
        if (isSuperAdmin) return; // Disabled if super admin

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

            // Save super admin status
            await permissionService.toggleSuperAdmin(selectedAdmin.id, isSuperAdmin);

            // Save individual permissions if not super admin
            if (!isSuperAdmin) {
                await permissionService.setAdminPermissions(selectedAdmin.id, selectedPermissions);
            }

            showOperationStatus('success', `Permissions updated for ${selectedAdmin.adminName || 'Admin'}`);

            // Refresh list to show updated badge maybe
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(249, 115, 22)' }}>Permission Management</h1>
                            <p className="text-xs text-gray-600 mt-1">Manage access control and super admin status</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <motion.button whileHover={{ scale: 1.05 }} onClick={handleSeedPermissions} disabled={isSeeding}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 shadow-sm transition-colors">
                                {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sprout className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">Seed Permissions</span>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} onClick={loadData} disabled={loading}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">

                {/* Left Column - Admin List */}
                <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search admins..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:border-gray-300 transition-colors"
                                style={{ outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50/50">
                        {loading && !selectedAdmin ? (
                            <div className="p-8 text-center text-gray-500 text-xs">Loading admins...</div>
                        ) : filteredAdmins.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-xs">No admins found.</div>
                        ) : (
                            filteredAdmins.map(admin => (
                                <button
                                    key={admin.id}
                                    onClick={() => handleSelectAdmin(admin)}
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors border ${selectedAdmin?.id === admin.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <AdminAvatar admin={admin} size="md" />
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                            {admin.adminName || 'Unnamed Admin'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{admin.adminEmail}</div>
                                    </div>
                                    {/* Note: In a real app we might show a badge here if we had `isSuperAdmin` in the basic list */}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Editor */}
                <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {!selectedAdmin ? (
                        <div className="flex-1 flex items-center justify-center p-8 text-center">
                            <div>
                                <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Select an Admin</h3>
                                <p className="text-sm text-gray-500 mt-2">Choose an administrator from the list to view and manage their permissions.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Selected Admin Header */}
                            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-blue-50/50 to-transparent">
                                <div className="flex items-center space-x-4">
                                    <AdminAvatar admin={selectedAdmin} size="xl" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedAdmin.adminName || 'Unnamed'}</h2>
                                        <p className="text-sm text-gray-600 mb-2">{selectedAdmin.adminEmail}</p>

                                        {/* Super Admin Toggle */}
                                        <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                                            <label className="flex items-center cursor-pointer px-2">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={isSuperAdmin}
                                                        onChange={(e) => setIsSuperAdmin(e.target.checked)}
                                                    />
                                                    <div className={`block w-10 h-6 rounded-full transition-colors ${isSuperAdmin ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSuperAdmin ? 'transform translate-x-4' : ''}`}></div>
                                                </div>
                                                <div className="ml-3 text-sm font-semibold text-gray-700 flex items-center space-x-1">
                                                    <ShieldAlert className={`w-4 h-4 ${isSuperAdmin ? 'text-orange-500' : 'text-gray-400'}`} />
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
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>Save Changes</span>
                                </motion.button>
                            </div>

                            {/* Permissions Grid */}
                            <div className="flex-1 overflow-y-auto p-6 relative">

                                {/* Overlay if Super Admin */}
                                <AnimatePresence>
                                    {isSuperAdmin && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center p-6"
                                        >
                                            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-orange-100 text-center max-w-sm">
                                                <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">Full Access Granted</h3>
                                                <p className="text-sm text-gray-600">
                                                    As a Super Admin, this user automatically has access to all features and modules. Individual permission settings are ignored.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isChecked = perm.locked || isSuperAdmin || selectedPermissions.includes(perm.id);

                                        return (
                                            <div
                                                key={perm.id}
                                                onClick={() => !perm.locked && togglePermission(perm.id)}
                                                className={`
                          relative p-4 rounded-xl border-2 transition-all flex items-start space-x-3
                          ${perm.locked ? 'bg-gray-50 border-gray-200 opacity-80 cursor-not-allowed' : 'cursor-pointer'}
                          ${isChecked && !perm.locked ? 'border-blue-500 bg-blue-50/50' : ''}
                          ${!isChecked && !perm.locked ? 'border-gray-200 hover:border-gray-300' : ''}
                        `}
                                            >
                                                <div className={`
                          w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors flex-shrink-0
                          ${isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}
                        `}>
                                                    {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
                                                        {perm.label}
                                                    </h4>
                                                    {perm.desc && (
                                                        <p className="text-xs text-gray-500 mt-1">{perm.desc}</p>
                                                    )}
                                                    {perm.locked && (
                                                        <span className="inline-block mt-2 text-[10px] font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-uppercase tracking-wide">
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
                        <div className="absolute top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-3 text-red-700 text-xs flex items-center justify-center space-x-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {operationStatus && (
                        <motion.div initial={{ opacity: 0, y: -20, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: .95 }}
                            className="fixed top-4 right-4 z-50">
                            <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg text-xs ${operationStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                {operationStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                                <span className="font-medium">{operationStatus.message}</span>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)} className="ml-2"><X className="w-3.5 h-3.5" /></motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PermissionManagement;
