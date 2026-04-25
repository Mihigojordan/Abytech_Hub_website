import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Eye,
  Download,
  BarChart3,
  Activity,
  Sparkles,
  Briefcase,
  GraduationCap,
  FlaskConical,
  Wallet,
  Target
} from 'lucide-react';
import reportService from '../../services/reportService';
import expenseService from '../../services/expenseService';
import meetingService from '../../services/meetingService';
import internshipService from '../../services/internshipService';
import researchService from '../../services/researchService';
import salaryService from '../../services/salaryService';
import weeklyGoalService from '../../services/weeklyGoalService';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const DashboardHome = ({ role }) => {
  const { hasPermission, permissions, isSuperAdmin } = useAdminAuth();
  const hasExpensePermission = hasPermission('expense_management');
  const hasReportPermission = hasPermission('report_management');
  const hasMeetingPermission = hasPermission('meeting_management');
  const hasInternshipPermission = hasPermission('internship_management');
  const hasResearchPermission = hasPermission('research_management');
  const hasSalaryPermission = hasPermission('salary_management');
  const hasWeeklyPermission = hasPermission('weekly_management');

  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [dashboardData, setDashboardData] = useState({
    reports: [],
    expenses: [],
    keyMetrics: [],
    stats: {
      totalReports: 0,
      totalExpenses: 0,
      totalAmount: 0,
      recentActivity: 0,
      uniqueAdmins: 0
    }
  });
  const [moduleStats, setModuleStats] = useState({
    meetings: { total: 0, scheduled: 0, completed: 0 },
    internships: { total: 0, pending: 0, accepted: 0 },
    research: { total: 0, inProgress: 0, published: 0 },
    salary: { total: 0, pending: 0, paid: 0, totalNet: 0 },
    weeklyGoals: { total: 0, completed: 0, inProgress: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Handle report download as PDF
  const handleDownloadReport = (report) => {
    if (!report.id) return Swal.fire('Error', 'Invalid report ID', 'error');
    const content = typeof report.content === 'string' ? report.content : JSON.stringify(report.content);
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .swal-preview-container .ql-editor { padding: 1rem; }
          .swal-preview-container .ql-editor h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; }
          .swal-preview-container .ql-editor h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; }
          .swal-preview-container .ql-editor h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; }
          .swal-preview-container .ql-editor ul, .swal-preview-container .ql-editor ol { padding-left: 1.5em; margin-bottom: 1em; }
          .swal-preview-container .ql-editor ul { list-style-type: disc; }
          .swal-preview-container .ql-editor ol { list-style-type: decimal; }
          .swal-preview-container .ql-editor li { margin-bottom: 0.5em; }
          .swal-preview-container .ql-editor p { margin-bottom: 1em; }
          .swal-preview-container .ql-editor strong { font-weight: bold; }
          .swal-preview-container .ql-editor em { font-style: italic; }
          .swal-preview-container .ql-editor blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; }
          .ql-container { min-height: 400px; }
          .ql-editor { min-height: 400px; }
          .text-left { text-align: left; }
        </style>
      </head>
      <body>
        <div class="swal-preview-container text-left">
          <div class="ql-editor">
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;
    const options = {
      margin: 10,
      filename: `${report.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    html2pdf().set(options).from(element).save();
  };

  // Fetch reports and expenses (expenses only if has permission)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const getFilterParams = () => {
          const params = { search: searchTerm.trim() };
          if (filterType && filterType !== 'all') {
            params.filter = filterType === 'week' ? 'weekly' : filterType === 'month' ? 'monthly' : filterType;
            if (filterType === 'custom' && customStartDate && customEndDate) {
              params.from = customStartDate;
              params.to = customEndDate;
            }
          }
          return params;
        };
        const filterParams = getFilterParams();

        // Always fetch reports (backend filters to own reports if no report_management permission)
        const reportResponse = await reportService.getAllReports({ ...filterParams, page: 1, limit: 9999 });
        const reportData = reportResponse.data || reportResponse || [];

        // Only fetch expenses if admin has expense_management permission
        let expenseData = [];
        if (hasExpensePermission) {
          const expenseResponse = await expenseService.getAllExpenses({ ...filterParams, page: 1, limit: 9999 });
          expenseData = expenseResponse.data || expenseResponse || [];
        }

        const recentActivity = reportData.length + expenseData.length;

        const keyMetrics = expenseData
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
          .map(expense => ({
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            adminName: expense.admin?.adminName || 'Unknown',
            createdAt: expense.createdAt
          }));

        setDashboardData({
          reports: reportData.slice(0, 3),
          expenses: expenseData.slice(0, 3),
          keyMetrics,
          stats: {
            totalReports: reportResponse.pagination ? reportResponse.pagination.total : reportData.length,
            totalExpenses: expenseData.length,
            totalAmount: expenseData.reduce((sum, expense) => sum + expense.amount, 0),
            recentActivity,
            uniqueAdmins: new Set([...reportData, ...expenseData].map(item => item.admin?.id)).size
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType, searchTerm, customStartDate, customEndDate, hasExpensePermission]);

  // Fetch module stats based on permissions (re-fetches when permissions change)
  useEffect(() => {
    const fetchModuleStats = async () => {
      try {
        const promises = [];
        const keys = [];

        if (hasMeetingPermission) {
          keys.push('meetings');
          promises.push(
            meetingService.getMeetingStats().catch(() => null)
          );
        }

        if (hasInternshipPermission) {
          keys.push('internships');
          promises.push(
            internshipService.getApplicationStats().catch(() => null)
          );
        }

        if (hasResearchPermission) {
          keys.push('research');
          promises.push(
            researchService.getAllResearches({ page: 1, limit: 1 }).catch(() => null)
          );
        }

        if (hasSalaryPermission) {
          keys.push('salary');
          promises.push(
            salaryService.getStats().catch(() => null)
          );
        }

        if (hasWeeklyPermission) {
          keys.push('weeklyGoals');
          promises.push(
            weeklyGoalService.getWeeklyGoalStats().catch(() => null)
          );
        }

        const results = await Promise.all(promises);
        const newStats = { ...moduleStats };

        results.forEach((result, index) => {
          if (!result) return;
          const key = keys[index];

          switch (key) {
            case 'meetings':
              newStats.meetings = {
                total: result.total || result.totalMeetings || 0,
                scheduled: result.scheduled || result.scheduledCount || 0,
                completed: result.completed || result.completedCount || 0,
              };
              break;
            case 'internships':
              newStats.internships = {
                total: result.total || result.totalApplications || 0,
                pending: result.pending || result.pendingCount || 0,
                accepted: result.accepted || result.acceptedCount || 0,
              };
              break;
            case 'research':
              newStats.research = {
                total: result.pagination?.total || result.total || 0,
                inProgress: result.inProgress || 0,
                published: result.published || 0,
              };
              break;
            case 'salary':
              newStats.salary = {
                total: result.total || result.totalRequests || 0,
                pending: result.pending || result.pendingCount || 0,
                paid: result.paid || result.paidCount || 0,
                totalNet: result.totalNet || result.totalNetAmount || 0,
              };
              break;
            case 'weeklyGoals':
              newStats.weeklyGoals = {
                total: result.total || result.totalGoals || 0,
                completed: result.completed || result.completedCount || 0,
                inProgress: result.inProgress || result.inProgressCount || 0,
              };
              break;
          }
        });

        setModuleStats(newStats);
      } catch (error) {
        console.error('Error fetching module stats:', error);
      }
    };
    fetchModuleStats();
  }, [permissions, isSuperAdmin, hasMeetingPermission, hasInternshipPermission, hasResearchPermission, hasSalaryPermission, hasWeeklyPermission]);

  const allStatsCards = [
    {
      label: 'Total Reports',
      value: dashboardData.stats.totalReports,
      change: '+12%',
      icon: FileText,
      trend: 'up',
      visible: true,
    },
    {
      label: 'Total Expenses',
      value: dashboardData.stats.totalExpenses,
      change: '+8%',
      icon: BarChart3,
      trend: 'up',
      visible: hasExpensePermission,
    },
    {
      label: 'Total Amount',
      value: `$${dashboardData.stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+15%',
      icon: DollarSign,
      trend: 'up',
      visible: hasExpensePermission,
    },
    {
      label: 'Meetings',
      value: moduleStats.meetings.total,
      subtitle: `${moduleStats.meetings.scheduled} scheduled`,
      icon: Briefcase,
      trend: 'up',
      change: `${moduleStats.meetings.completed} done`,
      visible: hasMeetingPermission,
    },
    {
      label: 'Internships',
      value: moduleStats.internships.total,
      subtitle: `${moduleStats.internships.pending} pending`,
      icon: GraduationCap,
      trend: 'up',
      change: `${moduleStats.internships.accepted} accepted`,
      visible: hasInternshipPermission,
    },
    {
      label: 'Research',
      value: moduleStats.research.total,
      icon: FlaskConical,
      trend: 'up',
      change: `${moduleStats.research.inProgress} in progress`,
      visible: hasResearchPermission,
    },
    {
      label: 'Salary Requests',
      value: moduleStats.salary.total,
      subtitle: `${moduleStats.salary.pending} pending`,
      icon: Wallet,
      trend: 'up',
      change: `${moduleStats.salary.paid} paid`,
      visible: hasSalaryPermission,
    },
    {
      label: 'Weekly Goals',
      value: moduleStats.weeklyGoals.total,
      subtitle: `${moduleStats.weeklyGoals.inProgress} in progress`,
      icon: Target,
      trend: 'up',
      change: `${moduleStats.weeklyGoals.completed} completed`,
      visible: hasWeeklyPermission,
    },
    {
      label: 'Recent Activity',
      value: dashboardData.stats.recentActivity,
      change: '+5%',
      icon: Activity,
      trend: 'up',
      visible: true,
    }
  ];

  const statsCards = allStatsCards.filter(card => card.visible);

  const handlePreviewReport = (report) => {
    window.location.href = `/admin/dashboard/report/view/${report.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: 32, height: 32, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ ...ba(13, 500, { color: ORG }) }}>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...bc(16, 700, { color: textC, letterSpacing: 1 }) }}>Dashboard Overview</h1>
              <p style={{ ...ba(12, 400, { color: text3, marginTop: 2 }) }}>Welcome back! Here's your overview.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="p-2 rounded-lg transition-all"
                style={{ color: text2 }}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-lg transition-all relative"
                style={{ color: text2 }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#e84040' }}></span>
              </button>
              <button
                className="p-2 rounded-lg transition-all"
                style={{ color: text2 }}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter Section */}
        <div
          className="rounded-lg p-4"
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5" size={16} style={{ color: text3 }} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm transition-all"
                style={{
                  ...ba(13, 400, { color: textC }),
                  background: bg3,
                  border: `1px solid ${border}`,
                  borderRadius: 4,
                  outline: 'none',
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'custom', label: 'Custom' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => {
                    setFilterType(btn.value);
                    if (btn.value !== 'custom') {
                      setShowCustomFilter(false);
                      setCustomStartDate('');
                      setCustomEndDate('');
                    } else {
                      setShowCustomFilter(true);
                    }
                  }}
                  className="px-3 py-1.5 transition-all"
                  style={
                    filterType === btn.value
                      ? { ...bc(11, 700, { color: '#fff', letterSpacing: 1 }), background: ORG, borderRadius: 4, border: 'none' }
                      : { ...bc(11, 600, { color: text2, letterSpacing: 1 }), background: bg3, border: `1px solid ${border}`, borderRadius: 4 }
                  }
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          {showCustomFilter && (
            <div
              className="mt-3 p-3 rounded-lg"
              style={{ background: bg3, border: `1px solid ${border}`, borderRadius: 4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block mb-1.5"
                    style={{ ...bc(10, 700, { color: text2, letterSpacing: 2, textTransform: 'uppercase' }) }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm"
                    style={{
                      ...ba(13, 400, { color: textC }),
                      background: bg2,
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block mb-1.5"
                    style={{ ...bc(10, 700, { color: text2, letterSpacing: 2, textTransform: 'uppercase' }) }}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm"
                    style={{
                      ...ba(13, 400, { color: textC }),
                      background: bg2,
                      border: `1px solid ${border}`,
                      borderRadius: 4,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => {
                    if (!customStartDate || !customEndDate) {
                      Swal.fire('Error', 'Please select both start and end dates', 'error');
                      return;
                    }
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                      Swal.fire('Error', 'Invalid date format', 'error');
                      return;
                    }
                    if (start > end) {
                      Swal.fire('Error', 'Start date must be before or equal to end date', 'error');
                      return;
                    }
                    setFilterType('custom');
                  }}
                  className="px-3 py-1.5 transition-all"
                  style={{ ...bc(11, 700, { color: '#fff', letterSpacing: 1 }), background: ORG, borderRadius: 4, border: 'none' }}
                >
                  Apply Filter
                </button>
                <button
                  onClick={() => {
                    setShowCustomFilter(false);
                    setFilterType('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="px-3 py-1.5 transition-all"
                  style={{ ...bc(11, 600, { color: text2, letterSpacing: 1 }), background: 'transparent', border: `1px solid ${border}`, borderRadius: 4 }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards — dynamic grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${statsCards.length > 4 ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="relative overflow-hidden p-4 transition-all duration-300"
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, marginBottom: 6 }) }}>
                    {stat.label}
                  </p>
                  <p style={{ ...bb(32, { color: ORG, lineHeight: 1 }) }}>{stat.value}</p>
                  <div className="flex items-center mt-1.5">
                    <span style={{ ...bc(10, 600, { color: stat.trend === 'up' ? '#4ade80' : '#e84040', letterSpacing: 1 }) }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(232,98,26,.1)',
                    border: '1px solid rgba(232,98,26,.2)',
                    borderRadius: 4,
                  }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: ORG }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 ${hasExpensePermission ? 'lg:grid-cols-2' : ''} gap-4`}>
          {/* Recent Reports — always visible */}
          <div
            className="overflow-hidden"
            style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                  <h3 style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>
                    Recent Reports
                  </h3>
                </div>
                <button className="p-1.5 rounded-lg transition-all" style={{ color: text3 }}>
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2.5">
                {dashboardData.reports.length > 0 ? (
                  dashboardData.reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 transition-all group"
                      style={{ background: bg3, borderRadius: 4 }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(232,98,26,.1)',
                            border: '1px solid rgba(232,98,26,.2)',
                            borderRadius: 4,
                          }}
                        >
                          <FileText className="w-4 h-4" style={{ color: ORG }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p style={{ ...ba(12, 600, { color: textC }) }} className="truncate">{report.title}</p>
                          <p style={{ ...ba(11, 400, { color: text3 }) }}>{report.admin?.adminName || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handlePreviewReport(report)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: ORG }}
                          title="Preview Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ color: '#4ade80' }}
                          title="Download Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <p style={{ ...ba(11, 400, { color: text3, marginLeft: 4 }) }}>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6" style={{ ...ba(12, 400, { color: text3 }) }}>No reports found</p>
                )}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
                <button
                  onClick={() => window.location.href = '/admin/dashboard/report'}
                  className="w-full py-2 transition-all"
                  style={{ ...ba(12, 600, { color: ORG }), background: 'transparent', border: 'none' }}
                >
                  View All Reports →
                </button>
              </div>
            </div>
          </div>

          {/* Recent Expenses — only visible with expense_management permission */}
          {hasExpensePermission && (
            <div
              className="overflow-hidden"
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
            >
              <div className="p-4" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                    <h3 style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>
                      Recent Expenses
                    </h3>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1"
                    style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}
                  >
                    <DollarSign className="w-3.5 h-3.5" style={{ color: ORG }} />
                    <span style={{ ...bc(11, 700, { color: ORG }) }}>
                      ${dashboardData.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2.5">
                  {dashboardData.expenses.length > 0 ? (
                    dashboardData.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-3 transition-all"
                        style={{ background: bg3, borderRadius: 4 }}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                              style={{
                                background: 'rgba(232,98,26,.1)',
                                border: '1px solid rgba(232,98,26,.2)',
                                borderRadius: 4,
                              }}
                            >
                              <DollarSign className="w-3.5 h-3.5" style={{ color: ORG }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p style={{ ...ba(12, 600, { color: textC }) }} className="truncate">{expense.title}</p>
                              <p style={{ ...ba(11, 400, { color: text3 }) }} className="truncate">{expense.description || 'N/A'}</p>
                              <p style={{ ...ba(11, 400, { color: text3 }) }}>{expense.admin?.adminName || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0 ml-2">
                            <span style={{ ...ba(12, 700, { color: textC }) }}>${expense.amount.toFixed(2)}</span>
                            <span style={{ ...ba(11, 400, { color: text3 }) }}>
                              {new Date(expense.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6" style={{ ...ba(12, 400, { color: text3 }) }}>No expenses found</p>
                  )}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
                  <button
                    onClick={() => window.location.href = '/admin/dashboard/expense'}
                    className="w-full py-2 transition-all"
                    style={{ ...ba(12, 600, { color: ORG }), background: 'transparent', border: 'none' }}
                  >
                    View All Expenses →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section — only show if admin has relevant permissions */}
        {(hasReportPermission || hasExpensePermission) && (
          <div className={`grid grid-cols-1 ${hasExpensePermission ? 'lg:grid-cols-3' : ''} gap-4`}>
            {/* Admin Overview — visible if has report or expense permission */}
            <div
              className={`${hasExpensePermission ? 'lg:col-span-2' : ''} overflow-hidden`}
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
            >
              <div className="p-4" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                    <h3 style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>
                      Admin Overview
                    </h3>
                  </div>
                  <button
                    onClick={() => window.location.href = '/admin/dashboard/users'}
                    style={{ ...ba(12, 600, { color: ORG }), background: 'transparent', border: 'none' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...new Set([...dashboardData.reports, ...dashboardData.expenses].map(item => item.admin?.id))]
                    .map((adminId) => {
                      const admin = dashboardData.reports.find(r => r.admin?.id === adminId)?.admin ||
                        dashboardData.expenses.find(e => e.admin?.id === adminId)?.admin;
                      const adminReports = dashboardData.reports.filter(r => r.admin?.id === adminId).length;
                      const adminExpenses = dashboardData.expenses.filter(e => e.admin?.id === adminId).length;
                      return {
                        id: adminId,
                        name: admin?.adminName || 'Unknown',
                        totalItems: adminReports + adminExpenses
                      };
                    })
                    .map((admin, index) => (
                      <div
                        key={index}
                        className="p-3 transition-all"
                        style={{ border: `1px solid ${border}`, borderRadius: 4 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 flex items-center justify-center"
                              style={{
                                background: 'rgba(232,98,26,.1)',
                                border: '1px solid rgba(232,98,26,.2)',
                                borderRadius: 4,
                              }}
                            >
                              <Building2 className="w-4 h-4" style={{ color: ORG }} />
                            </div>
                            <div>
                              <p style={{ ...ba(12, 600, { color: textC }) }}>{admin.name}</p>
                              <p style={{ ...ba(11, 400, { color: text3 }) }}>{admin.totalItems} items</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Key Metrics — only visible with expense_management permission */}
            {hasExpensePermission && (
              <div
                className="overflow-hidden"
                style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}
              >
                <div className="p-4" style={{ borderBottom: `1px solid ${border}` }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                    <h3 style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }) }}>
                      Key Metrics
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2.5">
                    {dashboardData.keyMetrics.length > 0 ? (
                      dashboardData.keyMetrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center gap-2.5 p-2.5 transition-all"
                          style={{ background: bg3, borderRadius: 4 }}
                        >
                          <div
                            className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'rgba(232,98,26,.1)',
                              border: '1px solid rgba(232,98,26,.2)',
                              borderRadius: 4,
                            }}
                          >
                            <DollarSign className="w-3.5 h-3.5" style={{ color: ORG }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...ba(12, 600, { color: textC }) }} className="truncate">{metric.title}</p>
                            <p style={{ ...ba(11, 400, { color: text3 }) }}>{metric.adminName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p style={{ ...ba(12, 700, { color: textC }) }}>${metric.amount.toFixed(2)}</p>
                            <p style={{ ...ba(11, 400, { color: text3 }) }}>{new Date(metric.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6" style={{ ...ba(12, 400, { color: text3 }) }}>No metrics found</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
                    <button
                      onClick={() => window.location.href = '/admin/dashboard/expense'}
                      className="w-full py-2 transition-all"
                      style={{ ...ba(12, 600, { color: ORG }), background: 'transparent', border: 'none' }}
                    >
                      View All Metrics →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
