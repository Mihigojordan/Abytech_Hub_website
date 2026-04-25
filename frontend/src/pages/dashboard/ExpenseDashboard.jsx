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
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';



const RejectModal = ({ isOpen, onClose, onReject }) => {
  const [reason, setReason] = useState("");
  const { isDark, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448 }}>
        <h2 style={{ ...ba(18, 600, { color: textC, marginBottom: 12 }) }}>Reject Request</h2>
        <p style={{ ...ba(13, 400, { color: text2, marginBottom: 16 }) }}>
          Please provide a reason for rejecting this request:
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason here..."
          style={{
            width: '100%',
            background: bg3,
            border: `1px solid ${border}`,
            borderRadius: 4,
            padding: '10px 12px',
            height: 96,
            color: textC,
            resize: 'none',
            outline: 'none',
            ...ba(12),
          }}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => { setReason(""); onClose(); }}
            style={{
              padding: '8px 16px',
              background: bg3,
              border: `1px solid ${border}`,
              borderRadius: 4,
              color: textC,
              cursor: 'pointer',
              ...ba(12),
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            style={{
              padding: '8px 16px',
              background: '#e84040',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              ...ba(12, 600),
            }}
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
  const [IsRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState(false)
  const [dateFilter, setDateFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseId, setExpenseId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    description: '',
  });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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

  const handleRejection = (id) => {
    setExpenseId(id)
    setIsRejecting(true)

  }


  const updateRejectedStatus = async (newStatus, reason) => {
    setOperationLoading(true);
    try {
      await expenseService.updateExpense(expenseId, { status: newStatus, reason });
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return { background: 'rgba(232,98,26,.15)', color: ORG };
      case 'APPROVED':
        return { background: 'rgba(74,222,128,.15)', color: '#4ade80' };
      case 'COMPLETED':
        return { background: 'rgba(74,222,128,.15)', color: '#4ade80' };
      case 'REJECTED':
        return { background: 'rgba(232,64,64,.15)', color: '#e84040' };
      default:
        return { background: 'rgba(74,222,128,.15)', color: '#4ade80' };
    }
  };

  const StatusBadge = ({ status }) => {
    const st = getStatusStyle(status);
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        background: st.background,
        color: st.color,
        ...bc(11, 600),
      }}>
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: ORG,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              opacity: operationLoading ? 0.5 : 1,
              ...bc(11, 600),
            }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: '#e84040',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              opacity: operationLoading ? 0.5 : 1,
              ...bc(11, 600),
            }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: ORG,
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              opacity: operationLoading ? 0.5 : 1,
              ...bc(11, 600),
            }}
          >
            <Check className="w-3 h-3" />
            <span>Complete</span>
          </motion.button>
        )}
      </div>
    );
  };

  const renderTableView = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }} className="w-full overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="text-xs w-full">
          <thead>
            <tr style={{ background: bg3 }}>
              <th
                className="text-left py-2 px-3 cursor-pointer"
                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}
                onClick={() => { setSortBy('title'); setSortOrder(sortBy === 'title' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'title' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th
                className="text-left py-2 px-3 cursor-pointer"
                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}
                onClick={() => { setSortBy('amount'); setSortOrder(sortBy === 'amount' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'amount' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th
                className="text-left py-2 px-3 hidden md:table-cell cursor-pointer"
                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}
                onClick={() => { setSortBy('createdAt'); setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'opacity-100' : 'opacity-40'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-3" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Status</th>
              <th className="text-right py-2 px-3" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.map((expense) => (
              <motion.tr
                key={expense.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: bg2, borderBottom: `1px solid ${border}` }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = bg2}
              >
                <td className="py-2 px-3" style={{ ...ba(12, 500, { color: textC }) }}>{expense.title || 'N/A'}</td>
                <td className="py-2 px-3" style={{ ...ba(12, 400, { color: text2 }) }}>{formatCurrency(expense.amount)}</td>
                <td className="py-2 px-3 hidden md:table-cell" style={{ ...ba(12, 400, { color: text2 }) }}>{formatDate(expense.createdAt)}</td>
                <td className="py-2 px-3">
                  <StatusButtons expense={expense} />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleViewExpense(expense)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: text2 }}
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleEditExpense(expense)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: text2 }}
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setDeleteConfirm(expense)}
                      style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: '#e84040' }}
                      title="Delete"
                    >
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
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 style={{ ...ba(13, 600, { color: textC, marginBottom: 4 }) }}>{expense.title}</h3>
              <p style={{ ...bb(18, { color: ORG }) }}>{formatCurrency(expense.amount)}</p>
            </div>
            <StatusBadge status={expense.status} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center space-x-1" style={{ ...ba(11, 400, { color: text3 }) }}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(expense.createdAt)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex items-center space-x-1">
              {expense.status === 'PENDING' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => updateExpenseStatus(expense.id, 'APPROVED')}
                  disabled={operationLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', background: ORG, color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    opacity: operationLoading ? 0.5 : 1,
                    ...bc(11, 600),
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Approve</span>
                </motion.button>
              )}
              {expense.status === 'APPROVED' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => updateExpenseStatus(expense.id, 'COMPLETED')}
                  disabled={operationLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', background: ORG, color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    opacity: operationLoading ? 0.5 : 1,
                    ...bc(11, 600),
                  }}
                >
                  <Check className="w-3 h-3" />
                  <span>Complete</span>
                </motion.button>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleViewExpense(expense)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 8px', background: bg3, border: `1px solid ${border}`,
                  borderRadius: 4, cursor: 'pointer', color: text2, ...ba(11),
                }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleEditExpense(expense)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 8px', background: bg3, border: `1px solid ${border}`,
                  borderRadius: 4, cursor: 'pointer', color: text2, ...ba(11),
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setDeleteConfirm(expense)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 8px', background: bg3, border: `1px solid ${border}`,
                  borderRadius: 4, cursor: 'pointer', color: '#e84040', ...ba(11),
                }}
              >
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
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
      {currentExpenses.map((expense) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: 16, borderBottom: `1px solid ${border}`, background: bg2, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = bg3}
          onMouseLeave={e => e.currentTarget.style.background = bg2}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 style={{ ...ba(13, 600, { color: textC }) }}>{expense.title}</h3>
                <StatusBadge status={expense.status} />
                <span className="hidden sm:inline" style={{ ...ba(11, 400, { color: text3 }) }}>{formatDate(expense.createdAt)}</span>
              </div>
              <p style={{ ...ba(14, 700, { color: ORG }) }}>{formatCurrency(expense.amount)}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {expense.status === 'PENDING' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => updateExpenseStatus(expense.id, 'APPROVED')}
                  disabled={operationLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', background: ORG, color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    opacity: operationLoading ? 0.5 : 1,
                    ...bc(11, 600),
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span className="hidden lg:inline">Approve</span>
                </motion.button>
              )}
              {expense.status === 'APPROVED' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => updateExpenseStatus(expense.id, 'COMPLETED')}
                  disabled={operationLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', background: ORG, color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    opacity: operationLoading ? 0.5 : 1,
                    ...bc(11, 600),
                  }}
                >
                  <Check className="w-3 h-3" />
                  <span className="hidden lg:inline">Complete</span>
                </motion.button>
              )}
              <div className="flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleViewExpense(expense)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: text2 }}
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleEditExpense(expense)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: text2 }}
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setDeleteConfirm(expense)}
                  style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: 6, cursor: 'pointer', color: '#e84040' }}
                  title="Delete"
                >
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
      <div
        className="flex items-center justify-between px-4 py-3 mt-4"
        style={{ background: bg2, borderTop: `1px solid ${border}`, borderRadius: 4 }}
      >
        <div style={{ ...ba(11, 400, { color: text2 }) }}>
          Showing {startIndex + 1}-{Math.min(endIndex, expenses.length)} of {expenses.length}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              display: 'flex', alignItems: 'center', padding: '6px 10px',
              background: bg3, border: `1px solid ${border}`, borderRadius: 4,
              color: text2, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          <span style={{ ...ba(11, 400, { color: text2 }) }}>{currentPage} / {totalPages}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              display: 'flex', alignItems: 'center', padding: '6px 10px',
              background: bg3, border: `1px solid ${border}`, borderRadius: 4,
              color: text2, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    );
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Expenses', count: statusCounts.ALL, icon: DollarSign, color: ORG },
    { key: 'PENDING', label: 'Pending', count: statusCounts.PENDING, icon: Clock, color: ORG },
    { key: 'APPROVED', label: 'Approved', count: statusCounts.APPROVED, icon: CheckCircle, color: '#4ade80' },
    { key: 'COMPLETED', label: 'Completed', count: statusCounts.COMPLETED, icon: Award, color: text2 },
  ];

  /* ── shared input style factory ── */
  const inputStyle = {
    width: '100%',
    background: bg3,
    border: `1px solid ${border}`,
    borderRadius: 4,
    padding: '8px 12px',
    color: textC,
    outline: 'none',
    ...ba(12),
  };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...bc(22, 700, { color: ORG, borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }) }}>
                Expense Management
              </h1>
              <p style={{ ...ba(11, 400, { color: text2, marginTop: 4, paddingLeft: 13 }) }}>
                Track and manage expenses efficiently
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleExport}
                disabled={expenses.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', background: bg3,
                  border: `1px solid ${border}`, borderRadius: 4,
                  color: textC, cursor: expenses.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: expenses.length === 0 ? 0.5 : 1,
                  ...ba(11),
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadData}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', background: bg3,
                  border: `1px solid ${border}`, borderRadius: 4,
                  color: textC, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  ...ba(11),
                }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAddExpense}
                disabled={operationLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', background: ORG, color: '#fff',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  opacity: operationLoading ? 0.5 : 1,
                  ...bc(12, 600),
                }}
              >
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
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: 12,
                  background: isActive ? 'rgba(232,98,26,.08)' : bg2,
                  border: isActive ? `1px solid ${ORG}` : `1px solid ${border}`,
                  borderLeft: isActive ? `3px solid ${ORG}` : `1px solid ${border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .15s',
                }}
              >
                <div className="flex items-center space-x-2">
                  <div style={{
                    padding: 8,
                    borderRadius: 4,
                    background: isActive ? `rgba(232,98,26,.15)` : bg3,
                  }}>
                    <tab.icon className="w-4 h-4" style={{ color: isActive ? ORG : tab.color }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ ...bc(11, 500, { color: isActive ? ORG : text2 }) }}>{tab.label}</p>
                    <p style={{ ...bb(20, { color: isActive ? ORG : textC }) }}>{tab.count}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
          <div className="space-y-3">
            {/* Search and View Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: text3 }} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: 8,
                    background: viewMode === 'table' ? ORG : bg3,
                    border: viewMode === 'table' ? 'none' : `1px solid ${border}`,
                    borderRadius: 4,
                    color: viewMode === 'table' ? '#fff' : text2,
                    cursor: 'pointer',
                  }}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: 8,
                    background: viewMode === 'grid' ? ORG : bg3,
                    border: viewMode === 'grid' ? 'none' : `1px solid ${border}`,
                    borderRadius: 4,
                    color: viewMode === 'grid' ? '#fff' : text2,
                    cursor: 'pointer',
                  }}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: 8,
                    background: viewMode === 'list' ? ORG : bg3,
                    border: viewMode === 'list' ? 'none' : `1px solid ${border}`,
                    borderRadius: 4,
                    color: viewMode === 'list' ? '#fff' : text2,
                    cursor: 'pointer',
                  }}
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
                style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
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
                style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
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
                  <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4 }) }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div className="flex-1">
                  <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4 }) }}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(232,64,64,.1)',
              border: '1px solid rgba(232,64,64,.3)',
              borderRadius: 4,
              padding: 16,
              color: '#e84040',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              ...ba(12),
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16, textAlign: 'center' }}>
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full animate-spin" style={{ border: `2px solid ${border}`, borderTopColor: ORG }}></div>
              <span style={{ ...ba(12, 400, { color: text2 }) }}>Loading expenses...</span>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, textAlign: 'center' }}>
            <DollarSign className="w-12 h-12 mx-auto mb-4" style={{ color: text3 }} />
            <p style={{ ...bc(15, 600, { color: textC, marginBottom: 8 }) }}>
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? 'No Expenses Found' : 'No Expenses Available'}
            </p>
            <p style={{ ...ba(12, 400, { color: text2 }) }}>
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Add a new expense to get started.'}
            </p>
          </div>
        ) : (
          <div>
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 4,
                background: operationStatus.type === 'success' ? 'rgba(74,222,128,.12)' : 'rgba(232,64,64,.12)',
                border: `1px solid ${operationStatus.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(232,64,64,.3)'}`,
                color: operationStatus.type === 'success' ? '#4ade80' : '#e84040',
                ...ba(12, 500),
              }}>
                {operationStatus.type === 'success'
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 flex-shrink-0" />
                }
                <span>{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setOperationStatus(null)}
                  style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
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
              className="fixed inset-0 flex items-center justify-center z-40"
              style={{ background: isDark ? 'rgba(7,20,24,.7)' : 'rgba(245,239,230,.7)' }}
            >
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: '16px 24px' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full animate-spin" style={{ border: `2px solid ${border}`, borderTopColor: ORG }}></div>
                  <span style={{ ...ba(12, 500, { color: textC }) }}>Processing...</span>
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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.7)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448 }}
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div style={{ width: 40, height: 40, background: 'rgba(232,64,64,.12)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: '#e84040' }} />
                  </div>
                  <div className="flex-1">
                    <h3 style={{ ...bc(14, 700, { color: textC }) }}>Delete Expense</h3>
                    <p style={{ ...ba(11, 400, { color: text2, marginTop: 4 }) }}>This action cannot be undone</p>
                  </div>
                </div>
                <p style={{ ...ba(12, 400, { color: text2, marginBottom: 24 }) }}>
                  Are you sure you want to delete{' '}
                  <span style={{ fontWeight: 600, color: textC }}>{deleteConfirm.title || 'N/A'}</span>?
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      padding: '8px 16px', background: bg3,
                      border: `1px solid ${border}`, borderRadius: 4,
                      color: textC, cursor: 'pointer', ...ba(12),
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteExpense(deleteConfirm)}
                    style={{
                      padding: '8px 16px', background: '#e84040',
                      border: 'none', borderRadius: 4,
                      color: '#fff', cursor: 'pointer', ...ba(12, 600),
                    }}
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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.7)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448 }}
              >
                <h3 style={{ ...bc(15, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10, marginBottom: 16 }) }}>
                  Add New Expense
                </h3>
                {formError && (
                  <div style={{
                    background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)',
                    borderRadius: 4, padding: 12, color: '#e84040',
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                    ...ba(12),
                  }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
                      placeholder="Enter expense title"
                    />
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, resize: 'none', height: 80 }}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
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
                      style={{
                        padding: '8px 16px', background: bg3,
                        border: `1px solid ${border}`, borderRadius: 4,
                        color: textC, cursor: 'pointer', ...ba(12),
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={operationLoading}
                      style={{
                        padding: '8px 16px', background: ORG,
                        border: 'none', borderRadius: 4,
                        color: '#fff', cursor: operationLoading ? 'not-allowed' : 'pointer',
                        opacity: operationLoading ? 0.5 : 1,
                        ...bc(12, 600),
                      }}
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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.7)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448 }}
              >
                <h3 style={{ ...bc(15, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10, marginBottom: 16 }) }}>
                  Update Expense
                </h3>
                {formError && (
                  <div style={{
                    background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)',
                    borderRadius: 4, padding: 12, color: '#e84040',
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                    ...ba(12),
                  }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
                      placeholder="Enter expense title"
                    />
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) }}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, resize: 'none', height: 80 }}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
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
                      style={{
                        padding: '8px 16px', background: bg3,
                        border: `1px solid ${border}`, borderRadius: 4,
                        color: textC, cursor: 'pointer', ...ba(12),
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={operationLoading}
                      style={{
                        padding: '8px 16px', background: ORG,
                        border: 'none', borderRadius: 4,
                        color: '#fff', cursor: operationLoading ? 'not-allowed' : 'pointer',
                        opacity: operationLoading ? 0.5 : 1,
                        ...bc(12, 600),
                      }}
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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.7)' }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 448 }}
              >
                <h3 style={{ ...bc(15, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10, marginBottom: 16 }) }}>
                  Expense Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Title</label>
                    <p style={{ ...ba(12, 400, { color: textC }) }}>{selectedExpense.title || '-'}</p>
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Amount</label>
                    <p style={{ ...ba(14, 700, { color: ORG }) }}>{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Description</label>
                    <p style={{ ...ba(12, 400, { color: textC }) }}>{selectedExpense.description || '-'}</p>
                  </div>
                  {selectedExpense.reason && (
                    <div>
                      <label style={{ ...bc(11, 700, { color: '#e84040', display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Reason of Rejection</label>
                      <p style={{ ...ba(12, 400, { color: textC }) }}>{selectedExpense.reason || '-'}</p>
                    </div>
                  )}
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Status</label>
                    <StatusBadge status={selectedExpense.status} />
                  </div>
                  <div>
                    <label style={{ ...bc(11, 700, { color: text2, display: 'block', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>Created At</label>
                    <p style={{ ...ba(12, 400, { color: textC }) }}>{formatDate(selectedExpense.createdAt)}</p>
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
                    style={{
                      padding: '8px 16px', background: bg3,
                      border: `1px solid ${border}`, borderRadius: 4,
                      color: textC, cursor: 'pointer', ...ba(12),
                    }}
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
            onClose={() => setIsRejecting(false)}
            onReject={(reason) => updateRejectedStatus('REJECTED', reason)}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
