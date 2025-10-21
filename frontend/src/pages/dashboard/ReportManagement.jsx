import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Grid3x3, List, Search, Eye, FileText, TrendingUp, Clock, Users, Plus, ChevronLeft, ChevronRight, Edit, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

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
  const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'grid' ? 9 : 7);
  const navigate = useNavigate();

  // Fetch all reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getAllReports();
        // Sort reports by createdAt descending (most recent first)
        const sortedReports = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReports(sortedReports);
      } catch (err) {
        setError(err.message || 'Failed to fetch reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Reset current page when view mode, search term, or filter type changes
  useEffect(() => {
    setCurrentPage(1);
    setItemsPerPage(viewMode === 'grid' ? 9 : 7);
  }, [viewMode, searchTerm, filterType]);

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

  // Handle report download as PDF
  const handleDownloadReport = (report) => {
    if (!report.id) return Swal.fire('Error', 'Invalid report ID', 'error');

    // Assuming report.content is a JSON object containing HTML content
    const content = typeof report.content === 'string' ? report.content : JSON.stringify(report.content);

    // Create HTML content for PDF
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

    // Configure html2pdf options
    const options = {
      margin: 10,
      filename: `${report.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate and download PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    html2pdf().set(options).from(element).save();
  };

  // Date range filter function (inspired by ReportViewPage)
  const isDateInRange = (dateString, range) => {
    if (range === 'all') return true;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false; // Invalid date check

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const customStart = customStartDate ? new Date(customStartDate) : null;
    const customEnd = customEndDate ? new Date(customEndDate) : null;

    switch (range) {
      case 'today':
        return date >= todayStart && date < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      case 'week':
        return date >= weekStart;
      case 'month':
        return date >= monthStart;
      case 'custom':
        if (!customStart || !customEnd || isNaN(customStart.getTime()) || isNaN(customEnd.getTime())) {
          return false;
        }
        // Ensure customEnd includes the entire day
        const customEndWithTime = new Date(customEnd);
        customEndWithTime.setHours(23, 59, 59, 999);
        return date >= customStart && date <= customEndWithTime;
      default:
        return true;
    }
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply date filter
    filtered = filtered.filter((report) => isDateInRange(report.createdAt, filterType));

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.admin?.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [reports, filterType, searchTerm, customStartDate, customEndDate]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
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

  const getStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalReports = reports.length;
    const todayReports = reports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      reportDate.setHours(0, 0, 0, 0);
      return reportDate.getTime() === today.getTime();
    }).length;

    const weekReports = reports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      return reportDate >= weekStart;
    }).length;

    const monthReports = reports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      return reportDate >= monthStart;
    }).length;

    const uniqueAdmins = new Set(reports.map((r) => r.admin?.id)).size;

    return { totalReports, todayReports, weekReports, monthReports, uniqueAdmins };
  }, [reports]);

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
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => handleUpdateReport(report)}
            className="flex items-center gap-1 px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors text-sm font-medium"
            title="Update Report"
          >
            <Edit size={16} />
            Update
          </button>
          <button
            onClick={() => handleDownloadReport(report)}
            className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors text-sm font-medium"
            title="Download Report"
          >
            <Download size={16} />
            Download
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
                    <p className="text-md font-bold text-gray-900">{getStats.totalReports}</p>
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
                    <p className="text-md font-bold text-gray-900">{getStats.todayReports}</p>
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
                    <p className="text-md font-bold text-gray-900">{getStats.weekReports}</p>
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
                    <p className="text-md font-bold text-gray-900">{getStats.monthReports}</p>
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
                    <p className="text-md font-bold text-gray-900">{getStats.uniqueAdmins}</p>
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
                  { value: 'all', label: 'All Reports' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'custom', label: 'Custom Range' },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => {
                      setFilterType(btn.value);
                      if (btn.value !== 'custom') {
                        setShowCustomFilter(false);
                        setCustomStartDate('');
                        setCustomEndDate('');
                      } else {
                        setShowCustomFilter(true);
                      }
                      setCurrentPage(1); // Reset to first page on filter change
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
                        setCurrentPage(1); // Reset to first page on custom filter apply
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
                        setCurrentPage(1); // Reset to first page on clear
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

            {/* Pagination Controls (Bottom) */}
            {paginatedReports.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing <span className="font-semibold">{paginatedReports.length}</span> of{' '}
                  <span className="font-semibold">{filteredReports.length}</span> report(s)
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