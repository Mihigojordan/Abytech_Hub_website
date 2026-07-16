import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Grid3X3, List, Clock, Calendar, Table, Download, FileText,
  TrendingUp, Users, Filter, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import reportService from '../../services/reportService';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../api/api';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// Helper function to handle reportUrl
function handleReportUrl(reportUrl) {
  if (!reportUrl) return null;
  const trimmedUrl = reportUrl.trim();
  if (trimmedUrl.includes('://')) return trimmedUrl;
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl;
  return baseUrl + path;
}

async function downloadFile(url, fileName) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'downloaded-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

const ReportDashboard = () => {
  const { user, hasPermission, permissions, isSuperAdmin } = useAdminAuth();
  const hasReportPermission = hasPermission('report_management');
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    weekReports: 0,
    monthReports: 0,
    uniqueAdmins: 0
  });
  const [loadingStats, setLoadingStats] = useState({
    total: false,
    today: false,
    week: false,
    month: false
  });
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load data when filters/pagination change or permissions change
  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, debouncedSearch, dateFilter, startDate, endDate, permissions, isSuperAdmin]);

  // Load stats on mount and when permissions change
  useEffect(() => {
    loadStats();
  }, [permissions, isSuperAdmin]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFilter, startDate, endDate, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Map date filter to backend format
      let filter = '';
      if (dateFilter === 'TODAY') filter = 'today';
      else if (dateFilter === 'WEEK') filter = 'weekly';
      else if (dateFilter === 'MONTH') filter = 'monthly';
      else if (dateFilter === 'CUSTOM') filter = 'custom';

      const response = await reportService.getAllReports({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        filter,
        from: dateFilter === 'CUSTOM' ? startDate : '',
        to: dateFilter === 'CUSTOM' ? endDate : '',
      });

      setReports(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalReports(response.pagination?.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats({ total: true, today: true, week: true, month: true });
      const [totalRes, todayRes, weekRes, monthRes] = await Promise.all([
        reportService.getAllReports({ page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        reportService.getAllReports({ page: 1, limit: 1, filter: 'today' }).catch(() => ({ pagination: { total: 0 } })),
        reportService.getAllReports({ page: 1, limit: 1, filter: 'weekly' }).catch(() => ({ pagination: { total: 0 } })),
        reportService.getAllReports({ page: 1, limit: 1, filter: 'monthly' }).catch(() => ({ pagination: { total: 0 } })),
      ]);

      setStats({
        totalReports: totalRes.pagination?.total || 0,
        todayReports: todayRes.pagination?.total || 0,
        weekReports: weekRes.pagination?.total || 0,
        monthReports: monthRes.pagination?.total || 0,
        uniqueAdmins: new Set((totalRes.data || []).map(r => r.admin?.adminName).filter(Boolean)).size || 0
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats({ total: false, today: false, week: false, month: false });
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleCreateReport = () => {
    navigate('/admin/dashboard/report/create');
  };

  const handleEditReport = (report) => {
    if (!report?.id) return;
    navigate(`/admin/dashboard/report/edit/${report.id}`);
  };

  const handleViewReport = (report) => {
    if (!report?.id) return;
    navigate(`/admin/dashboard/report/view/${report?.id}`)
  };

  const handleDeleteReport = async (report) => {
    if (!report?.id) {
      showOperationStatus('error', 'Invalid report ID');
      return;
    }
    try {
      setOperationLoading(true);
      // await reportService.deleteReport(report.id);
      setDeleteConfirm(null);
      await loadData();
      await loadStats();
      showOperationStatus('success', `${report.title} deleted successfully!`);
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to delete report');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDownloadReport = async (report) => {
    if (!report?.id) {
      showOperationStatus('error', 'Invalid report ID');
      return;
    }

    try {
      setOperationLoading(true);

      if (report.content) {
        const content = (() => {
          let c = typeof report.content === 'string' ? report.content : JSON.stringify(report.content, null, 2);
          try { const p = JSON.parse(c); if (typeof p === 'string') c = p; } catch {}
          return c;
        })();
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .swal-preview-container .ql-editor {
            padding: 1rem;
          }
          .swal-preview-container .ql-editor h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 0.67em;
            margin-bottom: 0.67em;
          }
          .swal-preview-container .ql-editor h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.83em;
            margin-bottom: 0.83em;
          }
          .swal-preview-container .ql-editor h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor ul,
          .swal-preview-container .ql-editor ol {
            padding-left: 1.5em;
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor ul {
            list-style-type: disc;
          }
          .swal-preview-container .ql-editor ol {
            list-style-type: decimal;
          }
          .swal-preview-container .ql-editor li {
            margin-bottom: 0.5em;
          }
          .swal-preview-container .ql-editor p {
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor strong {
            font-weight: bold;
          }
          .swal-preview-container .ql-editor em {
            font-style: italic;
          }
          .swal-preview-container .ql-editor blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1em;
            margin-left: 0;
            font-style: italic;
          }
          .ql-container {
            min-height: 400px;
          }
          .ql-editor {
            min-height: 400px;
          }
          .text-left { text-align: left; }
        </style>
      </head>
      <body>
        <div class="swal-preview-container text-left">
          <div class="ql-editor">
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;

        const options = {
          margin: 15,
          filename: `${report.title}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        await html2pdf().set(options).from(element).save();
        showOperationStatus('success', 'Report downloaded successfully!');
      } else if (report.reportUrl) {
        const fullUrl = handleReportUrl(report.reportUrl);
        if (!fullUrl) {
          showOperationStatus('error', 'Invalid report URL');
          return;
        }
        await downloadFile(fullUrl, report.title || 'report');
        showOperationStatus('success', 'Report downloaded successfully!');
      } else {
        showOperationStatus('error', 'No report content available');
      }
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to download report');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Created By', 'Created Date'],
      ...reports.map(report => [
        report.title,
        report.admin?.adminName || 'Unknown',
        formatDate(report.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showOperationStatus('success', 'Reports exported successfully!');
  };

  // A report is "scheduled" (owner-only visibility) while its date/time is still in the future
  const isScheduled = (report) => report?.createdAt && new Date(report.createdAt) > new Date();

  const ScheduledBadge = () => (
    <span
      title="Only visible to you until this date/time arrives"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
        borderRadius: 4, background: 'rgba(232,98,26,.12)', border: '1px solid rgba(232,98,26,.3)',
        ...bc(9, 700, { color: ORG, letterSpacing: 1, textTransform: 'uppercase' }),
      }}
    >
      <Clock className="w-3 h-3" /> Scheduled
    </span>
  );

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-GB');
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? new Date().toLocaleDateString('en-GB')
      : parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  };

  // Server-side pagination - reports are already paginated
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalReports);
  const currentReports = reports; // Already paginated from server

  const renderTableView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ background: bg3 }}>
            <tr>
              <th className="text-left py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Title</th>
              <th className="text-left py-3 px-4 hidden md:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Created By</th>
              <th className="text-left py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Created</th>
              <th className="text-right py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ background: bg2, borderBottom: `1px solid ${border}`, cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = bg2}
              >
                <td className="py-3 px-4" style={ba(12, 600, { color: textC })}>
                  <div className="flex items-center gap-2">
                    <span>{report.title || 'N/A'}</span>
                    {report.adminId === user?.id && isScheduled(report) && <ScheduledBadge />}
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell" style={ba(12, 400, { color: text2 })}>{report.admin?.adminName || 'Unknown'}</td>
                <td className="py-3 px-4" style={ba(12, 400, { color: text2 })}>{formatDate(report.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewReport(report)}
                      style={{ color: text3, padding: 6, borderRadius: 4, background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.color = textC; e.currentTarget.style.background = bg3; }}
                      onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                      title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditReport(report)}
                      style={{ color: text3, padding: 6, borderRadius: 4, background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.color = ORG; e.currentTarget.style.background = bg3; }}
                      onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                      title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadReport(report)}
                      style={{ color: text3, padding: 6, borderRadius: 4, background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.color = TEAL; e.currentTarget.style.background = bg3; }}
                      onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                      title="Download">
                      <Download className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(report)}
                      style={{ color: text3, padding: 6, borderRadius: 4, background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e84040'; e.currentTarget.style.background = bg3; }}
                      onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                      title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
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

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentReports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20, position: 'relative', overflow: 'hidden' }}
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h3 className="mb-1 line-clamp-2 leading-snug" style={ba(13, 600, { color: textC })}>{report.title}</h3>
                {report.adminId === user?.id && isScheduled(report) && (
                  <div className="mb-1"><ScheduledBadge /></div>
                )}
                <p className="flex items-center space-x-1" style={ba(11, 400, { color: text2 })}>
                  <Users className="w-3 h-3" />
                  <span>{report.admin?.adminName || 'Unknown'}</span>
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}
              >
                <FileText className="w-5 h-5" style={{ color: ORG }} />
              </motion.div>
            </div>

            <div className="flex items-center mb-4 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
              <Calendar className="w-3 h-3 mr-1" style={{ color: text3 }} />
              <span style={ba(11, 400, { color: text2 })}>{formatDate(report.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewReport(report)}
                  style={{ ...ba(11, 500, { color: text2 }), display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 4, background: bg3, border: 'none', cursor: 'pointer' }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditReport(report)}
                  style={{ ...ba(11, 500, { color: ORG }), display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 4, background: bg3, border: 'none', cursor: 'pointer' }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </motion.button>
              </div>
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadReport(report)}
                  style={{ color: TEAL, padding: 8, borderRadius: 4, background: bg3, border: 'none', cursor: 'pointer' }}
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(report)}
                  style={{ color: '#e84040', padding: 8, borderRadius: 4, background: bg3, border: 'none', cursor: 'pointer' }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      {currentReports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          style={{ padding: 16, borderBottom: `1px solid ${border}`, background: bg2 }}
          onMouseEnter={e => e.currentTarget.style.background = bg3}
          onMouseLeave={e => e.currentTarget.style.background = bg2}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                <FileText className="w-5 h-5" style={{ color: ORG }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 style={ba(13, 600, { color: textC })}>{report.title}</h3>
                  <span className="hidden sm:inline flex items-center" style={ba(11, 400, { color: text2 })}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(report.createdAt)}
                  </span>
                  {report.adminId === user?.id && isScheduled(report) && <ScheduledBadge />}
                </div>
                <p className="flex items-center" style={ba(11, 400, { color: text2 })}>
                  <Users className="w-3 h-3 mr-1" />
                  {report.admin?.adminName || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewReport(report)}
                style={{ color: text3, padding: 8, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = textC; e.currentTarget.style.background = bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                title="View">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditReport(report)}
                style={{ color: text3, padding: 8, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = ORG; e.currentTarget.style.background = bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                title="Edit">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadReport(report)}
                style={{ color: text3, padding: 8, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; e.currentTarget.style.background = bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                title="Download">
                <Download className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(report)}
                style={{ color: text3, padding: 8, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e84040'; e.currentTarget.style.background = bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = text3; e.currentTarget.style.background = 'transparent'; }}
                title="Delete">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalReports === 0) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(totalPages, startPage + showPages - 1);

      if (endPage - startPage < showPages - 1) {
        startPage = Math.max(1, endPage - showPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-2 py-3 mt-4"
        style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
        <div className="flex items-center space-x-2" style={ba(11, 400, { color: text2 })}>
          <span>Showing <span style={{ fontWeight: 600 }}>{startIndex + 1}</span>–<span style={{ fontWeight: 600 }}>{endIndex}</span> of <span style={{ fontWeight: 600 }}>{totalReports}</span>
            {!hasReportPermission && <span style={{ color: ORG, marginLeft: 4 }}>(Your reports only)</span>}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{ ...ba(11, 400, { color: text2 }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
          >
            First
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, color: text2, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>

          {getPageNumbers().map(page => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              style={
                currentPage === page
                  ? { background: ORG, color: '#fff', borderRadius: 4, padding: '4px 10px', border: 'none', cursor: 'pointer', ...bc(11, 600) }
                  : { background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 10px', color: text2, cursor: 'pointer', ...ba(11, 400) }
              }
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, color: text2, display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{ ...ba(11, 400, { color: text2 }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
          >
            Last
          </motion.button>
        </div>
      </div>
    );
  };

  const statCards = [
    {
      label: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      loading: loadingStats.total,
    },
    {
      label: "Today's Reports",
      value: stats.todayReports,
      icon: Clock,
      loading: loadingStats.today,
    },
    {
      label: 'This Week',
      value: stats.weekReports,
      icon: TrendingUp,
      loading: loadingStats.week,
    },
    {
      label: 'This Month',
      value: stats.monthReports,
      icon: Calendar,
      loading: loadingStats.month,
    },
    {
      label: 'Total Admins',
      value: stats.uniqueAdmins,
      icon: Users,
      loading: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-1 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                </motion.div>
                <h1 style={bc(20, 700, { color: ORG, letterSpacing: 1 })}>
                  Report Management
                </h1>
              </div>
              <p style={ba(11, 400, { color: text2 })}>Manage and view all system reports efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={reports.length === 0}
                style={{ ...ba(11, 500, { color: text2 }), display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: reports.length === 0 ? 'not-allowed' : 'pointer', opacity: reports.length === 0 ? 0.5 : 1 }}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { loadData(); loadStats(); }}
                disabled={loading}
                style={{ ...ba(11, 500, { color: text2 }), display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateReport}
                disabled={operationLoading}
                style={{ ...ba(11, 600, { color: '#fff' }), display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: ORG, border: 'none', borderRadius: 4, cursor: operationLoading ? 'not-allowed' : 'pointer', opacity: operationLoading ? 0.7 : 1 }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Report</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: 10, flexShrink: 0 }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: ORG }} />
                </motion.div>
                <div className="flex-1">
                  <p style={bc(10, 700, { letterSpacing: 3, color: text2, textTransform: 'uppercase', marginBottom: 2 })}>{stat.label}</p>
                  <p style={bb(32, { color: ORG, lineHeight: 1 })}>
                    {stat.loading ? (
                      <span className="inline-block w-8 h-4 rounded animate-pulse" style={{ background: bg3 }} />
                    ) : (
                      stat.value ?? '-'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20 }}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: text3 }} />
                <input
                  type="text"
                  placeholder="Search reports by title or admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5"
                  style={{ ...ba(11, 400, { color: textC }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, outline: 'none' }}
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: text3, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              <div className="flex items-center space-x-1 p-1" style={{ background: bg3, borderRadius: 4 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  style={viewMode === 'table'
                    ? { background: ORG, color: '#fff', padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }
                    : { background: 'transparent', color: text2, padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  style={viewMode === 'grid'
                    ? { background: ORG, color: '#fff', padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }
                    : { background: 'transparent', color: text2, padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  style={viewMode === 'list'
                    ? { background: ORG, color: '#fff', padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }
                    : { background: 'transparent', color: text2, padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer' }}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4" style={{ color: text3 }} />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 appearance-none cursor-pointer"
                  style={{ ...ba(11, 400, { color: textC }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, outline: 'none' }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                  <option value="CUSTOM">Custom Range</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Clock className="w-4 h-4" style={{ color: text3 }} />
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 appearance-none cursor-pointer"
                  style={{ ...ba(11, 400, { color: textC }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, outline: 'none' }}
                >
                  <option value={9}>9 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={30}>30 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
              {dateFilter === 'CUSTOM' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-3 p-4" style={{ background: bg3, borderRadius: 4, border: `1px solid ${border}` }}>
                    <div className="flex-1">
                      <label className="flex items-center mb-2" style={bc(10, 600, { color: text2, letterSpacing: 1 })}>
                        <Calendar className="w-3 h-3 mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5"
                        style={{ ...ba(11, 400, { color: textC }), background: bg2, border: `1px solid ${border}`, borderRadius: 4, outline: 'none' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center mb-2" style={bc(10, 600, { color: text2, letterSpacing: 1 })}>
                        <Calendar className="w-3 h-3 mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5"
                        style={{ ...ba(11, 400, { color: textC }), background: bg2, border: `1px solid ${border}`, borderRadius: 4, outline: 'none' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3"
              style={{ background: 'rgba(232,64,64,.08)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, color: '#e84040' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span style={ba(11, 600, { color: '#e84040' })}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reports Content */}
        {loading ? (
          <div className="text-center p-8" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
            <div className="inline-flex flex-col items-center space-y-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full"
                style={{ border: `3px solid ${border}`, borderTopColor: ORG }}
              />
              <span style={ba(11, 500, { color: text2 })}>Loading reports...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-10 w-full"
            style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
            </motion.div>
            <p className="mb-2" style={bc(16, 700, { color: textC })}>
              {searchTerm || dateFilter !== 'ALL' ? 'No Reports Found' : 'No Reports Available'}
            </p>
            <p className="mb-4" style={ba(11, 400, { color: text2 })}>
              {searchTerm || dateFilter !== 'ALL' ? 'Try adjusting your search filters.' : 'Create a new report to get started.'}
            </p>
            {!searchTerm && dateFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateReport}
                style={{ ...ba(11, 600, { color: '#fff' }), display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Report</span>
              </motion.button>
            )}
          </motion.div>
        ) : (<></>)}

        {
          !loading && reports.length !== 0 &&

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderCardView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </motion.div>
        }

        {/* Operation Status Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50"
            >
              <div
                className="flex items-center space-x-3 px-4 py-3"
                style={{
                  background: operationStatus.type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(232,64,64,.12)',
                  border: `2px solid ${operationStatus.type === 'success' ? 'rgba(34,197,94,.4)' : 'rgba(232,64,64,.4)'}`,
                  borderRadius: 4,
                  color: operationStatus.type === 'success' ? '#22c55e' : '#e84040',
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {operationStatus.type === 'success' ?
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} /> :
                    <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#e84040' }} />
                  }
                </motion.div>
                <span style={ba(11, 600)}>{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, borderRadius: '50%' }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Operation Loading Overlay */}
        <AnimatePresence>
          {operationLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-40"
              style={{ background: 'rgba(0,0,0,.75)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="p-8"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full"
                    style={{ border: `4px solid ${border}`, borderTopColor: ORG }}
                  />
                  <span style={ba(13, 600, { color: textC })}>Processing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
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
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-md p-6"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
              >
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.2 }}
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(232,64,64,.12)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4 }}
                  >
                    <AlertTriangle className="w-6 h-6" style={{ color: '#e84040' }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 style={bc(15, 700, { color: textC, marginBottom: 4 })}>Delete Report?</h3>
                    <p style={ba(11, 400, { color: text2 })}>This action cannot be undone</p>
                  </div>
                </div>
                <div className="p-4 mb-6" style={{ background: bg3, borderRadius: 4 }}>
                  <p style={ba(11, 400, { color: text2 })}>
                    Are you sure you want to delete <span style={{ fontWeight: 700, color: textC }}>"{deleteConfirm.title || 'N/A'}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    style={{ ...ba(11, 600, { color: textC }), padding: '8px 20px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteReport(deleteConfirm)}
                    style={{ ...ba(11, 600, { color: '#fff' }), padding: '8px 20px', background: '#e84040', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    Delete Report
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Report Modal */}
        <AnimatePresence>
          {showViewModal && selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.75)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-3xl p-6 max-h-[90vh] overflow-hidden flex flex-col"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                      <FileText className="w-5 h-5" style={{ color: ORG }} />
                    </div>
                    <div>
                      <h3 style={bc(14, 700, { color: textC })}>{selectedReport.title}</h3>
                      <p style={ba(11, 400, { color: text2, marginTop: 2 })}>Report Details</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedReport(null);
                    }}
                    style={{ color: text3, padding: 8, borderRadius: 4, background: bg3, border: 'none', cursor: 'pointer' }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p style={ba(11, 400, { color: text2, marginBottom: 4 })}>Created By</p>
                      <p style={ba(12, 600, { color: textC })}>{selectedReport.admin?.adminName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p style={ba(11, 400, { color: text2, marginBottom: 4 })}>Created On</p>
                      <p style={ba(12, 600, { color: textC })}>{formatDate(selectedReport.createdAt)}</p>
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderTop: `1px solid ${border}` }}>
                    <p style={ba(11, 400, { color: text2, marginBottom: 8 })}>Report Content</p>
                    {selectedReport.content ? (
                      <div className="p-4 max-h-96 overflow-y-auto" style={{ background: bg3, borderRadius: 4 }}>
                        <div
                          className="prose prose-sm max-w-none"
                          style={{ color: textC }}
                          dangerouslySetInnerHTML={{
                            __html: typeof selectedReport.content === 'string'
                              ? selectedReport.content
                              : '<pre>' + JSON.stringify(selectedReport.content, null, 2) + '</pre>'
                          }}
                        />
                      </div>
                    ) : selectedReport.reportUrl ? (
                      <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                        <p style={ba(12, 600, { color: TEAL, marginBottom: 4 })}>External Report</p>
                        <a
                          href={handleReportUrl(selectedReport.reportUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={ba(11, 400, { color: ORG })}
                        >
                          {selectedReport.reportUrl}
                        </a>
                      </div>
                    ) : (
                      <p style={ba(11, 400, { color: text3, fontStyle: 'italic' })}>No content available</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadReport(selectedReport)}
                    style={{ ...ba(11, 500, { color: TEAL }), display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedReport(null);
                    }}
                    style={{ ...ba(11, 500, { color: textC }), padding: '7px 14px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportDashboard;
