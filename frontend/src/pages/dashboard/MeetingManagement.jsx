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
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

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
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const statusConfig = {
    SCHEDULED: { label: 'Scheduled', icon: Calendar },
    ONGOING: { label: 'Ongoing', icon: Play },
    COMPLETED: { label: 'Completed', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', icon: XCircle },
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
    const badgeStyles = {
      SCHEDULED: { background: 'rgba(26,92,120,.15)', color: TEAL },
      ONGOING:   { background: 'rgba(232,98,26,.15)',  color: ORG },
      COMPLETED: { background: 'rgba(74,222,128,.15)', color: '#4ade80' },
      CANCELLED: { background: 'rgba(232,64,64,.15)',  color: '#e84040' },
    };
    const config = statusConfig[status] || statusConfig.SCHEDULED;
    const style = badgeStyles[status] || badgeStyles.SCHEDULED;
    return (
      <span style={{
        ...bc(10, 600),
        ...style,
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {config.label}
      </span>
    );
  };

  const totalPages = Math.ceil(meetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  const actionBtnStyle = {
    background: bg3,
    border: `1px solid ${border}`,
    borderRadius: 4,
    color: text2,
    padding: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const renderTableView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ background: bg3 }}>
            <tr>
              <th className="text-left py-3 px-4 cursor-pointer"
                style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}
                onClick={() => { setSortBy('title'); setSortOrder(sortBy === 'title' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown style={{ width: 12, height: 12, opacity: sortBy === 'title' ? 1 : 0.4, transform: sortBy === 'title' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                </div>
              </th>
              <th className="text-left py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Status</th>
              <th className="text-left py-3 px-4 cursor-pointer hidden md:table-cell"
                style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}
                onClick={() => { setSortBy('startTime'); setSortOrder(sortBy === 'startTime' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Start Time</span>
                  <ChevronDown style={{ width: 12, height: 12, opacity: sortBy === 'startTime' ? 1 : 0.4, transform: sortBy === 'startTime' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                </div>
              </th>
              <th className="text-left py-3 px-4 hidden lg:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Location</th>
              <th className="text-left py-3 px-4 hidden xl:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Created By</th>
              <th className="text-right py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMeetings.map((meeting, index) => (
              <motion.tr
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ background: bg2, borderBottom: `1px solid ${border}` }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = bg2}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Video style={{ width: 16, height: 16, color: text2 }} />
                    <div>
                      <span style={{ ...ba(12, 600), color: textC }}>{meeting.title || 'N/A'}</span>
                      {meeting.description && (
                        <p style={{ ...ba(11, 400), color: text2 }} className="truncate max-w-xs">{meeting.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{getStatusBadge(meeting.status)}</td>
                <td className="py-3 px-4 hidden md:table-cell" style={{ ...ba(12, 400), color: text2 }}>{formatDateTime(meeting.startTime)}</td>
                <td className="py-3 px-4 hidden lg:table-cell" style={{ ...ba(12, 400), color: text2 }}>
                  {meeting.meetingLink ? (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: ORG, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                      <ExternalLink style={{ width: 12, height: 12 }} /> Online
                    </a>
                  ) : meeting.location || '-'}
                </td>
                <td className="py-3 px-4 hidden xl:table-cell" style={{ ...ba(12, 400), color: text2 }}>{meeting.createdBy?.adminName || 'Unknown'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/admin/dashboard/meetings/view/${meeting.id}`)}
                      style={actionBtnStyle} title="View">
                      <Eye style={{ width: 14, height: 14 }} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/admin/dashboard/meetings/edit/${meeting.id}`)}
                      style={actionBtnStyle} title="Edit">
                      <Edit style={{ width: 14, height: 14 }} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(meeting)}
                      style={{ ...actionBtnStyle, color: '#e84040' }} title="Delete">
                      <Trash2 style={{ width: 14, height: 14 }} />
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
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
          className="p-5 relative overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusBadge(meeting.status)}
                </div>
                <h3 style={{ ...ba(13, 600), color: textC }} className="mb-1 line-clamp-2 leading-snug">{meeting.title}</h3>
                {meeting.description && (
                  <p style={{ ...ba(11, 400), color: text2 }} className="line-clamp-2">{meeting.description}</p>
                )}
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 40, height: 40, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)',
                }}
              >
                <Video style={{ width: 20, height: 20, color: ORG }} />
              </motion.div>
            </div>

            <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center" style={{ ...ba(11, 400), color: text2 }}>
                <Clock style={{ width: 12, height: 12, marginRight: 4 }} />
                <span>{formatDateTime(meeting.startTime)}</span>
              </div>
              {meeting.location && (
                <div className="flex items-center" style={{ ...ba(11, 400), color: text2 }}>
                  <MapPin style={{ width: 12, height: 12, marginRight: 4 }} />
                  <span>{meeting.location}</span>
                </div>
              )}
              {meeting.meetingLink && (
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer"
                  style={{ ...ba(11, 400), color: ORG, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <Link style={{ width: 12, height: 12, marginRight: 4 }} />
                  <span>Join Meeting</span>
                </a>
              )}
              <div className="flex items-center" style={{ ...ba(11, 400), color: text2 }}>
                <Users style={{ width: 12, height: 12, marginRight: 4 }} />
                <span>{meeting.createdBy?.adminName || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/dashboard/meetings/view/${meeting.id}`)}
                  style={{ ...actionBtnStyle, padding: '6px 12px', gap: 4 }}
                >
                  <Eye style={{ width: 14, height: 14 }} />
                  <span style={ba(11, 500)}>View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/dashboard/meetings/edit/${meeting.id}`)}
                  style={{ ...actionBtnStyle, padding: '6px 12px', gap: 4 }}
                >
                  <Edit style={{ width: 14, height: 14 }} />
                  <span style={ba(11, 500)}>Edit</span>
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(meeting)}
                style={{ ...actionBtnStyle, color: '#e84040' }}
                title="Delete"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      {currentMeetings.map((meeting, index) => (
        <motion.div
          key={meeting.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4"
          style={{ borderBottom: `1px solid ${border}` }}
          onMouseEnter={e => e.currentTarget.style.background = bg3}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center space-x-3">
              <div style={{
                width: 40, height: 40, borderRadius: 4, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)',
              }}>
                <Video style={{ width: 20, height: 20, color: ORG }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 style={{ ...ba(13, 600), color: textC }}>{meeting.title}</h3>
                  {getStatusBadge(meeting.status)}
                </div>
                <p style={{ ...ba(11, 400), color: text2 }} className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Clock style={{ width: 12, height: 12, marginRight: 4 }} />
                    {formatDateTime(meeting.startTime)}
                  </span>
                  <span className="flex items-center">
                    <Users style={{ width: 12, height: 12, marginRight: 4 }} />
                    {meeting.createdBy?.adminName || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/dashboard/meetings/view/${meeting.id}`)}
                style={actionBtnStyle} title="View">
                <Eye style={{ width: 16, height: 16 }} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/dashboard/meetings/edit/${meeting.id}`)}
                style={actionBtnStyle} title="Edit">
                <Edit style={{ width: 16, height: 16 }} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(meeting)}
                style={{ ...actionBtnStyle, color: '#e84040' }} title="Delete">
                <Trash2 style={{ width: 16, height: 16 }} />
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

    const pageBtnBase = {
      border: `1px solid ${border}`,
      borderRadius: 4,
      cursor: 'pointer',
      ...ba(11, 500),
    };

    return (
      <div className="flex items-center justify-between px-2 py-3 mt-4"
        style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, borderTop: `1px solid ${border}` }}>
        <div style={{ ...ba(11, 400), color: text2 }} className="flex items-center space-x-2">
          <span>Showing <span style={{ fontWeight: 600, color: textC }}>{startIndex + 1}</span>–<span style={{ fontWeight: 600, color: textC }}>{Math.min(endIndex, meetings.length)}</span> of <span style={{ fontWeight: 600, color: textC }}>{meetings.length}</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{ ...pageBtnBase, background: bg3, color: text2, padding: '4px 10px', opacity: currentPage === 1 ? 0.4 : 1 }}
          >
            First
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ ...pageBtnBase, background: bg3, color: text2, padding: '4px 8px', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </motion.button>

          {getPageNumbers().map(page => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              style={{
                ...pageBtnBase,
                padding: '4px 10px',
                background: currentPage === page ? ORG : bg3,
                color: currentPage === page ? '#fff' : text2,
                border: currentPage === page ? `1px solid ${ORG}` : `1px solid ${border}`,
                fontWeight: currentPage === page ? 700 : 500,
              }}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ ...pageBtnBase, background: bg3, color: text2, padding: '4px 8px', opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{ ...pageBtnBase, background: bg3, color: text2, padding: '4px 10px', opacity: currentPage === totalPages ? 0.4 : 1 }}
          >
            Last
          </motion.button>
        </div>
      </div>
    );
  };

  const statCards = [
    { label: 'Total Meetings', value: stats.total, icon: Video },
    { label: 'Scheduled',      value: stats.scheduled, icon: Calendar },
    { label: 'Ongoing',        value: stats.ongoing, icon: Play },
    { label: 'Completed',      value: stats.completed, icon: CheckCircle },
    { label: 'Cancelled',      value: stats.cancelled, icon: XCircle },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }} className="relative overflow-hidden">
        <div className="mx-auto px-1 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles style={{ width: 20, height: 20, color: ORG }} />
                </motion.div>
                <h1 style={{ ...bb(24, { color: ORG }) }}>
                  Meeting Management
                </h1>
              </div>
              <p style={{ ...ba(12, 400), color: text2 }}>Schedule and manage all team meetings</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={meetings.length === 0}
                style={{
                  ...bc(11, 500),
                  background: bg3, border: `1px solid ${border}`, color: textC,
                  borderRadius: 4, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
                  opacity: meetings.length === 0 ? 0.5 : 1, cursor: meetings.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <Download style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                disabled={loading}
                style={{
                  ...bc(11, 500),
                  background: bg3, border: `1px solid ${border}`, color: textC,
                  borderRadius: 4, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
                  opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard/meetings/create')}
                disabled={operationLoading}
                style={{
                  ...bc(11, 600),
                  background: ORG, color: '#fff',
                  borderRadius: 4, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6,
                  border: 'none', cursor: operationLoading ? 'not-allowed' : 'pointer',
                  opacity: operationLoading ? 0.7 : 1,
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
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
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
              className="relative p-4 overflow-hidden cursor-pointer"
            >
              <div className="relative flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    padding: '10px', borderRadius: 4,
                    background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)',
                  }}
                >
                  <stat.icon style={{ width: 16, height: 16, color: ORG }} />
                </motion.div>
                <div className="flex-1">
                  <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })} className="mb-0.5">{stat.label}</p>
                  <p style={bb(48, { color: ORG, lineHeight: 1 })}>
                    {loadingStats ? (
                      <span style={{ display: 'inline-block', width: 32, height: 16, background: bg3, borderRadius: 2 }} className="animate-pulse" />
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
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
          className="p-5"
        >
          <div className="space-y-4">
            {/* Section label */}
            <div className="flex items-center gap-2">
              <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
              <span style={bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Filters</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search style={{ width: 16, height: 16, color: text2, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search meetings by title or organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    ...ba(12, 400),
                    width: '100%', paddingLeft: 36, paddingRight: 36, paddingTop: 10, paddingBottom: 10,
                    background: bg3, border: `1px solid ${border}`, color: textC, borderRadius: 4,
                    outline: 'none',
                  }}
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: text2, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </motion.button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center space-x-1" style={{ background: bg3, padding: 4, borderRadius: 4 }}>
                {[
                  { mode: 'table', Icon: Table, title: 'Table View' },
                  { mode: 'grid', Icon: Grid3X3, title: 'Grid View' },
                  { mode: 'list', Icon: List, title: 'List View' },
                ].map(({ mode, Icon, title }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: viewMode === mode ? ORG : 'transparent',
                      color: viewMode === mode ? '#fff' : text2,
                    }}
                    title={title}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  {sortOrder === 'asc'
                    ? <SortAsc style={{ width: 16, height: 16, color: text2 }} />
                    : <SortDesc style={{ width: 16, height: 16, color: text2 }} />}
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  style={{
                    ...ba(12, 400),
                    width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    background: bg3, border: `1px solid ${border}`, color: textC,
                    borderRadius: 4, outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="startTime-desc">Newest First</option>
                  <option value="startTime-asc">Oldest First</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Filter style={{ width: 16, height: 16, color: text2 }} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    ...ba(12, 400),
                    width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    background: bg3, border: `1px solid ${border}`, color: textC,
                    borderRadius: 4, outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
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
              style={{
                background: 'rgba(232,64,64,.08)', border: '1px solid rgba(232,64,64,.25)',
                borderRadius: 4, padding: '12px 16px', color: '#e84040',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span style={ba(12, 500)}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meetings Content */}
        {loading ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="p-12 text-center">
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `3px solid ${border}`,
                  borderTopColor: ORG,
                }}
              />
              <span style={{ ...ba(12, 500), color: text2 }}>Loading meetings...</span>
            </div>
          </div>
        ) : meetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
            className="w-full p-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Video style={{ width: 64, height: 64, margin: '0 auto 16px', color: text3 }} />
            </motion.div>
            <p style={{ ...ba(15, 600), color: textC, marginBottom: 8 }}>
              {searchTerm || statusFilter !== 'ALL' ? 'No Meetings Found' : 'No Meetings Available'}
            </p>
            <p style={{ ...ba(12, 400), color: text2, marginBottom: 16 }}>
              {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Schedule a new meeting to get started.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard/meetings/create')}
                style={{
                  ...bc(12, 600),
                  background: ORG, color: '#fff', borderRadius: 4,
                  padding: '8px 16px', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                <span>Schedule First Meeting</span>
              </motion.button>
            )}
          </motion.div>
        ) : null}

        {!loading && meetings.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 4,
                background: operationStatus.type === 'success' ? 'rgba(74,222,128,.12)' : 'rgba(232,64,64,.12)',
                border: `1px solid ${operationStatus.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(232,64,64,.3)'}`,
                color: operationStatus.type === 'success' ? '#4ade80' : '#e84040',
                ...ba(12, 600),
              }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {operationStatus.type === 'success'
                    ? <CheckCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
                    : <XCircle style={{ width: 20, height: 20, flexShrink: 0 }} />}
                </motion.div>
                <span>{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, marginLeft: 8 }}
                >
                  <X style={{ width: 16, height: 16 }} />
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
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      border: `4px solid ${border}`,
                      borderTopColor: ORG,
                    }}
                  />
                  <span style={{ ...ba(13, 600), color: textC }}>Processing...</span>
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
                transition={{ type: 'spring', duration: 0.5 }}
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 420 }}
              >
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.2 }}
                    style={{
                      width: 48, height: 48, borderRadius: 4, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.2)',
                    }}
                  >
                    <AlertTriangle style={{ width: 24, height: 24, color: '#e84040' }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 style={{ ...ba(15, 700), color: textC, marginBottom: 4 }}>Delete Meeting?</h3>
                    <p style={{ ...ba(12, 400), color: text2 }}>This action cannot be undone</p>
                  </div>
                </div>
                <div style={{ background: bg3, borderRadius: 4, padding: 16, marginBottom: 24 }}>
                  <p style={{ ...ba(12, 400), color: text2 }}>
                    Are you sure you want to delete <span style={{ fontWeight: 700, color: textC }}>"{deleteConfirm.title || 'N/A'}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      ...bc(12, 600),
                      background: bg3, border: `1px solid ${border}`, color: textC,
                      borderRadius: 4, padding: '8px 20px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    style={{
                      ...bc(12, 600),
                      background: '#e84040', color: '#fff',
                      borderRadius: 4, padding: '8px 20px', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Delete Meeting
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

export default MeetingManagement;
