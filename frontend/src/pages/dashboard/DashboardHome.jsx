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
  Sparkles
} from 'lucide-react';
import reportService from '../../services/reportService';
import expenseService from '../../services/expenseService';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';

const DashboardHome = ({ role }) => {
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
          .swal-preview-container .ql-editor {
            padding: 1rem;
          }
          .swal-preview-container .ql-editor h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 0.67em;
            margin-bottom: 0.67em;
          }
          .swal-preview-container .ql-editor h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.83em;
            margin-bottom: 0.83em;
          }
          .swal-preview-container .ql-editor h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor ul,
          .swal-preview-container .ql-editor ol {
            padding-left: 1.5em;
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor ul {
            list-style-type: disc;
          }
          .swal-preview-container .ql-editor ol {
            list-style-type: decimal;
          }
          .swal-preview-container .ql-editor li {
            margin-bottom: 0.5em;
          }
          .swal-preview-container .ql-editor p {
            margin-bottom: 1em;
          }
          .swal-preview-container .ql-editor strong {
            font-weight: bold;
          }
          .swal-preview-container .ql-editor em {
            font-style: italic;
          }
          .swal-preview-container .ql-editor blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1em;
            margin-left: 0;
            font-style: italic;
          }
          .ql-container {
            min-height: 400px;
          }
          .ql-editor {
            min-height: 400px;
          }
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

  // Fetch reports and expenses
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

        const [reportResponse, expenseResponse] = await Promise.all([
          reportService.getAllReports({ ...filterParams, page: 1, limit: 9999 }),
          expenseService.getAllExpenses({ ...filterParams, page: 1, limit: 9999 }),
        ]);

        const reportData = reportResponse.data || reportResponse || [];
        const expenseData = expenseResponse.data || expenseResponse || [];

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
            totalExpenses: expenseResponse.pagination ? expenseResponse.pagination.total : expenseData.length,
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
  }, [filterType, searchTerm, customStartDate, customEndDate]);

  const statsCards = [
    {
      label: 'Total Reports',
      value: dashboardData.stats.totalReports,
      change: '+12%',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'up'
    },
    {
      label: 'Total Expenses',
      value: dashboardData.stats.totalExpenses,
      change: '+8%',
      icon: BarChart3,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: 'up'
    },
    {
      label: 'Total Amount',
      value: `$${dashboardData.stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+15%',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: 'up'
    },
    {
      label: 'Recent Activity',
      value: dashboardData.stats.recentActivity,
      change: '+5%',
      icon: Activity,
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: 'up'
    }
  ];

  const handlePreviewReport = (report) => {
    window.location.href = `/admin/dashboard/report/view/${report.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'rgb(81, 96, 146)' }} />
          <span className="text-sm font-medium" style={{ color: 'rgb(81, 96, 146)' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Financial Dashboard</h1>
              <p className="text-xs text-slate-600 mt-0.5">Welcome back! Here's your financial overview.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-all">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-all relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-lg transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Modern Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search reports or expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:border-transparent transition-all bg-white/50"
                style={{ focusRingColor: 'rgb(81, 96, 146)' }}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === btn.value
                      ? 'text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  style={filterType === btn.value ? { backgroundColor: 'rgb(81, 96, 146)' } : {}}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          {showCustomFilter && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:border-transparent"
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
                  className="px-3 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'rgb(81, 96, 146)' }}
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
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-slate-600 font-medium mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <div className="flex items-center mt-1.5">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ml-1 ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5">vs last month</span>
                  </div>
                </div>
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Reports */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Reports</h3>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2.5">
                {dashboardData.reports.length > 0 ? (
                  dashboardData.reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-all group">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 text-xs truncate">{report.title}</p>
                          <p className="text-xs text-slate-500">{report.admin?.adminName || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handlePreviewReport(report)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-all"
                          style={{ color: 'rgb(81, 96, 146)' }}
                          title="Preview Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                          title="Download Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-xs text-slate-500 ml-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center text-xs py-6">No reports found</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/report'}
                  className="w-full text-xs font-medium py-2 hover:opacity-80 transition-all"
                  style={{ color: 'rgb(81, 96, 146)' }}
                >
                  View All Reports →
                </button>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Expenses</h3>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <DollarSign className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-700">
                    ${dashboardData.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2.5">
                {dashboardData.expenses.length > 0 ? (
                  dashboardData.expenses.map((expense) => (
                    <div key={expense.id} className="p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-all">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 text-xs truncate">{expense.title}</p>
                            <p className="text-xs text-slate-500 truncate">{expense.description || 'N/A'}</p>
                            <p className="text-xs text-slate-400">{expense.admin?.adminName || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-2">
                          <span className="text-xs font-bold text-slate-900">${expense.amount.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center text-xs py-6">No expenses found</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/expense'}
                  className="w-full text-xs font-medium py-2 hover:opacity-80 transition-all"
                  style={{ color: 'rgb(81, 96, 146)' }}
                >
                  View All Expenses →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Admin Overview */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Admin Overview</h3>
                <button
                  onClick={() => window.location.href = '/admin/dashboard/users'}
                  className="text-xs font-medium hover:opacity-80"
                  style={{ color: 'rgb(81, 96, 146)' }}
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
                    <div key={index} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{admin.name}</p>
                            <p className="text-xs text-slate-500">{admin.totalItems} items</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Key Metrics</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2.5">
                {dashboardData.keyMetrics.length > 0 ? (
                  dashboardData.keyMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-all">
                      <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">{metric.title}</p>
                        <p className="text-xs text-slate-500">{metric.adminName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-slate-900">${metric.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{new Date(metric.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center text-xs py-6">No metrics found</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/expense'}
                  className="w-full text-xs font-medium py-2 hover:opacity-80 transition-all"
                  style={{ color: 'rgb(81, 96, 146)' }}
                >
                  View All Metrics →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;