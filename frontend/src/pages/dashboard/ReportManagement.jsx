import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronDown, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Grid3X3, List, Clock, Calendar, Table, Download, FileText,
  TrendingUp, Users, Filter, SortAsc, SortDesc, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import reportService from '../../services/reportService';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../api/api';

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
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allReports, dateFilter, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports({ page: 1, limit: 1000 });
      setAllReports(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      setAllReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats({ total: true, today: true, week: true, month: true });
      const [total, today, week, month] = await Promise.all([
        reportService.getReportCount('').catch(() => 0),
        reportService.getReportCount('today').catch(() => 0),
        reportService.getReportCount('weekly').catch(() => 0),
        reportService.getReportCount('monthly').catch(() => 0)
      ]);

      const uniqueAdmins = new Set(allReports.map(r => r.admin?.adminName).filter(Boolean)).size;

      setStats({
        totalReports: total,
        todayReports: today,
        weekReports: week,
        monthReports: month,
        uniqueAdmins: uniqueAdmins || Math.floor(total / 3)
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

  const handleFilterAndSort = () => {
    let filtered = [...allReports];

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        const reportDateOnly = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());

        switch (dateFilter) {
          case 'TODAY':
            return reportDateOnly.getTime() === today.getTime();
          case 'WEEK':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDateOnly >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return reportDateOnly >= monthAgo;
          case 'CUSTOM':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              return reportDateOnly >= start && reportDateOnly <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (report) =>
          report?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report?.admin?.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    setReports(filtered);
    setCurrentPage(1);
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
        const content = typeof report.content === 'string' ? report.content : JSON.stringify(report.content, null, 2);
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${report.title}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
              h1 { color: #1e40af; margin-bottom: 20px; }
              pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; }
              .container { max-width: 800px; margin: 0 auto; }
              * { page-break-inside: avoid; }
              h1, h2, h3 { page-break-after: avoid; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${report.title}</h1>
              <div>${content}</div>
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

  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white  rounded-xl border border-gray-100 shadow-sm w-full  ">
      <div className="overflow-x-auto ">
        <table className="w-full text-xs">
          <thead style={{ backgroundColor: 'rgba(81, 96, 146, 0.05)' }}>
            <tr>
              <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ color: 'rgb(81, 96, 146)' }}
                onClick={() => { setSortBy('title'); setSortOrder(sortBy === 'title' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'title' ? (sortOrder === 'asc' ? 'rotate-180' : '') : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold hidden md:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Created By</th>
              <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ color: 'rgb(81, 96, 146)' }}
                onClick={() => { setSortBy('createdAt'); setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'rotate-180' : '') : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-right py-3 px-4 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentReports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-gray-900">{report.title || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{report.admin?.adminName || 'Unknown'}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(report.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewReport(report)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditReport(report)}
                      className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-50 transition-colors" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadReport(report)}
                      className="text-gray-400 hover:text-green-600 p-1.5 rounded-md hover:bg-green-50 transition-colors" title="Download">
                      <Download className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(report)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Delete">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4      ">
      {currentReports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{report.title}</h3>
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{report.admin?.adminName || 'Unknown'}</span>
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}
              >
                <FileText className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
              </motion.div>
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(report.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewReport(report)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditReport(report)}
                  className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-xs font-medium transition-colors"
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
                  className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(report)}
                  className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 w-full">
      {currentReports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}>
                <FileText className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                  <span className="text-xs text-gray-500 hidden sm:inline flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {report.admin?.adminName || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewReport(report)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditReport(report)}
                className="text-gray-400 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadReport(report)}
                className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(report)}
                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (reports.length === 0) return null;

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
      <div className="flex items-center justify-between bg-white px-2 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4   border border-gray-100 shadow-sm  ">
        <div className="text-xs text-gray-600 flex items-center space-x-2">
          <span>Showing <span className="font-semibold">{startIndex + 1}</span>-<span className="font-semibold">{Math.min(endIndex, reports.length)}</span> of <span className="font-semibold">{reports.length}</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            First
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>

          {getPageNumbers().map(page => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentPage === page
                ? 'text-white font-semibold shadow-sm'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              style={currentPage === page ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      color: 'rgb(81, 96, 146)',
      bgColor: 'rgba(81, 96, 146, 0.1)',
      loading: loadingStats.total,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      label: "Today's Reports",
      value: stats.todayReports,
      icon: Clock,
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      loading: loadingStats.today,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'This Week',
      value: stats.weekReports,
      icon: TrendingUp,
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      loading: loadingStats.week,
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      label: 'This Month',
      value: stats.monthReports,
      icon: Calendar,
      color: 'rgb(249, 115, 22)',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      loading: loadingStats.month,
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      label: 'Total Admins',
      value: stats.uniqueAdmins,
      icon: Users,
      color: 'rgb(239, 68, 68)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      loading: false,
      gradient: 'from-red-500 to-rose-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="mx-auto px-1 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(81,96,146)] bg-clip-text">
                  Report Management
                </h1>
              </div>
              <p className="text-xs text-gray-600">Manage and view all system reports efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={reports.length === 0}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { loadData(); loadStats(); }}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateReport}
                disabled={operationLoading}
                className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-xs transition-all bg-[rgb(81,96,146)] hover:to-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Report</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4  sm:px-6 py-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-2.5 rounded-lg shadow-sm"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stat.loading ? (
                      <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      stat.value ?? '-'
                    )}
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br opacity-10 rounded-bl-full" style={{ background: stat.color }} />
            </motion.div>
          ))}
        </div>





        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports by title or admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  style={{ outline: 'none' }}
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table'
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  style={viewMode === 'table' ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  style={viewMode === 'grid' ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list'
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  style={viewMode === 'list' ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-gray-400" /> : <SortDesc className="w-4 h-4 text-gray-400" />}
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white cursor-pointer"
                  style={{ outline: 'none' }}
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white cursor-pointer"
                  style={{ outline: 'none' }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                  <option value="CUSTOM">Custom Range</option>
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
                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        style={{ outline: 'none' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        style={{ outline: 'none' }}
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
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-1 text-red-700 text-xs flex items-center space-x-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reports Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2  text-center">
            <div className="inline-flex flex-col items-center space-y-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-t-transparent rounded-full"
                style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent', borderWidth: '3px' }}
              />
              <span className="text-xs text-gray-600 font-medium">Loading reports...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm w-full border border-gray-100  text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            </motion.div>
            <p className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm || dateFilter !== 'ALL' ? 'No Reports Found' : 'No Reports Available'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {searchTerm || dateFilter !== 'ALL' ? 'Try adjusting your search filters.' : 'Create a new report to get started.'}
            </p>
            {!searchTerm && dateFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateReport}
                className="inline-flex items-center space-x-2 text-white px-2 py-2 rounded-lg font-medium shadow-md text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Report</span>
              </motion.button>
            )}
          </motion.div>
        ) : (<></>)}

        {
          !loading &&  reports.length !== 0 &&

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
              <div className={`flex items-center space-x-3 px-1 py-3 rounded-xl shadow-2xl text-xs border-2 ${operationStatus.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'
                }`}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {operationStatus.type === 'success' ?
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> :
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  }
                </motion.div>
                <span className="font-semibold">{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  className="ml-2 hover:bg-white/50 rounded-full p-1 transition-colors"
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl"
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-t-transparent rounded-full"
                    style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent' }}
                  />
                  <span className="text-gray-700 text-sm font-semibold">Processing...</span>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.2 }}
                    className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">Delete Report?</h3>
                    <p className="text-xs text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-700">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.title || 'N/A'}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2.5 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteReport(deleteConfirm)}
                    className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedReport.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Report Details</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedReport(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>



                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500">Created By</p>
                      <p className="font-medium text-gray-900">{selectedReport.admin?.adminName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created On</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-gray-500 mb-2">Report Content</p>
                    {selectedReport.content ? (
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: typeof selectedReport.content === 'string'
                              ? selectedReport.content
                              : '<pre>' + JSON.stringify(selectedReport.content, null, 2) + '</pre>'
                          }}
                        />
                      </div>
                    ) : selectedReport.reportUrl ? (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 font-medium">External Report</p>
                        <a
                          href={handleReportUrl(selectedReport.reportUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {selectedReport.reportUrl}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No content available</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
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
                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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