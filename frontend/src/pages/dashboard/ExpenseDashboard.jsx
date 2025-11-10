/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, ChevronDown, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, X, AlertCircle, DollarSign, RefreshCw,
  Filter, Grid3X3, List, Clock, Check, Award, Download, Calendar, Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import expenseService from '../../services/expenseService';
import { useNavigate } from 'react-router-dom';



const RejectModal = ({ isOpen, onClose, onReject }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      alert("Please enter a reason before rejecting.");
      return;
    }
    onReject(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Reject Request</h2>
        <p className="text-gray-600 mb-4">
          Please provide a reason for rejecting this request:
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason here..."
          className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => {
              setReason("");
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};




const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [IsRejecting,setIsRejecting] = useState(false)
  const [rejectReason,setRejectReason] = useState(false)
  const [dateFilter, setDateFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseId,setExpenseId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    description: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allExpenses, statusFilter, dateFilter, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const exps = await expenseService.getAllExpenses();
      setAllExpenses(Array.isArray(exps) ? exps : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      setAllExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allExpenses];
    
    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
        
        switch (dateFilter) {
          case 'TODAY':
            return expenseDateOnly.getTime() === today.getTime();
          case 'WEEK':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return expenseDateOnly >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return expenseDateOnly >= monthAgo;
          case 'CUSTOM':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              return expenseDateOnly >= start && expenseDateOnly <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }
    
    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (expense) =>
          expense?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    setExpenses(filtered);
    setCurrentPage(1);
  };

  const getStatusCounts = () => {
    return {
      ALL: allExpenses.length,
      PENDING: allExpenses.filter(e => e.status === 'PENDING').length,
      APPROVED: allExpenses.filter(e => e.status === 'APPROVED').length,
      COMPLETED: allExpenses.filter(e => e.status === 'COMPLETED').length,
    };
  };

  const statusCounts = getStatusCounts();
  const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddExpense = () => {
    setFormData({ title: '', amount: 0, description: '' });
    setFormError('');
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title) {
      setFormError('Title is required');
      return;
    }
    if (formData.amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    try {
      setOperationLoading(true);
      const newExpense = await expenseService.createExpense(formData);
      setShowAddModal(false);
      setFormData({ title: '', amount: 0, description: '' });
      await loadData();
      showOperationStatus('success', `${newExpense.title} created successfully!`);
    } catch (err) {
      setFormError(err.message || 'Failed to create expense');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditExpense = (expense) => {
    if (!expense?.id) return;
    setSelectedExpense(expense);
    setFormData({
      title: expense.title || '',
      amount: expense.amount || 0,
      description: expense.description || '',
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.title) {
      setFormError('Title is required');
      return;
    }
    if (formData.amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    if (!selectedExpense?.id) {
      setFormError('Invalid expense ID');
      return;
    }
    try {
      setOperationLoading(true);
      await expenseService.updateExpense(selectedExpense.id, formData);
      setShowUpdateModal(false);
      setSelectedExpense(null);
      setFormData({ title: '', amount: 0, description: '' });
      await loadData();
      showOperationStatus('success', `${formData.title} updated successfully!`);
    } catch (err) {
      setFormError(err.message || 'Failed to update expense');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewExpense = (expense) => {
    if (!expense?.id) return;
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleDeleteExpense = async (expense) => {
    if (!expense?.id) {
      showOperationStatus('error', 'Invalid expense ID');
      return;
    }
    try {
      setOperationLoading(true);
      await expenseService.deleteExpense(expense.id);
      setDeleteConfirm(null);
      await loadData();
      showOperationStatus('success', `${expense.title} deleted successfully!`);
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to delete expense');
    } finally {
      setOperationLoading(false);
    }
  };

  const updateExpenseStatus = async (expenseId, newStatus) => {
    setOperationLoading(true);
    try {
      await expenseService.updateExpense(expenseId, { status: newStatus });
      await loadData();
      showOperationStatus('success', `Expense ${newStatus.toLowerCase()}!`);
    } catch (err) {
      showOperationStatus('error', err.message || `Failed to ${newStatus.toLowerCase()} expense`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRejection = (id)=>{
    setExpenseId(id)
    setIsRejecting(true)

  }


  const updateRejectedStatus = async ( newStatus,reason) => {
    setOperationLoading(true);
    try {
      await expenseService.updateExpense(expenseId, { status: newStatus,reason });
      setIsRejecting(false)
      await loadData();
      setExpenseId(null)
      showOperationStatus('success', `Expense ${newStatus.toLowerCase()}!`);
    } catch (err) {
      showOperationStatus('error', err.message || `Failed to ${newStatus.toLowerCase()} expense`);
    } finally {
      setOperationLoading(false);
    }
  };



  const handleExport = () => {
    const csvContent = [
      ['Title', 'Amount', 'Description', 'Status', 'Created Date'],
      ...expenses.map(expense => [
        expense.title,
        expense.amount,
        expense.description || '',
        expense.status,
        formatDate(expense.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showOperationStatus('success', 'Expenses exported successfully!');
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-GB');
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? new Date().toLocaleDateString('en-GB')
      : parsedDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(amount);
  };

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'APPROVED':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'COMPLETED':
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
      case 'REJECTED':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
        {status}
      </span>
    );
  };

  const StatusButtons = ({ expense }) => {
    const { id, status } = expense;
    const isPending = status === 'PENDING';
    const isApproved = status === 'APPROVED';
    const isCompleted = status === 'COMPLETED';

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-1.5">
        <StatusBadge status={status} />
        {isPending && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateExpenseStatus(id, 'APPROVED')}
            disabled={operationLoading}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm transition disabled:opacity-50"
            style={{ backgroundColor: 'rgb(81, 96, 146)' }}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Approve</span>
          </motion.button>
        )}
        {isPending && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRejection(id)}
            disabled={operationLoading}
            className="flex items-center bg-red-500 space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm transition disabled:opacity-50"
           
          >
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </motion.button>
        )}

        {isApproved && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateExpenseStatus(id, 'COMPLETED')}
            disabled={operationLoading}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm transition disabled:opacity-50"
            style={{ backgroundColor: 'rgb(81, 96, 146)' }}
          >
            <Check className="w-3 h-3" />
            <span>Complete</span>
          </motion.button>
        )}
      </div>
    );
  };

  const renderTableView = () => (
    <div className="bg-white rounded-xl shadow-sm w-full border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className=" text-xs w-full">
          <thead style={{ backgroundColor: 'rgba(81, 96, 146, 0.05)' }}>
            <tr>
              <th className="text-left py-2 px-3 font-semibold cursor-pointer hover:bg-gray-50"
                  style={{ color: 'rgb(81, 96, 146)' }}
                  onClick={() => { setSortBy('title'); setSortOrder(sortBy === 'title' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'title' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-3 font-semibold cursor-pointer hover:bg-gray-50"
                  style={{ color: 'rgb(81, 96, 146)' }}
                  onClick={() => { setSortBy('amount'); setSortOrder(sortBy === 'amount' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'amount' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-3 font-semibold hidden md:table-cell cursor-pointer hover:bg-gray-50"
                  style={{ color: 'rgb(81, 96, 146)' }}
                  onClick={() => { setSortBy('createdAt'); setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Status</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentExpenses.map((expense) => (
              <motion.tr key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-900">{expense.title || 'N/A'}</td>
                <td className="py-2 px-3 text-gray-600">{formatCurrency(expense.amount)}</td>
                <td className="py-2 px-3 text-gray-600 hidden md:table-cell">{formatDate(expense.createdAt)}</td>
                <td className="py-2 px-3">
                  <StatusButtons expense={expense} />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewExpense(expense)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEditExpense(expense)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDeleteConfirm(expense)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50" title="Delete">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentExpenses.map((expense) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{expense.title}</h3>
              <p className="text-lg font-bold" style={{ color: 'rgb(81, 96, 146)' }}>{formatCurrency(expense.amount)}</p>
            </div>
            <StatusBadge status={expense.status} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(expense.createdAt)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              {expense.status === 'PENDING' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateExpenseStatus(expense.id, 'APPROVED')}
                  disabled={operationLoading}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm"
                  style={{ backgroundColor: 'rgb(81, 96, 146)' }}>
                  <CheckCircle className="w-3 h-3" />
                  <span>Approve</span>
                </motion.button>
              )}
              {expense.status === 'APPROVED' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateExpenseStatus(expense.id, 'COMPLETED')}
                  disabled={operationLoading}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm"
                  style={{ backgroundColor: 'rgb(81, 96, 146)' }}>
                  <Check className="w-3 h-3" />
                  <span>Complete</span>
                </motion.button>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleViewExpense(expense)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleEditExpense(expense)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs">
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setDeleteConfirm(expense)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 text-xs">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {currentExpenses.map((expense) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{expense.title}</h3>
                <StatusBadge status={expense.status} />
                <span className="text-xs text-gray-500 hidden sm:inline">{formatDate(expense.createdAt)}</span>
              </div>
              <p className="text-base font-bold" style={{ color: 'rgb(81, 96, 146)' }}>{formatCurrency(expense.amount)}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {expense.status === 'PENDING' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateExpenseStatus(expense.id, 'APPROVED')}
                  disabled={operationLoading}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm"
                  style={{ backgroundColor: 'rgb(81, 96, 146)' }}>
                  <CheckCircle className="w-3 h-3" />
                  <span className="hidden lg:inline">Approve</span>
                </motion.button>
              )}
              {expense.status === 'APPROVED' && (
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateExpenseStatus(expense.id, 'COMPLETED')}
                  disabled={operationLoading}
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm"
                  style={{ backgroundColor: 'rgb(81, 96, 146)' }}>
                  <Check className="w-3 h-3" />
                  <span className="hidden lg:inline">Complete</span>
                </motion.button>
              )}
              <div className="flex items-center space-x-1">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewExpense(expense)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="View">
                  <Eye className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEditExpense(expense)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="Edit">
                  <Edit className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDeleteConfirm(expense)}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, expenses.length)} of {expenses.length}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          <span className="text-xs text-gray-600">{currentPage} / {totalPages}</span>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    );
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Expenses', count: statusCounts.ALL, icon: DollarSign, color: 'rgb(81, 96, 146)' },
    { key: 'PENDING', label: 'Pending', count: statusCounts.PENDING, icon: Clock, color: 'rgb(234, 179, 8)' },
    { key: 'APPROVED', label: 'Approved', count: statusCounts.APPROVED, icon: CheckCircle, color: 'rgb(34, 197, 94)' },
    { key: 'COMPLETED', label: 'Completed', count: statusCounts.COMPLETED, icon: Award, color: 'rgb(107, 114, 128)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(81, 96, 146)' }}>Expense Management</h1>
              <p className="text-xs text-gray-600 mt-1">Track and manage expenses efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05 }} onClick={handleExport} disabled={expenses.length === 0}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={loadData} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={handleAddExpense} disabled={operationLoading}
                className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-sm text-xs"
                style={{ backgroundColor: 'rgb(81, 96, 146)' }}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Status Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statusTabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStatusFilter(tab.key)}
              className={`p-3 rounded-xl shadow-sm border transition-all ${
                statusFilter === tab.key 
                  ? 'border-transparent shadow-md' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
              style={statusFilter === tab.key ? { backgroundColor: tab.color } : {}}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className={`p-2 rounded-lg ${statusFilter === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}
                >
                  <tab.icon 
                    className="w-4 h-4" 
                    style={{ color: statusFilter === tab.key ? 'white' : tab.color }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-xs font-medium ${statusFilter === tab.key ? 'text-white/80' : 'text-gray-600'}`}>
                    {tab.label}
                  </p>
                  <p className={`text-base font-bold ${statusFilter === tab.key ? 'text-white' : 'text-gray-900'}`}>
                    {tab.count}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-3">
            {/* Search and View Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search expenses..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:border-gray-300 transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' 
                      ? 'text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
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
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
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
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'list' ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => { 
                  const [field, order] = e.target.value.split('-'); 
                  setSortBy(field); 
                  setSortOrder(order); 
                }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 flex-1"
                style={{ outline: 'none' }}
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>

              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 flex-1"
                style={{ outline: 'none' }}
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === 'CUSTOM' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                    style={{ outline: 'none' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                    style={{ outline: 'none' }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border  p-2 border-green-500 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent' }}></div>
              <span className="text-xs text-gray-600">Loading expenses...</span>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-green-500 p-2 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? 'No Expenses Found' : 'No Expenses Available'}
            </p>
            <p className="text-xs text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Add a new expense to get started.'}
            </p>
          </div>
        ) : (
          <div className='border-green-500'>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderCardView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </div>
        )}

        {/* Operation Status Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg text-xs ${
                operationStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {operationStatus.type === 'success' ? 
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : 
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                }
                <span className="font-medium">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)} className="ml-2">
                  <X className="w-3.5 h-3.5" />
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
              className="fixed bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <div className="bg-white rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent' }}></div>
                  <span className="text-gray-700 text-xs font-medium">Processing...</span>
                </div>
              </div>
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">Delete Expense</h3>
                    <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-xs text-gray-700 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{deleteConfirm.title || 'N/A'}</span>?
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteExpense(deleteConfirm)}
                    className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Expense Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Add New Expense</h3>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter expense title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors resize-none"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({ title: '', amount: 0, description: '' });
                        setFormError('');
                      }}
                      className="px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={operationLoading}
                      className="px-4 py-2 text-xs text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      style={{ backgroundColor: 'rgb(81, 96, 146)' }}
                    >
                      {operationLoading ? 'Creating...' : 'Create Expense'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Expense Modal */}
        <AnimatePresence>
          {showUpdateModal && selectedExpense && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Update Expense</h3>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter expense title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg transition-colors resize-none"
                      style={{ outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgb(81, 96, 146)'}
                      onBlur={(e) => e.target.style.borderColor = ''}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setSelectedExpense(null);
                        setFormData({ title: '', amount: 0, description: '' });
                        setFormError('');
                      }}
                      className="px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={operationLoading}
                      className="px-4 py-2 text-xs text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      style={{ backgroundColor: 'rgb(81, 96, 146)' }}
                    >
                      {operationLoading ? 'Updating...' : 'Update Expense'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Expense Modal */}
        <AnimatePresence>
          {showViewModal && selectedExpense && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Expense Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                    <p className="text-xs text-gray-900">{selectedExpense.title || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Amount</label>
                    <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                    <p className="text-xs text-gray-900">{selectedExpense.description || '-'}</p>
                  </div>
               { selectedExpense.reason &&  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Reason of Rejection</label>
                    <p className="text-xs text-gray-900">{selectedExpense.reason || '-'}</p>
                  </div>}
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <StatusBadge status={selectedExpense.status} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Created At</label>
                    <p className="text-xs text-gray-900">{formatDate(selectedExpense.createdAt)}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedExpense(null);
                    }}
                    className="px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          <RejectModal
          isOpen={IsRejecting}
          onClose={()=> setIsRejecting(false)}
          onReject={(reason)=>updateRejectedStatus('REJECTED',reason)}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpenseDashboard;