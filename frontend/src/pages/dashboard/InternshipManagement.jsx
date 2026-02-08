import React, { useState, useEffect } from 'react';
import {
  Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Star, StarOff, Phone, Mail, MapPin, FileText,
  CheckCircle, XCircle, AlertCircle, Clock, User, Briefcase, GraduationCap,
  Sparkles, Filter, Download, LayoutGrid, List, Table2, ChevronsLeft, ChevronsRight,
  Calendar, ExternalLink, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import internshipService from '../../services/internshipService';

const PRIMARY_COLOR = 'rgb(81, 96, 146)';
const PRIMARY_LIGHT = 'rgba(81, 96, 146, 0.1)';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
  WAITLISTED: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500' },
};

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development', color: 'bg-blue-100 text-blue-700' },
  UI_UX: { label: 'UI/UX Design', color: 'bg-pink-100 text-pink-700' },
  DATA: { label: 'Data', color: 'bg-indigo-100 text-indigo-700' },
  MARKETING: { label: 'Marketing', color: 'bg-orange-100 text-orange-700' },
  IT_SUPPORT: { label: 'IT Support', color: 'bg-teal-100 text-teal-700' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

const PERIOD_CONFIG = {
  ONE_MONTH: '1 Month',
  THREE_MONTHS: '3 Months',
  SIX_MONTHS: '6 Months',
  ONE_YEAR: '1 Year',
};

const InternshipManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewData, setReviewData] = useState({ score: 0, reviewNotes: '', status: 'REVIEWING' });
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0, waitlisted: 0, shortlisted: 0 });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter, itemsPerPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await internshipService.getAllApplications({
        page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter, internshipType: typeFilter,
      });
      setApplications(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await internshipService.getApplicationStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleShortlist = async (id) => {
    try {
      await internshipService.toggleShortlist(id);
      showToast('success', 'Shortlist updated');
      loadApplications();
      loadStats();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await internshipService.updateApplicationStatus(id, status);
      showToast('success', 'Status updated');
      loadApplications();
      loadStats();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await internshipService.reviewApplication(selectedApplication.id, reviewData);
      showToast('success', 'Review submitted');
      setShowReviewModal(false);
      loadApplications();
      loadStats();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await internshipService.deleteApplication(id);
      showToast('success', 'Application deleted');
      loadApplications();
      loadStats();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Institution', 'Type', 'Period', 'Status', 'Score', 'Applied Date'];
    const rows = applications.map(app => [
      app.fullName, app.email, app.phone || '', app.institution || '',
      TYPE_CONFIG[app.internshipType]?.label || app.internshipType,
      PERIOD_CONFIG[app.period] || app.period,
      STATUS_CONFIG[app.status]?.label || app.status,
      app.score || '', formatDate(app.createdAt)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `internship_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('success', 'Exported successfully');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  const activeFiltersCount = [statusFilter, typeFilter].filter(Boolean).length;

  const statCards = [
    { label: 'Total', value: stats.total, icon: User, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Reviewing', value: stats.reviewing, icon: Eye, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, gradient: 'from-red-500 to-rose-500' },
    { label: 'Waitlisted', value: stats.waitlisted, icon: Clock, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: Star, gradient: 'from-yellow-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-6 left-1/2 z-50">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50 text-white' : 'bg-red-500/90 border-red-400/50 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, rgb(100, 120, 180) 100%)` }}>
            {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" /> */}
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Sparkles className="w-6 h-6 text-white" /></div>
                  <h1 className="text-3xl font-bold text-white">Internship Applications</h1>
                </div>
                <p className="text-white/80 text-lg">Manage and review internship applications</p>
              </div>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all font-medium">
                <Download className="w-5 h-5" /> Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, gradient }, index) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4, scale: 1.02 }} className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters || activeFiltersCount > 0 ? 'text-white border-transparent' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`} style={showFilters || activeFiltersCount > 0 ? { backgroundColor: PRIMARY_COLOR } : {}}>
              <Filter className="w-5 h-5" /> Filters {activeFiltersCount > 0 && <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">{activeFiltersCount}</span>}
            </button>
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {[{ mode: 'table', icon: Table2 }, { mode: 'grid', icon: LayoutGrid }, { mode: 'list', icon: List }].map(({ mode, icon: Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`p-2.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            <button onClick={loadApplications} disabled={loading} className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-6 mt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <option value="">All Status</option>
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <option value="">All Types</option>
                      {Object.entries(TYPE_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="w-full px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all font-medium">Clear Filters</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: PRIMARY_COLOR }} />
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="font-medium">{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <GraduationCap className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No applications found</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100" style={{ backgroundColor: PRIMARY_LIGHT }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Applicant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Applied</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app, index) => (
                    <motion.tr key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: PRIMARY_COLOR }}>{app.fullName?.charAt(0)}</div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">{app.fullName} {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${TYPE_CONFIG[app.internshipType]?.color || 'bg-gray-100 text-gray-700'}`}>{TYPE_CONFIG[app.internshipType]?.label || app.internshipType}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{PERIOD_CONFIG[app.period] || app.period || '-'}</td>
                      <td className="px-6 py-4">
                        <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer ${STATUS_CONFIG[app.status]?.color}`}>
                          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">{app.score ? <span className="font-medium">{app.score}/10</span> : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleToggleShortlist(app.id)} className={`p-2 rounded-lg transition-all ${app.isShortlisted ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                            {app.isShortlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { setSelectedApplication(app); setShowViewModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(app.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {applications.map((app, index) => (
                <motion.div key={app.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PRIMARY_COLOR }}>{app.fullName?.charAt(0)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">{app.fullName} {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}</h3>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${TYPE_CONFIG[app.internshipType]?.color}`}>{TYPE_CONFIG[app.internshipType]?.label}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[app.status]?.color}`}>{STATUS_CONFIG[app.status]?.label}</span>
                    </div>
                    {app.institution && <div className="flex items-center gap-2 text-sm text-gray-600"><GraduationCap className="w-4 h-4" /><span className="truncate">{app.institution}</span></div>}
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" /><span>{PERIOD_CONFIG[app.period] || app.period}</span></div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatDate(app.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleShortlist(app.id)} className={`p-2 rounded-lg transition-all ${app.isShortlisted ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}>{app.isShortlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}</button>
                      <button onClick={() => { setSelectedApplication(app); setShowViewModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(app.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app, index) => (
                <motion.div key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PRIMARY_COLOR }}>{app.fullName?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{app.fullName}</h3>
                          {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[app.status]?.color}`}>{STATUS_CONFIG[app.status]?.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{app.email}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_CONFIG[app.internshipType]?.color}`}>{TYPE_CONFIG[app.internshipType]?.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedApplication(app); setShowViewModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(app.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"><ChevronsLeft className="w-5 h-5" /></button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <span className="px-4 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"><ChevronRight className="w-5 h-5" /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"><ChevronsRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedApplication && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: PRIMARY_COLOR }}>{selectedApplication.fullName?.charAt(0)}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedApplication.status]?.color}`}>{STATUS_CONFIG[selectedApplication.status]?.label}</span>
                      {selectedApplication.isShortlisted && <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">Shortlisted</span>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><Mail className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{selectedApplication.email}</span></div>
                  {selectedApplication.phone && <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><Phone className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{selectedApplication.phone}</span></div>}
                  {selectedApplication.country && <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><MapPin className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{selectedApplication.city}, {selectedApplication.country}</span></div>}
                  {selectedApplication.institution && <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><GraduationCap className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{selectedApplication.institution}</span></div>}
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div><label className="text-sm font-medium text-gray-500">Type</label><p className="text-gray-900 font-medium mt-1">{TYPE_CONFIG[selectedApplication.internshipType]?.label}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">Period</label><p className="text-gray-900 font-medium mt-1">{PERIOD_CONFIG[selectedApplication.period] || '-'}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">Field of Study</label><p className="text-gray-900 font-medium mt-1">{selectedApplication.fieldOfStudy || '-'}</p></div>
                  <div><label className="text-sm font-medium text-gray-500">Level</label><p className="text-gray-900 font-medium mt-1">{selectedApplication.level || '-'}</p></div>
                </div>
                {selectedApplication.skills?.length > 0 && (
                  <div><label className="text-sm font-medium text-gray-500 mb-2 block">Skills</label><div className="flex flex-wrap gap-2">{selectedApplication.skills.map((skill, i) => <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">{skill}</span>)}</div></div>
                )}
                {selectedApplication.coverLetter && <div><label className="text-sm font-medium text-gray-500 mb-2 block">Cover Letter</label><p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">{selectedApplication.coverLetter}</p></div>}
                <div className="flex flex-wrap gap-3">
                  {selectedApplication.cvUrl && <a href={selectedApplication.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"><FileText className="w-4 h-4" /> View CV <ExternalLink className="w-3 h-3" /></a>}
                  {selectedApplication.portfolioUrl && <a href={selectedApplication.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all"><Briefcase className="w-4 h-4" /> Portfolio <ExternalLink className="w-3 h-3" /></a>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedApplication && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Score (0-10)</label><input type="number" min="0" max="10" value={reviewData.score} onChange={(e) => setReviewData({ ...reviewData, score: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={reviewData.status} onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">{Object.entries(STATUS_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label><textarea value={reviewData.reviewNotes} onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none" placeholder="Add your review notes..." /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowReviewModal(false)} className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all">Cancel</button>
                  <button onClick={handleReviewSubmit} className="flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>Submit Review</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InternshipManagement;
