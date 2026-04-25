import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, Eye, UserPlus, CheckCircle, Users2,
  Mail, Calendar, Grid3X3, List, Table as TableIcon, Shield,
} from 'lucide-react';
import internshipService from '../../services/internshipService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const TYPE_STYLES = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development', bg: 'rgba(26,92,120,.15)', color: TEAL },
  UI_UX:               { label: 'UI/UX Design',          bg: 'rgba(232,98,26,.12)',  color: ORG },
  DATA:                { label: 'Data',                   bg: 'rgba(26,92,120,.15)', color: TEAL },
  MARKETING:           { label: 'Marketing',              bg: 'rgba(232,98,26,.15)', color: ORG },
  IT_SUPPORT:          { label: 'IT Support',             bg: 'rgba(26,92,120,.15)', color: TEAL },
  OTHER:               { label: 'Other',                  bg: 'rgba(128,128,128,.15)', color: '#888' },
};

const PERIOD_CONFIG = {
  ONE_MONTH: '1 Month', THREE_MONTHS: '3 Months',
  SIX_MONTHS: '6 Months', ONE_YEAR: '1 Year',
};

const EMPLOYEE_TYPE_CONFIG = {
  FULL_TIME: 'Full-Time', PART_TIME: 'Part-Time',
};

const EMPLOYMENT_STATUS_CONFIG = {
  INTERN:              { label: 'Intern',     bg: 'rgba(232,98,26,.15)',  color: ORG },
  FULL_TIME_EMPLOYEE:  { label: 'Full-Time',  bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
  PART_TIME_EMPLOYEE:  { label: 'Part-Time',  bg: 'rgba(26,92,120,.15)',  color: TEAL },
};

const InternManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAdminAuth();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [operationLoading, setOperationLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadInterns(); }, []);

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

  const getEmploymentStatusStyle = (intern) =>
    EMPLOYMENT_STATUS_CONFIG[intern.employmentStatus] || EMPLOYMENT_STATUS_CONFIG.INTERN;

  const getTypeStyle = (type) => TYPE_STYLES[type] || TYPE_STYLES.OTHER;

  const renderActions = (intern) => (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <button
        onClick={() => navigate(`/admin/dashboard/internships/view/${intern.id}`)}
        style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px 8px', color: text2, cursor: 'pointer' }}
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
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: operationLoading ? 'not-allowed' : 'pointer',
                opacity: operationLoading ? 0.6 : 1,
                ...(employeeType === 'FULL_TIME'
                  ? { background: ORG, color: '#fff', border: 'none' }
                  : { background: bg3, color: ORG, border: '1px solid ' + border }),
              }}
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
    <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead style={{ background: bg3 }}>
            <tr>
              {['Intern', 'Track', 'Admitted', 'Remaining Time', 'Employment Status', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`text-left py-3 px-5${i === 2 ? ' hidden lg:table-cell' : i === 1 ? ' hidden md:table-cell' : ''}`}
                  style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 5 ? 'right' : 'left' })}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInterns.map((intern) => {
              const typeStyle = getTypeStyle(intern.internshipType);
              const statusStyle = getEmploymentStatusStyle(intern);
              return (
                <tr
                  key={intern.id}
                  style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg3}
                  onMouseLeave={e => e.currentTarget.style.background = bg2}
                >
                  <td className="py-3 px-5">
                    <div className="space-y-1">
                      <div style={{ ...ba(13, 600, { color: textC }) }}>{intern.fullName}</div>
                      <div style={{ ...ba(11, 400, { color: text2, display: 'flex', alignItems: 'center', gap: 6 }) }}>
                        <Mail className="w-3.5 h-3.5" />{intern.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 hidden md:table-cell">
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>
                      {typeStyle.label}
                    </span>
                  </td>
                  <td className="py-3 px-5 hidden lg:table-cell" style={{ ...ba(13, 400, { color: text2 }) }}>
                    {formatDate(intern.internshipTimeline?.startDate || intern.internshipStartDate || intern.updatedAt)}
                  </td>
                  <td className="py-3 px-5" style={{ ...ba(13, 600, { color: textC }) }}>
                    {getRemainingTimeLabel(intern)}
                  </td>
                  <td className="py-3 px-5">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                      <Shield className="w-3.5 h-3.5" />
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="py-3 px-5">{renderActions(intern)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredInterns.map((intern) => {
        const typeStyle = getTypeStyle(intern.internshipType);
        const statusStyle = getEmploymentStatusStyle(intern);
        return (
          <div key={intern.id} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div style={{ ...ba(15, 600, { color: textC }) }}>{intern.fullName}</div>
                <div style={{ ...ba(12, 400, { color: text2 }) }}>{intern.email}</div>
              </div>
              <span style={{ display: 'inline-block', whiteSpace: 'nowrap', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeStyle.bg, color: typeStyle.color }}>
                {typeStyle.label}
              </span>
            </div>
            <div className="space-y-2 mb-4" style={{ fontSize: 13 }}>
              {[
                { label: 'Institution', value: intern.institution || '—' },
                { label: 'Period',      value: PERIOD_CONFIG[intern.period] || intern.period || '—' },
                { label: 'Admitted',    value: formatDate(intern.internshipTimeline?.startDate || intern.internshipStartDate || intern.updatedAt) },
                { label: 'Remaining',   value: getRemainingTimeLabel(intern) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span style={{ color: text2 }}>{label}</span>
                  <span style={{ ...ba(13, 600, { color: textC, textAlign: 'right' }) }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 pt-4" style={{ borderTop: '1px solid ' + border }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                <Shield className="w-3.5 h-3.5" />{statusStyle.label}
              </span>
              {renderActions(intern)}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Page Header */}
      <div style={{ background: bg2, borderBottom: '1px solid ' + border }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 style={{ ...bb(32, { color: ORG, lineHeight: 1, margin: 0 }) }}>Intern Management</h1>
              <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Manage accepted internship records and conversion history</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadInterns}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                <RefreshCw className={`w-4 h-4${loading ? ' animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="flex items-center p-1" style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4 }}>
                {[
                  { mode: 'table', Icon: TableIcon },
                  { mode: 'grid',  Icon: Grid3X3 },
                  { mode: 'list',  Icon: List },
                ].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      background: viewMode === mode ? ORG : 'transparent',
                      color: viewMode === mode ? '#fff' : text2,
                      transition: 'all .15s',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Internship Records',  value: internshipRecordCount,   Icon: Shield },
            { label: 'Managed Here',        value: filteredInterns.length,  Icon: Users2 },
            { label: 'Ready For Conversion',value: readyForConversionCount, Icon: CheckCircle },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: 12, color: ORG }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
                  <p style={bb(48, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: text2 }} />
              <input
                type="text"
                placeholder="Search by name, email, institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div className="flex items-center gap-2" style={{ ...ba(13, 400, { color: text2 }) }}>
              <Calendar className="w-4 h-4" />
              Accepted internship records
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 48, textAlign: 'center' }}>
            <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: ORG }} />
            <p style={{ ...ba(13, 600, { color: text2 }) }}>Loading internship records...</p>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 64, textAlign: 'center' }}>
            <Users2 className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
            <h3 style={{ ...ba(18, 600, { color: textC, marginBottom: 8 }) }}>No internship records found</h3>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Accepted applicants remain visible here throughout their internship lifecycle.</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && renderTable()}
            {viewMode === 'grid' && renderCards()}
            {viewMode === 'list' && renderCards()}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div style={{
            padding: '12px 20px',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid',
            ...(toast.type === 'success'
              ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
              : { background: 'rgba(232,64,64,.15)',  borderColor: '#e84040', color: '#e84040' }),
          }}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternManagement;
