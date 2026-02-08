import React, { useState, useEffect } from 'react';
import {
  Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Star, StarOff, Phone, Mail, MapPin, FileText,
  CheckCircle, XCircle, AlertCircle, Clock, User, Briefcase, GraduationCap,
  Sparkles, Filter, Download, LayoutGrid, List, Table2, ChevronsLeft, ChevronsRight,
  Calendar, ExternalLink, Loader2, Table as TableIcon, Grid3X3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import internshipService from '../../services/internshipService';

const PRIMARY_COLOR = 'rgb(81, 96, 146)';
const PRIMARY_LIGHT = 'rgba(81, 96, 146, 0.1)';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  WAITLISTED: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  UI_UX: { label: 'UI/UX Design', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  DATA: { label: 'Data', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  MARKETING: { label: 'Marketing', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  IT_SUPPORT: { label: 'IT Support', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
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
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [viewMode, setViewMode] = useState('grid'); // 'table', 'grid', 'list'
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewData, setReviewData] = useState({ score: 0, reviewNotes: '', status: 'REVIEWING' });
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0, waitlisted: 0, shortlisted: 0 });
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter, itemsPerPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await internshipService.getAllApplications({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        internshipType: typeFilter,
      });
      setApplications(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
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

  const showOperationMessage = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleToggleShortlist = async (id) => {
    setOperationLoading(true);
    try {
      await internshipService.toggleShortlist(id);
      showOperationMessage('success', 'Shortlist status updated');
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to update shortlist');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setOperationLoading(true);
    try {
      await internshipService.updateApplicationStatus(id, status);
      showOperationMessage('success', 'Application status updated');
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to update status');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setOperationLoading(true);
    try {
      await internshipService.reviewApplication(selectedApplication.id, reviewData);
      showOperationMessage('success', 'Review submitted successfully');
      setShowReviewModal(false);
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to submit review');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (application) => {
    setOperationLoading(true);
    try {
      await internshipService.deleteApplication(application.id);
      showOperationMessage('success', `"${application.fullName}'s application" deleted`);
      setDeleteConfirm(null);
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to delete application');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Institution', 'Type', 'Period', 'Status', 'Score', 'Applied Date'];
    const rows = applications.map(app => [
      app.fullName,
      app.email,
      app.phone || '',
      app.institution || '',
      TYPE_CONFIG[app.internshipType]?.label || app.internshipType,
      PERIOD_CONFIG[app.period] || app.period,
      STATUS_CONFIG[app.status]?.label || app.status,
      app.score || '',
      formatDate(app.createdAt)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c?.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `internship_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showOperationMessage('success', 'Applications exported to CSV');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  const activeFiltersCount = [statusFilter, typeFilter].filter(Boolean).length;

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: User, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Reviewing', value: stats.reviewing, icon: Eye, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, gradient: 'from-red-500 to-rose-600' },
    { label: 'Waitlisted', value: stats.waitlisted, icon: Clock, gradient: 'from-purple-500 to-pink-600' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: Star, gradient: 'from-yellow-500 to-amber-600' },
  ];

  // ────────────────────────────────────────────────
  // View Renderers
  // ────────────────────────────────────────────────

  const renderTableView = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'rgba(81, 96, 146, 0.05)' }}>
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)]">Applicant</th>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)] hidden md:table-cell">Type</th>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)]">Period</th>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)]">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)] hidden lg:table-cell">Score</th>
              <th className="text-left py-4 px-6 font-semibold text-[rgb(81,96,146)]">Applied</th>
              <th className="text-right py-4 px-6 font-semibold text-[rgb(81,96,146)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app, index) => (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgb(81,96,146)] text-white font-medium flex items-center justify-center flex-shrink-0">
                      {app.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {app.fullName}
                        {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="text-xs text-gray-500">{app.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 hidden md:table-cell">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[app.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {TYPE_CONFIG[app.internshipType]?.label || app.internshipType}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{PERIOD_CONFIG[app.period] || app.period || '—'}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[app.status]?.color}`}>
                    {STATUS_CONFIG[app.status]?.label}
                  </span>
                </td>
                <td className="py-4 px-6 hidden lg:table-cell">
                  {app.score ? <span className="font-medium">{app.score}/10</span> : '—'}
                </td>
                <td className="py-4 px-6 text-gray-600 text-sm">{formatDate(app.createdAt)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleShortlist(app.id)}
                      className={`p-1.5 rounded-md transition-colors ${app.isShortlisted ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                      title={app.isShortlisted ? "Remove from Shortlist" : "Shortlist"}
                    >
                      {app.isShortlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedApplication(app); setShowViewModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                      title="Review / Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(app)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {applications.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-40 group-hover:opacity-70 transition-opacity" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-[rgb(81,96,146)] text-white font-medium flex items-center justify-center flex-shrink-0">
                  {app.fullName?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{app.fullName}</h3>
                    {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{app.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggleShortlist(app.id)}
                  className={`p-1.5 rounded-md ${app.isShortlisted ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                >
                  {app.isShortlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[app.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {TYPE_CONFIG[app.internshipType]?.label || app.internshipType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[app.status]?.color}`}>
                {STATUS_CONFIG[app.status]?.label}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {app.institution && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="truncate">{app.institution}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{PERIOD_CONFIG[app.period] || app.period || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Score:</span>
                <span>{app.score ? `${app.score}/10` : '—'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span>{formatDate(app.createdAt)}</span>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedApplication(app); setShowViewModal(true); }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(app)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {applications.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          className="p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[rgb(81,96,146)] text-white font-medium flex items-center justify-center flex-shrink-0">
                {app.fullName?.charAt(0) || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1.5">
                  <h3 className="font-semibold text-gray-900 truncate">{app.fullName}</h3>
                  {app.isShortlisted && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[app.status]?.color}`}>
                    {STATUS_CONFIG[app.status]?.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[app.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {TYPE_CONFIG[app.internshipType]?.label || app.internshipType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{app.email}</span>
                  </div>
                  {app.institution && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span className="truncate">{app.institution}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{PERIOD_CONFIG[app.period] || app.period || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedApplication(app); setShowViewModal(true); }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                title="Review/Edit"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(app)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-3xl -ml-24 -mb-24" />
        <div className="mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(81,96,146)]">Internship Applications</h1>
              </div>
              <p className="text-sm text-gray-600">Review and manage incoming internship applications</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadApplications}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'table' ? 'bg-[rgb(81,96,146)] text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                  title="Table View"
                >
                  <TableIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'grid' ? 'bg-[rgb(81,96,146)] text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'list' ? 'bg-[rgb(81,96,146)] text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative p-5 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 rounded-xl shadow-sm"
                  style={{ backgroundColor: PRIMARY_LIGHT }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
                </motion.div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[180px]">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 appearance-none bg-white cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 appearance-none bg-white cursor-pointer"
                >
                  <option value="">All Types</option>
                  {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {(statusFilter || typeFilter || searchTerm) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-5 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: PRIMARY_COLOR, borderTopColor: 'transparent' }}
            />
            <p className="text-gray-600 font-medium">Loading internship applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center"
          >
            <GraduationCap className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm || statusFilter || typeFilter ? 'No matching applications' : 'No internship applications yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your search or filters'
                : 'New applications will appear here once candidates apply'}
            </p>
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
                  >
                    First
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = currentPage - 2 + i;
                    if (page < 1) page = 1;
                    if (page > totalPages) page = totalPages;
                    return (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm rounded-md ${
                          currentPage === page
                            ? 'bg-[rgb(81,96,146)] text-white font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
                  >
                    Last
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            className="fixed top-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-sm border ${
                operationStatus.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'
              }`}
            >
              {operationStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{operationStatus.message}</span>
              <button
                onClick={() => setOperationStatus(null)}
                className="ml-2 p-1 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {operationLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-5"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 border-4 border-t-transparent rounded-full"
                style={{ borderColor: PRIMARY_COLOR, borderTopColor: 'transparent' }}
              />
              <span className="text-gray-700 font-medium text-lg">Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-start gap-5 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Application?</h3>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{deleteConfirm.fullName}'s application</span>?
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-7 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-7 py-3 text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 shadow-md transition-all"
                >
                  Delete Application
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Application Modal */}
      <AnimatePresence>
        {showViewModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[rgb(81,96,146)] text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
                    {selectedApplication.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName}</h2>
                    <p className="text-sm text-gray-500 mt-1">Internship Application Details</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowViewModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="text-gray-500 mb-1 text-sm">Status</p>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${STATUS_CONFIG[selectedApplication.status]?.color}`}>
                      {STATUS_CONFIG[selectedApplication.status]?.label}
                    </span>
                    {selectedApplication.isShortlisted && (
                      <span className="inline-block ml-2 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        Shortlisted
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="text-gray-500 mb-1 text-sm">Type</p>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${TYPE_CONFIG[selectedApplication.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {TYPE_CONFIG[selectedApplication.internshipType]?.label || selectedApplication.internshipType}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="text-gray-500 mb-1 text-sm">Period</p>
                    <p className="font-medium text-gray-900">{PERIOD_CONFIG[selectedApplication.period] || selectedApplication.period || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="text-gray-500 mb-1 text-sm">Email</p>
                    <p className="font-medium text-gray-900 break-all">{selectedApplication.email}</p>
                  </div>

                  {selectedApplication.phone && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <p className="text-gray-500 mb-1 text-sm">Phone</p>
                      <p className="font-medium text-gray-900">{selectedApplication.phone}</p>
                    </div>
                  )}

                  {selectedApplication.institution && (
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <p className="text-gray-500 mb-1 text-sm">Institution</p>
                      <p className="font-medium text-gray-900">{selectedApplication.institution}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <p className="text-gray-500 mb-1 text-sm">Applied On</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <p className="text-gray-500 mb-2 text-sm font-medium">Cover Letter</p>
                    <div className="bg-gray-50 p-5 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}

                {selectedApplication.reviewNotes && (
                  <div>
                    <p className="text-gray-500 mb-2 text-sm font-medium">Review Notes</p>
                    <div className="bg-gray-50 p-5 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.reviewNotes}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {selectedApplication.cvUrl && (
                    <a
                      href={selectedApplication.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                    >
                      <FileText className="w-5 h-5" />
                      View CV
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {selectedApplication.portfolioUrl && (
                    <a
                      href={selectedApplication.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium"
                    >
                      <Briefcase className="w-5 h-5" />
                      Portfolio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowViewModal(false)}
                  className="px-8 py-3 text-base font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowViewModal(false);
                    setReviewData({ score: selectedApplication.score || 0, reviewNotes: selectedApplication.reviewNotes || '', status: selectedApplication.status });
                    setShowReviewModal(true);
                  }}
                  className="px-8 py-3 text-base font-medium bg-[rgb(81,96,146)] text-white rounded-xl hover:bg-[rgb(60,75,120)] shadow-md transition-all"
                >
                  Review / Edit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Review Application</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReviewModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Score (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={reviewData.score}
                    onChange={(e) => setReviewData({ ...reviewData, score: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 transition-all text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 appearance-none bg-white text-base"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Review Notes</label>
                  <textarea
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                    rows={5}
                    placeholder="Detailed feedback, strengths, areas for improvement..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[rgb(81,96,146)] focus:ring-2 focus:ring-[rgb(81,96,146)]/20 transition-all resize-none text-base"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-8 py-3 text-base font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    className="px-8 py-3 text-base font-medium bg-[rgb(81,96,146)] text-white rounded-xl hover:bg-[rgb(60,75,120)] shadow-md transition-all"
                  >
                    Submit Review
                  </button>
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