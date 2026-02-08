import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Globe, CheckCircle, XCircle, AlertCircle,
  Pause, Play, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import hostedWebsiteService from '../../services/hostedWebsiteService';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: Clock },
};

const HostedWebsiteManagement = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    status: 'ACTIVE',
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    expired: 0,
  });
  const [domainCheck, setDomainCheck] = useState({ checking: false, available: null });
  const [operationStatus, setOperationStatus] = useState(null);

  useEffect(() => {
    loadWebsites();
    loadStats();
  }, [currentPage, searchTerm, statusFilter]);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await hostedWebsiteService.getAllWebsites({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
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
      const data = await hostedWebsiteService.getWebsiteStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const checkDomain = async (domain) => {
    if (!domain || domain.length < 3) {
      setDomainCheck({ checking: false, available: null });
      return;
    }
    setDomainCheck({ checking: true, available: null });
    try {
      const result = await hostedWebsiteService.checkDomainAvailability(domain);
      setDomainCheck({ checking: false, available: result.available });
    } catch (err) {
      setDomainCheck({ checking: false, available: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedWebsite) {
        await hostedWebsiteService.updateWebsite(selectedWebsite.id, formData);
        showOperationMessage('success', 'Website updated successfully');
      } else {
        await hostedWebsiteService.createWebsite(formData);
        showOperationMessage('success', 'Website created successfully');
      }
      setShowModal(false);
      resetForm();
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      if (action === 'suspend') {
        await hostedWebsiteService.suspendWebsite(id);
      } else if (action === 'activate') {
        await hostedWebsiteService.activateWebsite(id);
      } else if (action === 'expire') {
        await hostedWebsiteService.expireWebsite(id);
      }
      showOperationMessage('success', 'Status updated successfully');
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;
    try {
      await hostedWebsiteService.deleteWebsite(id);
      showOperationMessage('success', 'Website deleted successfully');
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationMessage('error', err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', domain: '', description: '', status: 'ACTIVE' });
    setSelectedWebsite(null);
    setDomainCheck({ checking: false, available: null });
  };

  const openEditModal = (website) => {
    setSelectedWebsite(website);
    setFormData({
      name: website.name,
      domain: website.domain,
      description: website.description || '',
      status: website.status,
    });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hosted Websites</h1>
        <p className="text-gray-600">Manage hosted websites and domains</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-purple-500', icon: Globe },
          { label: 'Active', value: stats.active, color: 'bg-green-500', icon: CheckCircle },
          { label: 'Suspended', value: stats.suspended, color: 'bg-yellow-500', icon: Pause },
          { label: 'Expired', value: stats.expired, color: 'bg-red-500', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5 text-white" />
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
              placeholder="Search by name or domain..."
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
            <Plus className="w-5 h-5" /> Add Website
          </button>
          <button onClick={loadWebsites} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading websites...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : websites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No websites found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Website</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Domain</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {websites.map((website) => {
                const statusConfig = STATUS_CONFIG[website.status] || STATUS_CONFIG.ACTIVE;
                return (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{website.name}</div>
                          {website.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{website.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://${website.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {website.domain}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(website.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {website.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusAction(website.id, 'suspend')}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="Suspend"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {website.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusAction(website.id, 'activate')}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Activate"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEditModal(website)} className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(website.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
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
      </div>

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
                <h2 className="text-lg font-semibold">{selectedWebsite ? 'Edit Website' : 'Add Website'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="My Website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.domain}
                      onChange={(e) => {
                        setFormData({ ...formData, domain: e.target.value });
                        if (!selectedWebsite) checkDomain(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="example.com"
                    />
                    {!selectedWebsite && domainCheck.checking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!selectedWebsite && domainCheck.available !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {domainCheck.available ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {!selectedWebsite && domainCheck.available === false && (
                    <p className="text-sm text-red-500 mt-1">Domain already registered</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Website description..."
                  />
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
                    disabled={!selectedWebsite && domainCheck.available === false}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {selectedWebsite ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostedWebsiteManagement;
