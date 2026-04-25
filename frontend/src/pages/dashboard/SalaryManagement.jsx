import React, { useState, useEffect } from 'react';
import {
    Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight, X, RefreshCw,
    CheckCircle, XCircle, AlertCircle, Clock, User, Sparkles, Filter,
    Download, List, Plus, DollarSign, CreditCard, TrendingUp, Wallet,
    AlertTriangle, Calendar, Table as TableIcon, Grid3X3, BanknoteIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import salaryService from '../../services/salaryService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatCurrency = (value) => {
    const amount = Number(value);
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'PAID':
            return { background: 'rgba(74,222,128,.15)', color: '#4ade80' };
        case 'PENDING':
            return { background: 'rgba(232,98,26,.15)', color: ORG };
        case 'REJECTED':
            return { background: 'rgba(232,64,64,.15)', color: '#e84040' };
        case 'PROCESSING':
        case 'APPROVED':
            return { background: 'rgba(26,92,120,.15)', color: TEAL };
        default:
            return { background: 'rgba(128,128,128,.15)', color: '#888' };
    }
};

const STATUS_LABELS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PAID: 'Paid',
    PROCESSING: 'Processing',
};

// ── Confirmation Modal helper ──
const ConfirmModal = ({ show, onClose, onConfirm, icon: Icon, iconColor, title, desc, children, btnText, btnDanger }) => {
    const { bg2, bg3, border, textC, text2 } = useDashboardTheme();
    return (
        <AnimatePresence>{show && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
            >
                <motion.div
                    initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 28, width: '100%', maxWidth: 448, boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
                        <div style={{ width: 56, height: 56, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: 24, height: 24, color: iconColor || ORG }} />
                        </div>
                        <div>
                            <h3 style={{ ...bc(16, 700, { color: textC, margin: '0 0 8px' }) }}>{title}</h3>
                            <p style={{ ...ba(13, 400, { color: text2, margin: 0 }) }}>{desc}</p>
                        </div>
                    </div>
                    {children}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            style={{ padding: '10px 24px', ...ba(13, 500, { color: textC }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer' }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={onConfirm}
                            style={{ padding: '10px 24px', ...ba(13, 600, { color: '#fff' }), background: btnDanger ? '#e84040' : ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                            {btnText}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}</AnimatePresence>
    );
};

// ── Form Modal Component ──
const FormModal = ({ show, isEdit, onClose, onSubmit, formData, setFormData, opLoading, isSuperAdmin, adminList }) => {
    const { bg2, bg3, border, textC, text2 } = useDashboardTheme();
    const labelStyle = { ...bc(11, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 }) };
    const inputStyle = { width: '100%', padding: '10px 14px', background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', boxSizing: 'border-box', ...ba(13, 400, {}) };

    return (
        <AnimatePresence>{show && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
            >
                <motion.div
                    initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: bg3, borderBottom: '1px solid ' + border, borderRadius: '4px 4px 0 0' }}>
                        <h2 style={{ ...bc(15, 700, { color: textC, margin: 0, letterSpacing: 1 }) }}>
                            {isEdit ? 'Edit Salary Request' : isSuperAdmin ? 'Record Salary' : 'Request Salary'}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: text2, cursor: 'pointer', padding: 4, display: 'flex' }}
                        >
                            <X style={{ width: 20, height: 20 }} />
                        </motion.button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {isSuperAdmin && !isEdit && (
                            <div>
                                <label style={labelStyle}>Employee *</label>
                                <select
                                    value={formData.targetAdminId || ''}
                                    onChange={e => setFormData({ ...formData, targetAdminId: e.target.value })}
                                    style={{ ...inputStyle, appearance: 'none' }}
                                >
                                    <option value="">— Select employee —</option>
                                    {adminList.map(a => (
                                        <option key={a.id} value={a.id}>{a.adminName} ({a.adminEmail})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Month *</label>
                                <select
                                    value={formData.month}
                                    onChange={e => setFormData({ ...formData, month: e.target.value })}
                                    style={{ ...inputStyle, background: bg3, border: '1px solid ' + border, color: textC, appearance: 'none' }}
                                >
                                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Year *</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Amount (RWF) *</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="e.g. 500000"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                rows={3}
                                placeholder="My pay date has arrived..."
                                style={{ ...inputStyle, resize: 'none' }}
                            />
                        </div>
                        <div style={{ background: 'rgba(232,98,26,.08)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: '12px 16px' }}>
                            <span style={{ ...ba(12, 400, { color: ORG }) }}>Note: Bonus and deductions will be set by the manager when approving your request.</span>
                        </div>
                        <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px' }}>
                            <span style={{ ...ba(12, 400, { color: text2 }) }}>Requested Amount: </span>
                            <span style={{ ...ba(13, 700, { color: ORG }) }}>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid ' + border, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                            onClick={onClose}
                            style={{ padding: '10px 20px', ...ba(13, 500, { color: textC }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!formData.amount || (isSuperAdmin && !isEdit && !formData.targetAdminId) || opLoading}
                            style={{ padding: '10px 20px', ...ba(13, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer', opacity: (!formData.amount || (isSuperAdmin && !isEdit && !formData.targetAdminId) || opLoading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            {opLoading
                                ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                : <DollarSign style={{ width: 14, height: 14 }} />
                            }
                            {isEdit ? 'Update' : isSuperAdmin ? 'Record Salary' : 'Submit Request'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}</AnimatePresence>
    );
};

const SalaryManagement = () => {
    const { user, isSuperAdmin } = useAdminAuth();
    const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState('table');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, paid: 0, totalPaidAmount: 0, totalPendingAmount: 0 });
    const [toast, setToast] = useState(null);
    const [opLoading, setOpLoading] = useState(false);
    const [adminList, setAdminList] = useState([]);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [approveConfirm, setApproveConfirm] = useState(null);
    const [rejectConfirm, setRejectConfirm] = useState(null);
    const [payConfirm, setPayConfirm] = useState(null);
    const [selected, setSelected] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approveBonus, setApproveBonus] = useState(0);
    const [approveDeduction, setApproveDeduction] = useState(0);
    const [formData, setFormData] = useState({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), reason: '', targetAdminId: '' });

    useEffect(() => { loadSalaries(); loadStats(); }, [currentPage, searchTerm, statusFilter]);

    useEffect(() => {
        if (isSuperAdmin) loadAdminList();
    }, [isSuperAdmin]);

    const loadAdminList = async () => {
        try {
            const { default: api } = await import('../../api/api');
            const res = await api.get('/admin');
            setAdminList(res.data || []);
        } catch (e) { console.error('Failed to load admin list', e); }
    };

    const loadSalaries = async () => {
        try {
            setLoading(true);
            const res = await salaryService.getAllSalaries({ page: currentPage, limit: 10, search: searchTerm, status: statusFilter });
            setSalaries(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
            setError(null);
        } catch (err) { setError(err.message); setSalaries([]); }
        finally { setLoading(false); }
    };

    const loadStats = async () => {
        try { const d = await salaryService.getStats(); setStats(d); } catch (e) { console.error(e); }
    };

    const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 3000); };

    const handleCreate = async () => {
        setOpLoading(true);
        try {
            const payload = {
                amount: parseFloat(formData.amount),
                month: parseInt(formData.month),
                year: parseInt(formData.year),
                reason: formData.reason,
            };
            if (isSuperAdmin && formData.targetAdminId) {
                payload.targetAdminId = formData.targetAdminId;
            }
            await salaryService.createSalary(payload);
            showToast('success', isSuperAdmin ? 'Salary recorded successfully!' : 'Salary request submitted!');
            setShowCreateModal(false);
            setFormData({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), reason: '', targetAdminId: '' });
            loadSalaries(); loadStats();
        } catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const handleUpdate = async () => {
        setOpLoading(true);
        try {
            await salaryService.updateSalary(selected.id, { amount: parseFloat(formData.amount), month: parseInt(formData.month), year: parseInt(formData.year), reason: formData.reason });
            showToast('success', 'Salary request updated');
            setShowEditModal(false);
            loadSalaries(); loadStats();
        } catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const handleDelete = async (s) => {
        setOpLoading(true);
        try { await salaryService.deleteSalary(s.id); showToast('success', 'Deleted'); setDeleteConfirm(null); loadSalaries(); loadStats(); }
        catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const handleApprove = async (s) => {
        setOpLoading(true);
        try {
            await salaryService.approve(s.id, parseFloat(approveBonus) || 0, parseFloat(approveDeduction) || 0);
            showToast('success', 'Salary approved');
            setApproveConfirm(null);
            setApproveBonus(0);
            setApproveDeduction(0);
            loadSalaries(); loadStats();
        }
        catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const handleReject = async (s) => {
        setOpLoading(true);
        try { await salaryService.reject(s.id, rejectionReason); showToast('success', 'Salary rejected'); setRejectConfirm(null); setRejectionReason(''); loadSalaries(); loadStats(); }
        catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const handlePay = async (s) => {
        setOpLoading(true);
        try { await salaryService.markAsPaid(s.id); showToast('success', 'Marked as paid'); setPayConfirm(null); loadSalaries(); loadStats(); }
        catch (err) { showToast('error', err.message); }
        finally { setOpLoading(false); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const openEdit = (s) => {
        setSelected(s);
        setFormData({ amount: s.amount, month: s.month, year: s.year, reason: s.reason || '' });
        setShowEditModal(true);
    };

    const statCards = [
        { label: 'Total', value: stats.total, icon: DollarSign },
        { label: 'Pending', value: stats.pending, icon: Clock },
        { label: 'Approved', value: stats.approved, icon: CheckCircle },
        { label: 'Paid', value: stats.paid, icon: CreditCard },
        { label: 'Rejected', value: stats.rejected, icon: XCircle },
        { label: 'Paid Amount', value: formatCurrency(stats.totalPaidAmount), icon: Wallet },
        { label: 'Pending Amount', value: formatCurrency(stats.totalPendingAmount), icon: TrendingUp },
    ];

    const renderActionButtons = (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSelected(s); setShowViewModal(true); }}
                style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: 'pointer', display: 'flex' }}
                title="View"
            >
                <Eye style={{ width: 14, height: 14 }} />
            </motion.button>
            {s.status === 'PENDING' && (
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => openEdit(s)}
                    style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: 'pointer', display: 'flex' }}
                    title="Edit"
                >
                    <Edit style={{ width: 14, height: 14 }} />
                </motion.button>
            )}
            {s.status === 'PENDING' && (
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setApproveConfirm(s)}
                    style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: '#4ade80', cursor: 'pointer', display: 'flex' }}
                    title="Approve"
                >
                    <CheckCircle style={{ width: 14, height: 14 }} />
                </motion.button>
            )}
            {s.status === 'PENDING' && (
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setRejectConfirm(s)}
                    style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: '#e84040', cursor: 'pointer', display: 'flex' }}
                    title="Reject"
                >
                    <XCircle style={{ width: 14, height: 14 }} />
                </motion.button>
            )}
            {s.status === 'APPROVED' && (
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPayConfirm(s)}
                    style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: '#4ade80', cursor: 'pointer', display: 'flex' }}
                    title="Mark Paid"
                >
                    <CreditCard style={{ width: 14, height: 14 }} />
                </motion.button>
            )}
            <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(s)}
                style={{ padding: 6, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: '#e84040', cursor: 'pointer', display: 'flex' }}
                title="Delete"
            >
                <Trash2 style={{ width: 14, height: 14 }} />
            </motion.button>
        </div>
    );

    // ── Table View ──
    const renderTableView = () => (
        <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: bg3 }}>
                            {['Employee', 'Period', 'Amount', 'Net', 'Status', 'Requested', 'Actions'].map((h, i) => (
                                <th key={h} style={{
                                    textAlign: i === 6 ? 'right' : 'left',
                                    padding: '14px 20px',
                                    ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }),
                                    display: (h === 'Net') ? undefined : undefined,
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.map((s, i) => (
                            <motion.tr
                                key={s.id}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                style={{ background: bg2, borderBottom: '1px solid ' + border, cursor: 'default' }}
                                onMouseEnter={e => e.currentTarget.style.background = bg3}
                                onMouseLeave={e => e.currentTarget.style.background = bg2}
                            >
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...bc(14, 700, {}) }}>
                                            {s.admin?.adminName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div style={{ ...ba(13, 600, { color: textC }) }}>{s.admin?.adminName || 'Unknown'}</div>
                                            <div style={{ ...ba(11, 400, { color: text2 }) }}>{s.admin?.adminEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 20px', ...ba(13, 400, { color: textC }) }}>{MONTHS[s.month]} {s.year}</td>
                                <td style={{ padding: '14px 20px', ...ba(14, 700, { color: ORG }) }}>{formatCurrency(s.amount)}</td>
                                <td style={{ padding: '14px 20px', ...ba(14, 700, { color: ORG }) }}>{formatCurrency(s.netAmount)}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span style={{ ...ba(11, 600, { ...getStatusStyle(s.status), padding: '3px 10px', borderRadius: 20, display: 'inline-block', letterSpacing: 0.5 }) }}>
                                        {STATUS_LABELS[s.status] || s.status}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 20px', ...ba(12, 400, { color: text2 }) }}>{formatDate(s.createdAt)}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{renderActionButtons(s)}</div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ── Grid View ──
    const renderGridView = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {salaries.map((s, i) => (
                <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20, position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={e => e.currentTarget.style.background = bg3}
                    onMouseLeave={e => e.currentTarget.style.background = bg2}
                >
                    {/* Orange accent top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ORG, borderRadius: '4px 4px 0 0' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...bc(16, 700, {}) }}>
                                {s.admin?.adminName?.charAt(0) || '?'}
                            </div>
                            <div>
                                <div style={{ ...ba(13, 600, { color: textC }) }}>{s.admin?.adminName}</div>
                                <div style={{ ...ba(11, 400, { color: text2 }) }}>{s.admin?.adminEmail}</div>
                            </div>
                        </div>
                        <span style={{ ...ba(11, 600, { ...getStatusStyle(s.status), padding: '3px 10px', borderRadius: 20, flexShrink: 0 }) }}>
                            {STATUS_LABELS[s.status] || s.status}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ ...ba(12, 400, { color: text2 }) }}>Period</span>
                            <span style={{ ...ba(12, 600, { color: textC }) }}>{MONTHS[s.month]} {s.year}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ ...ba(12, 400, { color: text2 }) }}>Amount</span>
                            <span style={{ ...ba(13, 700, { color: ORG }) }}>{formatCurrency(s.amount)}</span>
                        </div>
                        {(s.bonus > 0 || s.deduction > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ ...ba(12, 400, { color: text2 }) }}>Bonus / Deduction</span>
                                <span style={{ ...ba(12, 400, { color: textC }) }}>+{formatCurrency(s.bonus)} / -{formatCurrency(s.deduction)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid ' + border, paddingTop: 8 }}>
                            <span style={{ ...ba(12, 600, { color: text2 }) }}>Net</span>
                            <span style={{ ...ba(14, 700, { color: ORG }) }}>{formatCurrency(s.netAmount)}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid ' + border }}>
                        <span style={{ ...ba(11, 400, { color: text3 }) }}>{formatDate(s.createdAt)}</span>
                        {renderActionButtons(s)}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // ── List View ──
    const renderListView = () => (
        <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
            {salaries.map((s, i) => (
                <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ padding: '16px 20px', borderBottom: '1px solid ' + border, background: bg2 }}
                    onMouseEnter={e => e.currentTarget.style.background = bg3}
                    onMouseLeave={e => e.currentTarget.style.background = bg2}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...bc(16, 700, {}) }}>
                                {s.admin?.adminName?.charAt(0) || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
                                    <span style={{ ...ba(13, 600, { color: textC }) }}>{s.admin?.adminName}</span>
                                    <span style={{ ...ba(11, 600, { ...getStatusStyle(s.status), padding: '2px 8px', borderRadius: 20 }) }}>
                                        {STATUS_LABELS[s.status] || s.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                                    <span style={{ ...ba(12, 400, { color: text2 }) }}>{MONTHS[s.month]} {s.year}</span>
                                    <span style={{ ...ba(13, 700, { color: ORG }) }}>{formatCurrency(s.netAmount)}</span>
                                    <span style={{ ...ba(11, 400, { color: text3 }) }}>{formatDate(s.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        {renderActionButtons(s)}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: bg }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Header */}
            <div style={{ background: bg2, borderBottom: '1px solid ' + border, position: 'relative', overflow: 'hidden' }}>
                {/* Orange left accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: ORG }} />
                <div style={{ padding: '20px 24px 20px 32px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>
                                    <Sparkles style={{ width: 20, height: 20, color: ORG }} />
                                </motion.div>
                                <h1 style={{ ...bb(28, { color: ORG, margin: 0, lineHeight: 1 }) }}>Salary Management</h1>
                            </div>
                            <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Request and manage monthly salary payments</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { loadSalaries(); loadStats(); }}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', ...ba(12, 500, { color: text2 }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                            >
                                <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                                Refresh
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', ...ba(12, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                                <Plus style={{ width: 14, height: 14 }} />
                                {isSuperAdmin ? 'Record Salary' : 'Request Salary'}
                            </motion.button>
                            {/* View mode toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 3, gap: 2 }}>
                                {[{ mode: 'table', Icon: TableIcon }, { mode: 'grid', Icon: Grid3X3 }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                                    <motion.button
                                        key={mode}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setViewMode(mode)}
                                        style={{ padding: '6px 10px', borderRadius: 3, border: 'none', cursor: 'pointer', display: 'flex', background: viewMode === mode ? ORG : 'transparent', color: viewMode === mode ? '#fff' : text2 }}
                                    >
                                        <Icon style={{ width: 16, height: 16 }} />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stats row 1 — 4 cols */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {statCards.slice(0, 4).map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '16px 20px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: ORG }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 8 }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <stat.icon style={{ width: 18, height: 18, color: ORG }} />
                                </div>
                                <div>
                                    <p style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: '0 0 4px' }) }}>{stat.label}</p>
                                    <p style={{ ...bb(28, { color: ORG, lineHeight: 1, margin: 0 }) }}>{stat.value ?? '-'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats row 2 — 3 cols */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {statCards.slice(4).map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 4) * 0.08 }}
                            whileHover={{ y: -4 }}
                            style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '16px 20px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: ORG }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 8 }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <stat.icon style={{ width: 18, height: 18, color: ORG }} />
                                </div>
                                <div>
                                    <p style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: '0 0 4px' }) }}>{stat.label}</p>
                                    <p style={{ ...bb(28, { color: ORG, lineHeight: 1, margin: 0 }) }}>{stat.value ?? '-'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '16px 20px' }}
                >
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                        <span style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Filters</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
                            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: text2 }} />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', boxSizing: 'border-box', ...ba(13, 400, {}) }}
                            />
                        </div>
                        <div style={{ position: 'relative', minWidth: 160 }}>
                            <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: text2, pointerEvents: 'none' }} />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', appearance: 'none', cursor: 'pointer', ...ba(13, 400, {}) }}
                            >
                                <option value="">All Statuses</option>
                                {Object.entries(STATUS_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                            </select>
                        </div>
                        {(statusFilter || searchTerm) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setStatusFilter(''); setSearchTerm(''); setCurrentPage(1); }}
                                style={{ padding: '10px 18px', ...ba(12, 500, { color: text2 }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer' }}
                            >
                                Clear
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '64px 24px', textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ ...ba(13, 500, { color: text2, margin: 0 }) }}>Loading salary requests...</p>
                    </div>
                ) : salaries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '72px 24px', textAlign: 'center' }}
                    >
                        <DollarSign style={{ width: 64, height: 64, margin: '0 auto 24px', color: text3 }} />
                        <h3 style={{ ...bc(18, 700, { color: textC, margin: '0 0 10px' }) }}>
                            {searchTerm || statusFilter ? 'No matching requests' : 'No salary requests yet'}
                        </h3>
                        <p style={{ ...ba(13, 400, { color: text2, margin: '0 0 28px' }) }}>
                            {searchTerm || statusFilter ? 'Try adjusting filters' : isSuperAdmin ? 'Record the first salary entry' : 'Submit your first salary request'}
                        </p>
                        {!searchTerm && !statusFilter && (
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                style={{ padding: '11px 24px', ...ba(13, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                                {isSuperAdmin ? 'Record Salary' : 'Request Salary'}
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '8px 12px' }}>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        style={{ padding: '6px 12px', ...ba(12, 500, { color: text2 }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={{ padding: '6px 10px', background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer', color: text2, opacity: currentPage === 1 ? 0.4 : 1, display: 'flex' }}
                                    >
                                        <ChevronLeft style={{ width: 14, height: 14 }} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let p = currentPage - 2 + i;
                                        if (p < 1) p = 1;
                                        if (p > totalPages) p = totalPages;
                                        const isActive = currentPage === p;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                style={{ padding: '6px 12px', ...ba(12, isActive ? 700 : 500, { color: isActive ? '#fff' : text2 }), background: isActive ? ORG : bg3, border: isActive ? 'none' : '1px solid ' + border, borderRadius: 4, cursor: 'pointer' }}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{ padding: '6px 10px', background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer', color: text2, opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex' }}
                                    >
                                        <ChevronRight style={{ width: 14, height: 14 }} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        style={{ padding: '6px 12px', ...ba(12, 500, { color: text2 }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>{toast && (
                <motion.div
                    initial={{ opacity: 0, y: -60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -60 }}
                    style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 4,
                        boxShadow: '0 12px 40px rgba(0,0,0,.35)',
                        background: toast.type === 'success' ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)',
                        border: `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(232,64,64,.3)'}`,
                    }}>
                        {toast.type === 'success'
                            ? <CheckCircle style={{ width: 18, height: 18, color: '#4ade80', flexShrink: 0 }} />
                            : <XCircle style={{ width: 18, height: 18, color: '#e84040', flexShrink: 0 }} />
                        }
                        <span style={{ ...ba(13, 600, { color: toast.type === 'success' ? '#4ade80' : '#e84040' }) }}>{toast.message}</span>
                        <button
                            onClick={() => setToast(null)}
                            style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: text2, display: 'flex' }}
                        >
                            <X style={{ width: 14, height: 14 }} />
                        </button>
                    </div>
                </motion.div>
            )}</AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>{opLoading && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: isDark ? 'rgba(7,20,24,.7)' : 'rgba(245,239,230,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
                >
                    <motion.div
                        initial={{ scale: 0.85 }} animate={{ scale: 1 }}
                        style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '40px 56px', boxShadow: '0 24px 64px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
                    >
                        <div style={{ width: 48, height: 48, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ ...bc(13, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 }) }}>Processing...</span>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* Form Modals */}
            <FormModal
                show={showCreateModal} isEdit={false}
                onClose={() => { setShowCreateModal(false); setFormData({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), reason: '', targetAdminId: '' }); }}
                onSubmit={handleCreate} formData={formData} setFormData={setFormData}
                opLoading={opLoading} isSuperAdmin={isSuperAdmin} adminList={adminList}
            />
            <FormModal
                show={showEditModal} isEdit={true}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdate} formData={formData} setFormData={setFormData}
                opLoading={opLoading} isSuperAdmin={isSuperAdmin} adminList={adminList}
            />

            {/* View Modal */}
            <AnimatePresence>{showViewModal && selected && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
                >
                    <motion.div
                        initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 30 }}
                        style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column' }}
                    >
                        {/* Modal header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: bg3, borderBottom: '1px solid ' + border }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 4, background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...bc(20, 700, {}) }}>
                                    {selected.admin?.adminName?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 style={{ ...bc(17, 700, { color: textC, margin: '0 0 2px', letterSpacing: 0.5 }) }}>{selected.admin?.adminName}</h2>
                                    <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }}>Salary Request Details</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                onClick={() => setShowViewModal(false)}
                                style={{ background: 'transparent', border: 'none', color: text2, cursor: 'pointer', padding: 6, display: 'flex' }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </motion.button>
                        </div>

                        {/* Modal body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'Period', value: `${MONTHS[selected.month]} ${selected.year}` },
                                    { label: 'Status', value: selected.status, badge: true },
                                    { label: 'Amount', value: formatCurrency(selected.amount) },
                                    { label: 'Bonus', value: formatCurrency(selected.bonus) },
                                    { label: 'Deduction', value: formatCurrency(selected.deduction) },
                                    { label: 'Net Amount', value: formatCurrency(selected.netAmount) },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px' }}>
                                        <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, margin: '0 0 6px' }) }}>{item.label}</p>
                                        {item.badge
                                            ? <span style={{ ...ba(12, 600, { ...getStatusStyle(item.value), padding: '3px 10px', borderRadius: 20, display: 'inline-block' }) }}>
                                                {STATUS_LABELS[item.value] || item.value}
                                              </span>
                                            : <p style={{ ...ba(14, 700, { color: ORG, margin: 0 }) }}>{item.value}</p>
                                        }
                                    </div>
                                ))}
                            </div>

                            {selected.reason && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <div style={{ width: 3, height: 14, background: ORG, borderRadius: 2 }} />
                                        <span style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Reason</span>
                                    </div>
                                    <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px', ...ba(13, 400, { color: textC }) }}>
                                        {selected.reason}
                                    </div>
                                </div>
                            )}

                            {selected.rejectionReason && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <div style={{ width: 3, height: 14, background: '#e84040', borderRadius: 2 }} />
                                        <span style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Rejection Reason</span>
                                    </div>
                                    <div style={{ background: 'rgba(232,64,64,.08)', border: '1px solid rgba(232,64,64,.2)', borderRadius: 4, padding: '12px 16px', ...ba(13, 400, { color: '#e84040' }) }}>
                                        {selected.rejectionReason}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px' }}>
                                    <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, margin: '0 0 6px' }) }}>Requested On</p>
                                    <p style={{ ...ba(13, 600, { color: textC, margin: 0 }) }}>{formatDate(selected.createdAt)}</p>
                                </div>
                                {selected.paidAt && (
                                    <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 4, padding: '12px 16px' }}>
                                        <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: '#4ade80', margin: '0 0 6px' }) }}>Paid On</p>
                                        <p style={{ ...ba(13, 600, { color: '#4ade80', margin: 0 }) }}>{formatDate(selected.paidAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid ' + border, display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowViewModal(false)}
                                style={{ padding: '10px 28px', ...ba(13, 500, { color: textC }), background: bg3, border: '1px solid ' + border, borderRadius: 4, cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* Delete Confirm */}
            <ConfirmModal
                show={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                icon={AlertTriangle} iconColor="#e84040"
                title="Delete Request?"
                desc="This action cannot be undone."
                btnText="Delete" btnDanger
            >
                {deleteConfirm && (
                    <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px', marginBottom: 4 }}>
                        <p style={{ ...ba(13, 400, { color: textC, margin: 0 }) }}>
                            Delete <strong>{deleteConfirm.admin?.adminName}</strong>'s salary request for {MONTHS[deleteConfirm.month]} {deleteConfirm.year}?
                        </p>
                    </div>
                )}
            </ConfirmModal>

            {/* Approve Confirm */}
            <ConfirmModal
                show={!!approveConfirm}
                onClose={() => { setApproveConfirm(null); setApproveBonus(0); setApproveDeduction(0); }}
                onConfirm={() => handleApprove(approveConfirm)}
                icon={CheckCircle} iconColor="#4ade80"
                title="Approve Salary?"
                desc="Set bonus/deduction and approve the request."
                btnText="Approve"
            >
                {approveConfirm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 4, padding: '12px 16px' }}>
                            <p style={{ ...ba(13, 400, { color: textC, margin: 0 }) }}>
                                Approving <strong>{approveConfirm.admin?.adminName}</strong>'s salary request of <strong style={{ color: ORG }}>{formatCurrency(approveConfirm.amount)}</strong> for {MONTHS[approveConfirm.month]} {approveConfirm.year}
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 }) }}>Bonus (RWF)</label>
                                <input
                                    type="number" value={approveBonus} onChange={e => setApproveBonus(e.target.value)} placeholder="0"
                                    style={{ width: '100%', padding: '10px 14px', background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', boxSizing: 'border-box', ...ba(13, 400, {}) }}
                                />
                            </div>
                            <div>
                                <label style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 }) }}>Deduction (RWF)</label>
                                <input
                                    type="number" value={approveDeduction} onChange={e => setApproveDeduction(e.target.value)} placeholder="0"
                                    style={{ width: '100%', padding: '10px 14px', background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', boxSizing: 'border-box', ...ba(13, 400, {}) }}
                                />
                            </div>
                        </div>
                        <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '12px 16px' }}>
                            <span style={{ ...ba(12, 400, { color: text2 }) }}>Final Net Amount: </span>
                            <span style={{ ...ba(14, 700, { color: ORG }) }}>{formatCurrency((approveConfirm.amount || 0) + (parseFloat(approveBonus) || 0) - (parseFloat(approveDeduction) || 0))}</span>
                        </div>
                    </div>
                )}
            </ConfirmModal>

            {/* Reject Confirm */}
            <ConfirmModal
                show={!!rejectConfirm}
                onClose={() => { setRejectConfirm(null); setRejectionReason(''); }}
                onConfirm={() => handleReject(rejectConfirm)}
                icon={XCircle} iconColor="#e84040"
                title="Reject Salary?"
                desc="Provide a reason for rejection."
                btnText="Reject" btnDanger
            >
                <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Reason for rejection..."
                    style={{ width: '100%', padding: '10px 14px', background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', resize: 'none', boxSizing: 'border-box', ...ba(13, 400, {}) }}
                />
            </ConfirmModal>

            {/* Pay Confirm */}
            <ConfirmModal
                show={!!payConfirm}
                onClose={() => setPayConfirm(null)}
                onConfirm={() => handlePay(payConfirm)}
                icon={CreditCard} iconColor="#4ade80"
                title="Mark as Paid?"
                desc="Confirm salary payment."
                btnText="Mark Paid"
            >
                {payConfirm && (
                    <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 4, padding: '12px 16px' }}>
                        <p style={{ ...ba(13, 400, { color: textC, margin: 0 }) }}>
                            Confirm payment of <strong style={{ color: ORG }}>{formatCurrency(payConfirm.netAmount)}</strong> to <strong>{payConfirm.admin?.adminName}</strong> for {MONTHS[payConfirm.month]} {payConfirm.year}?
                        </p>
                    </div>
                )}
            </ConfirmModal>
        </div>
    );
};

export default SalaryManagement;
