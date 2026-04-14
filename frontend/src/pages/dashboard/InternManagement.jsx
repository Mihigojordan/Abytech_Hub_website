import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, Eye, UserPlus, CheckCircle, Users2,
  Mail, Calendar, Grid3X3, List, Table as TableIcon, Shield,
} from 'lucide-react';
import internshipService from '../../services/internshipService';
import useAdminAuth from '../../context/AdminAuthContext';

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  UI_UX: { label: 'UI/UX Design', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  DATA: { label: 'Data', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  MARKETING: { label: 'Marketing', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  IT_SUPPORT: { label: 'IT Support', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const PERIOD_CONFIG = {
  ONE_MONTH: '1 Month',
  THREE_MONTHS: '3 Months',
  SIX_MONTHS: '6 Months',
  ONE_YEAR: '1 Year',
};

const EMPLOYEE_TYPE_CONFIG = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
};

const EMPLOYMENT_STATUS_CONFIG = {
  INTERN: {
    label: 'Intern',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  FULL_TIME_EMPLOYEE: {
    label: 'Full-Time',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  PART_TIME_EMPLOYEE: {
    label: 'Part-Time',
    className: 'bg-sky-100 text-sky-700 border-sky-200',
  },
};

const InternManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAdminAuth();
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [operationLoading, setOperationLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      setLoading(true);
      const response = await internshipService.getAdmittedInterns({ limit: 100 });
      setInterns(response.data || []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load internship records' });
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConvert = async (intern, employeeType) => {
    try {
      setOperationLoading(true);
      const result = await internshipService.transitionToFullTimeEmployee(intern.id, employeeType);
      showToast('success', result.message || `Intern converted to ${EMPLOYEE_TYPE_CONFIG[employeeType]?.toLowerCase() || 'employee'}`);
      setInterns((prev) =>
        prev.map((item) => (
          item.id === intern.id
            ? { ...item, employmentStatus: result.employmentStatus || (employeeType === 'PART_TIME' ? 'PART_TIME_EMPLOYEE' : 'FULL_TIME_EMPLOYEE') }
            : item
        )),
      );
    } catch (error) {
      showToast('error', error.message || 'Failed to convert intern to employee');
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredInterns = interns.filter((intern) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      intern.fullName?.toLowerCase().includes(term) ||
      intern.email?.toLowerCase().includes(term) ||
      intern.institution?.toLowerCase().includes(term)
    );
  });

  const internshipRecordCount = filteredInterns.length;
  const readyForConversionCount = filteredInterns.filter((intern) => !intern.employmentStatus || intern.employmentStatus === 'INTERN').length;

  const formatDate = (date) => (
    date
      ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'
  );

  const getRemainingTimeLabel = (intern) => (
    intern.employmentStatus === 'FULL_TIME_EMPLOYEE' || intern.employmentStatus === 'PART_TIME_EMPLOYEE'
      ? 'Completed'
      : intern.internshipTimeline?.remainingLabel || '—'
  );
  const getEmploymentStatusLabel = (intern) => EMPLOYMENT_STATUS_CONFIG[intern.employmentStatus] || EMPLOYMENT_STATUS_CONFIG.INTERN;

  const renderActions = (intern) => (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <button
        onClick={() => navigate(`/admin/dashboard/internships/view/${intern.id}`)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        title="View Application"
      >
        <Eye className="w-4 h-4" />
      </button>
      {isSuperAdmin && (!intern.employmentStatus || intern.employmentStatus === 'INTERN') && (
        <>
          {Object.entries(EMPLOYEE_TYPE_CONFIG).map(([employeeType, label]) => (
            <button
              key={employeeType}
              onClick={() => handleConvert(intern, employeeType)}
              disabled={operationLoading}
              className={`px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60 flex items-center gap-2 ${
                employeeType === 'FULL_TIME'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
              }`}
              title={`Convert To ${label} Employee`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </>
      )}
    </div>
  );

  const renderTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}>
            <tr>
              <th className="text-left py-3.5 px-6 font-semibold text-orange-500">Intern</th>
              <th className="text-left py-3.5 px-6 font-semibold text-orange-500 hidden md:table-cell">Track</th>
              <th className="text-left py-3.5 px-6 font-semibold text-orange-500 hidden lg:table-cell">Admitted</th>
              <th className="text-left py-3.5 px-6 font-semibold text-orange-500">Remaining Time</th>
              <th className="text-left py-3.5 px-6 font-semibold text-orange-500">Employment Status</th>
              <th className="text-right py-3.5 px-6 font-semibold text-orange-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInterns.map((intern) => (
              <tr key={intern.id} className="hover:bg-gray-50">
                <td className="py-3.5 px-6">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{intern.fullName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {intern.email}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-6 hidden md:table-cell">
                  <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[intern.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {TYPE_CONFIG[intern.internshipType]?.label || intern.internshipType}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-gray-600 hidden lg:table-cell">{formatDate(intern.internshipTimeline?.startDate || intern.internshipStartDate || intern.updatedAt)}</td>
                <td className="py-3.5 px-6">
                  <span className="text-[13px] font-medium text-gray-700">{getRemainingTimeLabel(intern)}</span>
                </td>
                <td className="py-3.5 px-6">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getEmploymentStatusLabel(intern).className}`}>
                    <Shield className="w-3.5 h-3.5" />
                    {getEmploymentStatusLabel(intern).label}
                  </span>
                </td>
                <td className="py-3.5 px-6">{renderActions(intern)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredInterns.map((intern) => (
        <div key={intern.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{intern.fullName}</h3>
              <p className="text-[13px] text-gray-500">{intern.email}</p>
            </div>
            <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_CONFIG[intern.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
              {TYPE_CONFIG[intern.internshipType]?.label || intern.internshipType}
            </span>
          </div>
          <div className="space-y-2 text-[13px] text-gray-600 mb-4">
            <div className="flex items-center justify-between gap-4">
              <span>Institution</span>
              <span className="font-medium text-gray-900 text-right">{intern.institution || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Period</span>
              <span className="font-medium text-gray-900">{PERIOD_CONFIG[intern.period] || intern.period || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Admitted</span>
              <span className="font-medium text-gray-900">{formatDate(intern.internshipTimeline?.startDate || intern.internshipStartDate || intern.updatedAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Remaining</span>
              <span className="font-medium text-gray-900">{getRemainingTimeLabel(intern)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getEmploymentStatusLabel(intern).className}`}>
                <Shield className="w-3.5 h-3.5" />
                {getEmploymentStatusLabel(intern).label}
              </span>
            </div>
            {renderActions(intern)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[1.6rem] sm:text-[2rem] font-bold text-orange-500">Intern Management</h1>
              <p className="text-[13px] text-gray-600 mt-1">Manage accepted internship records and conversion history</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadInterns}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'table' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                >
                  <TableIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Internship Records', value: internshipRecordCount, icon: Shield },
            { label: 'Managed Here', value: filteredInterns.length, icon: Users2 },
            { label: 'Ready For Conversion', value: readyForConversionCount, icon: CheckCircle },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] text-gray-500">{card.label}</p>
                  <p className="text-[1.35rem] sm:text-[1.45rem] font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="text-[13px] text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Accepted internship records
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <RefreshCw className="w-10 h-10 mx-auto mb-4 text-orange-500 animate-spin" />
            <p className="text-[13px] text-gray-600 font-medium">Loading internship records...</p>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <Users2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No internship records found</h3>
            <p className="text-[13px] text-gray-600">Accepted applicants remain visible here throughout their internship lifecycle.</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && renderTable()}
            {viewMode === 'grid' && renderCards()}
            {viewMode === 'list' && renderCards()}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
            <div className={`px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {toast.message}
            </div>
        </div>
      )}
    </div>
  );
};

export default InternManagement;
