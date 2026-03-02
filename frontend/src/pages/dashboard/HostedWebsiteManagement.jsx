import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Globe, CheckCircle, XCircle, AlertCircle,
  Pause, Play, Clock, Sparkles, Download, AlertTriangle,
  Filter, SortAsc, SortDesc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import hostedWebsiteService from '../../services/hostedWebsiteService';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: Pause },
  EXPIRED: { label: 'Expired', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: Clock },
};

const HostedWebsiteManagement = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', domain: '', description: '', status: 'ACTIVE' });
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, expired: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [domainCheck, setDomainCheck] = useState({ checking: false, available: null });
  const [operationStatus, setOperationStatus] = useState(null);

  useEffect(() => { loadWebsites(); loadStats(); }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await hostedWebsiteService.getAllWebsites({
        page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter,
      });
      setWebsites(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await hostedWebsiteService.getWebsiteStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const checkDomain = async (domain) => {
    if (!domain || domain.length < 3) { setDomainCheck({ checking: false, available: null }); return; }
    setDomainCheck({ checking: true, available: null });
    try {
      const result = await hostedWebsiteService.checkDomainAvailability(domain);
      setDomainCheck({ checking: false, available: result.available });
    } catch {
      setDomainCheck({ checking: false, available: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setOperationLoading(true);
      if (selectedWebsite) {
        await hostedWebsiteService.updateWebsite(selectedWebsite.id, formData);
        showOperationStatus('success', `"${formData.name}" updated successfully!`);
      } else {
        await hostedWebsiteService.createWebsite(formData);
        showOperationStatus('success', `"${formData.name}" created successfully!`);
      }
      setShowModal(false);
      resetForm();
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Operation failed');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      setOperationLoading(true);
      if (action === 'suspend') await hostedWebsiteService.suspendWebsite(id);
      else if (action === 'activate') await hostedWebsiteService.activateWebsite(id);
      else if (action === 'expire') await hostedWebsiteService.expireWebsite(id);
      showOperationStatus('success', 'Status updated successfully!');
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to update status');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (website) => {
    try {
      setOperationLoading(true);
      await hostedWebsiteService.deleteWebsite(website.id);
      setShowDeleteConfirm(null);
      showOperationStatus('success', `"${website.name}" deleted successfully!`);
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to delete website');
    } finally {
      setOperationLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', domain: '', description: '', status: 'ACTIVE' });
    setSelectedWebsite(null);
    setDomainCheck({ checking: false, available: null });
  };

  const openEditModal = (website) => {
    setSelectedWebsite(website);
    setFormData({ name: website.name, domain: website.domain, description: website.description || '', status: website.status });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}>
        {cfg.label}
      </span>
    );
  };

  const statCards = [
    { label: 'Total Websites', value: stats.total, icon: Globe, color: 'rgb(249, 115, 22)', bgColor: 'rgba(249, 115, 22, 0.1)', gradient: 'from-orange-500 to-amber-600' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'rgb(34, 197, 94)', bgColor: 'rgba(34, 197, 94, 0.1)', gradient: 'from-green-500 to-emerald-600' },
    { label: 'Suspended', value: stats.suspended, icon: Pause, color: 'rgb(234, 179, 8)', bgColor: 'rgba(234, 179, 8, 0.1)', gradient: 'from-yellow-500 to-amber-600' },
    { label: 'Expired', value: stats.expired, icon: Clock, color: 'rgb(239, 68, 68)', bgColor: 'rgba(239, 68, 68, 0.1)', gradient: 'from-red-500 to-rose-600' },
  ];

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) start = Math.max(1, end - showPages + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

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
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: 'rgb(249, 115, 22)' }} />
                </motion.div>
                <h1 className="text-xl sm:text-2xl font-bold text-orange-500">Hosted Websites</h1>
              </div>
              <p className="text-xs text-gray-600">Manage hosted websites and domains</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadWebsites}
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
                className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-xs transition-all bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Website</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                    {loadingStats ? <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" /> : (stat.value ?? '-')}
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full" style={{ background: stat.color }} />
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                style={{ outline: 'none' }}
              />
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white cursor-pointer"
                style={{ outline: 'none' }}
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              {sortOrder === 'asc'
                ? <SortAsc className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                : <SortDesc className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              }
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }}
                className="pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white cursor-pointer"
                style={{ outline: 'none' }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full"
                style={{ border: '3px solid rgba(249,115,22,0.2)', borderTopColor: 'rgb(249,115,22)' }}
              />
              <span className="text-xs text-gray-600 font-medium">Loading websites...</span>
            </div>
          </div>
        ) : websites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            </motion.div>
            <p className="text-base font-semibold text-gray-900 mb-2">No Websites Found</p>
            <p className="text-xs text-gray-500 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Add your first website to get started.'}
            </p>
            {!searchTerm && !statusFilter && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
                className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium shadow-md text-xs bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" /><span>Add Website</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}>
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(249, 115, 22)' }}>Website</th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(249, 115, 22)' }}>Domain</th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(249, 115, 22)' }}>Status</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell" style={{ color: 'rgb(249, 115, 22)' }}>Created</th>
                      <th className="text-right py-3 px-4 font-semibold" style={{ color: 'rgb(249, 115, 22)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {websites.map((website, index) => (
                      <motion.tr
                        key={website.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                              <Globe className="w-4 h-4" style={{ color: 'rgb(249, 115, 22)' }} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{website.name}</div>
                              {website.description && (
                                <div className="text-gray-400 truncate max-w-xs text-[10px]">{website.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={`https://${website.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                          >
                            {website.domain}
                          </a>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(website.status)}</td>
                        <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{formatDate(website.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-1">
                            {website.status === 'ACTIVE' && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusAction(website.id, 'suspend')}
                                className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-50 transition-colors" title="Suspend">
                                <Pause className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                            {website.status === 'SUSPENDED' && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusAction(website.id, 'activate')}
                                className="text-gray-400 hover:text-green-600 p-1.5 rounded-md hover:bg-green-50 transition-colors" title="Activate">
                                <Play className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                              onClick={() => openEditModal(website)}
                              className="text-gray-400 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-50 transition-colors" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setShowDeleteConfirm(website)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-2 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4 border border-gray-100">
                <div className="text-xs text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                    className="px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    First
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </motion.button>
                  {getPageNumbers().map(page => (
                    <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentPage === page ? 'text-white font-semibold shadow-sm' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
                      style={currentPage === page ? { backgroundColor: 'rgb(249, 115, 22)' } : {}}>
                      {page}
                    </motion.button>
                  ))}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Last
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Toast */}
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
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                  {operationStatus.type === 'success'
                    ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  }
                </motion.div>
                <span className="font-semibold">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  className="ml-2 hover:bg-white/50 rounded-full p-1 transition-colors">
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl"
              >
                <div className="flex flex-col items-center space-y-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full"
                    style={{ border: '4px solid rgba(249,115,22,0.2)', borderTopColor: 'rgb(249,115,22)' }}
                  />
                  <span className="text-gray-700 text-sm font-semibold">Processing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-start space-x-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2 }}
                    className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">Delete Website?</h3>
                    <p className="text-xs text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-700">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{showDeleteConfirm.name}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-5 py-2.5 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all">
                    Delete Website
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                      <Globe className="w-5 h-5" style={{ color: 'rgb(249, 115, 22)' }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedWebsite ? 'Edit Website' : 'Add Website'}</h3>
                      <p className="text-xs text-gray-500">{selectedWebsite ? 'Update website details' : 'Add a new hosted website'}</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                      style={{ outline: 'none' }}
                      placeholder="My Website"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Domain *</label>
                    <div className="relative">
                      <input
                        type="text" required
                        value={formData.domain}
                        onChange={(e) => {
                          setFormData({ ...formData, domain: e.target.value });
                          if (!selectedWebsite) checkDomain(e.target.value);
                        }}
                        className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all pr-10"
                        style={{ outline: 'none' }}
                        placeholder="example.com"
                      />
                      {!selectedWebsite && domainCheck.checking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      {!selectedWebsite && domainCheck.available !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {domainCheck.available
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-500" />
                          }
                        </div>
                      )}
                    </div>
                    {!selectedWebsite && domainCheck.available === false && (
                      <p className="text-[11px] text-red-500 mt-1">Domain already registered</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      style={{ outline: 'none' }}
                      placeholder="Website description..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none bg-white"
                      style={{ outline: 'none' }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Cancel
                    </motion.button>
                    <motion.button type="submit" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                      disabled={!selectedWebsite && domainCheck.available === false}
                      className="px-5 py-2.5 text-xs font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      style={{ backgroundColor: 'rgb(249, 115, 22)' }}>
                      {selectedWebsite ? 'Update Website' : 'Create Website'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HostedWebsiteManagement;
