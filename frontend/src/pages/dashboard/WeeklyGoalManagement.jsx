import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  X, RefreshCw, Target, CheckCircle, XCircle, AlertCircle,
  Clock, Calendar, CheckSquare, Square, TrendingUp, Sparkles,
  Users, Filter,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import weeklyGoalService from '../../services/weeklyGoalService';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  MISSED: { label: 'Missed', color: 'bg-red-100 text-red-800 border-red-200' },
};

const WeeklyGoalManagement = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weekStart: '',
    weekEnd: '',
    status: 'PENDING',
  });
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    missed: 0,
    averageProgress: 0,
    completionRate: 0,
  });
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const primaryColor = 'rgb(249, 115, 22)';

  useEffect(() => {
    loadGoals();
    loadStats();
  }, [currentPage, searchTerm, statusFilter]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await weeklyGoalService.getAllWeeklyGoals({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });
      setGoals(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await weeklyGoalService.getWeeklyGoalStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const showOperationMessage = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    try {
      if (selectedGoal) {
        await weeklyGoalService.updateWeeklyGoal(selectedGoal.id, formData);
        showOperationMessage('success', 'Goal updated successfully');
      } else {
        await weeklyGoalService.createWeeklyGoal(formData);
        showOperationMessage('success', 'Goal created successfully');
      }
      setShowModal(false);
      resetForm();
      loadGoals();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Operation failed');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAddTask = async () => {
    setOperationLoading(true);
    try {
      await weeklyGoalService.addTask(selectedGoal.id, newTask);
      showOperationMessage('success', 'Task added successfully');
      setNewTask({ title: '', description: '' });
      setShowTaskModal(false);
      loadGoals();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to add task');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleTask = async (goalId, taskId) => {
    try {
      await weeklyGoalService.toggleTask(goalId, taskId);
      loadGoals();
    } catch (err) {
      showOperationMessage('error', 'Failed to update task');
    }
  };

  const handleRemoveTask = async (goalId, taskId) => {
    try {
      await weeklyGoalService.removeTask(goalId, taskId);
      showOperationMessage('success', 'Task removed');
      loadGoals();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to remove task');
    }
  };

  const handleDelete = async (goal) => {
    setOperationLoading(true);
    try {
      await weeklyGoalService.deleteWeeklyGoal(goal.id);
      showOperationMessage('success', `"${goal.title}" deleted successfully`);
      setDeleteConfirm(null);
      loadGoals();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message || 'Failed to delete goal');
    } finally {
      setOperationLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      weekStart: '',
      weekEnd: '',
      status: 'PENDING',
    });
    setSelectedGoal(null);
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      weekStart: goal.weekStart ? new Date(goal.weekStart).toISOString().slice(0, 10) : '',
      weekEnd: goal.weekEnd ? new Date(goal.weekEnd).toISOString().slice(0, 10) : '',
      status: goal.status,
    });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 25) return 'from-yellow-500 to-amber-600';
    return 'from-gray-400 to-gray-500';
  };

  const statCards = [
    { label: 'Total Goals', value: stats.total, icon: Target, gradient: 'from-purple-500 to-violet-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-yellow-500 to-amber-600' },
    { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
    { label: 'Missed', value: stats.missed, icon: XCircle, gradient: 'from-red-500 to-rose-600' },
    { label: 'Avg Progress', value: `${stats.averageProgress}%`, icon: TrendingUp, gradient: 'from-indigo-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-3xl -ml-24 -mb-24" />
        <div className="mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-orange-500">
                  Weekly Goals
                </h1>
              </div>
              <p className="text-xs text-gray-600">Track and manage weekly objectives & tasks</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadGoals}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-sm transition-all bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
                <span>New Goal</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex items-center space-x-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-2.5 rounded-lg shadow-sm"
                  style={{ backgroundColor: 'rgba(81,96,146,0.1)' }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: primaryColor }} />
                </motion.div>
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value ?? '-'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search goals by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative flex-1 sm:max-w-[240px]">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none bg-white cursor-pointer transition-all"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-3"
              style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
            />
            <p className="text-gray-600">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center"
          >
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No matching goals' : 'No weekly goals yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first weekly goal to get started'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg shadow-md hover:shadow-lg text-sm font-medium hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              Create Goal
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal, index) => {
              const tasks = goal.tasks || [];
              const completed = tasks.filter(t => t.done).length;
              const progress = goal.progress || 0;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full opacity-40 group-hover:opacity-70 transition-opacity" />

                  <div className="relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{goal.title}</h3>
                        <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[goal.status]?.color}`}>
                          {STATUS_CONFIG[goal.status]?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setSelectedGoal(goal); setShowViewModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(goal)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(goal)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(goal.weekStart)} — {formatDate(goal.weekEnd)}</span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${getProgressColor(progress)}`}
                        />
                      </div>
                    </div>

                    {/* Tasks preview */}
                    {tasks.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Tasks • {completed}/{tasks.length}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                            className="text-orange-500 hover:text-orange-600 text-xs font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </motion.button>
                        </div>
                        <div className="space-y-1.5">
                          {tasks.slice(0, 3).map(task => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-sm cursor-pointer group/task"
                              onClick={() => handleToggleTask(goal.id, task.id)}
                            >
                              {task.done ? (
                                <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-300 group-hover/task:text-gray-500 flex-shrink-0 transition-colors" />
                              )}
                              <span className={`line-clamp-1 ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {tasks.length > 3 && (
                            <div className="text-xs text-gray-400 pl-6">+{tasks.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )}

                    {tasks.length === 0 && (
                      <button
                        onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                        className="w-full py-2.5 mt-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
                      >
                        + Add first task
                      </button>
                    )}

                    <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {goal.owner?.adminName || '—'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2 bg-white px-2 py-2.5 rounded-lg border border-gray-200 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
              >
                First
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = currentPage - 2 + i;
                if (page < 1) page = 1;
                if (page > totalPages) page = totalPages;
                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3.5 py-1.5 text-sm rounded-md ${currentPage === page
                      ? 'bg-orange-500 text-white font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    {page}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded disabled:opacity-50"
              >
                Last
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            className="fixed top-5 right-5 z-50"
          >
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm border ${operationStatus.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800'
              }`}>
              {operationStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{operationStatus.message}</span>
              <button
                onClick={() => setOperationStatus(null)}
                className="ml-2 p-1 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {operationLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-t-transparent rounded-full"
                style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
              />
              <span className="text-gray-700 font-medium">Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Goal?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.title}"</span>?
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-md transition-all"
                >
                  Delete Goal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedGoal ? 'Edit Weekly Goal' : 'Create New Goal'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Goal Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Week Start *</label>
                    <input
                      type="date"
                      required
                      value={formData.weekStart}
                      onChange={e => setFormData({ ...formData, weekStart: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Week End *</label>
                    <input
                      type="date"
                      required
                      value={formData.weekEnd}
                      onChange={e => setFormData({ ...formData, weekEnd: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 appearance-none bg-white"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md transition-all"
                  >
                    {selectedGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Goal Modal + Tasks */}
      <AnimatePresence>
        {showViewModal && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedGoal.title}</h2>
                    <p className="text-xs text-gray-500">Weekly Goal Details</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[selectedGoal.status]?.color}`}>
                      {STATUS_CONFIG[selectedGoal.status]?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Owner</p>
                    <p className="font-medium">{selectedGoal.owner?.adminName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Week Start</p>
                    <p className="font-medium">{formatDate(selectedGoal.weekStart)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Week End</p>
                    <p className="font-medium">{formatDate(selectedGoal.weekEnd)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 mb-2">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(selectedGoal.progress)} transition-all`}
                        style={{ width: `${selectedGoal.progress}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{selectedGoal.progress}%</span>
                  </div>
                </div>

                {selectedGoal.description && (
                  <div>
                    <p className="text-gray-500 mb-2">Description</p>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                      {selectedGoal.description}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 font-medium">Tasks ({completed}/{tasks.length})</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowViewModal(false); setShowTaskModal(true); }}
                      className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </motion.button>
                  </div>

                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group/task"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => handleToggleTask(selectedGoal.id, task.id)}
                          >
                            {task.done ? (
                              <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300 group-hover/task:text-gray-500 transition-colors flex-shrink-0" />
                            )}
                            <span className={`flex-1 ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveTask(selectedGoal.id, task.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover/task:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-gray-500">No tasks yet</p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setShowViewModal(false); setShowTaskModal(true); }}
                        className="mt-3 text-[rgb(81,96,146)] hover:underline text-sm font-medium"
                      >
                        + Add your first task
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowViewModal(false); openEditModal(selectedGoal); }}
                  className="px-6 py-2.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit Goal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showTaskModal && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (optional)</label>
                  <textarea
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    placeholder="Task details or notes..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.title.trim()}
                    className={`px-6 py-2.5 text-sm font-medium rounded-lg text-white transition-all shadow-md ${newTask.title.trim()
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-gray-300 cursor-not-allowed'
                      }`}
                  >
                    Add Task
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

export default WeeklyGoalManagement;
