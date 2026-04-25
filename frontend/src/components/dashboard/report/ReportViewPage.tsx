import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText, Calendar, ArrowLeft, AlertTriangle, Search,
  ChevronLeft, ChevronRight, X, CheckCircle, XCircle,
  AlertCircle, Trash2, Filter, Edit, Download, Send,
  MessageCircle, Clock, ExternalLink, Layout, Globe, RefreshCw
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import reportService from "../../../services/reportService";
import useAdminAuth from "../../../context/AdminAuthContext";
import { API_URL } from '../../../api/api';
import { useSocketEvent } from "../../../context/SocketContext";
import CalendarFilter from "./CalendarFilter";
import { useDashboardTheme } from "../../../utils/dashboardTheme";
import { ORG, TEAL, bb, bc, ba, initials } from "../../../utils/homeConstants";
import { motion, AnimatePresence } from "framer-motion";

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
  replies?: ReplyReport[];
}

interface ReplyReport {
  id: string;
  content: string;
  createdAt: string;
  adminId: string;
  reportId: string;
  admin?: {
    name?: string;
    adminName?: string;
  };
}

type FilterType = "all" | "today" | "yesterday" | "week" | "month" | "custom";
interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

// Helper function to handle reportUrl
function handleReportUrl(reportUrl: string) {
  if (!reportUrl) return null;
  const trimmedUrl = reportUrl.trim();
  if (trimmedUrl.includes('://')) return trimmedUrl;
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl;
  return baseUrl + path;
}

async function downloadFile(url: string, fileName: string) {
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
  const { bg, bg2, textC, text2, text3, border, isDark } = useDashboardTheme();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(8);
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
      const params = {
        filter: 'custom',
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      };
      fetchSidebarReports(params);
      setFilterType('custom')
    } else {
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
  const fetchSidebarReports = async (par?: any) => {
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
      showOperationStatus("success", `Report deleted successfully!`);
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
      const newReply = await reportService.replyToReport(selectedReport.id, replyContent, user?.id);
      setSelectedReport(prev => prev ? { ...prev, replies: [...(prev.replies || []), newReply] } : null);
      setReplyContent("");
      showOperationStatus("success", "Reply sent successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  if (loading && currentSidebarReports.length === 0) {
    return (
      <div style={{ height: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%' }} />
      </div>
    );
  }

  if (!selectedReport && !loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 40 }}>
      {/* Header Bar */}
      <div style={{ background: `${bg2}80`, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(root_url)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: text3, cursor: 'pointer', ...bc(12, 700), transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = ORG}
            onMouseOut={(e) => e.currentTarget.style.color = text3}
          >
            <ArrowLeft size={18} /> BACK TO REPORTS
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            REPORTS / <span style={{ color: ORG }}>SESSION VIEW</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: Reports Archive */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, overflow: 'hidden', height: 'fit-content' }}>
              <div style={{ padding: '20px', borderBottom: `1px solid ${border}`, background: `linear-gradient(to bottom right, ${ORG}05, transparent)` }}>
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={20} style={{ color: ORG }} />
                  <h2 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>ARCHIVE</h2>
                </div>
                
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: text3 }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 40px', background: bg, border: `1px solid ${border}`, borderRadius: 12, color: textC, ...ba(13, 500), outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(["all", "today", "yesterday", "week", "month"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      style={{ 
                        padding: '6px 12px', borderRadius: 100, border: `1px solid ${filterType === f ? ORG : border}`,
                        background: filterType === f ? ORG : bg, color: filterType === f ? '#fff' : text2,
                        ...bc(10, 800), cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCalendar(true)}
                    style={{ 
                      padding: '6px 12px', borderRadius: 100, border: `1px solid ${filterType === 'custom' ? ORG : border}`,
                      background: filterType === 'custom' ? ORG : bg, color: filterType === 'custom' ? '#fff' : text2,
                      ...bc(10, 800), cursor: 'pointer'
                    }}
                  >
                    CALENDAR
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }} className="custom-scrollbar">
                {currentSidebarReports.map((report) => {
                  const isActive = selectedReport?.id === report.id;
                  return (
                    <motion.div
                      key={report.id}
                      onClick={() => { setSelectedReport(report); navigate(`${url}${report.id}`); }}
                      whileHover={{ x: 4 }}
                      style={{ 
                        padding: '16px 20px', cursor: 'pointer', borderBottom: `1px solid ${border}`,
                        background: isActive ? `${ORG}05` : 'transparent',
                        borderLeft: `4px solid ${isActive ? ORG : 'transparent'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <h4 style={{ ...bc(14, 700, { color: isActive ? ORG : textC, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }) }}>{report.title}</h4>
                      <p style={{ ...ba(12, 500, { color: text3, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>
                        {report.reportUrl ? `Resource Attached` : stripHtml(typeof report.content === 'string' ? report.content : '')}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ ...bc(10, 800, { color: text3 }) }}>{getRelativeTime(report.createdAt)}</span>
                        <ChevronRight size={14} style={{ color: isActive ? ORG : border }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {sidebarTotalPages > 1 && (
                <div style={{ padding: '16px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <button onClick={() => handleSidebarPageChange(sidebarCurrentPage - 1)} disabled={sidebarCurrentPage === 1} style={{ padding: 8, borderRadius: 8, background: bg, border: `1px solid ${border}`, color: text3, cursor: 'pointer', opacity: sidebarCurrentPage === 1 ? 0.3 : 1 }}><ChevronLeft size={16} /></button>
                  <span style={{ ...bc(11, 800, { color: text2 }) }}>{sidebarCurrentPage} / {sidebarTotalPages}</span>
                  <button onClick={() => handleSidebarPageChange(sidebarCurrentPage + 1)} disabled={sidebarCurrentPage === sidebarTotalPages} style={{ padding: 8, borderRadius: 8, background: bg, border: `1px solid ${border}`, color: text3, cursor: 'pointer', opacity: sidebarCurrentPage === sidebarTotalPages ? 0.3 : 1 }}><ChevronRight size={16} /></button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {selectedReport && (
                <motion.div
                  key={selectedReport.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Hero Card */}
                  <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `linear-gradient(225deg, ${ORG}05 0%, transparent 70%)` }}></div>
                    <div className="relative z-10">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${ORG}40` }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <p style={{ ...bc(10, 800, { color: text3, letterSpacing: '0.1em', margin: 0 }) }}>REPORT LOG</p>
                          <p style={{ ...ba(14, 600, { color: text2, margin: 0 }) }}>{selectedReport.admin?.name || 'Authorized Admin'}</p>
                        </div>
                      </div>

                      <h1 style={{ ...bc(40, 800, { color: textC, margin: '0 0 16px', lineHeight: 1.1 }) }}>{selectedReport.title}</h1>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 32, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: text3, ...bc(11, 800) }}>
                          <Calendar size={14} style={{ color: ORG }} /> {formatDateTime(selectedReport.createdAt)}
                        </div>
                        <div style={{ width: 1, height: 16, background: border }}></div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate('/admin/dashboard/report/edit/' + selectedReport.id)}
                            style={{ padding: '8px 16px', borderRadius: 10, background: bg, border: `1px solid ${border}`, color: text2, cursor: 'pointer', ...bc(11, 800), display: 'flex', alignItems: 'center', gap: 8 }}
                          >
                            <Edit size={14} /> EDIT
                          </button>
                          {user?.id === selectedReport.adminId && (
                            <button
                              onClick={() => setDeleteConfirm(selectedReport)}
                              style={{ padding: '8px 16px', borderRadius: 10, background: '#ef444415', border: '1px solid #ef444433', color: '#ef4444', cursor: 'pointer', ...bc(11, 800), display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                              <Trash2 size={14} /> DELETE
                            </button>
                          )}
                          {selectedReport.reportUrl && (
                            <button
                              onClick={() => handleDownloadReport(selectedReport)}
                              style={{ padding: '8px 16px', borderRadius: 10, background: `${TEAL}15`, border: `1px solid ${TEAL}33`, color: TEAL, cursor: 'pointer', ...bc(11, 800), display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                              <Download size={14} /> EXPORT
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Body */}
                  <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 24px' }}>
                    <div className="flex items-center gap-3 mb-8">
                      <Layout size={20} style={{ color: ORG }} />
                      <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>LOG CONTENT</h3>
                    </div>

                    <div className="swal-preview-container">
                      {selectedReport.reportUrl ? (
                        <div style={{ background: bg, padding: '24px', borderRadius: 24, border: `1px dashed ${border}`, textAlign: 'center' }}>
                          <div style={{ width: 64, height: 64, borderRadius: 20, background: `${TEAL}10`, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Globe size={32} />
                          </div>
                          <p style={{ ...ba(15, 600, { color: text2, marginBottom: 24 }) }}>This report contains an external document resource.</p>
                          <a
                            href={`${handleReportUrl(selectedReport.reportUrl)}?inline=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: TEAL, color: '#fff', textDecoration: 'none', ...bc(12, 800), boxShadow: `0 8px 20px ${TEAL}30` }}
                          >
                            <ExternalLink size={16} /> VIEW RESOURCE IN NEW TAB
                          </a>
                        </div>
                      ) : selectedReport.content ? (
                        <div
                          className="ql-editor"
                          style={{ color: textC, lineHeight: 1.8, fontSize: 16 }}
                          dangerouslySetInnerHTML={{
                            __html: typeof selectedReport.content === "string"
                              ? selectedReport.content
                              : JSON.stringify(selectedReport.content)
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: 48, color: text3 }}>
                          <AlertTriangle size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                          <p style={{ ...ba(14, 500) }}>No detailed content logs available for this session.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REPLIES Section */}
                  <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 24px' }}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <MessageCircle size={20} style={{ color: ORG }} />
                        <h3 style={{ ...bc(18, 800, { color: textC, margin: 0 }) }}>COMMUNICATIONS</h3>
                        <span style={{ background: `${ORG}15`, color: ORG, padding: '2px 10px', borderRadius: 8, ...bc(11, 800) }}>
                          {selectedReport.replies?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 40 }}>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Log your reflection or feedback..."
                        style={{ width: '100%', padding: '16px 20px', background: bg, borderRadius: 16, border: `1px solid ${border}`, color: textC, ...ba(14, 500), outline: 'none', minHeight: 100, resize: 'vertical' }}
                      />
                      <div className="mt-4 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleSendReply}
                          disabled={replying || !replyContent.trim()}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 32px', 
                            background: ORG, color: '#fff', border: 'none', borderRadius: 14, 
                            cursor: 'pointer', ...bc(13, 800), opacity: (replying || !replyContent.trim()) ? 0.5 : 1,
                            boxShadow: `0 8px 24px ${ORG}40`
                          }}
                        >
                          {replying ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={16} /></motion.div> : <Send size={16} />}
                          SEND REFLECTION
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {selectedReport.replies && selectedReport.replies.length > 0 ? (
                        selectedReport.replies.map((reply) => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ 
                              display: 'flex', gap: 14, padding: '14px 18px', borderRadius: 20, background: bg, border: `1px solid ${border}` 
                            }}
                          >
                            <div style={{ 
                              width: 44, height: 44, borderRadius: 14, background: `${ORG}15`, color: ORG,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              ...bc(16, 800)
                            }}>
                              {initials(reply.admin?.adminName || reply.admin?.name)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="flex items-center justify-between mb-2">
                                <h4 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>{reply.admin?.adminName || 'TEAM MEMBER'}</h4>
                                <span style={{ ...bc(10, 800, { color: text3 }) }}>{getRelativeTime(reply.createdAt).toUpperCase()}</span>
                              </div>
                              <p style={{ ...ba(14, 500, { color: text2, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }) }}>{reply.content}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', border: `1px dashed ${border}`, borderRadius: 24 }}>
                          <p style={{ ...ba(14, 500, { color: text3, margin: 0 }) }}>No communication logs for this session.</p>
                        </div>
                      )}
                      <div ref={repliesEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global MODALS */}
      <AnimatePresence>
        {deleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: 32, padding: 40, maxWidth: 460, width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ef444415', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ ...bc(24, 800, { color: textC, marginBottom: 16 }) }}>Terminate Log?</h3>
              <p style={{ ...ba(16, 500, { color: text2, marginBottom: 32, lineHeight: 1.6 }) }}>
                Are you certain you want to remove <span style={{ fontWeight: 800, color: textC }}>"{deleteConfirm.title}"</span>? This action will permanently purge the data from the archive.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '16px', borderRadius: 14, background: bg2, color: textC, border: `1px solid ${border}`, cursor: 'pointer', ...bc(13, 800) }}
                >
                  DISCARD
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  style={{ flex: 1, padding: '16px', borderRadius: 14, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', ...bc(13, 800), boxShadow: '0 10px 25px rgba(239,68,68,0.3)' }}
                >
                  PURGE DATA
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCalendar && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowCalendar(false)} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginBottom: 24 }}
            >
              <X size={48} />
            </motion.button>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <CalendarFilter
                onDateRangeSelect={handleDateRangeSelect}
                onClose={() => setShowCalendar(false)}
              />
            </motion.div>
          </div>
        )}

        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{ 
              position: 'fixed', bottom: 40, left: '50%', zIndex: 100,
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: 16,
              background: operationStatus.type === 'success' ? '#10b981' : operationStatus.type === 'error' ? '#ef4444' : ORG,
              color: '#fff', ...bc(13, 800), boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            {operationStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {operationStatus.message.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-editor ul { list-style-type: disc !important; padding-left: 1.5em !important; }
        .ql-editor ol { list-style-type: decimal !important; padding-left: 1.5em !important; }
        .ql-editor p { margin-bottom: 1.2em; }
        .ql-editor strong { font-weight: 800; color: ${textC}; }
        .ql-editor em { font-style: italic; }
        .ql-editor blockquote { border-left: 4px solid ${ORG}; padding-left: 1.5em; margin-left: 0; font-style: italic; opacity: 0.8; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${border}; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ReportViewPage;
