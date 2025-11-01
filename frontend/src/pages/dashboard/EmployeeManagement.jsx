import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  RefreshCw, Filter, Grid3X3, List, Minimize2, Phone,
  AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminAuthService from '../../services/adminAuthService'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

const EmployeeeDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('adminName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [operationStatus, setOperationStatus] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allAdmins]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminAuthService.getAllAdmins();
      const adminList = Array.isArray(data) ? data : [];
      setAllAdmins(adminList);
      setAdmins(adminList);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load admins');
      setAllAdmins([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allAdmins];

    if (searchTerm.trim()) {
      filtered = filtered.filter(admin =>
        (admin.adminName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.phone?.includes(searchTerm))
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setAdmins(filtered);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openWhatsApp = (phone) => {
    if (!phone) {
      showOperationStatus('error', 'Phone number not available');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      showOperationStatus('error', 'Invalid phone number');
      return;
    }
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSortBy('adminName'); setSortOrder(sortBy === 'adminName' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'adminName' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSortBy('adminEmail'); setSortOrder(sortBy === 'adminEmail' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'adminEmail' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden md:table-cell">Phone</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSortBy('createdAt'); setSortOrder(sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-4 h-4 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
              <th className="text-right py-3 px-4 text-gray-600 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentAdmins.map((admin) => (
              <motion.tr key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{admin.adminName || '—'}</td>
                <td className="py-3 px-4 text-gray-600">{admin.adminEmail || '—'}</td>
                <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{admin.phone || '—'}</td>
                <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{formatDate(admin.createdAt)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    admin.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {admin.status || '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openWhatsApp(admin.phone)}
                    disabled={!admin.phone}
                    className={`p-2 rounded-full transition ${
                      admin.phone 
                        ? 'text-green-600 hover:bg-green-50 hover:text-green-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={admin.phone ? `Message ${admin.adminName} on WhatsApp` : 'No phone number'}
                  >
                    <Phone className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentAdmins.map((admin) => (
        <motion.div
          key={admin.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-900 truncate">{admin.adminName || 'Unnamed'}</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              admin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {admin.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-1">{admin.adminEmail}</div>
          <div className="text-sm text-gray-500 mb-3">{admin.phone || 'No phone'}</div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openWhatsApp(admin.phone)}
              disabled={!admin.phone}
              className={`p-2 rounded-full ${
                admin.phone 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Phone className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 divide-y divide-gray-100">
      {currentAdmins.map((admin) => (
        <motion.div
          key={admin.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{admin.adminName || '—'}</div>
            <div className="text-sm text-gray-600">{admin.adminEmail}</div>
            <div className="text-xs text-gray-500 mt-1">{admin.phone || 'No phone'}</div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              admin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {admin.status}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openWhatsApp(admin.phone)}
              disabled={!admin.phone}
              className={`p-2 rounded-full ${
                admin.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'
              }`}
            >
              <Phone className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-lg shadow">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, admins.length)} of {admins.length}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-600 bg-white border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          {pages.map(page => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 text-sm rounded ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 bg-white border border-gray-200 hover:bg-primary-50'
              }`}
            >
              {page}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-600 bg-white border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="mx-auto px-4 py-4 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50"
              >
                <Minimize2 className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Employee Directory</h1>
                <p className="text-sm text-gray-500">Contact employee via WhatsApp</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 border border-gray-200 rounded hover:bg-primary-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-6  space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Total Admins', count: allAdmins.length, color: 'primary-600' },
            { title: 'Active', count: allAdmins.filter(a => a.status === 'ACTIVE').length, color: 'green-600' },
            { title: 'With Phone', count: allAdmins.filter(a => a.phone).length, color: 'blue-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg shadow border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <div className={`w-10 h-10 bg-${stat.color.replace('600', '50')} rounded-full flex items-center justify-center`}>
                  <Phone className={`w-5 h-5 text-${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="adminName-asc">Name (A-Z)</option>
                <option value="adminName-desc">Name (Z-A)</option>
                <option value="adminEmail-asc">Email (A-Z)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
              <div className="flex border border-gray-200 rounded">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading admins...</span>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-12 text-center">
            <p className="text-lg font-semibold text-gray-900">
              {searchTerm ? 'No Admins Found' : 'No Admins Available'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search.' : 'Admins will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {totalPages > 1 && renderPagination()}
          </>
        )}

        {/* Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50"
            >
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg text-sm ${
                operationStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {operationStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{operationStatus.message}</span>
                <button onClick={() => setOperationStatus(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeeDashboard;