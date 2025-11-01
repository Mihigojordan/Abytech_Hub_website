import React, { useState, useEffect } from 'react';
import { Calendar, Grid3x3, List, Search, Eye, FileText, TrendingUp, Clock, Users, Plus, ChevronLeft, ChevronRight, Edit, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../../api/api';

// Helper function to handle reportUrl
function handleReportUrl(reportUrl) {
  if (!reportUrl) return null;
  const trimmedUrl = reportUrl.trim();
  if (trimmedUrl.includes('://')) return trimmedUrl; // handles https:// or http://
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl;
  return baseUrl + path;
}

async function downloadFile(url, fileName) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
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
    Swal.fire('Error', 'Failed to download report from URL', 'error');
  }
}

const ReportDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalReports: null,
    todayReports: null,
    weekReports: null,
    monthReports: null,
    uniqueAdmins: null
  });
  const [loadingStats, setLoadingStats] = useState({
    total: false,
    today: false,
    week: false,
    month: false
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Set initial state from URL params
  useEffect(() => {
    const initialView = searchParams.get('view') || 'grid';
    const initialLimit = Number(searchParams.get('limit')) || (initialView === 'grid' ? 9 : 10);
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialSearch = searchParams.get('search') || '';
    const initialFilter = searchParams.get('filter') || 'all';
    const initialFrom = searchParams.get('from') || '';
    const initialTo = searchParams.get('to') || '';

    setViewMode(initialView);
    setItemsPerPage(initialLimit);
    setCurrentPage(initialPage);
    setSearchTerm(initialSearch);
    setFilterType(initialFilter);
    setCustomStartDate(initialFrom);
    setCustomEndDate(initialTo);
    setShowCustomFilter(initialFilter === 'custom');
  }, []);

  // Sync URL params when states change
  useEffect(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('view', viewMode);
      params.set('limit', itemsPerPage.toString());
      params.set('page', currentPage.toString());
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      if (filterType !== 'all') {
        params.set('filter', filterType);
      } else {
        params.delete('filter');
      }
      if (filterType === 'custom') {
        if (customStartDate) {
          params.set('from', customStartDate);
        } else {
          params.delete('from');
        }
        if (customEndDate) {
          params.set('to', customEndDate);
        } else {
          params.delete('to');
        }
      } else {
        params.delete('from');
        params.delete('to');
      }
      return params;
    });
  }, [viewMode, itemsPerPage, currentPage, searchTerm, filterType, customStartDate, customEndDate, setSearchParams]);

  // Fetch reports with server-side pagination, search, and filters
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm.trim(),
        };
        // Add filter parameters
        if (filterType && filterType !== 'all') {
          params.filter = filterType;
          
          if (filterType === 'custom' && customStartDate && customEndDate) {
            params.from = customStartDate;
            params.to = customEndDate;
          }
        }
        const data = await reportService.getAllReports(params);
        
        // Access the correct structure based on backend response
        setReports(data.data || []);
        setTotalReports(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / itemsPerPage));
      } catch (err) {
        setError(err.message || 'Failed to fetch reports');
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, searchTerm ? 300 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, filterType, customStartDate, customEndDate]);

  // Reset to page 1 and update itemsPerPage when view mode changes
  useEffect(() => {
    setCurrentPage(1);
    setItemsPerPage(viewMode === 'grid' ? 9 : 10);
  }, [viewMode]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Fetch stat for a specific filter
  const fetchStat = async (statKey, filter) => {
    setLoadingStats(prev => ({ ...prev, [statKey]: true }));
    try {
      const count = await reportService.getReportCount(filter);
      setStats(prev => ({ ...prev, [`${statKey}Reports`]: count }));
    } catch (err) {
      console.error(`Failed to fetch ${statKey} stat:`, err);
    } finally {
      setLoadingStats(prev => ({ ...prev, [statKey]: false }));
    }
  };

  // Handle successful report creation/update
  const handleCreateReport = () => {
    navigate('/admin/dashboard/report/create');
  };

  // Handle opening the modal for updating a report
  const handleUpdateReport = (report) => {
    if (!report.id) return Swal.fire('Error', 'Invalid report ID', 'error');
    navigate(`/admin/dashboard/report/edit/${report.id}`);
  };

  // Handle report preview
  const handlePreviewReport = (report) => {
    if (!report.id) return Swal.fire('Error', 'Invalid report ID', 'error');
    navigate(`/admin/dashboard/report/view/${report.id}`);
  };

  // Handle report download
  const handleDownloadReport = async (report) => {
    if (!report.id) return Swal.fire('Error', 'Invalid report ID', 'error');
    
    // Case 1: Use report.content (HTML string) to generate PDF
    if (report.content) {
      const content = typeof report.content === 'string' ? report.content : JSON.stringify(report.content);
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${report.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
           
            /* Prevent page breaks inside elements */
            * {
              page-break-inside: avoid;
              break-inside: avoid;
            }
           
            /* Allow page breaks only before certain elements */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              break-after: avoid;
              page-break-inside: avoid;
              break-inside: avoid;
            }
           
            p, li, blockquote {
              page-break-inside: avoid;
              break-inside: avoid;
              orphans: 3;
              widows: 3;
            }
           
            ul, ol {
              page-break-inside: avoid;
              break-inside: avoid;
            }
           
            img {
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              break-after: avoid;
            }
           
            .swal-preview-container .ql-editor {
              padding: 1rem;
            }
           
            .swal-preview-container .ql-editor h1 {
              font-size: 2em;
              font-weight: bold;
              margin: 0.67em 0;
            }
           
            .swal-preview-container .ql-editor h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin: 0.83em 0;
            }
           
            .swal-preview-container .ql-editor h3 {
              font-size: 1.17em;
              font-weight: bold;
              margin: 1em 0;
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
           
            .ql-container, .ql-editor {
              min-height: 400px;
            }
           
            .text-left {
              text-align: left;
            }
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
        margin: 10,
        filename: `${report.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      };
     
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      html2pdf().set(options).from(element).save();
    }
    // Case 2: Use reportUrl to download file
    else if (report.reportUrl) {
      const fullUrl = handleReportUrl(report.reportUrl);
      if (!fullUrl) {
        Swal.fire('Error', 'Invalid report URL', 'error');
        return;
      }
      await downloadFile(fullUrl, report.title || 'report');
    }
    // Case 3: No content or URL
    else {
      Swal.fire('Error', 'No report content or URL available for download', 'error');
    }
  };

  // Use reports directly from server (already paginated)
  const paginatedReports = reports;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ReportCard = ({ report }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">{report.title}</h3>
        <div className="flex gap-2 ml-2 flex-shrink-0">
          <button
            onClick={() => handlePreviewReport(report)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Preview Report"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleUpdateReport(report)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Update Report"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDownloadReport(report)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download Report"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Created:</span> {formatDate(report.createdAt)}
        </p>
        <p>
          <span className="font-medium">By:</span> {report.admin?.adminName || 'Unknown'}
        </p>
      </div>
    </div>
  );

  const ReportRow = ({ report, index }) => (
    <tr className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td className="px-6 py-4 font-medium text-gray-900">{report.title}</td>
      <td className="px-6 py-4 text-gray-600">{report.admin?.adminName || 'Unknown'}</td>
      <td className="px-6 py-4 text-gray-600">{formatDate(report.createdAt)}</td>
      <td className="px-6 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => handlePreviewReport(report)}
            className="flex items-center gap-1 px-3 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors text-sm font-medium"
            title="Preview Report"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => handleUpdateReport(report)}
            className="flex items-center gap-1 px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors text-sm font-medium"
            title="Update Report"
          >
            <Edit size={16} /> Update
          </button>
          <button
            onClick={() => handleDownloadReport(report)}
            className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors text-sm font-medium"
            title="Download Report"
          >
            <Download size={16} /> Download
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-md font-bold text-gray-900 mb-2">Report Dashboard</h1>
            <p className="text-gray-600">Manage and view all system reports</p>
          </div>
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            Create Report
          </button>
        </div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading reports...</p>
          </div>
        )}
        {!isLoading && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 rounded-full p-3">
                    <FileText className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Reports</p>
                    <p className="text-md font-bold text-gray-900">
                      {loadingStats.total ? '...' : (stats.totalReports ?? totalReports ?? '-')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">Today's Reports</p>
                    <p className="text-md font-bold text-gray-900">
                      {loadingStats.today ? '...' : (stats.todayReports ?? '-')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Week</p>
                    <p className="text-md font-bold text-gray-900">
                      {loadingStats.week ? '...' : (stats.weekReports ?? '-')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 rounded-full p-3">
                    <Calendar className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
                    <p className="text-md font-bold text-gray-900">
                      {loadingStats.month ? '...' : (stats.monthReports ?? '-')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <Users className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Admins</p>
                    <p className="text-md font-bold text-gray-900">
                      {stats.uniqueAdmins ?? '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title or admin name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 justify-end items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Items per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={viewMode === 'grid' ? 6 : 10}>{viewMode === 'grid' ? 6 : 10}</option>
                      <option value={viewMode === 'grid' ? 12 : 20}>{viewMode === 'grid' ? 12 : 20}</option>
                      <option value={viewMode === 'grid' ? 18 : 30}>{viewMode === 'grid' ? 18 : 30}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="List View"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Reports', statKey: 'total', filter: '' },
                  { value: 'today', label: 'Today', statKey: 'today', filter: 'today' },
                  { value: 'week', label: 'This Week', statKey: 'week', filter: 'weekly' },
                  { value: 'month', label: 'This Month', statKey: 'month', filter: 'monthly' },
                  { value: 'custom', label: 'Custom Range', statKey: null, filter: 'custom' },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => {
                      setFilterType(btn.value);
                      if (btn.value !== 'custom') {
                        setShowCustomFilter(false);
                        setCustomStartDate('');
                        setCustomEndDate('');
                       
                        // Fetch stat only when clicking this button
                        if (btn.statKey && btn.filter) {
                          fetchStat(btn.statKey, btn.filter);
                        }
                      } else {
                        setShowCustomFilter(true);
                      }
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      filterType === btn.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {btn.value === 'custom' && <Calendar size={18} />}
                    {btn.label}
                  </button>
                ))}
              </div>
              {showCustomFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        if (!customStartDate || !customEndDate) {
                          Swal.fire('Error', 'Please select both start and end dates', 'error');
                          return;
                        }
                        const start = new Date(customStartDate);
                        const end = new Date(customEndDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                          Swal.fire('Error', 'Invalid date format', 'error');
                          return;
                        }
                        if (start > end) {
                          Swal.fire('Error', 'Start date must be before or equal to end date', 'error');
                          return;
                        }
                        setFilterType('custom');
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomFilter(false);
                        setFilterType('all');
                        setCustomStartDate('');
                        setCustomEndDate('');
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((report) => <ReportCard key={report.id} report={report} />)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No reports found</p>
                  </div>
                )}
              </div>
            )}
            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {paginatedReports.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Report Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created By</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created At</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((report, index) => (
                        <ReportRow key={report.id} index={index} report={report} />
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No reports found</p>
                  </div>
                )}
              </div>
            )}
            {/* Pagination Controls */}
            {paginatedReports.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{paginatedReports.length}</span> of{' '}
                  <span className="font-semibold">{totalReports}</span> report(s)
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span>
                    Page <span className="font-semibold">{currentPage}</span> of{' '}
                    <span className="font-semibold">{totalPages || 1}</span>
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;