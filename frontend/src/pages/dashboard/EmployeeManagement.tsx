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
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

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

  const sizePx =
    size === 'sm' ? 32 :
    size === 'lg' ? 48 :
    40;

  const iconSize =
    size === 'sm' ? 16 :
    size === 'lg' ? 24 :
    20;

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={employee.name || 'Employee'}
        style={{ width: sizePx, height: sizePx, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ORG}`, flexShrink: 0 }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div style={{
      width: sizePx,
      height: sizePx,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: ORG,
      color: '#fff',
      flexShrink: 0,
    }}>
      {employee.initial ? (
        <span style={{ fontSize: 11, fontWeight: 700 }}>{employee.initial.slice(0, 2)}</span>
      ) : (
        <User style={{ width: iconSize, height: iconSize }} />
      )}
    </div>
  );
};

const EmployeeDirectoryPage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
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

  const getStatusStyle = (status: EmployeeStatus) => status === 'ACTIVE'
    ? { background: 'rgba(74,222,128,.15)', color: '#4ade80' }
    : { background: 'rgba(232,64,64,.15)', color: '#e84040' };

  const getTypeBadgeStyle = (employee: EmployeeRecord) => {
    if (employee.role === 'ADMIN') {
      return { background: `rgba(26,92,120,.15)`, color: TEAL };
    }
    return employee.employeeType === 'PART_TIME'
      ? { background: `rgba(232,98,26,.15)`, color: ORG }
      : { background: `rgba(26,92,120,.15)`, color: TEAL };
  };

  const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
    const s = getStatusStyle(status);
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: s.background,
        color: s.color,
      }}>
        {status}
      </span>
    );
  };

  const TypeBadge = ({ employee }: { employee: EmployeeRecord }) => {
    const s = getTypeBadgeStyle(employee);
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: s.background,
        color: s.color,
      }}>
        {getWorkforceTypeLabel(employee)}
      </span>
    );
  };

  const renderActions = (employee: EmployeeRecord) => (
    <div className="flex items-center justify-end space-x-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => setSelectedEmployee(employee)}
        style={{
          padding: '6px',
          borderRadius: 4,
          background: bg3,
          border: `1px solid ${border}`,
          color: textC,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        title="View Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => openWhatsApp(employee.phone)}
        disabled={!employee.phone}
        style={{
          padding: '6px',
          borderRadius: 4,
          background: employee.phone ? 'rgba(34,197,94,.12)' : bg3,
          border: `1px solid ${employee.phone ? 'rgba(34,197,94,.3)' : border}`,
          color: employee.phone ? '#22c55e' : text3,
          cursor: employee.phone ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Message on WhatsApp"
      >
        <Phone className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );

  const renderTable = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead style={{ background: bg3 }}>
            <tr>
              <th className="text-left py-2 px-3" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Employee</th>
              <th className="text-left py-2 px-3 hidden md:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Type</th>
              <th className="text-left py-2 px-3 hidden lg:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Email</th>
              <th className="text-left py-2 px-3 hidden xl:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Phone</th>
              <th className="text-left py-2 px-3 hidden xl:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Joined</th>
              <th className="text-left py-2 px-3" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Status</th>
              <th className="text-right py-2 px-3" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageEmployees.map((employee) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: bg2, borderBottom: `1px solid ${border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = bg3)}
                onMouseLeave={(e) => (e.currentTarget.style.background = bg2)}
              >
                <td className="py-2 px-3">
                  <div className="flex items-center space-x-2">
                    <EmployeeAvatar employee={employee} size="sm" />
                    <div>
                      <div style={{ fontWeight: 600, color: textC }}>{employee.name || '—'}</div>
                      <div style={{ fontSize: 11, color: text2 }} className="lg:hidden">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 hidden md:table-cell"><TypeBadge employee={employee} /></td>
                <td className="py-2 px-3 hidden lg:table-cell" style={{ color: text2 }}>{employee.email || '—'}</td>
                <td className="py-2 px-3 hidden xl:table-cell" style={{ color: text2 }}>{employee.phone || '—'}</td>
                <td className="py-2 px-3 hidden xl:table-cell" style={{ color: text2 }}>{formatDate(employee.createdAt)}</td>
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
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <EmployeeAvatar employee={employee} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 style={{ fontSize: 14, fontWeight: 600, color: textC }} className="truncate">{employee.name || 'Unnamed'}</h3>
                <p style={{ fontSize: 12, color: text2 }} className="truncate">{employee.email}</p>
              </div>
            </div>
            <TypeBadge employee={employee} />
          </div>

          <div className="flex items-center justify-between mb-3" style={{ fontSize: 12, color: text2 }}>
            <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{employee.phone || 'No phone'}</span></span>
            <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formatDate(employee.createdAt)}</span></span>
          </div>

          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
            <StatusBadge status={employee.status || 'ACTIVE'} />
            {renderActions(employee)}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderList = () => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
      {pageEmployees.map((employee) => (
        <motion.div
          key={employee.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: 16, borderBottom: `1px solid ${border}`, background: bg2 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = bg3)}
          onMouseLeave={(e) => (e.currentTarget.style.background = bg2)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <EmployeeAvatar employee={employee} size="sm" />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: textC }}>{employee.name || '—'}</h3>
                <TypeBadge employee={employee} />
                <StatusBadge status={employee.status || 'ACTIVE'} />
                <span style={{ fontSize: 12, color: text2 }} className="hidden sm:inline">{formatDate(employee.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 ml-10" style={{ fontSize: 12, color: text2 }}>
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
    <div style={{ minHeight: '100vh', background: bg }}>
      {/* Page header */}
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...bb(24, { color: ORG }) }}>Employee Management</h1>
              <p style={{ fontSize: 12, color: text2, marginTop: 4 }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  background: bg3,
                  border: `1px solid ${border}`,
                  color: textC,
                  borderRadius: 4,
                  cursor: filteredEmployees.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: filteredEmployees.length === 0 ? 0.5 : 1,
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  background: bg3,
                  border: `1px solid ${border}`,
                  color: textC,
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Filter cards */}
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
              style={{
                background: activeFilter === card.key ? `rgba(232,98,26,.08)` : bg2,
                border: `1px solid ${border}`,
                borderLeft: activeFilter === card.key ? `3px solid ${ORG}` : `1px solid ${border}`,
                borderRadius: 4,
                padding: 12,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center space-x-2">
                <div style={{ padding: 8, borderRadius: 6, background: `rgba(232,98,26,.15)`, color: ORG }}>
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p style={bc(9, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>{card.label}</p>
                  <p style={bb(36, { color: ORG, lineHeight: 1 })}>{card.count}</p>
                </div>
                {activeFilter === card.key && <CheckCircle className="w-4 h-4" style={{ color: ORG }} />}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search & controls panel */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search style={{ width: 16, height: 16, color: text3, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={isSuperAdmin ? 'Search workforce...' : 'Search employees...'}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 36,
                    paddingRight: 16,
                    paddingTop: 8,
                    paddingBottom: 8,
                    fontSize: 12,
                    background: bg3,
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    color: textC,
                    outline: 'none',
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                {(['table', 'grid', 'list'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: 8,
                      borderRadius: 4,
                      background: viewMode === mode ? ORG : bg3,
                      color: viewMode === mode ? '#fff' : text2,
                      border: `1px solid ${viewMode === mode ? ORG : border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                  >
                    {mode === 'table' && <Table className="w-4 h-4" />}
                    {mode === 'grid' && <Grid3X3 className="w-4 h-4" />}
                    {mode === 'list' && <List className="w-4 h-4" />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-3" style={{ borderTop: `1px solid ${border}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: text2, whiteSpace: 'nowrap' }}>Filter by Date:</span>
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  style={{
                    fontSize: 12,
                    background: bg3,
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    padding: '6px 12px',
                    color: textC,
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: text2 }}>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  style={{
                    fontSize: 12,
                    background: bg3,
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    padding: '6px 12px',
                    color: textC,
                    outline: 'none',
                  }}
                />
                {(dateFrom || dateTo) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    style={{
                      fontSize: 12,
                      color: textC,
                      padding: '4px 8px',
                      background: bg3,
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
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
                style={{
                  fontSize: 12,
                  background: bg3,
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  padding: '6px 12px',
                  color: textC,
                  outline: 'none',
                  flex: 1,
                }}
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

        {/* Active filter tags */}
        {(activeFilter !== 'ALL' || dateFrom || dateTo || searchTerm) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center flex-wrap gap-2"
            style={{
              background: `rgba(232,98,26,.08)`,
              border: `1px solid rgba(232,98,26,.2)`,
              borderRadius: 4,
              padding: 12,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: ORG }}>Active Filters:</span>
            {activeFilter !== 'ALL' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                background: `rgba(232,98,26,.1)`,
                border: `1px solid rgba(232,98,26,.3)`,
                borderRadius: 4,
                fontSize: 12,
                color: ORG,
              }}>
                <span>Type: {FILTER_LABELS[activeFilter]}</span>
                <button onClick={() => setActiveFilter('ALL')} style={{ color: ORG, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchTerm && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                background: `rgba(232,98,26,.1)`,
                border: `1px solid rgba(232,98,26,.3)`,
                borderRadius: 4,
                fontSize: 12,
                color: ORG,
              }}>
                <span>Search: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} style={{ color: ORG, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {dateFrom && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                background: `rgba(232,98,26,.1)`,
                border: `1px solid rgba(232,98,26,.3)`,
                borderRadius: 4,
                fontSize: 12,
                color: ORG,
              }}>
                <span>From: {dateFrom}</span>
              </span>
            )}
            {dateTo && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                background: `rgba(232,98,26,.1)`,
                border: `1px solid rgba(232,98,26,.3)`,
                borderRadius: 4,
                fontSize: 12,
                color: ORG,
              }}>
                <span>To: {dateTo}</span>
              </span>
            )}
          </motion.div>
        )}

        {/* Error state */}
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
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Loading / empty / content */}
        {loading ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 48, textAlign: 'center' }}>
            <div className="inline-flex items-center space-x-2">
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: ORG,
                animation: 'spin 0.8s linear infinite',
              }} className="animate-spin"></div>
              <span style={{ fontSize: 12, color: text2 }}>{isSuperAdmin ? 'Loading workforce...' : 'Loading employees...'}</span>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 48, textAlign: 'center' }}>
            <User style={{ width: 48, height: 48, margin: '0 auto 16px', color: text3 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: textC, marginBottom: 8 }}>
              {searchTerm || activeFilter !== 'ALL' || dateFrom || dateTo
                ? `No ${isSuperAdmin ? 'Workforce Records' : 'Employees'} Found`
                : `No ${isSuperAdmin ? 'Workforce Records' : 'Employees'} Available`}
            </p>
            <p style={{ fontSize: 12, color: text2 }}>
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 mt-2" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: text2 }}>
                Showing {startIdx + 1}-{Math.min(endIdx, filteredEmployees.length)} of {filteredEmployees.length}
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    fontSize: 12,
                    background: bg3,
                    border: `1px solid ${border}`,
                    color: text2,
                    borderRadius: 4,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </motion.button>
                <span style={{ fontSize: 12, color: text2 }}>{currentPage} / {totalPages}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    fontSize: 12,
                    background: bg3,
                    border: `1px solid ${border}`,
                    color: text2,
                    borderRadius: 4,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Employee detail modal */}
        <AnimatePresence>
          {selectedEmployee && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,.75)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: 512,
                  background: bg2,
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                {/* Modal header */}
                <div style={{
                  padding: '16px 24px',
                  background: bg3,
                  borderBottom: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: textC }}>
                      {selectedEmployee.role === 'ADMIN' ? 'Admin Details' : 'Employee Details'}
                    </h2>
                    <p style={{ fontSize: 12, color: text2 }}>
                      {selectedEmployee.role === 'ADMIN' ? 'Admin directory profile' : 'User-backed employee profile'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    style={{
                      padding: 8,
                      borderRadius: 4,
                      background: bg2,
                      border: `1px solid ${border}`,
                      color: textC,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div style={{ padding: 24 }} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <EmployeeAvatar employee={selectedEmployee} size="lg" />
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: textC }}>{selectedEmployee.name}</h3>
                      <p style={{ fontSize: 14, color: text2 }}>{selectedEmployee.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <TypeBadge employee={selectedEmployee} />
                    <StatusBadge status={selectedEmployee.status || 'ACTIVE'} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '12px 16px' }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: text2, marginBottom: 4 }}>Phone</p>
                      <p style={{ fontWeight: 600, color: textC }}>{selectedEmployee.phone || '—'}</p>
                    </div>
                    <div style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '12px 16px' }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: text2, marginBottom: 4 }}>Joined</p>
                      <p style={{ fontWeight: 600, color: textC }}>{formatDate(selectedEmployee.createdAt)}</p>
                    </div>
                    <div className="sm:col-span-2" style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4, padding: '12px 16px' }}>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: text2, marginBottom: 4 }}>Source</p>
                      <p style={{ fontWeight: 600, color: textC }}>
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

        {/* Operation status toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 4,
                fontSize: 12,
                background: operationStatus.type === 'success' ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)',
                border: `1px solid ${operationStatus.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(232,64,64,.3)'}`,
                color: operationStatus.type === 'success' ? '#4ade80' : '#e84040',
                boxShadow: '0 4px 24px rgba(0,0,0,.25)',
              }}>
                {operationStatus.type === 'success' ? (
                  <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                ) : (
                  <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 600 }}>{operationStatus.message}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setOperationStatus(null)}
                  style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                  <X style={{ width: 14, height: 14 }} />
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
