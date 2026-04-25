import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  X, RefreshCw, Target, CheckCircle, XCircle, AlertCircle,
  Clock, Calendar, CheckSquare, Square, TrendingUp, Sparkles,
  Users, Filter, AlertTriangle, Eye, Grid3X3, List, Table,
  SortAsc, SortDesc, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import weeklyGoalService from '../../services/weeklyGoalService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending' },
  IN_PROGRESS: { label: 'In Progress' },
  COMPLETED:   { label: 'Completed' },
  MISSED:      { label: 'Missed' },
};

const primaryColor = ORG;

const WeeklyGoalManagement = () => {
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, missed: 0, averageProgress: 0 });
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadGoals(); loadStats(); }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);
  useEffect(() => { setCurrentPage(1); }, [viewMode, itemsPerPage]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await weeklyGoalService.getAllWeeklyGoals({ page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter });
      setGoals(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
      setGoals([]);
    } finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await weeklyGoalService.getWeeklyGoalStats();
      setStats(data);
    } catch (err) { console.error('Failed to load stats:', err); }
    finally { setLoadingStats(false); }
  };

  const showOperationMessage = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleAddTask = async () => {
    setOperationLoading(true);
    try {
      await weeklyGoalService.addTask(selectedGoal.id, newTask);
      showOperationMessage('success', 'Task added successfully!');
      setNewTask({ title: '', description: '' });
      setShowTaskModal(false);
      loadGoals();
    } catch (err) { showOperationMessage('error', err.message || 'Failed to add task'); }
    finally { setOperationLoading(false); }
  };

  const handleToggleTask = async (goalId, taskId) => {
    try { await weeklyGoalService.toggleTask(goalId, taskId); loadGoals(); }
    catch { showOperationMessage('error', 'Failed to update task'); }
  };

  const handleDelete = async (goal) => {
    setOperationLoading(true);
    try {
      await weeklyGoalService.deleteWeeklyGoal(goal.id);
      showOperationMessage('success', `"${goal.title}" deleted successfully!`);
      setDeleteConfirm(null);
      loadGoals(); loadStats();
    } catch (err) { showOperationMessage('error', err.message || 'Failed to delete goal'); }
    finally { setOperationLoading(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getProgressColor = (p) => {
    if (p >= 80) return '#22c55e';
    if (p >= 50) return ORG;
    if (p >= 25) return TEAL;
    return 'rgba(128,128,128,0.5)';
  };

  const getStatusBadge = (status) => {
    let bg, color;
    switch (status) {
      case 'COMPLETED':
        bg = 'rgba(34,197,94,.15)'; color = '#22c55e'; break;
      case 'IN_PROGRESS':
      case 'ONGOING':
        bg = `rgba(232,98,26,.15)`; color = ORG; break;
      case 'NOT_STARTED':
      case 'PENDING':
        bg = `rgba(26,92,120,.15)`; color = TEAL; break;
      default:
        if (status && status.toLowerCase().includes('cancel')) {
          bg = 'rgba(232,64,64,.15)'; color = '#e84040';
        } else {
          bg = `rgba(26,92,120,.15)`; color = TEAL;
        }
    }
    const label = STATUS_CONFIG[status]?.label || status;
    return (
      <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase' }) }}>
        {label}
      </span>
    );
  };

  const statCards = [
    { label: 'Total Goals', value: stats.total, icon: Target, color: ORG, bgColor: 'rgba(232,98,26,0.1)' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: TEAL, bgColor: 'rgba(26,92,120,0.1)' },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: ORG, bgColor: 'rgba(232,98,26,0.1)' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
    { label: 'Missed', value: stats.missed, icon: XCircle, color: '#e84040', bgColor: 'rgba(232,64,64,0.1)' },
    { label: 'Avg Progress', value: `${stats.averageProgress ?? 0}%`, icon: TrendingUp, color: ORG, bgColor: 'rgba(232,98,26,0.1)' },
  ];

  const getPageNumbers = () => {
    const pages = [], show = 5;
    let start = Math.max(1, currentPage - Math.floor(show / 2));
    let end = Math.min(totalPages, start + show - 1);
    if (end - start < show - 1) start = Math.max(1, end - show + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ─── TABLE VIEW ──────────────────────────────────────────────────────────────
  const renderTableView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ background: bg3 }}>
            <tr>
              {[['title', 'Title'], ['status', 'Status'], [null, 'Progress'], [null, 'Tasks'], ['weekStart', 'Week'], [null, 'Owner'], [null, 'Actions']].map(([field, label], i) => (
                <th key={i}
                  className={`text-left py-3 px-4 ${field ? 'cursor-pointer' : ''} ${i >= 5 ? 'hidden lg:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}
                  style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}
                  onClick={field ? () => { setSortBy(field); setSortOrder(sortBy === field ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); } : undefined}
                >
                  {field ? (
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      <ChevronLeft style={{ color: text2, opacity: sortBy === field ? 1 : 0.3 }} className={`w-3 h-3 transition-transform rotate-90 ${sortBy === field ? (sortOrder === 'asc' ? 'rotate-[270deg]' : 'rotate-90') : ''}`} />
                    </div>
                  ) : label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, index) => {
              const tasks = goal.tasks || [];
              const done = tasks.filter(t => t.done).length;
              const progress = goal.progress || 0;
              return (
                <motion.tr key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                  style={{ background: bg2, borderBottom: `1px solid ${border}`, cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg3}
                  onMouseLeave={e => e.currentTarget.style.background = bg2}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)' }}>
                        <Target className="w-3.5 h-3.5" style={{ color: ORG }} />
                      </div>
                      <span className="font-medium line-clamp-1" style={{ color: textC }}>{goal.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(goal.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2 min-w-[80px]">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: bg3 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }}
                          style={{ height: '100%', background: getProgressColor(progress), borderRadius: 4 }} />
                      </div>
                      <span className="text-[10px] w-7 text-right" style={{ color: text2 }}>{progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color: text2 }}>{done}/{tasks.length}</td>
                  <td className="py-3 px-4 hidden lg:table-cell" style={{ color: text2 }}>{formatDate(goal.weekStart)}</td>
                  <td className="py-3 px-4 hidden lg:table-cell" style={{ color: text2 }}>{goal.owner?.adminName || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-1">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)}
                        style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 6px', color: text2 }}
                        title="View"><Eye className="w-3.5 h-3.5" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)}
                        style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 6px', color: ORG }}
                        title="Edit"><Edit className="w-3.5 h-3.5" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(goal)}
                        style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 6px', color: '#e84040' }}
                        title="Delete"><Trash2 className="w-3.5 h-3.5" /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── GRID / CARD VIEW ────────────────────────────────────────────────────────
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal, index) => {
        const tasks = goal.tasks || [];
        const done = tasks.filter(t => t.done).length;
        const progress = goal.progress || 0;
        return (
          <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }}
            style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <div className="mb-1.5">{getStatusBadge(goal.status)}</div>
                  <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: textC }}>{goal.title}</h3>
                  {goal.owner?.adminName && (
                    <p className="text-[10px] mt-0.5 flex items-center space-x-1" style={{ color: text2 }}>
                      <Users className="w-3 h-3" /><span>{goal.owner.adminName}</span>
                    </p>
                  )}
                </div>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                  <Target className="w-5 h-5" style={{ color: ORG }} />
                </motion.div>
              </div>

              {goal.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: text2 }}>{goal.description}</p>}

              {/* Week range */}
              <div className="flex items-center text-[10px] mb-3 space-x-1" style={{ color: text2 }}>
                <Calendar className="w-3 h-3" />
                <span>{formatDate(goal.weekStart)} — {formatDate(goal.weekEnd)}</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: text2 }}>Progress</span>
                  <span className="font-semibold" style={{ color: textC }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg3 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: getProgressColor(progress), borderRadius: 4 }} />
                </div>
              </div>

              {/* Tasks preview */}
              <div className="pt-3 mb-3" style={{ borderTop: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium" style={{ color: text2 }}>Tasks • {done}/{tasks.length}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                    className="text-[10px] font-medium flex items-center space-x-0.5" style={{ color: ORG }}>
                    <Plus className="w-3 h-3" /><span>Add</span>
                  </motion.button>
                </div>
                {tasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 text-xs cursor-pointer" onClick={() => handleToggleTask(goal.id, task.id)}>
                        {task.done
                          ? <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                          : <Square className="w-3.5 h-3.5 flex-shrink-0" style={{ color: text3 }} />}
                        <span className="line-clamp-1" style={{ color: task.done ? text2 : textC, textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                      </div>
                    ))}
                    {tasks.length > 3 && <div className="text-[10px] pl-5" style={{ color: text2 }}>+{tasks.length - 3} more</div>}
                  </div>
                ) : (
                  <button onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                    className="w-full py-2 text-[10px] transition-colors"
                    style={{ border: `1px dashed ${border}`, borderRadius: 4, color: text2, background: 'transparent' }}>
                    + Add first task
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)}
                    className="flex items-center space-x-1 text-[10px] font-medium px-2.5 py-1.5"
                    style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
                    <Eye className="w-3.5 h-3.5" /><span>View</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)}
                    className="flex items-center space-x-1 text-[10px] font-medium px-2.5 py-1.5"
                    style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: ORG }}>
                    <Edit className="w-3.5 h-3.5" /><span>Edit</span>
                  </motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(goal)}
                  className="p-1.5"
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: '#e84040' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // ─── LIST VIEW ───────────────────────────────────────────────────────────────
  const renderListView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full overflow-hidden">
      {goals.map((goal, index) => {
        const tasks = goal.tasks || [];
        const done = tasks.filter(t => t.done).length;
        const progress = goal.progress || 0;
        return (
          <motion.div key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
            style={{ borderBottom: `1px solid ${border}`, padding: 16, background: bg2 }}
            onMouseEnter={e => e.currentTarget.style.background = bg3}
            onMouseLeave={e => e.currentTarget.style.background = bg2}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                  <Target className="w-5 h-5" style={{ color: ORG }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: textC }}>{goal.title}</h3>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="flex items-center space-x-3 text-xs" style={{ color: text2 }}>
                    {goal.owner?.adminName && <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{goal.owner.adminName}</span></span>}
                    <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formatDate(goal.weekStart)}</span></span>
                    <span className="flex items-center space-x-1"><CheckSquare className="w-3 h-3" /><span>{done}/{tasks.length} tasks</span></span>
                  </div>
                  {/* Inline progress */}
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="flex-1 max-w-[160px] h-1.5 rounded-full overflow-hidden" style={{ background: bg3 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }}
                        style={{ height: '100%', background: getProgressColor(progress), borderRadius: 4 }} />
                    </div>
                    <span className="text-[10px]" style={{ color: text2 }}>{progress}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, color: text2 }}>
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, color: ORG }}>
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(goal)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, color: '#e84040' }}>
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // ─── PAGINATION ──────────────────────────────────────────────────────────────
  const renderPagination = () => {
    if (goals.length === 0) return null;
    return (
      <div className="flex items-center justify-between px-2 py-3 mt-4" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
        <div className="text-xs" style={{ color: text2 }}>
          Page <span className="font-semibold" style={{ color: textC }}>{currentPage}</span> of <span className="font-semibold" style={{ color: textC }}>{totalPages}</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
            className="px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>First</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="flex items-center px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          {getPageNumbers().map(page => (
            <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(page)}
              className="px-3 py-1.5 text-xs"
              style={currentPage === page
                ? { background: ORG, color: '#fff', borderRadius: 4, fontWeight: 700 }
                : { background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
              {page}
            </motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="flex items-center px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>Last</motion.button>
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: bg }}>

      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div style={{ width: 3, height: 24, background: ORG, borderRadius: 2, marginRight: 4 }} />
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>
                  <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                </motion.div>
                <h1 style={bb(28, { color: ORG, lineHeight: 1 })}>Weekly Goals</h1>
              </div>
              <p className="text-xs" style={{ color: text2 }}>Track and manage weekly objectives &amp; tasks</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={loadGoals} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs disabled:opacity-50 transition-all"
                style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: ORG }} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard/weekly-goals/new')}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium transition-all"
                style={{ background: ORG, color: '#fff', borderRadius: 4 }}>
                <Plus className="w-3.5 h-3.5" /><span>New Goal</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4, scale: 1.02 }}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}
                  style={{ padding: 10, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                  <stat.icon className="w-4 h-4" style={{ color: ORG }} />
                </motion.div>
                <div className="flex-1">
                  <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>{stat.label}</p>
                  <p style={bb(28, { color: ORG, lineHeight: 1.1 })}>
                    {loadingStats ? <span className="inline-block w-8 h-4 rounded animate-pulse" style={{ background: bg3 }} /> : (stat.value ?? '-')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search / Filter / View Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 20 }}>
          <div className="space-y-4">
            {/* Section label */}
            <div className="flex items-center space-x-2 mb-1">
              <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
              <span style={bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Search &amp; Filter</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: text2 }} />
                <input type="text" placeholder="Search goals by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs transition-all"
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none' }} />
                {searchTerm && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: text2 }}>
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 p-1" style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4 }}>
                {[['table', Table, 'Table'], ['grid', Grid3X3, 'Grid'], ['list', List, 'List']].map(([mode, Icon, label]) => (
                  <motion.button key={mode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    style={viewMode === mode
                      ? { background: ORG, color: '#fff', padding: 8, borderRadius: 4 }
                      : { color: text2, padding: 8, borderRadius: 4, background: 'transparent' }}
                    title={`${label} View`}>
                    <Icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status filter + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs appearance-none cursor-pointer transition-all"
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none' }}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" style={{ color: text2 }} /> : <SortDesc className="w-4 h-4" style={{ color: text2 }} />}
                </div>
                <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs appearance-none cursor-pointer transition-all"
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none' }}>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="weekStart-desc">Week (Latest)</option>
                  <option value="weekStart-asc">Week (Earliest)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="p-4 text-xs flex items-center space-x-2"
              style={{ background: 'rgba(232,64,64,.08)', border: '1px solid rgba(232,64,64,.25)', borderRadius: 4, color: '#e84040' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full"
                style={{ border: `3px solid ${bg3}`, borderTopColor: ORG }} />
              <span className="text-xs font-medium" style={{ color: text2 }}>Loading goals...</span>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Target className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
            </motion.div>
            <p className="text-base font-semibold mb-2" style={{ color: textC }}>{searchTerm || statusFilter ? 'No Matching Goals' : 'No Weekly Goals Yet'}</p>
            <p className="text-xs mb-4" style={{ color: text2 }}>{searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Create your first weekly goal to get started.'}</p>
            {!searchTerm && !statusFilter && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard/weekly-goals/new')}
                className="inline-flex items-center space-x-2 px-4 py-2 font-medium text-xs"
                style={{ background: ORG, color: '#fff', borderRadius: 4 }}>
                <Plus className="w-4 h-4" /><span>Create First Goal</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {viewMode === 'table' && renderTableView()}
                {viewMode === 'grid' && renderGridView()}
                {viewMode === 'list' && renderListView()}
              </motion.div>
            </AnimatePresence>
            {totalPages > 1 && renderPagination()}
          </motion.div>
        )}

        {/* Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-50">
              <div className="flex items-center space-x-3 px-4 py-3 text-xs"
                style={operationStatus.type === 'success'
                  ? { background: 'rgba(34,197,94,.12)', border: '2px solid rgba(34,197,94,.4)', borderRadius: 4, color: '#22c55e' }
                  : { background: 'rgba(232,64,64,.12)', border: '2px solid rgba(232,64,64,.4)', borderRadius: 4, color: '#e84040' }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                  {operationStatus.type === 'success'
                    ? <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                    : <XCircle className="w-5 h-5" style={{ color: '#e84040' }} />}
                </motion.div>
                <span className="font-semibold">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.2, rotate: 90 }} onClick={() => setOperationStatus(null)} className="ml-2 p-1 rounded-full">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {operationLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-40"
              style={{ background: 'rgba(0,0,0,.75)' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="p-8" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
                <div className="flex flex-col items-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full"
                    style={{ border: `4px solid ${bg3}`, borderTopColor: ORG }} />
                  <span className="text-sm font-semibold" style={{ color: textC }}>Processing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.75)' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md p-6"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2 }}
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.2)', borderRadius: 4 }}>
                    <AlertTriangle className="w-6 h-6" style={{ color: '#e84040' }} />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold mb-1" style={{ color: textC }}>Delete Goal?</h3>
                    <p className="text-xs" style={{ color: text2 }}>This action cannot be undone</p>
                  </div>
                </div>
                <div className="rounded p-4 mb-6" style={{ background: bg3, border: `1px solid ${border}` }}>
                  <p className="text-xs" style={{ color: text2 }}>
                    Are you sure you want to delete <span className="font-bold" style={{ color: textC }}>"{deleteConfirm.title}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-5 py-2.5 text-xs font-semibold transition-all"
                    style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC }}>Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-5 py-2.5 text-xs font-semibold transition-all"
                    style={{ background: '#e84040', color: '#fff', borderRadius: 4 }}>Delete Goal</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showTaskModal && selectedGoal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.75)' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md p-6"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
                <div className="flex items-start justify-between mb-5 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center"
                      style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}>
                      <CheckSquare className="w-5 h-5" style={{ color: ORG }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: textC }}>Add New Task</h3>
                      <p className="text-xs line-clamp-1" style={{ color: text2 }}>{selectedGoal.title}</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTaskModal(false)}
                    className="p-2 transition-colors"
                    style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: text2 }}>
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: text2 }}>Task Title *</label>
                    <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      className="w-full px-3 py-2.5 text-xs transition-all"
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: text2 }}>Description (optional)</label>
                    <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3} placeholder="Task details or notes..."
                      className="w-full px-3 py-2.5 text-xs transition-all resize-none"
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none' }} />
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTaskModal(false)}
                      className="px-4 py-2 text-xs font-medium transition-colors"
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC }}>Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                      onClick={handleAddTask} disabled={!newTask.title.trim()}
                      className="px-5 py-2.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: ORG, color: '#fff', borderRadius: 4 }}>Add Task</motion.button>
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

export default WeeklyGoalManagement;
