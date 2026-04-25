import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Star, StarOff, Phone, Mail, MapPin, FileText,
  CheckCircle, XCircle, AlertCircle, Clock, User, Briefcase, GraduationCap,
  Sparkles, Filter, Download, LayoutGrid, List, Table2, ChevronsLeft, ChevronsRight,
  Calendar, ExternalLink, Loader2, Table as TableIcon, Grid3X3, UserCheck, UserX,
  AlertTriangle, Send, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import internshipService from '../../services/internshipService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',    color: null },
  REVIEWING: { label: 'Reviewing',  color: null },
  ACCEPTED:  { label: 'Accepted',   color: null },
  REJECTED:  { label: 'Rejected',   color: null },
  WAITLISTED:{ label: 'Waitlisted', color: null },
};

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development' },
  UI_UX:                { label: 'UI/UX Design' },
  DATA:                 { label: 'Data' },
  MARKETING:            { label: 'Marketing' },
  IT_SUPPORT:           { label: 'IT Support' },
  OTHER:                { label: 'Other' },
};

const PERIOD_CONFIG = {
  ONE_MONTH:    '1 Month',
  THREE_MONTHS: '3 Months',
  SIX_MONTHS:   '6 Months',
  ONE_YEAR:     '1 Year',
};

/* ── helpers ─────────────────────────────────────── */
const statusBadgeStyle = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return { background: 'rgba(74,222,128,.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
    case 'REVIEWING':
    case 'PENDING':
      return { background: `rgba(232,98,26,.15)`, color: ORG, border: `1px solid rgba(232,98,26,.3)`, borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
    case 'REJECTED':
      return { background: 'rgba(232,64,64,.15)', color: '#e84040', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
    case 'WAITLISTED':
      return { background: 'rgba(168,85,247,.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
    default:
      return { background: 'rgba(200,200,200,.15)', color: '#999', border: '1px solid rgba(200,200,200,.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
  }
};

const typeBadgeStyle = (type) => {
  const colors = {
    SOFTWARE_DEVELOPMENT: { bg: 'rgba(59,130,246,.15)', color: '#60a5fa' },
    UI_UX:                { bg: 'rgba(236,72,153,.15)',  color: '#f472b6' },
    DATA:                 { bg: 'rgba(99,102,241,.15)',  color: '#818cf8' },
    MARKETING:            { bg: `rgba(232,98,26,.15)`,   color: ORG },
    IT_SUPPORT:           { bg: 'rgba(20,184,166,.15)',  color: '#2dd4bf' },
    OTHER:                { bg: 'rgba(156,163,175,.15)', color: '#9ca3af' },
  };
  const c = colors[type] || colors.OTHER;
  return { background: c.bg, color: c.color, border: `1px solid ${c.color}33`, borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 };
};

const InternshipManagement = () => {
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
  const [acceptConfirm, setAcceptConfirm] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

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

  const handleAcceptIntern = async (application) => {
    setAcceptLoading(true);
    try {
      await internshipService.updateApplicationStatus(application.id, 'ACCEPTED');
      showOperationMessage('success', `${application.fullName} has been accepted as an intern and moved to Intern Management.`);
      setAcceptConfirm(null);
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to accept intern');
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleRejectIntern = async (application) => {
    setRejectLoading(true);
    try {
      await internshipService.updateApplicationStatus(application.id, 'REJECTED');
      showOperationMessage('success', `${application.fullName}'s application has been rejected`);
      setRejectConfirm(null);
      loadApplications();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to reject application');
    } finally {
      setRejectLoading(false);
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
    { label: 'Total',      value: stats.total,      icon: User,         iconColor: ORG,               iconBg: 'rgba(232,98,26,.1)' },
    { label: 'Pending',    value: stats.pending,     icon: Clock,        iconColor: 'rgb(234,179,8)',   iconBg: 'rgba(234,179,8,.1)' },
    { label: 'Reviewing',  value: stats.reviewing,   icon: Eye,          iconColor: 'rgb(59,130,246)',  iconBg: 'rgba(59,130,246,.1)' },
    { label: 'Accepted',   value: stats.accepted,    icon: CheckCircle,  iconColor: '#4ade80',          iconBg: 'rgba(74,222,128,.1)' },
    { label: 'Rejected',   value: stats.rejected,    icon: XCircle,      iconColor: '#e84040',          iconBg: 'rgba(232,64,64,.1)' },
    { label: 'Waitlisted', value: stats.waitlisted,  icon: AlertCircle,  iconColor: 'rgb(168,85,247)',  iconBg: 'rgba(168,85,247,.1)' },
    { label: 'Shortlisted',value: stats.shortlisted, icon: Star,         iconColor: 'rgb(245,158,11)',  iconBg: 'rgba(245,158,11,.1)' },
  ];

  /* ── action button style helper ─────────────────── */
  const actionBtn = { background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text2, cursor: 'pointer' };

  // ────────────────────────────────────────────────
  // View Renderers
  // ────────────────────────────────────────────────

  const renderTableView = () => (
    <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: bg3 }}>
            <tr>
              {['Applicant', 'Type', 'Period', 'Status', 'Score', 'Applied', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`text-left py-4 px-6 ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 4 ? 'hidden lg:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}
                  style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{ background: bg2, borderBottom: '1px solid ' + border }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = bg2}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-medium"
                      style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', color: ORG }}>
                      {app.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2" style={{ color: textC, fontWeight: 600 }}>
                        {app.fullName}
                        {app.isShortlisted && <Star className="w-4 h-4" style={{ color: 'rgb(245,158,11)', fill: 'rgb(245,158,11)' }} />}
                      </div>
                      <div style={{ ...ba(12, 400, { color: text2 }) }}>{app.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 hidden md:table-cell">
                  <span style={typeBadgeStyle(app.internshipType)}>
                    {TYPE_CONFIG[app.internshipType]?.label || app.internshipType}
                  </span>
                </td>
                <td className="py-4 px-6" style={{ color: text2 }}>{PERIOD_CONFIG[app.period] || app.period || '—'}</td>
                <td className="py-4 px-6">
                  <span style={statusBadgeStyle(app.status)}>{STATUS_CONFIG[app.status]?.label || app.status}</span>
                </td>
                <td className="py-4 px-6 hidden lg:table-cell" style={{ color: textC, fontWeight: 500 }}>
                  {app.score ? `${app.score}/10` : '—'}
                </td>
                <td className="py-4 px-6" style={{ color: text2, fontSize: 13 }}>{formatDate(app.createdAt)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleShortlist(app.id)}
                      style={{ ...actionBtn, color: app.isShortlisted ? 'rgb(245,158,11)' : text2 }}
                      title={app.isShortlisted ? 'Remove from Shortlist' : 'Shortlist'}>
                      {app.isShortlisted ? <Star className="w-4 h-4" style={{ fill: 'currentColor' }} /> : <StarOff className="w-4 h-4" />}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/admin/dashboard/internships/view/${app.id}`)}
                      style={actionBtn} title="View Details">
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                      style={actionBtn} title="Review / Edit">
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    {app.status !== 'ACCEPTED' && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setAcceptConfirm(app)}
                        style={{ ...actionBtn, color: '#4ade80' }} title="Accept Intern">
                        <UserCheck className="w-4 h-4" />
                      </motion.button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setRejectConfirm(app)}
                        style={{ ...actionBtn, color: '#e84040' }} title="Reject Application">
                        <UserX className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(app)}
                      style={{ ...actionBtn, color: '#e84040' }} title="Delete">
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
          style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20, position: 'relative', overflow: 'hidden', cursor: 'default' }}
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-lg"
                  style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', color: ORG }}>
                  {app.fullName?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="truncate font-semibold" style={{ color: textC }}>{app.fullName}</h3>
                    {app.isShortlisted && <Star className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(245,158,11)', fill: 'rgb(245,158,11)' }} />}
                  </div>
                  <p className="truncate" style={{ ...ba(12, 400, { color: text2 }) }}>{app.email}</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleShortlist(app.id)}
                style={{ ...actionBtn, color: app.isShortlisted ? 'rgb(245,158,11)' : text2 }}>
                {app.isShortlisted ? <Star className="w-4 h-4" style={{ fill: 'currentColor' }} /> : <StarOff className="w-4 h-4" />}
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span style={typeBadgeStyle(app.internshipType)}>
                {TYPE_CONFIG[app.internshipType]?.label || app.internshipType}
              </span>
              <span style={statusBadgeStyle(app.status)}>
                {STATUS_CONFIG[app.status]?.label || app.status}
              </span>
            </div>

            <div className="space-y-2 mb-4" style={{ ...ba(13, 400, { color: text2 }) }}>
              {app.institution && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" style={{ color: ORG }} />
                  <span className="truncate">{app.institution}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: ORG }} />
                <span>{PERIOD_CONFIG[app.period] || app.period || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: text2 }}>Score:</span>
                <span style={{ color: textC, fontWeight: 600 }}>{app.score ? `${app.score}/10` : '—'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid ' + border }}>
              <span style={{ ...ba(12, 400, { color: text3 }) }}>{formatDate(app.createdAt)}</span>
              <div className="flex items-center gap-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/dashboard/internships/view/${app.id}`)}
                  style={actionBtn} title="View">
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                  style={actionBtn} title="Review/Edit">
                  <Edit className="w-4 h-4" />
                </motion.button>
                {app.status !== 'ACCEPTED' && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setAcceptConfirm(app)}
                    style={{ ...actionBtn, color: '#4ade80' }} title="Accept Intern">
                    <UserCheck className="w-4 h-4" />
                  </motion.button>
                )}
                {app.status !== 'REJECTED' && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setRejectConfirm(app)}
                    style={{ ...actionBtn, color: '#e84040' }} title="Reject Application">
                    <UserX className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(app)}
                  style={{ ...actionBtn, color: '#e84040' }} title="Delete">
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
    <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
      {applications.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          style={{ padding: 20, borderBottom: '1px solid ' + border, background: bg2 }}
          onMouseEnter={e => e.currentTarget.style.background = bg3}
          onMouseLeave={e => e.currentTarget.style.background = bg2}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-lg"
                style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', color: ORG }}>
                {app.fullName?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1.5">
                  <h3 className="font-semibold truncate" style={{ color: textC }}>{app.fullName}</h3>
                  {app.isShortlisted && <Star className="w-4 h-4" style={{ color: 'rgb(245,158,11)', fill: 'rgb(245,158,11)' }} />}
                  <span style={statusBadgeStyle(app.status)}>{STATUS_CONFIG[app.status]?.label || app.status}</span>
                  <span style={typeBadgeStyle(app.internshipType)}>{TYPE_CONFIG[app.internshipType]?.label || app.internshipType}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ ...ba(12, 400, { color: text2 }) }}>
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
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/dashboard/internships/view/${app.id}`)}
                style={actionBtn} title="View">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedApplication(app); setReviewData({ score: app.score || 0, reviewNotes: app.reviewNotes || '', status: app.status }); setShowReviewModal(true); }}
                style={actionBtn} title="Review/Edit">
                <Edit className="w-4 h-4" />
              </motion.button>
              {app.status !== 'ACCEPTED' && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setAcceptConfirm(app)}
                  style={{ ...actionBtn, color: '#4ade80' }} title="Accept Intern">
                  <UserCheck className="w-4 h-4" />
                </motion.button>
              )}
              {app.status !== 'REJECTED' && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setRejectConfirm(app)}
                  style={{ ...actionBtn, color: '#e84040' }} title="Reject Application">
                  <UserX className="w-4 h-4" />
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(app)}
                style={{ ...actionBtn, color: '#e84040' }} title="Delete">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  /* ── shared input style ──────────────────────────── */
  const inputStyle = { background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', padding: '10px 16px 10px 44px', width: '100%', fontSize: 14 };
  const selectStyle = { background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, padding: '10px 16px 10px 44px', fontSize: 14, appearance: 'none', cursor: 'pointer', width: '100%' };

  return (
    <div className="min-h-screen" style={{ background: bg }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={{ background: bg2, borderBottom: '1px solid ' + border }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: 8 }}>
                  <GraduationCap className="w-5 h-5" style={{ color: ORG }} />
                </div>
                <h1 style={{ ...bb(32, { color: ORG }) }}>Internship Applications</h1>
              </div>
              <p style={{ ...ba(13, 400, { color: text2 }) }}>Review and manage incoming internship applications</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadApplications}
                disabled={loading}
                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              {/* View toggle */}
              <div className="flex items-center" style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 4, gap: 2 }}>
                {[
                  { mode: 'table', Icon: TableIcon, label: 'Table View' },
                  { mode: 'grid',  Icon: Grid3X3,   label: 'Grid View' },
                  { mode: 'list',  Icon: List,       label: 'List View' },
                ].map(({ mode, Icon, label }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      background: viewMode === mode ? ORG : 'transparent',
                      color: viewMode === mode ? '#fff' : text2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stat Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.slice(0, 4).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <div className="flex items-center gap-3">
                <div style={{ background: stat.iconBg, border: `1px solid ${stat.iconColor}33`, borderRadius: 4, padding: 10, flexShrink: 0 }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, marginBottom: 2 }) }}>{stat.label}</p>
                  <p style={{ ...bb(28, { color: ORG, lineHeight: 1 }) }}>{stat.value ?? '-'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {statCards.slice(4).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 4) * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <div className="flex items-center gap-3">
                <div style={{ background: stat.iconBg, border: `1px solid ${stat.iconColor}33`, borderRadius: 4, padding: 10, flexShrink: 0 }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, marginBottom: 2 }) }}>{stat.label}</p>
                  <p style={{ ...bb(28, { color: ORG, lineHeight: 1 }) }}>{stat.value ?? '-'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filters & Search ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 3, height: 18, background: ORG, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Search & Filters</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: text2 }} />
              <input
                type="text"
                placeholder="Search by name, email, institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: text2, cursor: 'pointer', display: 'flex' }}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative" style={{ minWidth: 180 }}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="w-5 h-5" style={{ color: text2 }} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="relative" style={{ minWidth: 180 }}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="w-5 h-5" style={{ color: text2 }} />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={selectStyle}
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
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}
                >
                  Clear Filters
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Error Message ───────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: '12px 16px', color: '#e84040', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content ────────────────────────────── */}
        {loading ? (
          <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 48, textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid ' + border, borderTopColor: ORG, margin: '0 auto 16px' }}
            />
            <p style={{ color: text2, fontWeight: 500 }}>Loading internship applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 64, textAlign: 'center' }}
          >
            <GraduationCap className="w-20 h-20 mx-auto mb-6" style={{ color: text3 }} />
            <h3 style={{ ...bb(28, { color: textC, marginBottom: 12 }) }}>
              {searchTerm || statusFilter || typeFilter ? 'No matching applications' : 'No internship applications yet'}
            </h3>
            <p style={{ ...ba(14, 400, { color: text2, maxWidth: 400, margin: '0 auto 32px' }) }}>
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your search or filters'
                : 'New applications will appear here once candidates apply'}
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid'  && renderGridView()}
            {viewMode === 'list'  && renderListView()}

            {/* ── Pagination ───────────────────────── */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex items-center gap-2" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: '8px 12px' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: '6px 14px', fontSize: 13, cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}>
                    First
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: '6px 10px', fontSize: 13, cursor: 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex' }}>
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
                        style={{
                          background: currentPage === page ? ORG : bg3,
                          border: '1px solid ' + (currentPage === page ? ORG : border),
                          borderRadius: 4,
                          color: currentPage === page ? '#fff' : text2,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: currentPage === page ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {page}
                      </motion.button>
                    );
                  })}

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: '6px 10px', fontSize: 13, cursor: 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex' }}>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: '6px 14px', fontSize: 13, cursor: 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}>
                    Last
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Toast Notification ──────────────────────── */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            className="fixed top-6 right-6 z-50"
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 4,
              background: operationStatus.type === 'success' ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)',
              border: `1px solid ${operationStatus.type === 'success' ? 'rgba(74,222,128,.4)' : 'rgba(232,64,64,.4)'}`,
              color: operationStatus.type === 'success' ? '#4ade80' : '#e84040',
              fontSize: 13, fontWeight: 500,
            }}>
              {operationStatus.type === 'success'
                ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                : <XCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{operationStatus.message}</span>
              <button onClick={() => setOperationStatus(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8, display: 'flex' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading Overlay ─────────────────────────── */}
      <AnimatePresence>
        {operationLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid ' + border, borderTopColor: ORG }}
              />
              <span style={{ color: textC, fontWeight: 500, fontSize: 16 }}>Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 28, width: '100%', maxWidth: 440 }}
            >
              <div className="flex items-start gap-5 mb-6">
                <div style={{ width: 56, height: 56, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle className="w-7 h-7" style={{ color: '#e84040' }} />
                </div>
                <div>
                  <h3 style={{ ...bb(24, { color: textC, marginBottom: 6 }) }}>Delete Application?</h3>
                  <p style={{ color: text2, fontSize: 13 }}>This action cannot be undone.</p>
                </div>
              </div>

              <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
                <p style={{ color: text2, fontSize: 13 }}>
                  Are you sure you want to delete{' '}
                  <span style={{ color: textC, fontWeight: 700 }}>{deleteConfirm.fullName}'s application</span>?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{ background: '#e84040', border: 'none', borderRadius: 4, color: '#fff', padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Delete Application
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accept Confirmation Modal ────────────────── */}
      <AnimatePresence>
        {acceptConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 28, width: '100%', maxWidth: 440 }}
            >
              <div className="flex items-start gap-5 mb-6">
                <div style={{ width: 56, height: 56, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck className="w-7 h-7" style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <h3 style={{ ...bb(24, { color: textC, marginBottom: 6 }) }}>Accept Intern?</h3>
                  <p style={{ color: text2, fontSize: 13 }}>This will admit the applicant as an intern. Employee conversion is a separate super-admin action.</p>
                </div>
              </div>

              <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 4, padding: 16, marginBottom: 24 }}>
                <p style={{ color: text2, fontSize: 13, marginBottom: 10 }}>
                  You are about to accept{' '}
                  <span style={{ color: textC, fontWeight: 700 }}>{acceptConfirm.fullName}</span> as an intern.
                </p>
                <div className="flex items-start gap-2" style={{ color: '#4ade80', fontSize: 12 }}>
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>The applicant will remain in intern management until a super-admin converts them to an employee</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setAcceptConfirm(null)} disabled={acceptLoading}
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '10px 24px', fontSize: 13, cursor: 'pointer', opacity: acceptLoading ? 0.5 : 1 }}>
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: acceptLoading ? 1 : 1.02 }}
                  whileTap={{ scale: acceptLoading ? 1 : 0.98 }}
                  onClick={() => handleAcceptIntern(acceptConfirm)}
                  disabled={acceptLoading}
                  style={{ background: ORG, border: 'none', borderRadius: 4, color: '#fff', padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: acceptLoading ? 0.7 : 1 }}>
                  {acceptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Accept Intern
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Confirmation Modal ────────────────── */}
      <AnimatePresence>
        {rejectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 28, width: '100%', maxWidth: 440 }}
            >
              <div className="flex items-start gap-5 mb-6">
                <div style={{ width: 56, height: 56, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserX className="w-7 h-7" style={{ color: '#e84040' }} />
                </div>
                <div>
                  <h3 style={{ ...bb(24, { color: textC, marginBottom: 6 }) }}>Reject Application?</h3>
                  <p style={{ color: text2, fontSize: 13 }}>This will mark the application as rejected.</p>
                </div>
              </div>

              <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
                <p style={{ color: text2, fontSize: 13 }}>
                  Are you sure you want to reject{' '}
                  <span style={{ color: textC, fontWeight: 700 }}>{rejectConfirm.fullName}'s</span> internship application?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setRejectConfirm(null)} disabled={rejectLoading}
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '10px 24px', fontSize: 13, cursor: 'pointer', opacity: rejectLoading ? 0.5 : 1 }}>
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: rejectLoading ? 1 : 1.02 }}
                  whileTap={{ scale: rejectLoading ? 1 : 0.98 }}
                  onClick={() => handleRejectIntern(rejectConfirm)}
                  disabled={rejectLoading}
                  style={{ background: '#e84040', border: 'none', borderRadius: 4, color: '#fff', padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: rejectLoading ? 0.7 : 1 }}>
                  {rejectLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      Reject Application
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Application Modal ───────────────────── */}
      <AnimatePresence>
        {showViewModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 768, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid ' + border }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 56, height: 56, borderRadius: 4, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {selectedApplication.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 style={{ ...bb(28, { color: textC }) }}>{selectedApplication.fullName}</h2>
                    <p style={{ ...ba(12, 400, { color: text2, marginTop: 2 }) }}>Internship Application Details</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowViewModal(false)}
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: 10, cursor: 'pointer', display: 'flex' }}>
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Status', content: (
                      <div className="flex flex-wrap gap-2">
                        <span style={statusBadgeStyle(selectedApplication.status)}>{STATUS_CONFIG[selectedApplication.status]?.label || selectedApplication.status}</span>
                        {selectedApplication.isShortlisted && (
                          <span style={{ background: 'rgba(245,158,11,.15)', color: 'rgb(245,158,11)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Shortlisted</span>
                        )}
                      </div>
                    )},
                    { label: 'Type', content: (
                      <span style={typeBadgeStyle(selectedApplication.internshipType)}>{TYPE_CONFIG[selectedApplication.internshipType]?.label || selectedApplication.internshipType}</span>
                    )},
                    { label: 'Period', content: (
                      <span style={{ color: textC, fontWeight: 500 }}>{PERIOD_CONFIG[selectedApplication.period] || selectedApplication.period || '—'}</span>
                    )},
                  ].map(({ label, content }) => (
                    <div key={label} style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
                      <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 8 }) }}>{label}</p>
                      {content}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Email', value: selectedApplication.email, show: true },
                    { label: 'Phone', value: selectedApplication.phone, show: !!selectedApplication.phone },
                    { label: 'Institution', value: selectedApplication.institution, show: !!selectedApplication.institution },
                    { label: 'Applied On', value: formatDate(selectedApplication.createdAt), show: true },
                  ].filter(f => f.show).map(({ label, value }) => (
                    <div key={label} style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
                      <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 6 }) }}>{label}</p>
                      <p style={{ color: textC, fontWeight: 500, wordBreak: 'break-all' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 8 }) }}>Cover Letter</p>
                    <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16, color: text2, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13 }}>
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}

                {selectedApplication.reviewNotes && (
                  <div>
                    <p style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 8 }) }}>Review Notes</p>
                    <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 16, color: text2, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13 }}>
                      {selectedApplication.reviewNotes}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {selectedApplication.cvUrl && (
                    <a
                      href={selectedApplication.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 4, color: '#60a5fa', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.3)', borderRadius: 4, color: '#a855f7', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
                    >
                      <Briefcase className="w-5 h-5" />
                      Portfolio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid ' + border, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                <div className="flex gap-3">
                  {selectedApplication.status !== 'ACCEPTED' && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowViewModal(false); setAcceptConfirm(selectedApplication); }}
                      style={{ background: ORG, border: 'none', borderRadius: 4, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserCheck className="w-5 h-5" />
                      Accept
                    </motion.button>
                  )}
                  {selectedApplication.status !== 'REJECTED' && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowViewModal(false); setRejectConfirm(selectedApplication); }}
                      style={{ background: '#e84040', border: 'none', borderRadius: 4, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserX className="w-5 h-5" />
                      Reject
                    </motion.button>
                  )}
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowViewModal(false)}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '10px 28px', fontSize: 13, cursor: 'pointer' }}>
                    Close
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setReviewData({ score: selectedApplication.score || 0, reviewNotes: selectedApplication.reviewNotes || '', status: selectedApplication.status });
                      setShowReviewModal(true);
                    }}
                    style={{ background: ORG, border: 'none', borderRadius: 4, color: '#fff', padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Review / Edit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showReviewModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 520 }}
            >
              {/* Review Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid ' + border }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 3, height: 20, background: ORG, borderRadius: 2 }} />
                  <h2 style={{ ...bb(28, { color: textC }) }}>Review Application</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReviewModal(false)}
                  style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, padding: 10, cursor: 'pointer', display: 'flex' }}>
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div style={{ padding: 24 }} className="space-y-5">
                <div>
                  <label style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 8 }) }}>Score (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={reviewData.score}
                    onChange={(e) => setReviewData({ ...reviewData, score: Number(e.target.value) || 0 })}
                    style={{ background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', padding: '10px 16px', width: '100%', fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 8 }) }}>Status</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    style={{ background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, padding: '10px 16px', fontSize: 14, width: '100%', appearance: 'none' }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 8 }) }}>Review Notes</label>
                  <textarea
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                    rows={5}
                    placeholder="Detailed feedback, strengths, areas for improvement..."
                    style={{ background: bg3, border: '1px solid ' + border, color: textC, borderRadius: 4, outline: 'none', padding: '10px 16px', width: '100%', fontSize: 14, resize: 'none' }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, padding: '10px 28px', fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    style={{ background: ORG, border: 'none', borderRadius: 4, color: '#fff', padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
