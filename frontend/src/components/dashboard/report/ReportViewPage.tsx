import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Filter,
  Edit,
  Download,
  Send,
  MessageCircle,
  Clock,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import reportService from "../../../services/reportService";
import useAdminAuth from "../../../context/AdminAuthContext";
import { API_URL } from '../../../api/api';
import { useSocketEvent } from "../../../context/SocketContext";
import CalendarFilter from "./CalendarFilter";

interface Report {
  id: string;
  title: string;
  content?: any;
  reportUrl?: string;
  createdAt: string;
  adminId: string;
  admin?: {
    id: string;
    name?: string;
    email?: string;
  };
  replies?: ReplyReport[]; // <-- Added from model
}

interface ReplyReport {
  id: string;
  content: string;
  createdAt: string;
  adminId: string;
  reportId:string;
  admin?: {
    name?: string;
  };
}

type FilterType = "all" | "today" | "yesterday" | "week" | "month";
interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

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

const ReportViewPage = () => {
  const { id: reportId } = useParams<{ id?: string }>();
  const { user } = useAdminAuth();
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(6);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Report | null>(null);
  const [currentSidebarReports, setCurrentSidebarReports] = useState<Report[]>([]);
  const [totalSidebarReports, setTotalSidebarReports] = useState<number>(0);
  const [sidebarTotalPages, setSidebarTotalPages] = useState<number>(1);

  // === REPLY STATE ===
  const [replyContent, setReplyContent] = useState<string>("");
  const [replying, setReplying] = useState<boolean>(false);

  const url = "/admin/dashboard/report/view/";
  const root_url = "/admin/dashboard/report/";

  const repliesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [selectedReport?.replies?.length]);

// Add state for calendar visibility
const [showCalendar, setShowCalendar] = useState(false);

// Add handler for date range selection
const handleDateRangeSelect = (startDate: Date | null, endDate: Date | null) => {
  if (startDate && endDate) {
    // Convert to ISO format for your API
    const params = {
      filter: 'custom',
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    };
    // Call your fetchSidebarReports with custom date range
    fetchSidebarReports(params);
    setFilterType('custom')
  } else {
    // Clear custom filter
    setFilterType('all');
  }
};

  // Fetch selected report
  useEffect(() => {
    if (reportId) {
      const loadSelected = async () => {
        try {
          const response = await reportService.getReportById(reportId);
          setSelectedReport(response);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load report";
          setError(errorMessage);
        }
      };
      loadSelected();
    }
  }, [reportId]);

  useSocketEvent(
  'reportReplyCreated',
  (newReply: ReplyReport) => {
    if (selectedReport?.id === newReply.reportId && newReply.adminId !== user?.id) {
      showOperationStatus("info", `${newReply.admin?.name || 'Someone'} replied`);
    }
    // Still update UI
    if (selectedReport?.id === newReply.reportId) {
      setSelectedReport(prev => prev ? {
        ...prev,
        replies: [...(prev.replies || []), newReply]
      } : null);
    }
  },
  [selectedReport?.id, user?.id]
);

  // Fetch sidebar reports with server-side pagination
  const fetchSidebarReports = async (par?:any) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const params: any = {
        page: sidebarCurrentPage,
        limit: sidebarItemsPerPage,
        search: searchTerm.trim(),
        ...par
      };
      if (filterType !== 'all') {
        if (filterType === 'today') {
          params.filter = 'today';
        } else if (filterType === 'week') {
          params.filter = 'weekly';
        } else if (filterType === 'month') {
          params.filter = 'monthly';
        } else if (filterType === 'yesterday') {
          params.filter = 'custom';
          params.from = yesterdayStart.toISOString().split('T')[0];
          params.to = todayStart.toISOString().split('T')[0];
        }
      }
      const data = await reportService.getAllReports(params);
      const sortedReports = (data.data || []).sort(
        (a: Report, b: Report) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCurrentSidebarReports(sortedReports);
      setTotalSidebarReports(data.pagination?.total || 0);
      setSidebarTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / sidebarItemsPerPage));
      if (sortedReports.length === 0 && sidebarCurrentPage > 1) {
        setSidebarCurrentPage(1);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load reports";
      setError(errorMessage);
      setCurrentSidebarReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarReports();
  }, [sidebarCurrentPage, searchTerm, filterType]);

  useEffect(() => {
    setSidebarCurrentPage(1);
  }, [searchTerm, filterType]);

  const showOperationStatus = (
    type: OperationStatus["type"],
    message: string,
    duration: number = 3000
  ) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleDeleteReport = async (report: Report) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await reportService.deleteReport(report.id);
      await fetchSidebarReports();
      if (selectedReport?.id === report.id) {
        if (currentSidebarReports.length > 0) {
          setSelectedReport(currentSidebarReports[0]);
          navigate(`${url}${currentSidebarReports[0].id}`);
        } else {
          setSelectedReport(null);
          navigate(root_url);
        }
      }
      showOperationStatus("success", `Report "${report.title}" has been deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete report");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    if (report.reportUrl) {
      try {
        const fullUrl = handleReportUrl(report.reportUrl);
        if (!fullUrl) throw new Error('Invalid report URL');
        await downloadFile(fullUrl, report.title || 'report');
      } catch (err) {
        showOperationStatus("error", "Failed to download report file");
      }
    } else {
      showOperationStatus("error", "No file available for download");
    }
  };

  // === SEND REPLY ===
  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedReport) return;

    try {
      setReplying(true);
      const newReply = await reportService.replyToReport(selectedReport.id,   replyContent , user?.id );
      
      // Replace replies with new array including the new one
      setSelectedReport(prev => prev ? { ...prev, replies: [...(prev.replies || []), newReply] } : null);

      setReplyContent("");
      showOperationStatus("success", "Reply sent successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    navigate(`${url}${report.id}`);
  };

  const stripHtml = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const truncateText = (text: string, maxLength: number): string => {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  const handleSidebarPageChange = (page: number) => {
    if (page >= 1 && page <= sidebarTotalPages) {
      setSidebarCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error && currentSidebarReports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(root_url)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h2>
          <p className="text-gray-600 mb-4">There are no reports available.</p>
          <button
            onClick={() => navigate(root_url)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(root_url)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Reports List Sidebar */}
        <div className="col-span-3 sticky top-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-300">
            <div className="p-4 border-b border-gray-300">
              <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <div className="flex items-center space-x-1">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {(["all", "today", "yesterday", "week", "month"] as FilterType[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterType(filter)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          filterType === filter
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                    <button
  onClick={() => setShowCalendar(!showCalendar)}
  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${ filterType === 'custom'
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"} `}
>
  Custom Date
</button>

                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{totalSidebarReports} reports</p>
            </div>
            <div className="divide-y max-h-[calc(100vh-400px)] overflow-y-auto">
              {currentSidebarReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedReport.id === report.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleReportSelect(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{report.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {report.reportUrl
                          ? `File: ${report.title}`
                          : truncateText(
                              typeof report.content === "string" ? report.content : JSON.stringify(report.content || ''),
                              80
                            )}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{getRelativeTime(report.createdAt)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            {sidebarTotalPages > 1 && (
              <div className="p-4 border-t border-gray-400 flex justify-center space-x-2">
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage - 1)}
                  disabled={sidebarCurrentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="py-2 px-4 text-sm text-gray-700">
                  Page {sidebarCurrentPage} of {sidebarTotalPages}
                </span>
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage + 1)}
                  disabled={sidebarCurrentPage === sidebarTotalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Report Detail View */}
        <div className="col-span-9 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">
                      Created {formatDateTime(selectedReport.createdAt)}
                    </span>
                    {selectedReport.admin?.name && (
                      <span className="text-sm text-gray-500">
                        by {selectedReport.admin.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => navigate('/admin/dashboard/report/edit/' + selectedReport.id)}
                  disabled={operationLoading}
                  className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {user?.id === selectedReport.adminId && (
                  <button
                    onClick={() => setDeleteConfirm(selectedReport)}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                {selectedReport.reportUrl && (
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Content</h3>
            <div className="swal-preview-container">
              {selectedReport.reportUrl ? (
                <div className="text-left">
                  <p className="text-gray-700 mb-4">
                    This report is a file. You can download it using the button above or view it below.
                  </p>
                  <a
                    href={`${handleReportUrl(selectedReport.reportUrl)}?inline=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View file in new tab
                  </a>
                </div>
              ) : selectedReport.content ? (
                <div
                  className="ql-editor text-left text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: typeof selectedReport.content === "string"
                      ? selectedReport.content
                      : JSON.stringify(selectedReport.content)
                  }}
                />
              ) : (
                <p className="text-gray-600">No content or file available for this report.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedReport.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Report ID</p>
                  <p className="text-sm text-gray-900 font-mono">{selectedReport.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          </div>

          {/* === REPLIES SECTION === */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Replies ({selectedReport.replies?.length || 0})
              </h3>
            </div>

            {/* Reply Input */}
            <div className="mb-6">
              <textarea
                value={replyContent}
                onChange={(e)=> setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="bg-gray-50 w-full border-2 p-2 border-gray-300 rounded-lg"
                rows={4}
               
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSendReply}
                  disabled={replying || !replyContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {replying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Reply
                </button>
              </div>
            </div>

            {/* Replies List */}
            <div className="space-y-4">
              {selectedReport.replies && selectedReport.replies.length > 0 ? (
                selectedReport.replies.map((reply) => (
                  <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {reply.admin?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reply.admin?.adminName || 'Admin'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className=" max-h-[50px] text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">No replies yet. Be the first to reply!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === TOASTS & MODALS (unchanged) === */}
      {operationStatus && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
              operationStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : operationStatus.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {operationStatus.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-5 h-5 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-5 h-5 text-blue-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {operationLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Report</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteConfirm.title}"</span>? This will
                permanently remove the report from the system.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirm)}
                disabled={operationLoading}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
      {showCalendar && (
  <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center flex-col bg-black/50">
    <X className="text-white w-16 h-16" onClick={()=>setShowCalendar(false)}></X>
    <CalendarFilter 
      onDateRangeSelect={handleDateRangeSelect}
      onClose={() => setShowCalendar(false)}
    />
  </div>
)}

      <style jsx>{`
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
          min-height: 150px;
        }
        .ql-editor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
};

export default ReportViewPage;