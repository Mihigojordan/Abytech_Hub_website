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

const PRIMARY = 'rgb(249, 115, 22)';

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
    PAID: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatCurrency = (value) => {
    const amount = Number(value);
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

// ── Confirmation Modal helper ──
const ConfirmModal = ({ show, onClose, onConfirm, icon: Icon, iconBg, title, desc, children, btnText, btnClass }) => (
    <AnimatePresence>{show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }} className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
                <div className="flex items-start gap-5 mb-6">
                    <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}><Icon className="w-7 h-7" /></div>
                    <div><h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3><p className="text-gray-600">{desc}</p></div>
                </div>
                {children}
                <div className="flex justify-end gap-4 mt-6">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="px-7 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm} className={`px-7 py-3 text-sm font-medium text-white rounded-xl shadow-md ${btnClass}`}>{btnText}</motion.button>
                </div>
            </motion.div>
        </motion.div>
    )}</AnimatePresence>
);

// ── Form Modal Component ──
const FormModal = ({ show, isEdit, onClose, onSubmit, formData, setFormData, opLoading }) => {
    return (
        <AnimatePresence>{show && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Salary Request' : 'Request Salary'}</h2>
                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></motion.button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Month *</label>
                                <select value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Year *</label>
                                <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" /></div>
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Amount (RWF) *</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g. 500000" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                            <textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={3} placeholder="My pay date has arrived..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none" /></div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm"><span className="text-amber-700">Note: Bonus and deductions will be set by the manager when approving your request.</span></div>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm"><span className="text-gray-500">Requested Amount: </span><span className="font-bold text-gray-900">{formatCurrency(parseFloat(formData.amount) || 0)}</span></div>
                    </div>
                    <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                        <button onClick={onSubmit} disabled={!formData.amount || opLoading} className="px-6 py-3 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md disabled:opacity-50 flex items-center gap-2">
                            {opLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <DollarSign className="w-4 h-4" />}
                            {isEdit ? 'Update' : 'Submit Request'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}</AnimatePresence>
    );
};

const SalaryManagement = () => {
    const { user } = useAdminAuth();
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
    const [formData, setFormData] = useState({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), reason: '' });

    useEffect(() => { loadSalaries(); loadStats(); }, [currentPage, searchTerm, statusFilter]);

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
            await salaryService.createSalary({ amount: parseFloat(formData.amount), month: parseInt(formData.month), year: parseInt(formData.year), reason: formData.reason });
            showToast('success', 'Salary request submitted!');
            setShowCreateModal(false);
            setFormData({ amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), reason: '' });
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
        { label: 'Total', value: stats.total, icon: DollarSign, color: PRIMARY, bgColor: 'rgba(249,115,22,0.1)', gradient: 'from-orange-500 to-amber-600' },
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'rgb(234,179,8)', bgColor: 'rgba(234,179,8,0.1)', gradient: 'from-yellow-500 to-amber-600' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'rgb(59,130,246)', bgColor: 'rgba(59,130,246,0.1)', gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Paid', value: stats.paid, icon: CreditCard, color: 'rgb(34,197,94)', bgColor: 'rgba(34,197,94,0.1)', gradient: 'from-green-500 to-emerald-600' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'rgb(239,68,68)', bgColor: 'rgba(239,68,68,0.1)', gradient: 'from-red-500 to-rose-600' },
        { label: 'Paid Amount', value: formatCurrency(stats.totalPaidAmount), icon: Wallet, color: 'rgb(168,85,247)', bgColor: 'rgba(168,85,247,0.1)', gradient: 'from-purple-500 to-violet-600' },
        { label: 'Pending Amount', value: formatCurrency(stats.totalPendingAmount), icon: TrendingUp, color: 'rgb(245,158,11)', bgColor: 'rgba(245,158,11,0.1)', gradient: 'from-amber-500 to-orange-600' },
    ];

    const renderActionButtons = (s, size = 'sm') => {
        const p = size === 'sm' ? 'p-1.5' : 'p-2';
        const w = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
        return (
            <div className="flex items-center gap-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelected(s); setShowViewModal(true); }} className={`${p} text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md`} title="View"><Eye className={w} /></motion.button>
                {s.status === 'PENDING' && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => openEdit(s)} className={`${p} text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md`} title="Edit"><Edit className={w} /></motion.button>}
                {s.status === 'PENDING' && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setApproveConfirm(s)} className={`${p} text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md`} title="Approve"><CheckCircle className={w} /></motion.button>}
                {s.status === 'PENDING' && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setRejectConfirm(s)} className={`${p} text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md`} title="Reject"><XCircle className={w} /></motion.button>}
                {s.status === 'APPROVED' && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setPayConfirm(s)} className={`${p} text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md`} title="Mark Paid"><CreditCard className={w} /></motion.button>}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(s)} className={`${p} text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md`} title="Delete"><Trash2 className={w} /></motion.button>
            </div>
        );
    };

    // ── Table View ──
    const renderTableView = () => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead style={{ backgroundColor: 'rgba(249,115,22,0.05)' }}>
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500">Employee</th>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500">Period</th>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500">Amount</th>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500 hidden lg:table-cell">Net</th>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500">Status</th>
                            <th className="text-left py-4 px-6 font-semibold text-orange-500 hidden md:table-cell">Requested</th>
                            <th className="text-right py-4 px-6 font-semibold text-orange-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {salaries.map((s, i) => (
                            <motion.tr key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-medium flex items-center justify-center shrink-0">{s.admin?.adminName?.charAt(0) || '?'}</div>
                                        <div><div className="font-medium text-gray-900">{s.admin?.adminName || 'Unknown'}</div><div className="text-xs text-gray-500">{s.admin?.adminEmail}</div></div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-gray-700">{MONTHS[s.month]} {s.year}</td>
                                <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(s.amount)}</td>
                                <td className="py-4 px-6 font-medium text-gray-900 hidden lg:table-cell">{formatCurrency(s.netAmount)}</td>
                                <td className="py-4 px-6"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[s.status]?.color}`}>{STATUS_CONFIG[s.status]?.label}</span></td>
                                <td className="py-4 px-6 text-gray-600 text-sm hidden md:table-cell">{formatDate(s.createdAt)}</td>
                                <td className="py-4 px-6"><div className="flex justify-end">{renderActionButtons(s)}</div></td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ── Grid View ──
    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {salaries.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-medium flex items-center justify-center shrink-0">{s.admin?.adminName?.charAt(0) || '?'}</div>
                                <div><h3 className="font-semibold text-gray-900">{s.admin?.adminName}</h3><p className="text-xs text-gray-500">{s.admin?.adminEmail}</p></div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[s.status]?.color}`}>{STATUS_CONFIG[s.status]?.label}</span>
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between"><span className="text-gray-500">Period</span><span className="font-medium text-gray-900">{MONTHS[s.month]} {s.year}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium text-gray-900">{formatCurrency(s.amount)}</span></div>
                            {(s.bonus > 0 || s.deduction > 0) && <div className="flex justify-between"><span className="text-gray-500">Bonus / Deduction</span><span className="text-gray-700">+{formatCurrency(s.bonus)} / -{formatCurrency(s.deduction)}</span></div>}
                            <div className="flex justify-between border-t pt-2"><span className="text-gray-500 font-medium">Net</span><span className="font-bold text-gray-900">{formatCurrency(s.netAmount)}</span></div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <span>{formatDate(s.createdAt)}</span>
                            {renderActionButtons(s)}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // ── List View ──
    const renderListView = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {salaries.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-medium flex items-center justify-center shrink-0">{s.admin?.adminName?.charAt(0) || '?'}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-3 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{s.admin?.adminName}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[s.status]?.color}`}>{STATUS_CONFIG[s.status]?.label}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                                    <span>{MONTHS[s.month]} {s.year}</span>
                                    <span className="font-medium">{formatCurrency(s.netAmount)}</span>
                                    <span>{formatDate(s.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        {renderActionButtons(s, 'md')}
                    </div>
                </motion.div>
            ))}
        </div>
    );



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-100/40 to-orange-100/40 rounded-full blur-3xl -ml-24 -mb-24" />
                <div className="mx-auto px-4 sm:px-6 py-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}><Sparkles className="w-6 h-6" style={{ color: PRIMARY }} /></motion.div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-orange-500">Salary Management</h1>
                            </div>
                            <p className="text-sm text-gray-600">Request and manage monthly salary payments</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => { loadSalaries(); loadStats(); }} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600">
                                <Plus className="w-4 h-4" />Request Salary
                            </motion.button>
                            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                                {[{ mode: 'table', Icon: TableIcon }, { mode: 'grid', Icon: Grid3X3 }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                                    <motion.button key={mode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setViewMode(mode)}
                                        className={`p-2.5 rounded transition-all ${viewMode === mode ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}><Icon className="w-5 h-5" /></motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Stats — 4+3 grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.slice(0, 4).map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4, scale: 1.02 }}
                            className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group cursor-pointer">
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            <div className="relative flex items-center space-x-3">
                                <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className="p-2.5 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: stat.bgColor }}><stat.icon className="w-4 h-4" style={{ color: stat.color }} /></motion.div>
                                <div><p className="text-xs font-medium text-gray-600 mb-0.5">{stat.label}</p><p className="text-lg font-bold text-gray-900">{stat.value ?? '-'}</p></div>
                            </div>
                            <div className="absolute top-0 right-0 w-14 h-14 opacity-10 rounded-bl-full" style={{ background: stat.color }} />
                        </motion.div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {statCards.slice(4).map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 4) * 0.08 }} whileHover={{ y: -4, scale: 1.02 }}
                            className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group cursor-pointer">
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            <div className="relative flex items-center space-x-3">
                                <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className="p-2.5 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: stat.bgColor }}><stat.icon className="w-4 h-4" style={{ color: stat.color }} /></motion.div>
                                <div><p className="text-xs font-medium text-gray-600 mb-0.5">{stat.label}</p><p className="text-lg font-bold text-gray-900">{stat.value ?? '-'}</p></div>
                            </div>
                            <div className="absolute top-0 right-0 w-14 h-14 opacity-10 rounded-bl-full" style={{ background: stat.color }} />
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search by name, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative min-w-[160px]">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none bg-white cursor-pointer">
                                    <option value="">All Statuses</option>
                                    {Object.entries(STATUS_CONFIG).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                                </select>
                            </div>
                            {(statusFilter || searchTerm) && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setStatusFilter(''); setSearchTerm(''); setCurrentPage(1); }} className="px-5 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200">Clear</motion.button>}
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
                        <p className="text-gray-600 font-medium">Loading salary requests...</p>
                    </div>
                ) : salaries.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                        <DollarSign className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{searchTerm || statusFilter ? 'No matching requests' : 'No salary requests yet'}</h3>
                        <p className="text-gray-600 mb-8">{searchTerm || statusFilter ? 'Try adjusting filters' : 'Submit your first salary request'}</p>
                        {!searchTerm && !statusFilter && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium shadow-md hover:bg-orange-600">Request Salary</motion.button>}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <div className="flex items-center gap-2 bg-white px-3 py-3 rounded-xl border border-gray-200 shadow-sm">
                                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50">First</button>
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let p = currentPage - 2 + i; if (p < 1) p = 1; if (p > totalPages) p = totalPages; return (
                                            <button key={p} onClick={() => setCurrentPage(p)} className={`px-4 py-2 text-sm rounded-md ${currentPage === p ? 'bg-orange-500 text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>{p}</button>
                                        );
                                    })}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50">Last</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>{toast && (
                <motion.div initial={{ opacity: 0, y: -60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -60 }} className="fixed top-6 right-6 z-50">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-sm border ${toast.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                        <span className="font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-white/40 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                </motion.div>
            )}</AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>{opLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-5">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-14 h-14 border-4 border-t-transparent rounded-full" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
                        <span className="text-gray-700 font-medium text-lg">Processing...</span>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* Modals */}
            <FormModal show={showCreateModal} isEdit={false} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} formData={formData} setFormData={setFormData} opLoading={opLoading} />
            <FormModal show={showEditModal} isEdit={true} onClose={() => setShowEditModal(false)} onSubmit={handleUpdate} formData={formData} setFormData={setFormData} opLoading={opLoading} />

            {/* View Modal */}
            <AnimatePresence>{showViewModal && selected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 30 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center text-xl">{selected.admin?.adminName?.charAt(0) || '?'}</div>
                                <div><h2 className="text-2xl font-bold text-gray-900">{selected.admin?.adminName}</h2><p className="text-sm text-gray-500">Salary Request Details</p></div>
                            </div>
                            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowViewModal(false)} className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6" /></motion.button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Period', value: `${MONTHS[selected.month]} ${selected.year}` },
                                    { label: 'Status', value: selected.status, badge: true },
                                    { label: 'Amount', value: formatCurrency(selected.amount) },
                                    { label: 'Bonus', value: formatCurrency(selected.bonus) },
                                    { label: 'Deduction', value: formatCurrency(selected.deduction) },
                                    { label: 'Net Amount', value: formatCurrency(selected.netAmount) },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-gray-500 text-sm mb-1">{item.label}</p>
                                        {item.badge ? <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[item.value]?.color}`}>{STATUS_CONFIG[item.value]?.label}</span>
                                            : <p className="font-medium text-gray-900">{item.value}</p>}
                                    </div>
                                ))}
                            </div>
                            {selected.reason && <div><p className="text-gray-500 text-sm mb-2 font-medium">Reason</p><div className="bg-gray-50 p-4 rounded-xl text-gray-700">{selected.reason}</div></div>}
                            {selected.rejectionReason && <div><p className="text-gray-500 text-sm mb-2 font-medium">Rejection Reason</p><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">{selected.rejectionReason}</div></div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl"><p className="text-gray-500 text-sm mb-1">Requested On</p><p className="font-medium text-gray-900">{formatDate(selected.createdAt)}</p></div>
                                {selected.paidAt && <div className="bg-green-50 p-4 rounded-xl"><p className="text-green-600 text-sm mb-1">Paid On</p><p className="font-medium text-green-800">{formatDate(selected.paidAt)}</p></div>}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end"><button onClick={() => setShowViewModal(false)} className="px-8 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Close</button></div>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* Delete Confirm */}
            <ConfirmModal show={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm)} icon={AlertTriangle} iconBg="bg-gradient-to-br from-red-100 to-rose-100 text-red-600" title="Delete Request?" desc="This action cannot be undone." btnText="Delete" btnClass="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                {deleteConfirm && <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-700">Delete <strong>{deleteConfirm.admin?.adminName}</strong>'s salary request for {MONTHS[deleteConfirm.month]} {deleteConfirm.year}?</p></div>}
            </ConfirmModal>

            {/* Approve Confirm */}
            <ConfirmModal show={!!approveConfirm} onClose={() => { setApproveConfirm(null); setApproveBonus(0); setApproveDeduction(0); }} onConfirm={() => handleApprove(approveConfirm)} icon={CheckCircle} iconBg="bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600" title="Approve Salary?" desc="Set bonus/deduction and approve the request." btnText="Approve" btnClass="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                {approveConfirm && (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <p className="text-gray-700">Approving <strong>{approveConfirm.admin?.adminName}</strong>'s salary request of <strong>{formatCurrency(approveConfirm.amount)}</strong> for {MONTHS[approveConfirm.month]} {approveConfirm.year}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Bonus (RWF)</label>
                                <input type="number" value={approveBonus} onChange={e => setApproveBonus(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Deduction (RWF)</label>
                                <input type="number" value={approveDeduction} onChange={e => setApproveDeduction(e.target.value)} placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                            <span className="text-gray-500">Final Net Amount: </span>
                            <span className="font-bold text-gray-900">{formatCurrency((approveConfirm.amount || 0) + (parseFloat(approveBonus) || 0) - (parseFloat(approveDeduction) || 0))}</span>
                        </div>
                    </div>
                )}
            </ConfirmModal>

            {/* Reject Confirm */}
            <ConfirmModal show={!!rejectConfirm} onClose={() => { setRejectConfirm(null); setRejectionReason(''); }} onConfirm={() => handleReject(rejectConfirm)} icon={XCircle} iconBg="bg-gradient-to-br from-red-100 to-rose-100 text-red-600" title="Reject Salary?" desc="Provide a reason for rejection." btnText="Reject" btnClass="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} placeholder="Reason for rejection..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none" />
            </ConfirmModal>

            {/* Pay Confirm */}
            <ConfirmModal show={!!payConfirm} onClose={() => setPayConfirm(null)} onConfirm={() => handlePay(payConfirm)} icon={CreditCard} iconBg="bg-gradient-to-br from-green-100 to-emerald-100 text-green-600" title="Mark as Paid?" desc="Confirm salary payment." btnText="Mark Paid" btnClass="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                {payConfirm && <div className="bg-green-50 border border-green-200 rounded-xl p-4"><p className="text-gray-700">Confirm payment of <strong>{formatCurrency(payConfirm.netAmount)}</strong> to <strong>{payConfirm.admin?.adminName}</strong> for {MONTHS[payConfirm.month]} {payConfirm.year}?</p></div>}
            </ConfirmModal>
        </div>
    );
};

export default SalaryManagement;
