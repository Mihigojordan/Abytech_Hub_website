import React, { useState, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight,
  RefreshCw, Grid3X3, List, Phone,
  XCircle, CheckCircle, Eye, Calendar, Mail,
  AlertCircle, X, User, Table, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminAuthService from '../../services/adminAuthService';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api/api';

function handleReportUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes('://')) return trimmed;
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
  return base + path;
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

const EmployeeDirectoryPage = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('adminName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('table'); // Start in grid
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  useEffect(() => { handleFilterAndSort(); }, [
    searchTerm, sortBy, sortOrder, allAdmins, activeFilter, dateFrom, dateTo
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminAuthService.getAllAdmins();
      const list = Array.isArray(data) ? data : [];
      setAllAdmins(list);
      setAdmins(list);
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

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return showOperationStatus('error', 'Phone number not available');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return showOperationStatus('error', 'Invalid phone number');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  // Navigate to detail page
  const goToAdminDetail = (adminId: string) => {
    navigate(`/admin/dashboard/profile/${adminId}`);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Created Date'],
      ...admins.map(a => [
        a.adminName || '',
        a.adminEmail || '',
        a.phone || '',
        a.status || '',
        formatDate(a.createdAt)
      ])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admins_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showOperationStatus('success', 'Admins exported successfully!');
  };

  const clearDateFilters = () => { setDateFrom(''); setDateTo(''); };

  const handleFilterAndSort = () => {
    let filtered = [...allAdmins];

    if (activeFilter !== 'ALL') filtered = filtered.filter(a => a.status === activeFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.adminName?.toLowerCase().includes(term)) ||
        (a.adminEmail?.toLowerCase().includes(term)) ||
        (a.phone?.includes(term))
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(a => new Date(a.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.createdAt) <= to);
    }

    filtered.sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      if (sortBy === 'createdAt') {
        const at = new Date(av).getTime();
        const bt = new Date(bv).getTime();
        return sortOrder === 'asc' ? at - bt : bt - at;
      }
      const as = av.toString().toLowerCase();
      const bs = bv.toString().toLowerCase();
      return sortOrder ===('asc') ? as.localeCompare(bs) : bs.localeCompare(as);
    });

    setAdmins(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageAdmins = admins.slice(startIdx, endIdx);

  const getStatusColor = (status: string) => status === 'ACTIVE'
    ? { bg: 'bg-green-100', txt: 'text-green-700', border: 'border-green-200' }
    : { bg: 'bg-red-100', txt: 'text-red-700', border: 'border-red-200' };

  const StatusBadge = ({ status }: { status: string }) => {
    const c = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${c.bg} ${c.txt} border ${c.border}`}>
        {status}
      </span>
    );
  };

  const renderTable = () => (
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
            {pageAdmins.map(a => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <AdminAvatar admin={a} size="sm" />
                    <div>
                      <div className="font-medium text-gray-900">{a.adminName || '—'}</div>
                      <div className="text-xs text-gray-500 md:hidden">{a.adminEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600 hidden md:table-cell">{a.adminEmail || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden lg:table-cell">{a.phone || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden xl:table-cell">{formatDate(a.createdAt)}</td>
                <td className="py-2 px-3"><StatusBadge status={a.status || 'INACTIVE'} /></td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-end space-x-1">
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => goToAdminDetail(a.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View Details">
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .95 }} onClick={() => openWhatsApp(a.phone)} disabled={!a.phone}
                      className={`p-1.5 rounded-md transition ${a.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 cursor-not-allowed'}`}>
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

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pageAdmins.map(a => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <AdminAvatar admin={a} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{a.adminName || 'Unnamed'}</h3>
                <p className="text-xs text-gray-600 truncate">{a.adminEmail}</p>
              </div>
            </div>
            <StatusBadge status={a.status || 'INACTIVE'} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{a.phone || 'No phone'}</span></span>
            <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formatDate(a.createdAt)}</span></span>
          </div>
          <div className="flex items-center justify-end space-x-1 pt-3 border-t border-gray-100">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => goToAdminDetail(a.id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs">
              <Eye className="w-3.5 h-3.5" /><span>View</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => openWhatsApp(a.phone)} disabled={!a.phone}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs ${a.phone ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 cursor-not-allowed'}`}>
              <Phone className="w-3.5 h-3.5" /><span>Message</span>
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {pageAdmins.map(a => (
        <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <AdminAvatar admin={a} size="sm" />
                <h3 className="text-sm font-semibold text-gray-900">{a.adminName || '—'}</h3>
                <StatusBadge status={a.status || 'INACTIVE'} />
                <span className="text-xs text-gray-500 hidden sm:inline">{formatDate(a.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 ml-10">
                <span className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{a.adminEmail || '—'}</span></span>
                <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{a.phone || 'No phone'}</span></span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-4">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => goToAdminDetail(a.id)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100" title="View Details">
                <Eye className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => openWhatsApp(a.phone)} disabled={!a.phone}
                className={`p-1.5 rounded-md ${a.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'}`}>
                <Phone className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4">
      <div className="text-xs text-gray-600">
        Showing {startIdx + 1}-{Math.min(endIdx, admins.length)} of {admins.length}
      </div>
      <div className="flex items-center space-x-2">
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
          className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.button>
        <span className="text-xs text-gray-600">{currentPage} / {totalPages}</span>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
          className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );

  const statusTabs = [
    { key: 'ALL', label: 'All Admins', count: allAdmins.length, color: 'rgb(81, 96, 146)' },
    { key: 'ACTIVE', label: 'Active', count: allAdmins.filter(a => a.status === 'ACTIVE').length, color: 'rgb(34, 197, 94)' },
    { key: 'INACTIVE', label: 'Inactive', count: allAdmins.filter(a => a.status === 'INACTIVE').length, color: 'rgb(239, 68, 68)' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
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
                <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={loadData} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Status Cards with Backgrounds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statusTabs.map((tab, i) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative rounded-xl shadow-sm border p-3 transition-all text-left overflow-hidden
                ${activeFilter === tab.key ? 'border-2 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              style={activeFilter === tab.key ? {
                backgroundColor: `${tab.color}15`,
                borderColor: tab.color
              } : { backgroundColor: 'white' }}
            >
              {/* First card background image */}
              {i === 0 && activeFilter === 'ALL' && (
                <div className="absolute inset-0 bg-cover bg-center opacity-10"
                  style={{ backgroundImage: 'ur[](https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80)' }} />
              )}

              <div className="relative flex items-center space-x-2">
                <div className="p-2 rounded-lg"
                  style={{ backgroundColor: `${tab.color}${activeFilter === tab.key ? '30' : '15'}` }}>
                  <User className="w-4 h-4" style={{ color: tab.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-gray-600">{tab.label}</p>
                  <p className="text-base font-bold text-gray-900">{tab.count}</p>
                </div>
                {activeFilter === tab.key && <CheckCircle className="w-4 h-4" style={{ color: tab.color }} />}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:border-gray-300 transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>

              <div className="flex items-center space-x-2">
                {(['table', 'grid', 'list'] as const).map(mode => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-colors ${viewMode === mode ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    style={viewMode === mode ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                    title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                  >
                    {mode === 'table' && <Table className="w-4 h-4" />}
                    {mode === 'grid' && <Grid3X3 className="w-4 h-4" />}
                    {mode === 'list' && <List className="w-4 h-4" />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Filter by Date:</span>
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2" style={{ outline: 'none' }} />
                <span className="text-xs text-gray-500">to</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2" style={{ outline: 'none' }} />
                {(dateFrom || dateTo) && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={clearDateFilters}
                    className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Clear Dates
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o as 'asc' | 'desc'); }}
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
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center flex-wrap gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-xs font-semibold text-blue-900">Active Filters:</span>
            {activeFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>Status: {activeFilter}</span>
                <button onClick={() => setActiveFilter('ALL')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>Search: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {dateFrom && <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"><span>From: {dateFrom}</span></span>}
            {dateTo && <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"><span>To: {dateTo}</span></span>}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
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
            {viewMode === 'table' && renderTable()}
            {viewMode === 'grid' && renderGrid()}
            {viewMode === 'list' && renderList()}
            {renderPagination()}
          </div>
        )}

        {/* Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div initial={{ opacity: 0, y: -20, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: .95 }}
              className="fixed top-4 right-4 z-50">
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg text-xs ${operationStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {operationStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                <span className="font-medium">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)} className="ml-2"><X className="w-3.5 h-3.5" /></motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDirectoryPage;