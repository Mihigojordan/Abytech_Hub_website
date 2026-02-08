import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Target, CheckCircle, XCircle, AlertCircle,
  Clock, Calendar, CheckSquare, Square, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import weeklyGoalService from '../../services/weeklyGoalService';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  MISSED: { label: 'Missed', color: 'bg-red-100 text-red-800' },
};

const WeeklyGoalManagement = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
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
      setError(err.message);
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

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      showOperationMessage('error', err.message);
    }
  };

  const handleAddTask = async () => {
    try {
      await weeklyGoalService.addTask(selectedGoal.id, newTask);
      showOperationMessage('success', 'Task added');
      setNewTask({ title: '', description: '' });
      setShowTaskModal(false);
      loadGoals();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleToggleTask = async (goalId, taskId) => {
    try {
      await weeklyGoalService.toggleTask(goalId, taskId);
      loadGoals();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleRemoveTask = async (goalId, taskId) => {
    try {
      await weeklyGoalService.removeTask(goalId, taskId);
      showOperationMessage('success', 'Task removed');
      loadGoals();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await weeklyGoalService.deleteWeeklyGoal(id);
      showOperationMessage('success', 'Goal deleted successfully');
      loadGoals();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
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
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Goals</h1>
        <p className="text-gray-600">Track and manage weekly goals and tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-purple-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          { label: 'Missed', value: stats.missed, color: 'bg-red-500' },
          { label: 'Avg Progress', value: `${stats.averageProgress}%`, color: 'bg-indigo-500' },
          { label: 'Completion', value: `${stats.completionRate}%`, color: 'bg-teal-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <Target className="w-5 h-5 text-white" />
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
              placeholder="Search goals..."
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
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" /> New Goal
          </button>
          <button onClick={loadGoals} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading goals...</p>
          </div>
        ) : error ? (
          <div className="col-span-full p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No goals found</div>
        ) : (
          goals.map((goal) => {
            const tasks = goal.tasks || [];
            const completedTasks = tasks.filter((t) => t.done).length;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[goal.status]?.color}`}>
                      {STATUS_CONFIG[goal.status]?.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedGoal(goal); setShowViewModal(true); }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(goal)} className="p-1 text-gray-400 hover:text-green-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{goal.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(goal.weekStart)} - {formatDate(goal.weekEnd)}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(goal.progress)} transition-all`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks */}
                {tasks.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Tasks ({completedTasks}/{tasks.length})
                      </span>
                      <button
                        onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {tasks.slice(0, 3).map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                          onClick={() => handleToggleTask(goal.id, task.id)}
                        >
                          {task.done ? (
                            <CheckSquare className="w-4 h-4 text-green-500" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={task.done ? 'text-gray-400 line-through' : 'text-gray-700'}>
                            {task.title}
                          </span>
                        </li>
                      ))}
                      {tasks.length > 3 && (
                        <li className="text-sm text-gray-400">+{tasks.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {tasks.length === 0 && (
                  <button
                    onClick={() => { setSelectedGoal(goal); setShowTaskModal(true); }}
                    className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500"
                  >
                    + Add Task
                  </button>
                )}

                <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                  By: {goal.owner?.adminName || '-'}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{selectedGoal ? 'Edit Goal' : 'New Goal'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week Start *</label>
                    <input
                      type="date"
                      required
                      value={formData.weekStart}
                      onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week End *</label>
                    <input
                      type="date"
                      required
                      value={formData.weekEnd}
                      onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {selectedGoal ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedGoal && (
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
                <h2 className="text-lg font-semibold">Goal Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedGoal.title}</h3>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedGoal.status]?.color}`}>
                    {STATUS_CONFIG[selectedGoal.status]?.label}
                  </span>
                </div>

                {selectedGoal.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700">{selectedGoal.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Week Start</label>
                    <p className="text-gray-700">{formatDate(selectedGoal.weekStart)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Week End</label>
                    <p className="text-gray-700">{formatDate(selectedGoal.weekEnd)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Progress</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(selectedGoal.progress)}`}
                        style={{ width: `${selectedGoal.progress}%` }}
                      />
                    </div>
                    <span className="font-medium">{selectedGoal.progress}%</span>
                  </div>
                </div>

                {selectedGoal.tasks && selectedGoal.tasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-500">Tasks</label>
                      <button
                        onClick={() => { setShowViewModal(false); setShowTaskModal(true); }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add Task
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {selectedGoal.tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => handleToggleTask(selectedGoal.id, task.id)}
                          >
                            {task.done ? (
                              <CheckSquare className="w-5 h-5 text-green-500" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                            <span className={task.done ? 'text-gray-400 line-through' : 'text-gray-700'}>
                              {task.title}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveTask(selectedGoal.id, task.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedGoal.reviewNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Review Notes</label>
                    <p className="text-gray-700 mt-1">{selectedGoal.reviewNotes}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Owner</label>
                  <p className="text-gray-700">{selectedGoal.owner?.adminName || '-'}</p>
                </div>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Add Task</h2>
                <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.title}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
