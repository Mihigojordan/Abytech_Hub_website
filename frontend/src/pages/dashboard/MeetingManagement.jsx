import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronDown, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Grid3X3, List, Clock, Calendar, Table, Download, Video,
  TrendingUp, Users, Filter, SortAsc, SortDesc, Sparkles,
  MapPin, Link, Play, Pause, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import meetingService from '../../services/meetingService';
import { useNavigate } from 'react-router-dom';

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingLink: '',
    status: 'SCHEDULED',
  });
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const navigate = useNavigate();

  const statusConfig = {
    SCHEDULED: { label: 'Scheduled', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: Calendar },
    ONGOING: { label: 'Ongoing', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: Play },
    COMPLETED: { label: 'Completed', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: XCircle },
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allMeetings, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingStats(true);
      const response = await meetingService.getAllMeetings({ page: 1, limit: 1000 });
      const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setAllMeetings(data);

      // Calculate stats
      const statsData = {
        total: data.length,
        scheduled: data.filter(m => m.status === 'SCHEDULED').length,
        ongoing: data.filter(m => m.status === 'ONGOING').length,
        completed: data.filter(m => m.status === 'COMPLETED').length,
        cancelled: data.filter(m => m.status === 'CANCELLED').length,
      };
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load meetings');
      setAllMeetings([]);
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  const showOperationMessage = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allMeetings];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (meeting) =>
          meeting?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting?.createdBy?.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === 'startTime' || sortBy === 'endTime' || sortBy === 'createdAt') {
        const aDate = new Date(aValue || 0);
        const bDate = new Date(bValue || 0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    setMeetings(filtered);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setOperationLoading(true);
      if (selectedMeeting) {
        await meetingService.updateMeeting(selectedMeeting.id, formData);
        showOperationMessage('success', 'Meeting updated successfully');
      } else {
        await meetingService.createMeeting(formData);
        showOperationMessage('success', 'Meeting created successfully');
      }
      setShowFormModal(false);
      resetForm();
      await loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (meeting) => {
    if (!meeting?.id) {
      showOperationMessage('error', 'Invalid meeting ID');
      return;
    }
    try {
      setOperationLoading(true);
      await meetingService.deleteMeeting(meeting.id);
      setDeleteConfirm(null);
      await loadData();
      showOperationMessage('success', `"${meeting.title}" deleted successfully!`);
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to delete meeting');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await meetingService.updateMeetingStatus(id, status);
      showOperationMessage('success', 'Status updated successfully');
      await loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      meetingLink: '',
      status: 'SCHEDULED',
    });
    setSelectedMeeting(null);
  };

  const openEditModal = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : '',
      endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : '',
      location: meeting.location || '',
      meetingLink: meeting.meetingLink || '',
      status: meeting.status,
    });
    setShowFormModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Status', 'Start Time', 'End Time', 'Location', 'Meeting Link', 'Created By'],
      ...meetings.map(meeting => [
        meeting.title,
        meeting.status,
        formatDateTime(meeting.startTime),
        formatDateTime(meeting.endTime),
        meeting.location || '',
        meeting.meetingLink || '',
        meeting.createdBy?.adminName || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meetings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showOperationMessage('success', 'Meetings exported successfully!');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? 'N/A'
      : parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.SCHEDULED;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const totalPages = Math.ceil(meetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="overflow-x-auto">
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
              <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Status</th>
              <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-gray-50 transition-colors hidden md:table-cell"
                style={{ color: 'rgb(81, 96, 146)' }}
                onClick={() => { setSortBy('startTime'); setSortOrder(sortBy === 'startTime' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Start Time</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'startTime' ? (sortOrder === 'asc' ? 'rotate-180' : '') : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Location</th>
              <th className="text-left py-3 px-4 font-semibold hidden xl:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Created By</th>
              <th className="text-right py-3 px-4 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentMeetings.map((meeting, index) => (
              <motion.tr
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">{meeting.title || 'N/A'}</span>
                      {meeting.description && (
                        <p className="text-gray-500 text-xs truncate max-w-xs">{meeting.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(meeting.status)}</td>
                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{formatDateTime(meeting.startTime)}</td>
                <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                  {meeting.meetingLink ? (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Online
                    </a>
                  ) : meeting.location || '-'}
                </td>
                <td className="py-3 px-4 text-gray-600 hidden xl:table-cell">{meeting.createdBy?.adminName || 'Unknown'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedMeeting(meeting); setShowViewModal(true); }}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => openEditModal(meeting)}
                      className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-50 transition-colors" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(meeting)}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentMeetings.map((meeting, index) => (
        <motion.div
          key={meeting.id}
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
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusBadge(meeting.status)}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">{meeting.title}</h3>
                {meeting.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{meeting.description}</p>
                )}
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}
              >
                <Video className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
              </motion.div>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDateTime(meeting.startTime)}</span>
              </div>
              {meeting.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{meeting.location}</span>
                </div>
              )}
              {meeting.meetingLink && (
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                  <Link className="w-3 h-3 mr-1" />
                  <span>Join Meeting</span>
                </a>
              )}
              <div className="flex items-center text-xs text-gray-500">
                <Users className="w-3 h-3 mr-1" />
                <span>{meeting.createdBy?.adminName || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedMeeting(meeting); setShowViewModal(true); }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openEditModal(meeting)}
                  className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-xs font-medium transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(meeting)}
                className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 w-full">
      {currentMeetings.map((meeting, index) => (
        <motion.div
          key={meeting.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}>
                <Video className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{meeting.title}</h3>
                  {getStatusBadge(meeting.status)}
                </div>
                <p className="text-xs text-gray-600 flex items-center space-x-3">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDateTime(meeting.startTime)}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {meeting.createdBy?.adminName || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedMeeting(meeting); setShowViewModal(true); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => openEditModal(meeting)}
                className="text-gray-400 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(meeting)}
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
    if (meetings.length === 0) return null;

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
      <div className="flex items-center justify-between bg-white px-2 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4 border border-gray-100 shadow-sm">
        <div className="text-xs text-gray-600 flex items-center space-x-2">
          <span>Showing <span className="font-semibold">{startIndex + 1}</span>-<span className="font-semibold">{Math.min(endIndex, meetings.length)}</span> of <span className="font-semibold">{meetings.length}</span></span>
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
      label: 'Total Meetings',
      value: stats.total,
      icon: Video,
      color: 'rgb(81, 96, 146)',
      bgColor: 'rgba(81, 96, 146, 0.1)',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Calendar,
      color: 'rgb(59, 130, 246)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      gradient: 'from-blue-400 to-cyan-600'
    },
    {
      label: 'Ongoing',
      value: stats.ongoing,
      icon: Play,
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'rgb(107, 114, 128)',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      gradient: 'from-gray-500 to-slate-600'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'rgb(239, 68, 68)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
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
                  Meeting Management
                </h1>
              </div>
              <p className="text-xs text-gray-600">Schedule and manage all team meetings</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={meetings.length === 0}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowFormModal(true); }}
                disabled={operationLoading}
                className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-xs transition-all bg-[rgb(81,96,146)] hover:to-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Meeting</span>
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
                    {loadingStats ? (
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
                  placeholder="Search meetings by title or organizer..."
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
                  <option value="startTime-desc">Newest First</option>
                  <option value="startTime-asc">Oldest First</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white cursor-pointer"
                  style={{ outline: 'none' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
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
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meetings Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-t-transparent rounded-full"
                style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent', borderWidth: '3px' }}
              />
              <span className="text-xs text-gray-600 font-medium">Loading meetings...</span>
            </div>
          </div>
        ) : meetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm w-full border border-gray-100 p-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            </motion.div>
            <p className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No Meetings Found' : 'No Meetings Available'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Schedule a new meeting to get started.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowFormModal(true); }}
                className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium shadow-md text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule First Meeting</span>
              </motion.button>
            )}
          </motion.div>
        ) : null}

        {!loading && meetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderCardView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </motion.div>
        )}

        {/* Operation Status Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl text-xs border-2 ${operationStatus.type === 'success'
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
                    <h3 className="text-base font-bold text-gray-900 mb-1">Delete Meeting?</h3>
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
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Delete Meeting
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showFormModal && (
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
                className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedMeeting ? 'Edit Meeting' : 'New Meeting'}</h3>
                      <p className="text-xs text-gray-500">Fill in the meeting details</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFormModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      style={{ outline: 'none' }}
                      placeholder="Enter meeting title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      style={{ outline: 'none' }}
                      placeholder="Meeting agenda or notes"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Start Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        style={{ outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">End Time</label>
                      <input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        style={{ outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      style={{ outline: 'none' }}
                      placeholder="Room name or address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Meeting Link</label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      style={{ outline: 'none' }}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
                      style={{ outline: 'none' }}
                    >
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFormModal(false)}
                      className="px-5 py-2.5 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 text-xs font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all bg-[rgb(81,96,146)]"
                    >
                      {selectedMeeting ? 'Update Meeting' : 'Create Meeting'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Meeting Modal */}
        <AnimatePresence>
          {showViewModal && selectedMeeting && (
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
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900">{selectedMeeting.title}</h3>
                        {getStatusBadge(selectedMeeting.status)}
                      </div>
                      <p className="text-xs text-gray-500">Meeting Details</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowViewModal(false); setSelectedMeeting(null); }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                  {selectedMeeting.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Description</p>
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{selectedMeeting.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Start Time</p>
                      <p className="font-medium text-gray-900">{formatDateTime(selectedMeeting.startTime)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> End Time</p>
                      <p className="font-medium text-gray-900">{formatDateTime(selectedMeeting.endTime)}</p>
                    </div>
                  </div>

                  {selectedMeeting.location && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Location</p>
                      <p className="text-xs font-medium text-gray-900">{selectedMeeting.location}</p>
                    </div>
                  )}

                  {selectedMeeting.meetingLink && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center"><Link className="w-3 h-3 mr-1" /> Meeting Link</p>
                      <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Join Meeting
                      </a>
                    </div>
                  )}

                  {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Participants ({selectedMeeting.participants.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.participants.map((p, i) => (
                          <span key={i} className={`px-2 py-1 rounded-full text-xs ${p.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {p.name} {p.attended && <CheckCircle className="w-3 h-3 inline ml-1" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Action Items</p>
                      <ul className="space-y-2">
                        {selectedMeeting.actionItems.map((item, i) => (
                          <li key={i} className={`flex items-center gap-2 text-xs ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {item.completed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 border-2 rounded border-gray-300" />}
                            {item.task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1 flex items-center"><Users className="w-3 h-3 mr-1" /> Created By</p>
                    <p className="text-xs font-medium text-gray-900">{selectedMeeting.createdBy?.adminName || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <select
                    value={selectedMeeting.status}
                    onChange={(e) => { handleStatusChange(selectedMeeting.id, e.target.value); setSelectedMeeting({ ...selectedMeeting, status: e.target.value }); }}
                    className="px-3 py-2 text-xs border border-gray-200 rounded-lg"
                    style={{ outline: 'none' }}
                  >
                    {Object.entries(statusConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowViewModal(false); openEditModal(selectedMeeting); }}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowViewModal(false); setSelectedMeeting(null); }}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeetingManagement;
