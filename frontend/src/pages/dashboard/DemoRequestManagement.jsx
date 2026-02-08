import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Calendar, Clock, Mail, Phone, Building,
  CheckCircle, XCircle, AlertCircle, Video, User, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import demoRequestService from '../../services/demoRequestService';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  CONTACTED: { label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const TYPE_CONFIG = {
  PRODUCT: { label: 'Product Demo', color: 'bg-blue-100 text-blue-800' },
  FEATURE: { label: 'Feature Demo', color: 'bg-purple-100 text-purple-800' },
  CUSTOM: { label: 'Custom Demo', color: 'bg-orange-100 text-orange-800' },
};

const DemoRequestManagement = () => {
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
    total: 0,
    pending: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
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
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        demoType: typeFilter,
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demo Requests</h1>
        <p className="text-gray-600">Manage demo requests and scheduling</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-purple-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
          { label: 'Contacted', value: stats.contacted, color: 'bg-blue-500' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-purple-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <Video className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Operation Status */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              operationStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {operationStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {operationStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button onClick={loadRequests} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No demo requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Scheduled</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Requested</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{request.fullName}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.companyName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_CONFIG[request.demoType]?.color}`}>
                        {TYPE_CONFIG[request.demoType]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.product || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${STATUS_CONFIG[request.status]?.color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {request.scheduledAt ? formatDateTime(request.scheduledAt) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedRequest(request); setShowViewModal(true); }}
                          className="p-1 text-gray-400 hover:text-blue-600"
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
                            className="p-1 text-gray-400 hover:text-purple-600"
                            title="Schedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        {request.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleComplete(request.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(request.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Demo Request Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedRequest.fullName}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedRequest.status]?.color}`}>
                      {STATUS_CONFIG[selectedRequest.status]?.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{selectedRequest.email}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedRequest.phone}</span>
                    </div>
                  )}
                  {selectedRequest.companyName && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedRequest.companyName}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Demo Type</label>
                    <p className="text-gray-700">{TYPE_CONFIG[selectedRequest.demoType]?.label}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product</label>
                    <p className="text-gray-700">{selectedRequest.product || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Date</label>
                    <p className="text-gray-700">{formatDate(selectedRequest.preferredDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Time</label>
                    <p className="text-gray-700">{selectedRequest.preferredTime || '-'}</p>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <p className="text-gray-700 mt-1">{selectedRequest.message}</p>
                  </div>
                )}

                {selectedRequest.scheduledAt && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Scheduled Demo</label>
                    <p className="text-gray-700 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(selectedRequest.scheduledAt)}
                    </p>
                    {selectedRequest.meetingLink && (
                      <a href={selectedRequest.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        <Video className="w-4 h-4" /> Join Meeting
                      </a>
                    )}
                  </div>
                )}

                {selectedRequest.assignedTo && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <p className="text-gray-700">{selectedRequest.assignedTo.adminName}</p>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Schedule Demo</h2>
                <button onClick={() => setShowScheduleModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleData.scheduledAt}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduleData.scheduledAt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
