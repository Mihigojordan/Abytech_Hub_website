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

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  IN_PROGRESS: { label: 'In Progress', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  COMPLETED: { label: 'Completed', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  MISSED: { label: 'Missed', bgColor: 'bg-red-100', textColor: 'text-red-700' },
};

const primaryColor = 'rgb(249, 115, 22)';

const WeeklyGoalManagement = () => {
  const navigate = useNavigate();
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
    if (p >= 80) return 'from-green-500 to-emerald-600';
    if (p >= 50) return 'from-blue-500 to-indigo-600';
    if (p >= 25) return 'from-yellow-500 to-amber-600';
    return 'from-gray-400 to-gray-500';
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}>{cfg.label}</span>;
  };

  const statCards = [
    { label: 'Total Goals', value: stats.total, icon: Target, color: primaryColor, bgColor: 'rgba(249,115,22,0.1)', gradient: 'from-orange-500 to-amber-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'rgb(234,179,8)', bgColor: 'rgba(234,179,8,0.1)', gradient: 'from-yellow-500 to-amber-600' },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'rgb(59,130,246)', bgColor: 'rgba(59,130,246,0.1)', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'rgb(34,197,94)', bgColor: 'rgba(34,197,94,0.1)', gradient: 'from-green-500 to-emerald-600' },
    { label: 'Missed', value: stats.missed, icon: XCircle, color: 'rgb(239,68,68)', bgColor: 'rgba(239,68,68,0.1)', gradient: 'from-red-500 to-rose-600' },
    { label: 'Avg Progress', value: `${stats.averageProgress ?? 0}%`, icon: TrendingUp, color: 'rgb(168,85,247)', bgColor: 'rgba(168,85,247,0.1)', gradient: 'from-purple-500 to-violet-600' },
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ backgroundColor: 'rgba(249,115,22,0.05)' }}>
            <tr>
              {[['title', 'Title'], ['status', 'Status'], [null, 'Progress'], [null, 'Tasks'], ['weekStart', 'Week'], [null, 'Owner'], [null, 'Actions']].map(([field, label], i) => (
                <th key={i}
                  className={`text-left py-3 px-4 font-semibold ${field ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${i >= 5 ? 'hidden lg:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}
                  style={{ color: primaryColor }}
                  onClick={field ? () => { setSortBy(field); setSortOrder(sortBy === field ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); } : undefined}
                >
                  {field ? (
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      <ChevronLeft className={`w-3 h-3 transition-transform rotate-90 ${sortBy === field ? (sortOrder === 'asc' ? 'rotate-[270deg]' : 'rotate-90') : 'opacity-30'}`} />
                    </div>
                  ) : label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {goals.map((goal, index) => {
              const tasks = goal.tasks || [];
              const done = tasks.filter(t => t.done).length;
              const progress = goal.progress || 0;
              return (
                <motion.tr key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                        <Target className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1">{goal.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(goal.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2 min-w-[80px]">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} className={`h-full bg-gradient-to-r ${getProgressColor(progress)}`} />
                      </div>
                      <span className="text-gray-600 text-[10px] w-7 text-right">{progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{done}/{tasks.length}</td>
                  <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{formatDate(goal.weekStart)}</td>
                  <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{goal.owner?.adminName || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-1">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)} className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-50 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(goal)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></motion.button>
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
          <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <div className="mb-1.5">{getStatusBadge(goal.status)}</div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{goal.title}</h3>
                  {goal.owner?.adminName && <p className="text-[10px] text-gray-400 mt-0.5 flex items-center space-x-1"><Users className="w-3 h-3" /><span>{goal.owner.adminName}</span></p>}
                </div>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                  <Target className="w-5 h-5" style={{ color: primaryColor }} />
                </motion.div>
              </div>

              {goal.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{goal.description}</p>}

              {/* Week range */}
              <div className="flex items-center text-[10px] text-gray-400 mb-3 space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(goal.weekStart)} — {formatDate(goal.weekEnd)}</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-gray-700">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full bg-gradient-to-r ${getProgressColor(progress)}`} />
                </div>
              </div>

              {/* Tasks preview */}
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-gray-500">Tasks • {done}/{tasks.length}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }} className="text-[10px] font-medium flex items-center space-x-0.5 transition-colors" style={{ color: primaryColor }}>
                    <Plus className="w-3 h-3" /><span>Add</span>
                  </motion.button>
                </div>
                {tasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center space-x-2 text-xs cursor-pointer group/task" onClick={() => handleToggleTask(goal.id, task.id)}>
                        {task.done ? <CheckSquare className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Square className="w-3.5 h-3.5 text-gray-300 group-hover/task:text-gray-500 flex-shrink-0 transition-colors" />}
                        <span className={`line-clamp-1 ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</span>
                      </div>
                    ))}
                    {tasks.length > 3 && <div className="text-[10px] text-gray-400 pl-5">+{tasks.length - 3} more</div>}
                  </div>
                ) : (
                  <button onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">+ Add first task</button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)} className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-[10px] font-medium transition-colors"><Eye className="w-3.5 h-3.5" /><span>View</span></motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)} className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 px-2.5 py-1.5 rounded-lg hover:bg-yellow-50 text-[10px] font-medium transition-colors"><Edit className="w-3.5 h-3.5" /><span>Edit</span></motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(goal)} className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // ─── LIST VIEW ───────────────────────────────────────────────────────────────
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 w-full">
      {goals.map((goal, index) => {
        const tasks = goal.tasks || [];
        const done = tasks.filter(t => t.done).length;
        const progress = goal.progress || 0;
        return (
          <motion.div key={goal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                  <Target className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{goal.title}</h3>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {goal.owner?.adminName && <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{goal.owner.adminName}</span></span>}
                    <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formatDate(goal.weekStart)}</span></span>
                    <span className="flex items-center space-x-1"><CheckSquare className="w-3 h-3" /><span>{done}/{tasks.length} tasks</span></span>
                  </div>
                  {/* Inline progress */}
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="flex-1 max-w-[160px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} className={`h-full bg-gradient-to-r ${getProgressColor(progress)}`} />
                    </div>
                    <span className="text-[10px] text-gray-500">{progress}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/view/${goal.id}`)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/admin/dashboard/weekly-goals/edit/${goal.id}`)} className="text-gray-400 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition-colors"><Edit className="w-4 h-4" /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteConfirm(goal)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
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
      <div className="flex items-center justify-between bg-white px-2 py-3 border border-gray-100 rounded-xl shadow-sm mt-4">
        <div className="text-xs text-gray-600">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span></div>
        <div className="flex items-center space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">First</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></motion.button>
          {getPageNumbers().map(page => (
            <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentPage === page ? 'text-white font-semibold shadow-sm' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
              style={currentPage === page ? { backgroundColor: primaryColor } : {}}>{page}</motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Last</motion.button>
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -ml-24 -mb-24" />
        <div className="mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>
                  <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-orange-500">Weekly Goals</h1>
              </div>
              <p className="text-xs text-gray-600">Track and manage weekly objectives & tasks</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={loadGoals} disabled={loading} className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin/dashboard/weekly-goals/new')} className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-xs transition-all bg-orange-500 hover:bg-orange-600">
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
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4, scale: 1.02 }} className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative flex items-center space-x-3">
                <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className="p-2.5 rounded-lg shadow-sm" style={{ backgroundColor: stat.bgColor }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-0.5">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {loadingStats ? <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" /> : (stat.value ?? '-')}
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full" style={{ background: stat.color }} />
            </motion.div>
          ))}
        </div>

        {/* Search / Filter / View Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input type="text" placeholder="Search goals by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all" style={{ outline: 'none' }} />
                {searchTerm && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                {[['table', Table, 'Table'], ['grid', Grid3X3, 'Grid'], ['list', List, 'List']].map(([mode, Icon, label]) => (
                  <motion.button key={mode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-md transition-all ${viewMode === mode ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
                    style={viewMode === mode ? { backgroundColor: primaryColor } : {}} title={`${label} View`}>
                    <Icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status filter + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white cursor-pointer" style={{ outline: 'none' }}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-gray-400" /> : <SortDesc className="w-4 h-4 text-gray-400" />}
                </div>
                <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white cursor-pointer" style={{ outline: 'none' }}>
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
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2 shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full" style={{ border: '3px solid rgba(249,115,22,0.2)', borderTopColor: primaryColor }} />
              <span className="text-xs text-gray-600 font-medium">Loading goals...</span>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            </motion.div>
            <p className="text-base font-semibold text-gray-900 mb-2">{searchTerm || statusFilter ? 'No Matching Goals' : 'No Weekly Goals Yet'}</p>
            <p className="text-xs text-gray-500 mb-4">{searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Create your first weekly goal to get started.'}</p>
            {!searchTerm && !statusFilter && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin/dashboard/weekly-goals/new')} className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium shadow-md text-xs bg-orange-500 hover:bg-orange-600">
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
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl text-xs border-2 ${operationStatus.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'}`}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                  {operationStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                </motion.div>
                <span className="font-semibold">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.2, rotate: 90 }} onClick={() => setOperationStatus(null)} className="ml-2 hover:bg-white/50 rounded-full p-1 transition-colors"><X className="w-4 h-4" /></motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {operationLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-full" style={{ border: '4px solid rgba(249,115,22,0.2)', borderTopColor: primaryColor }} />
                  <span className="text-gray-700 text-sm font-semibold">Processing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', duration: 0.5 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2 }} className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">Delete Goal?</h3>
                    <p className="text-xs text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-700">Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.title}"</span>?</p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all">Delete Goal</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showTaskModal && selectedGoal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', duration: 0.5 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
                      <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Add New Task</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{selectedGoal.title}</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></motion.button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task Title *</label>
                    <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Enter task title"
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all" style={{ outline: 'none' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description (optional)</label>
                    <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={3} placeholder="Task details or notes..."
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none" style={{ outline: 'none' }} />
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</motion.button>
                    <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleAddTask} disabled={!newTask.title.trim()}
                      className="px-5 py-2.5 text-xs font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: primaryColor }}>Add Task</motion.button>
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
