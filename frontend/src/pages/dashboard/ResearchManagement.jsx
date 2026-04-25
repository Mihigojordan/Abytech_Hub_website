import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronDown, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, RefreshCw,
  Grid3X3, List, Clock, Calendar, Table, Download, FileText,
  TrendingUp, Users, Filter, SortAsc, SortDesc, Sparkles,
  Beaker, BookOpen, Target, Lightbulb, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import researchService from '../../services/researchService';
import { useNavigate } from 'react-router-dom';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const ResearchManagement = () => {
  const [researches, setResearches] = useState([]);
  const [allResearches, setAllResearches] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    inProgress: 0,
    completed: 0,
    published: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const navigate = useNavigate();

  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const statusConfig = {
    DRAFT: { label: 'Draft', color: '#e8621a', bg: 'rgba(232,98,26,.15)' },
    IN_PROGRESS: { label: 'In Progress', color: '#e8621a', bg: 'rgba(232,98,26,.15)' },
    COMPLETED: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,.15)' },
    REVIEW: { label: 'Review', color: '#1a5c78', bg: 'rgba(26,92,120,.15)' },
    PUBLISHED: { label: 'Published', color: '#22c55e', bg: 'rgba(34,197,94,.15)' }
  };

  const typeConfig = {
    TECHNICAL: { label: 'Technical', icon: FlaskConical, color: 'rgb(59, 130, 246)' },
    MARKET: { label: 'Market', icon: TrendingUp, color: 'rgb(34, 197, 94)' },
    USER: { label: 'User', icon: Users, color: 'rgb(168, 85, 247)' },
    PERFORMANCE: { label: 'Performance', icon: Target, color: ORG },
    OTHER: { label: 'Other', icon: Lightbulb, color: 'rgb(107, 114, 128)' }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allResearches, statusFilter, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingStats(true);
      const response = await researchService.getAllResearches({ page: 1, limit: 1000 });
      const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setAllResearches(data);

      // Calculate stats
      const statsData = {
        total: data.length,
        draft: data.filter(r => r.status === 'DRAFT').length,
        inProgress: data.filter(r => r.status === 'IN_PROGRESS').length,
        completed: data.filter(r => r.status === 'COMPLETED').length,
        published: data.filter(r => r.status === 'PUBLISHED').length
      };
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load researches');
      setAllResearches([]);
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allResearches];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(research => research.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(research => research.type === typeFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (research) =>
          research?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          research?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          research?.owner?.adminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'startDate' || sortBy === 'endDate') {
        const aDate = new Date(aValue || 0);
        const bDate = new Date(bValue || 0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    setResearches(filtered);
    setCurrentPage(1);
  };

  const handleCreateResearch = () => {
    navigate('/admin/dashboard/research/create');
  };

  const handleEditResearch = (research) => {
    if (!research?.id) return;
    navigate(`/admin/dashboard/research/edit/${research.id}`);
  };

  const handleViewResearch = (research) => {
    if (!research?.id) return;
    navigate(`/admin/dashboard/research/view/${research.id}`);
  };

  const handleDeleteResearch = async (research) => {
    if (!research?.id) {
      showOperationStatus('error', 'Invalid research ID');
      return;
    }
    try {
      setOperationLoading(true);
      await researchService.deleteResearch(research.id);
      setDeleteConfirm(null);
      await loadData();
      showOperationStatus('success', `"${research.title}" deleted successfully!`);
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to delete research');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Type', 'Status', 'Owner', 'Start Date', 'End Date', 'Created'],
      ...researches.map(research => [
        research.title,
        research.type,
        research.status,
        research.owner?.adminName || 'Unknown',
        formatDate(research.startDate),
        formatDate(research.endDate),
        formatDate(research.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `researches_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showOperationStatus('success', 'Researches exported successfully!');
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
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span style={{
        padding: '2px 10px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.color,
        fontFamily: "'Barlow Condensed',sans-serif",
      }}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const config = typeConfig[type] || typeConfig.OTHER;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" style={{ color: config.color }} />;
  };

  const totalPages = Math.ceil(researches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResearches = researches.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ background: bg3 }}>
            <tr>
              <th
                className="text-left py-3 px-4 cursor-pointer"
                style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}
                onClick={() => { setSortBy('title'); setSortOrder(sortBy === 'title' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'title' ? (sortOrder === 'asc' ? 'rotate-180' : '') : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Type</th>
              <th className="text-left py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Status</th>
              <th className="text-left py-3 px-4 hidden md:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Owner</th>
              <th
                className="text-left py-3 px-4 cursor-pointer hidden lg:table-cell"
                style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}
                onClick={() => { setSortBy('createdAt'); setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'rotate-180' : '') : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-right py-3 px-4" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentResearches.map((research, index) => (
              <motion.tr
                key={research.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ background: bg2, borderBottom: `1px solid ${border}`, cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = bg2}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(research.type)}
                    <span style={{ ...ba(12, 500, { color: textC }) }}>{research.title || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-3 px-4" style={{ color: text2, ...ba(12) }}>{typeConfig[research.type]?.label || research.type}</td>
                <td className="py-3 px-4">{getStatusBadge(research.status)}</td>
                <td className="py-3 px-4 hidden md:table-cell" style={{ color: text2, ...ba(12) }}>{research.owner?.adminName || 'Unknown'}</td>
                <td className="py-3 px-4 hidden lg:table-cell" style={{ color: text2, ...ba(12) }}>{formatDate(research.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewResearch(research)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 7px', color: text2 }}
                      title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditResearch(research)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 7px', color: text2 }}
                      title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(research)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 7px', color: '#e84040' }}
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
      {currentResearches.map((research, index) => (
        <motion.div
          key={research.id}
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
                  {getStatusBadge(research.status)}
                </div>
                <h3 style={{ ...ba(13, 600, { color: textC }) }} className="mb-1 line-clamp-2 leading-snug">{research.title}</h3>
                <p style={{ ...ba(11, 400, { color: text2 }) }} className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{research.owner?.adminName || 'Unknown'}</span>
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 40, height: 40, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)',
                  flexShrink: 0,
                }}
              >
                {getTypeIcon(research.type)}
              </motion.div>
            </div>

            {research.description && (
              <p style={{ ...ba(11, 400, { color: text2 }) }} className="mb-3 line-clamp-2">{research.description}</p>
            )}

            <div className="flex items-center mb-4 pb-4 space-x-4" style={{ borderBottom: `1px solid ${border}` }}>
              <span className="flex items-center" style={{ ...ba(11, 400, { color: text2 }) }}>
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(research.createdAt)}
              </span>
              <span style={{ ...bc(10, 600, { color: text2, background: bg3, padding: '2px 8px', borderRadius: 4 }) }}>
                {typeConfig[research.type]?.label || research.type}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewResearch(research)}
                  style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 10px' }) }}
                  className="flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditResearch(research)}
                  style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 10px' }) }}
                  className="flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(research)}
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px', color: '#e84040' }}
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
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full">
      {currentResearches.map((research, index) => (
        <motion.div
          key={research.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          style={{ borderBottom: `1px solid ${border}`, background: bg2 }}
          className="p-4"
          onMouseEnter={e => e.currentTarget.style.background = bg3}
          onMouseLeave={e => e.currentTarget.style.background = bg2}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center space-x-3">
              <div style={{
                width: 40, height: 40, borderRadius: 4, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)',
              }}>
                {getTypeIcon(research.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 style={{ ...ba(13, 600, { color: textC }) }}>{research.title}</h3>
                  {getStatusBadge(research.status)}
                </div>
                <p style={{ ...ba(11, 400, { color: text2 }) }} className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {research.owner?.adminName || 'Unknown'}
                  </span>
                  <span className="hidden sm:flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(research.createdAt)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewResearch(research)}
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px', color: text2 }} title="View">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditResearch(research)}
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px', color: text2 }} title="Edit">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(research)}
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px', color: '#e84040' }} title="Delete">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (researches.length === 0) return null;

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
        <div style={{ ...ba(11, 400, { color: text2 }) }} className="flex items-center space-x-2">
          <span>Showing <span style={{ fontWeight: 600, color: textC }}>{startIndex + 1}</span>–<span style={{ fontWeight: 600, color: textC }}>{Math.min(endIndex, researches.length)}</span> of <span style={{ fontWeight: 600, color: textC }}>{researches.length}</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 10px' }), opacity: currentPage === 1 ? 0.4 : 1 }}
          >
            First
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 8px', color: text2, opacity: currentPage === 1 ? 0.4 : 1 }}
            className="flex items-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>

          {getPageNumbers().map(page => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              style={currentPage === page
                ? { ...bc(11, 700, { color: '#fff', background: ORG, borderRadius: 4, padding: '5px 10px' })  }
                : { ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 10px' }) }
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
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 8px', color: text2, opacity: currentPage === totalPages ? 0.4 : 1 }}
            className="flex items-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '5px 10px' }), opacity: currentPage === totalPages ? 0.4 : 1 }}
          >
            Last
          </motion.button>
        </div>
      </div>
    );
  };

  const statCards = [
    {
      label: 'Total Research',
      value: stats.total,
      icon: Beaker,
    },
    {
      label: 'Draft',
      value: stats.draft,
      icon: FileText,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
    },
    {
      label: 'Published',
      value: stats.published,
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }} className="relative overflow-hidden">
        <div className="mx-auto px-1 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {/* Orange left accent bar */}
                <div style={{ width: 4, height: 28, background: ORG, borderRadius: 2, flexShrink: 0 }} />
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                </motion.div>
                <h1 style={bb(28, { color: ORG, lineHeight: 1 })}>
                  Research Management
                </h1>
              </div>
              <p style={bc(11, 400, { color: text2, marginLeft: 7 })}>Manage and track all research projects</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={researches.length === 0}
                style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px 12px', opacity: researches.length === 0 ? 0.5 : 1 }) }}
                className="flex items-center space-x-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                disabled={loading}
                style={{ ...bc(11, 600, { color: text2, background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '7px 12px', opacity: loading ? 0.5 : 1 }) }}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateResearch}
                disabled={operationLoading}
                style={{ background: ORG, color: '#fff', borderRadius: 4, padding: '7px 14px', ...bc(11, 700, {}), opacity: operationLoading ? 0.7 : 1 }}
                className="flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Research</span>
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
                    padding: 10, borderRadius: 4,
                    background: 'rgba(232,98,26,.1)',
                    border: '1px solid rgba(232,98,26,.2)',
                  }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: ORG }} />
                </motion.div>
                <div className="flex-1">
                  <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })} className="mb-0.5">{stat.label}</p>
                  <p style={bb(48, { color: ORG, lineHeight: 1 })}>
                    {loadingStats ? (
                      <span style={{ display: 'inline-block', width: 32, height: 16, background: bg3, borderRadius: 4 }} className="animate-pulse" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: text2 }} />
                <input
                  type="text"
                  placeholder="Search research by title or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: searchTerm ? 36 : 14,
                    paddingTop: 9, paddingBottom: 9,
                    background: bg3, border: `1px solid ${border}`, borderRadius: 4,
                    color: textC, outline: 'none',
                    ...ba(12, 400, {}),
                  }}
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: text2 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center space-x-1 p-1" style={{ background: bg3, borderRadius: 4, border: `1px solid ${border}` }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  style={viewMode === 'table'
                    ? { background: ORG, color: '#fff', borderRadius: 4, padding: 7 }
                    : { color: text2, borderRadius: 4, padding: 7 }
                  }
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  style={viewMode === 'grid'
                    ? { background: ORG, color: '#fff', borderRadius: 4, padding: 7 }
                    : { color: text2, borderRadius: 4, padding: 7 }
                  }
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  style={viewMode === 'list'
                    ? { background: ORG, color: '#fff', borderRadius: 4, padding: 7 }
                    : { color: text2, borderRadius: 4, padding: 7 }
                  }
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" style={{ color: text2 }} /> : <SortDesc className="w-4 h-4" style={{ color: text2 }} />}
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    background: bg3, border: `1px solid ${border}`, borderRadius: 4,
                    color: textC, outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                    ...ba(12, 400, {}),
                  }}
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4" style={{ color: text2 }} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    background: bg3, border: `1px solid ${border}`, borderRadius: 4,
                    color: textC, outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                    ...ba(12, 400, {}),
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REVIEW">Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Beaker className="w-4 h-4" style={{ color: text2 }} />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 14,
                    paddingTop: 9, paddingBottom: 9,
                    background: bg3, border: `1px solid ${border}`, borderRadius: 4,
                    color: textC, outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                    ...ba(12, 400, {}),
                  }}
                >
                  <option value="ALL">All Types</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="MARKET">Market</option>
                  <option value="USER">User</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="OTHER">Other</option>
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
                background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)',
                borderRadius: 4, padding: '12px 16px', color: '#e84040',
              }}
              className="flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span style={ba(12, 600, {})}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Research Content */}
        {loading ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="p-12 text-center">
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  border: `3px solid ${border}`,
                  borderTopColor: ORG,
                }}
              />
              <span style={bc(11, 600, { color: text2 })}>Loading researches...</span>
            </div>
          </div>
        ) : researches.length === 0 ? (
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
              <Beaker className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
            </motion.div>
            <p style={bb(28, { color: textC, lineHeight: 1 })} className="mb-2">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No Research Found' : 'No Research Available'}
            </p>
            <p style={bc(12, 400, { color: text2 })} className="mb-4">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Create a new research project to get started.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && typeFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateResearch}
                style={{ background: ORG, color: '#fff', borderRadius: 4, padding: '8px 18px', ...bc(12, 700, {}) }}
                className="inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Research</span>
              </motion.button>
            )}
          </motion.div>
        ) : null}

        {!loading && researches.length > 0 && (
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
              <div style={operationStatus.type === 'success'
                ? { background: 'rgba(34,197,94,.15)', border: '2px solid rgba(34,197,94,.4)', color: '#22c55e', borderRadius: 4, padding: '10px 16px' }
                : { background: 'rgba(232,64,64,.15)', border: '2px solid rgba(232,64,64,.4)', color: '#e84040', borderRadius: 4, padding: '10px 16px' }
              } className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {operationStatus.type === 'success' ?
                    <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  }
                </motion.div>
                <span style={bc(12, 700, {})}>{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  className="ml-2 rounded-full p-1"
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
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 48, height: 48,
                      borderRadius: '50%',
                      border: `4px solid ${border}`,
                      borderTopColor: ORG,
                    }}
                  />
                  <span style={bc(13, 700, { color: textC })}>Processing...</span>
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
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
                className="w-full max-w-md p-6"
              >
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.2 }}
                    style={{
                      width: 48, height: 48, borderRadius: 4,
                      background: 'rgba(232,64,64,.15)',
                      border: '1px solid rgba(232,64,64,.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <AlertTriangle className="w-6 h-6" style={{ color: '#e84040' }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 style={bb(22, { color: textC, lineHeight: 1 })} className="mb-1">Delete Research?</h3>
                    <p style={bc(11, 400, { color: text2 })}>This action cannot be undone</p>
                  </div>
                </div>
                <div style={{ background: bg3, borderRadius: 4, padding: '12px 16px', marginBottom: 24 }}>
                  <p style={ba(12, 400, { color: text2 })}>
                    Are you sure you want to delete{' '}
                    <span style={{ fontWeight: 700, color: textC }}>"{deleteConfirm.title || 'N/A'}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '8px 20px', color: textC, ...bc(12, 600, {}) }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteResearch(deleteConfirm)}
                    style={{ background: '#e84040', color: '#fff', borderRadius: 4, padding: '8px 20px', ...bc(12, 700, {}) }}
                  >
                    Delete Research
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

export default ResearchManagement;
