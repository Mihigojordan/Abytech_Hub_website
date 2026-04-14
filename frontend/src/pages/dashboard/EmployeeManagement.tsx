import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Grid3X3,
  List,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Table,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useAdminAuth from '../../context/AdminAuthContext';
import adminAuthService from '../../services/adminAuthService';
import userAuthService from '../../services/userAuthService';
import { API_URL } from '../../api/api';

function handleReportUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes('://')) return trimmed;
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
  return base + path;
}

type EmployeeType = 'FULL_TIME' | 'PART_TIME';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
type WorkforceFilter = 'ALL' | 'ADMIN' | EmployeeType;
type WorkforceRole = 'ADMIN' | 'EMPLOYEE' | 'USER';

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  initial?: string | null;
  phone?: string | null;
  status: EmployeeStatus;
  role: WorkforceRole;
  employeeType?: EmployeeType | null;
  createdAt: string;
  source: 'admins' | 'users';
  isSuperAdmin?: boolean;
}

const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
};

const FILTER_LABELS: Record<Exclude<WorkforceFilter, 'ALL'>, string> = {
  ADMIN: 'Admins',
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
};

function buildInitials(name: string | null | undefined): string | null {
  if (!name?.trim()) return null;

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 5);
}

function normalizeEmployee(employee: any): EmployeeRecord {
  return {
    id: employee.id,
    name: employee.name || '—',
    email: employee.email || '—',
    avatar: employee.avatar || null,
    initial: employee.initial || buildInitials(employee.name),
    phone: employee.phone || null,
    status: employee.status || 'ACTIVE',
    role: employee.role || 'EMPLOYEE',
    employeeType: employee.employeeType || null,
    createdAt: employee.createdAt,
    source: 'users',
  };
}

function normalizeAdmin(admin: any): EmployeeRecord {
  return {
    id: admin.id,
    name: admin.adminName || '—',
    email: admin.adminEmail || '—',
    avatar: admin.profileImage || null,
    initial: buildInitials(admin.adminName),
    phone: admin.phone || null,
    status: admin.status || 'ACTIVE',
    role: 'ADMIN',
    employeeType: null,
    createdAt: admin.createdAt,
    source: 'admins',
    isSuperAdmin: Boolean(admin.isSuperAdmin),
  };
}

function getWorkforceTypeLabel(employee: EmployeeRecord): string {
  if (employee.role === 'ADMIN') {
    return 'Admin';
  }

  if (employee.employeeType) {
    return EMPLOYEE_TYPE_LABELS[employee.employeeType];
  }

  return employee.role === 'EMPLOYEE' ? 'Employee' : 'User';
}

const EmployeeAvatar = ({ employee, size = 'md' }: { employee: EmployeeRecord; size?: 'sm' | 'md' | 'lg' }) => {
  const imageUrl = handleReportUrl(employee.avatar);
  const [hasError, setHasError] = useState(false);

  const sizeClass =
    size === 'sm' ? 'w-8 h-8' :
    size === 'lg' ? 'w-12 h-12' :
    'w-10 h-10';

  const iconSize =
    size === 'sm' ? 'w-4 h-4' :
    size === 'lg' ? 'w-6 h-6' :
    'w-5 h-5';

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={employee.name || 'Employee'}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center bg-orange-50 text-orange-500 border border-orange-100`}>
      {employee.initial ? (
        <span className="text-xs font-semibold">{employee.initial.slice(0, 2)}</span>
      ) : (
        <User className={iconSize} />
      )}
    </div>
  );
};

const EmployeeDirectoryPage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [operationStatus, setOperationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('table');
  const [activeFilter, setActiveFilter] = useState<WorkforceFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeeData, adminData] = await Promise.all([
        userAuthService.getEmployees(),
        isSuperAdmin ? adminAuthService.getAllAdmins() : Promise.resolve([]),
      ]);

      const employeeList = Array.isArray(employeeData)
        ? employeeData.map((employee) => normalizeEmployee(employee))
        : [];
      const adminList = isSuperAdmin && Array.isArray(adminData)
        ? adminData.map((admin) => normalizeAdmin(admin))
        : [];

      setEmployees([...adminList, ...employeeList]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load workforce');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: 'success' | 'error', message: string, duration = 3000) => {
    setOperationStatus({ type, message });
    window.setTimeout(() => setOperationStatus(null), duration);
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const openWhatsApp = (phone?: string | null) => {
    if (!phone) return showOperationStatus('error', 'Phone number not available');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return showOperationStatus('error', 'Invalid phone number');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Type', 'Status', 'Created Date'],
      ...filteredEmployees.map((employee) => [
        employee.name || '',
        employee.email || '',
        employee.phone || '',
        getWorkforceTypeLabel(employee),
        employee.status || '',
        formatDate(employee.createdAt),
      ]),
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${isSuperAdmin ? 'workforce' : 'employees'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showOperationStatus('success', `${isSuperAdmin ? 'Workforce' : 'Employees'} exported successfully`);
  };

  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (activeFilter === 'ADMIN') {
      filtered = filtered.filter((employee) => employee.role === 'ADMIN');
    } else if (activeFilter !== 'ALL') {
      filtered = filtered.filter((employee) => employee.employeeType === activeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((employee) =>
        employee.name?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term) ||
        employee.phone?.includes(term),
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((employee) => new Date(employee.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((employee) => new Date(employee.createdAt) <= to);
    }

    filtered.sort((a, b) => {
      const av = sortBy === 'employeeType'
        ? getWorkforceTypeLabel(a)
        : (a as any)[sortBy] ?? '';
      const bv = sortBy === 'employeeType'
        ? getWorkforceTypeLabel(b)
        : (b as any)[sortBy] ?? '';

      if (sortBy === 'createdAt') {
        const at = new Date(av).getTime();
        const bt = new Date(bv).getTime();
        return sortOrder === 'asc' ? at - bt : bt - at;
      }

      const as = av.toString().toLowerCase();
      const bs = bv.toString().toLowerCase();
      return sortOrder === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });

    return filtered;
  }, [activeFilter, dateFrom, dateTo, employees, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageEmployees = filteredEmployees.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredEmployees.length, activeFilter, searchTerm, dateFrom, dateTo, sortBy, sortOrder]);

  const getStatusColor = (status: EmployeeStatus) => status === 'ACTIVE'
    ? { bg: 'bg-green-100', txt: 'text-green-700', border: 'border-green-200' }
    : { bg: 'bg-red-100', txt: 'text-red-700', border: 'border-red-200' };

  const getTypeColor = (employee: EmployeeRecord) => {
    if (employee.role === 'ADMIN') {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return employee.employeeType === 'PART_TIME'
      ? 'bg-sky-100 text-sky-700 border-sky-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
    const colors = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${colors.bg} ${colors.txt} border ${colors.border}`}>
        {status}
      </span>
    );
  };

  const TypeBadge = ({ employee }: { employee: EmployeeRecord }) => (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(employee)}`}>
      {getWorkforceTypeLabel(employee)}
    </span>
  );

  const renderActions = (employee: EmployeeRecord) => (
    <div className="flex items-center justify-end space-x-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => setSelectedEmployee(employee)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        title="View Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => openWhatsApp(employee.phone)}
        disabled={!employee.phone}
        className={`p-1.5 rounded-md transition ${employee.phone ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 cursor-not-allowed'}`}
        title="Message on WhatsApp"
      >
        <Phone className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );

  const renderTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}>
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-orange-500">Employee</th>
              <th className="text-left py-2 px-3 font-semibold text-orange-500 hidden md:table-cell">Type</th>
              <th className="text-left py-2 px-3 font-semibold text-orange-500 hidden lg:table-cell">Email</th>
              <th className="text-left py-2 px-3 font-semibold text-orange-500 hidden xl:table-cell">Phone</th>
              <th className="text-left py-2 px-3 font-semibold text-orange-500 hidden xl:table-cell">Joined</th>
              <th className="text-left py-2 px-3 font-semibold text-orange-500">Status</th>
              <th className="text-right py-2 px-3 font-semibold text-orange-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageEmployees.map((employee) => (
              <motion.tr key={employee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <EmployeeAvatar employee={employee} size="sm" />
                    <div>
                      <div className="font-medium text-gray-900">{employee.name || '—'}</div>
                      <div className="text-xs text-gray-500 lg:hidden">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 hidden md:table-cell"><TypeBadge employee={employee} /></td>
                <td className="py-2 px-3 text-gray-600 hidden lg:table-cell">{employee.email || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden xl:table-cell">{employee.phone || '—'}</td>
                <td className="py-2 px-3 text-gray-600 hidden xl:table-cell">{formatDate(employee.createdAt)}</td>
                <td className="py-2 px-3"><StatusBadge status={employee.status || 'ACTIVE'} /></td>
                <td className="py-2 px-3">{renderActions(employee)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pageEmployees.map((employee) => (
        <motion.div
          key={employee.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <EmployeeAvatar employee={employee} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{employee.name || 'Unnamed'}</h3>
                <p className="text-xs text-gray-600 truncate">{employee.email}</p>
              </div>
            </div>
            <TypeBadge employee={employee} />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{employee.phone || 'No phone'}</span></span>
            <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formatDate(employee.createdAt)}</span></span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <StatusBadge status={employee.status || 'ACTIVE'} />
            {renderActions(employee)}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {pageEmployees.map((employee) => (
        <motion.div key={employee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <EmployeeAvatar employee={employee} size="sm" />
                <h3 className="text-sm font-semibold text-gray-900">{employee.name || '—'}</h3>
                <TypeBadge employee={employee} />
                <StatusBadge status={employee.status || 'ACTIVE'} />
                <span className="text-xs text-gray-500 hidden sm:inline">{formatDate(employee.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 ml-10">
                <span className="flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{employee.email || '—'}</span></span>
                <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{employee.phone || 'No phone'}</span></span>
              </div>
            </div>
            <div className="ml-4">{renderActions(employee)}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const filterCards = [
    { key: 'ALL' as const, label: 'All Employees', count: employees.length },
    ...(isSuperAdmin
      ? [{ key: 'ADMIN' as const, label: 'Admins', count: employees.filter((employee) => employee.role === 'ADMIN').length }]
      : []),
    { key: 'FULL_TIME' as const, label: 'Full-Time', count: employees.filter((employee) => employee.role !== 'ADMIN' && employee.employeeType === 'FULL_TIME').length },
    { key: 'PART_TIME' as const, label: 'Part-Time', count: employees.filter((employee) => employee.role !== 'ADMIN' && employee.employeeType === 'PART_TIME').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-orange-500">Employee Management</h1>
              <p className="text-xs text-gray-600 mt-1">
                {isSuperAdmin
                  ? 'Manage employees and admins in one workforce view'
                  : 'Manage employees sourced from the user directory'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleExport}
                disabled={filteredEmployees.length === 0}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className={`grid grid-cols-1 ${isSuperAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
          {filterCards.map((card, index) => (
            <motion.button
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(card.key)}
              className={`rounded-xl shadow-sm border p-3 transition-all text-left ${
                activeFilter === card.key
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-gray-600">{card.label}</p>
                  <p className="text-base font-bold text-gray-900">{card.count}</p>
                </div>
                {activeFilter === card.key && <CheckCircle className="w-4 h-4 text-orange-500" />}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isSuperAdmin ? 'Search workforce...' : 'Search employees...'}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:border-gray-300 transition-colors"
                  style={{ outline: 'none' }}
                />
              </div>

              <div className="flex items-center space-x-2">
                {(['table', 'grid', 'list'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-colors ${viewMode === mode ? 'text-white shadow-sm bg-orange-500' : 'text-gray-600 hover:bg-gray-100'}`}
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
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2" style={{ outline: 'none' }} />
                <span className="text-xs text-gray-500">to</span>
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2" style={{ outline: 'none' }} />
                {(dateFrom || dateTo) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Clear Dates
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(event) => {
                  const [field, order] = event.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 flex-1"
                style={{ outline: 'none' }}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="employeeType-asc">Type (A-Z)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {(activeFilter !== 'ALL' || dateFrom || dateTo || searchTerm) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center flex-wrap gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-xs font-semibold text-blue-900">Active Filters:</span>
            {activeFilter !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                <span>Type: {FILTER_LABELS[activeFilter]}</span>
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

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 rounded-full animate-spin border-orange-500 border-t-transparent"></div>
              <span className="text-xs text-gray-600">{isSuperAdmin ? 'Loading workforce...' : 'Loading employees...'}</span>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base font-semibold text-gray-900 mb-2">
              {searchTerm || activeFilter !== 'ALL' || dateFrom || dateTo
                ? `No ${isSuperAdmin ? 'Workforce Records' : 'Employees'} Found`
                : `No ${isSuperAdmin ? 'Workforce Records' : 'Employees'} Available`}
            </p>
            <p className="text-xs text-gray-500">
              {searchTerm || activeFilter !== 'ALL' || dateFrom || dateTo
                ? 'Try adjusting your filters.'
                : isSuperAdmin
                  ? 'Employees and admins will appear here.'
                  : 'Converted employees will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTable()}
            {viewMode === 'grid' && renderGrid()}
            {viewMode === 'list' && renderList()}

            <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-100 rounded-b-xl shadow-sm mt-4">
              <div className="text-xs text-gray-600">
                Showing {startIdx + 1}-{Math.min(endIdx, filteredEmployees.length)} of {filteredEmployees.length}
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </motion.button>
                <span className="text-xs text-gray-600">{currentPage} / {totalPages}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-2.5 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedEmployee.role === 'ADMIN' ? 'Admin Details' : 'Employee Details'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedEmployee.role === 'ADMIN' ? 'Admin directory profile' : 'User-backed employee profile'}
                    </p>
                  </div>
                  <button onClick={() => setSelectedEmployee(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <EmployeeAvatar employee={selectedEmployee} size="lg" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h3>
                      <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <TypeBadge employee={selectedEmployee} />
                    <StatusBadge status={selectedEmployee.status || 'ACTIVE'} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.phone || '—'}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Joined</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedEmployee.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Source</p>
                      <p className="font-medium text-gray-900">
                        {selectedEmployee.role === 'ADMIN'
                          ? <><code>Admin</code> table via <code>/admin</code></>
                          : <><code>users</code> table via <code>user-auth/users?role=EMPLOYEE</code></>}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {operationStatus && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="fixed top-4 right-4 z-50">
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg text-xs ${operationStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {operationStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)} className="ml-2">
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDirectoryPage;
