import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  RefreshCw, Grid3X3, List, Phone,
  XCircle, CheckCircle, Eye, Calendar, Mail,
  AlertCircle, X, User, ArrowLeft, Table, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminAuthService from '../../services/adminAuthService';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api/api';

function handleReportUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes('://')) return trimmedUrl;
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl;
  return baseUrl + path;
}

interface AdminAvatarProps {
  admin: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AdminAvatar = ({ admin, size = 'md' }: AdminAvatarProps) => {
  const imageUrl = handleReportUrl(admin.profileImage);
  const [hasError, setHasError] = useState(false);

  const sizeClass =
    size === 'sm' ? 'w-8 h-8' :
    size === 'lg' ? 'w-12 h-12' :
    size === 'xl' ? 'w-24 h-24' :
    'w-10 h-10';

  const iconSize =
    size === 'sm' ? 'w-4 h-4' :
    size === 'lg' ? 'w-6 h-6' :
    size === 'xl' ? 'w-12 h-12' :
    'w-5 h-5';

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={admin.adminName || 'Admin'}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center`} style={{ backgroundColor: 'rgba(81, 96, 146, 0.1)' }}>
      <User className={iconSize} style={{ color: 'rgb(81, 96, 146)' }} />
    </div>
  );
};

const EmployeeDashboard = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('adminName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('table');
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allAdmins, activeFilter, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminAuthService.getAllAdmins();
      const adminList = Array.isArray(data) ? data : [];
      setAllAdmins(adminList);
      setAdmins(adminList);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
      setAllAdmins([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: 'success' | 'error', message: string, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allAdmins];

    // Filter by status
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(admin => admin.status === activeFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(admin =>
        (admin.adminName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.phone?.includes(searchTerm))
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(admin => {
        const createdDate = new Date(admin.createdAt);
        return createdDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(admin => {
        const createdDate = new Date(admin.createdAt);
        return createdDate <= toDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setAdmins(filtered);
    setCurrentPage(1);
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openWhatsApp = (phone: string) => {
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

  const handleViewAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Created Date'],
      ...admins.map(admin => [
        admin.adminName || '',
        admin.adminEmail || '',
        admin.phone || '',
        admin.status || '',
        formatDate(admin.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admins_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showOperationStatus('success', 'Admins exported successfully!');
  };

  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = admins.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' 
      ? { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
      : { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
        {status}
      </span>
    );
  };

  // === TABLE VIEW ===
  const renderTableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ backgroundColor: 'rgba(81, 96, 146, 0.05)' }}>
            <tr>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Admin</th>
              <th className="text-left py-2 px-3 font-semibold hidden md:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Email</th>
              <th className="text-left py-2 px-3 font-semibold hidden lg:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Phone</th>
              <th className="text-left py-2 px-3 font-semibold hidden xl:table-cell" style={{ color: 'rgb(81, 96, 146)' }}>Created</th>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Status</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: 'rgb(81, 96, 146)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentAdmins.map((admin) => (
              <motion.tr key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <AdminAvatar admin={admin} size="sm" />
                    <div>
                      <div className="font-medium text-gray-900">{admin.adminName || '—'}</div>
                      <div className="text-xs text-gray-500 md:hidden">{admin.adminEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600 hidden md:table-cell">{admin.adminEmail || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden lg:table-cell">{admin.phone || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden xl:table-cell">{formatDate(admin.createdAt)}</td>
                <td className="py-2 px-3">
                  <StatusBadge status={admin.status || 'INACTIVE'} />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewAdmin(admin)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openWhatsApp(admin.phone)}
                      disabled={!admin.phone}
                      className={`p-1.5 rounded-md transition ${
                        admin.phone 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      title={admin.phone ? `Message ${admin.adminName}` : 'No phone'}
                    >
                      <Phone className="w-3.5 h-3.5" />
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

  // === GRID VIEW ===
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentAdmins.map((admin) => (
        <motion.div
          key={admin.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <AdminAvatar admin={admin} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{admin.adminName || 'Unnamed'}</h3>
                <p className="text-xs text-gray-600 truncate">{admin.adminEmail}</p>
              </div>
            </div>
            <StatusBadge status={admin.status || 'INACTIVE'} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{admin.phone || 'No phone'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(admin.createdAt)}</span>
            </span>
          </div>
          <div className="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleViewAdmin(admin)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => openWhatsApp(admin.phone)}
              disabled={!admin.phone}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs ${
                admin.phone 
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Message</span>
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // === LIST VIEW ===
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {currentAdmins.map((admin) => (
        <motion.div
          key={admin.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <AdminAvatar admin={admin} size="sm" />
                <h3 className="text-sm font-semibold text-gray-900">{admin.adminName || '—'}</h3>
                <StatusBadge status={admin.status || 'INACTIVE'} />
                <span className="text-xs text-gray-500 hidden sm:inline">{formatDate(admin.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 ml-10">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{admin.adminEmail || '—'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{admin.phone || 'No phone'}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewAdmin(admin)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="View">
                <Eye className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => openWhatsApp(admin.phone)}
                disabled={!admin.phone}
                className={`p-1.5 rounded-md ${
                  admin.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // === PAGINATION ===
  const renderPagination = () => {
    // Always show pagination controls
    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, admins.length)} of {admins.length}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
          <span className="text-xs text-gray-600">{currentPage} / {totalPages}</span>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
            className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    );
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Admins', count: allAdmins.length, color: 'rgb(81, 96, 146)' },
    { key: 'ACTIVE', label: 'Active', count: allAdmins.filter(a => a.status === 'ACTIVE').length, color: 'rgb(34, 197, 94)' },
    { key: 'INACTIVE', label: 'Inactive', count: allAdmins.filter(a => a.status === 'INACTIVE').length, color: 'rgb(239, 68, 68)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(81, 96, 146)' }}>Admin Directory</h1>
              <p className="text-xs text-gray-600 mt-1">Contact and manage admin information</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05 }} onClick={handleExport} disabled={admins.length === 0}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={loadData} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Stats Cards - Now Clickable Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusTabs.map((tab, i) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(tab.key as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className={`rounded-xl shadow-sm border p-3 transition-all text-left ${
                activeFilter === tab.key 
                  ? 'border-2 shadow-md' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              style={activeFilter === tab.key ? { 
                backgroundColor: `${tab.color}10`, 
                borderColor: tab.color 
              } : { backgroundColor: 'white' }}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="p-2 rounded-lg" 
                  style={{ backgroundColor: `${tab.color}${activeFilter === tab.key ? '30' : '15'}` }}
                >
                  <User className="w-4 h-4" style={{ color: tab.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-gray-600">{tab.label}</p>
                  <p className="text-base font-bold text-gray-900">{tab.count}</p>
                </div>
                {activeFilter === tab.key && (
                  <CheckCircle className="w-4 h-4" style={{ color: tab.color }} />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search admins..." 
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

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Filter by Date:</span>
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2"
                  style={{ outline: 'none' }}
                  placeholder="From"
                />
                <span className="text-xs text-gray-500">to</span>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2"
                  style={{ outline: 'none' }}
                  placeholder="To"
                />
                {(dateFrom || dateTo) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={clearDateFilters}
                    className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Clear Dates
                  </motion.button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <select 
                value={`${sortBy}-${sortOrder}`} 
                onChange={(e) => { 
                  const [field, order] = e.target.value.split('-'); 
                  setSortBy(field); 
                  setSortOrder(order as 'asc' | 'desc'); 
                }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 flex-1"
                style={{ outline: 'none' }}
              >
                <option value="adminName-asc">Name (A-Z)</option>
                <option value="adminName-desc">Name (Z-A)</option>
                <option value="adminEmail-asc">Email (A-Z)</option>
                <option value="adminEmail-desc">Email (Z-A)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(activeFilter !== 'ALL' || dateFrom || dateTo || searchTerm) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center flex-wrap gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <span className="text-xs font-semibold text-blue-900">Active Filters:</span>
            {activeFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>Status: {activeFilter}</span>
                <button onClick={() => setActiveFilter('ALL')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>Search: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>From: {dateFrom}</span>
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>To: {dateTo}</span>
              </span>
            )}
          </motion.div>
        )}

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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgb(81, 96, 146)', borderTopColor: 'transparent' }}></div>
              <span className="text-xs text-gray-600">Loading admins...</span>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm || activeFilter !== 'ALL' || dateFrom || dateTo ? 'No Admins Found' : 'No Admins Available'}
            </p>
            <p className="text-xs text-gray-500">
              {searchTerm || activeFilter !== 'ALL' || dateFrom || dateTo ? 'Try adjusting your filters.' : 'Admins will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
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

        {/* View Admin Modal */}
        <AnimatePresence>
          {showViewModal && selectedAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowViewModal(false);
                setSelectedAdmin(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-gray-900">Admin Details</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedAdmin(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <AdminAvatar admin={selectedAdmin} size="xl" />
                  <h4 className="text-base font-bold text-gray-900 mt-3">{selectedAdmin.adminName || 'Unnamed'}</h4>
                  <div className="mt-2">
                    <StatusBadge status={selectedAdmin.status || 'INACTIVE'} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-900">{selectedAdmin.adminEmail || '—'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-900">{selectedAdmin.phone || 'No phone number'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Created Date</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-900">{formatDate(selectedAdmin.createdAt)}</p>
                    </div>
                  </div>

                  {selectedAdmin.updatedAt && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Last Updated</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-900">{formatDate(selectedAdmin.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedAdmin(null);
                    }}
                    className="px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    Close
                  </motion.button>
                  {selectedAdmin.phone && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openWhatsApp(selectedAdmin.phone)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-white rounded-lg shadow-sm"
                      style={{ backgroundColor: 'rgb(37, 211, 102)' }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Message on WhatsApp</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDashboard;