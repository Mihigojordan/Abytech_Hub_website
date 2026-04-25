import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Calendar, Clock, Mail, Phone, Building,
  CheckCircle, XCircle, AlertCircle, Video, User, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import demoRequestService from '../../services/demoRequestService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const getStatusStyle = (status) => {
  if (status === 'COMPLETED') return { bg: 'rgba(74,222,128,.15)',  color: '#4ade80',  label: 'Completed' };
  if (status === 'PENDING')   return { bg: 'rgba(232,98,26,.15)',   color: ORG,        label: 'Pending' };
  if (status === 'CONTACTED') return { bg: 'rgba(26,92,120,.15)',   color: TEAL,       label: 'Contacted' };
  if (status === 'SCHEDULED') return { bg: 'rgba(26,92,120,.15)',   color: TEAL,       label: 'Scheduled' };
  if (status === 'CANCELLED') return { bg: 'rgba(232,64,64,.15)',   color: '#e84040',  label: 'Cancelled' };
  return { bg: 'rgba(128,128,128,.15)', color: '#888', label: status };
};

const getDemoTypeStyle = (type) => {
  if (type === 'PRODUCT') return { bg: 'rgba(26,92,120,.15)',  color: TEAL, label: 'Product Demo' };
  if (type === 'FEATURE') return { bg: 'rgba(26,92,120,.15)',  color: TEAL, label: 'Feature Demo' };
  if (type === 'CUSTOM')  return { bg: 'rgba(232,98,26,.15)',  color: ORG,  label: 'Custom Demo' };
  return { bg: 'rgba(128,128,128,.15)', color: '#888', label: type };
};

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending' },
  CONTACTED: { label: 'Contacted' },
  SCHEDULED: { label: 'Scheduled' },
  COMPLETED: { label: 'Completed' },
  CANCELLED: { label: 'Cancelled' },
};

const TYPE_CONFIG = {
  PRODUCT: { label: 'Product Demo' },
  FEATURE: { label: 'Feature Demo' },
  CUSTOM:  { label: 'Custom Demo' },
};

const DemoRequestManagement = () => {
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({ scheduledAt: '', meetingLink: '' });
  const [stats, setStats] = useState({
    total: 0, pending: 0, contacted: 0, scheduled: 0, completed: 0, cancelled: 0,
  });
  const [operationStatus, setOperationStatus] = useState(null);

  useEffect(() => {
    loadRequests();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await demoRequestService.getAllDemoRequests({
        page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter, demoType: typeFilter,
      });
      setRequests(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await demoRequestService.getDemoRequestStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await demoRequestService.updateDemoRequestStatus(id, status);
      showOperationMessage('success', 'Status updated');
      loadRequests();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleSchedule = async () => {
    try {
      await demoRequestService.scheduleDemo(selectedRequest.id, scheduleData.scheduledAt, scheduleData.meetingLink);
      showOperationMessage('success', 'Demo scheduled');
      setShowScheduleModal(false);
      loadRequests();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      await demoRequestService.completeDemoRequest(id);
      showOperationMessage('success', 'Demo marked as completed');
      loadRequests();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this demo request?')) return;
    try {
      await demoRequestService.cancelDemoRequest(id);
      showOperationMessage('success', 'Demo request cancelled');
      loadRequests();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await demoRequestService.deleteDemoRequest(id);
      showOperationMessage('success', 'Request deleted');
      loadRequests();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  const statList = [
    { label: 'Total',     value: stats.total,     colorKey: 'info' },
    { label: 'Pending',   value: stats.pending,   colorKey: 'warn' },
    { label: 'Contacted', value: stats.contacted, colorKey: 'info' },
    { label: 'Scheduled', value: stats.scheduled, colorKey: 'info' },
    { label: 'Completed', value: stats.completed, colorKey: 'success' },
    { label: 'Cancelled', value: stats.cancelled, colorKey: 'danger' },
  ];

  const statColors = {
    info:    { bg: 'rgba(26,92,120,.15)',  color: TEAL },
    warn:    { bg: 'rgba(232,98,26,.15)',  color: ORG },
    success: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
    danger:  { bg: 'rgba(232,64,64,.15)',  color: '#e84040' },
  };

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Demo Requests</h1>
        <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Manage demo requests and scheduling</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statList.map(({ label, value, colorKey }) => {
          const cs = statColors[colorKey];
          return (
            <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
              <div style={{ width: 40, height: 40, background: cs.bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: cs.color }}>
                <Video className="w-5 h-5" />
              </div>
              <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>
              <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Operation Status */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 flex items-center gap-2 p-4"
            style={{
              borderRadius: 4, fontSize: 13, fontWeight: 600, border: '1px solid',
              ...(operationStatus.type === 'success'
                ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
                : { background: 'rgba(232,64,64,.15)',  borderColor: '#e84040', color: '#e84040' }),
            }}
          >
            {operationStatus.type === 'success'
              ? <CheckCircle className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />
            }
            {operationStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: text2 }} />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none' }}
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none' }}
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={loadRequests}
            style={{ padding: '8px 12px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${bg3}`, borderTopColor: ORG, margin: '0 auto 12px' }}
            />
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading requests...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p style={{ fontSize: 13 }}>{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>No demo requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Contact', 'Company', 'Type', 'Product', 'Status', 'Scheduled', 'Requested', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 7 ? 'right' : 'left', padding: '12px 16px' })}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const typeStyle = getDemoTypeStyle(request.demoType);
                  return (
                    <tr
                      key={request.id}
                      style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = bg3}
                      onMouseLeave={e => e.currentTarget.style.background = bg2}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 36, height: 36, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div style={{ ...ba(13, 600, { color: textC }) }}>{request.fullName}</div>
                            <div style={{ ...ba(11, 400, { color: text2 }) }}>{request.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{request.companyName || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>
                          {typeStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{request.product || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', outline: 'none', ...(() => { const s = getStatusStyle(request.status); return { background: s.bg, color: s.color }; })() }}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>
                        {request.scheduledAt ? formatDateTime(request.scheduledAt) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{formatDate(request.createdAt)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedRequest(request); setShowViewModal(true); }}
                            style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: TEAL, cursor: 'pointer' }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setScheduleData({
                                  scheduledAt: request.scheduledAt ? new Date(request.scheduledAt).toISOString().slice(0, 16) : '',
                                  meetingLink: request.meetingLink || '',
                                });
                                setShowScheduleModal(true);
                              }}
                              style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: text2, cursor: 'pointer' }}
                              title="Schedule"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}
                          {request.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleComplete(request.id)}
                              style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#4ade80', cursor: 'pointer' }}
                              title="Mark Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#e84040', cursor: 'pointer' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid ' + border }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
              style={{ padding: '5px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span style={{ ...ba(13, 400, { color: text2 }) }}>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
              style={{ padding: '5px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Demo Request Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div style={{ width: 56, height: 56, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 style={{ ...ba(18, 700, { color: textC, margin: 0 }) }}>{selectedRequest.fullName}</h3>
                    {(() => { const s = getStatusStyle(selectedRequest.status); return (
                      <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    ); })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: text2 }} />
                    <span style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.email}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: text2 }} />
                      <span style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.phone}</span>
                    </div>
                  )}
                  {selectedRequest.companyName && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" style={{ color: text2 }} />
                      <span style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.companyName}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Demo Type</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{TYPE_CONFIG[selectedRequest.demoType]?.label}</p>
                  </div>
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Product</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.product || '-'}</p>
                  </div>
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Preferred Date</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{formatDate(selectedRequest.preferredDate)}</p>
                  </div>
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Preferred Time</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.preferredTime || '-'}</p>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Message</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.message}</p>
                  </div>
                )}

                {selectedRequest.scheduledAt && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Scheduled Demo</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: textC }) }}>
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(selectedRequest.scheduledAt)}
                    </p>
                    {selectedRequest.meetingLink && (
                      <a
                        href={selectedRequest.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-1"
                        style={{ color: TEAL, fontSize: 13 }}
                      >
                        <Video className="w-4 h-4" /> Join Meeting
                      </a>
                    )}
                  </div>
                )}

                {selectedRequest.assignedTo && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 })}>Assigned To</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selectedRequest.assignedTo.adminName}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }}
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 440 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Schedule Demo</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleData.scheduledAt}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Meeting Link</label>
                  <input
                    type="url"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    style={inputStyle}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduleData.scheduledAt}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: !scheduleData.scheduledAt ? 'not-allowed' : 'pointer', opacity: !scheduleData.scheduledAt ? 0.5 : 1 }}
                  >
                    Schedule Demo
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

export default DemoRequestManagement;
