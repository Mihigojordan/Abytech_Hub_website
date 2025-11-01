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
  Download
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

        // Assuming backend sorts by createdAt desc, no need to sort again

        // Get recent activity count based on filter
        const recentActivity = reportData.length + expenseData.length;

        // Get key metrics (top 3 expenses by amount)
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
          reports: reportData.slice(0, 3), // Limit to 3 recent reports
          expenses: expenseData.slice(0, 3), // Limit to 3 recent expenses
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
      change: '+10%',
      icon: FileText,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'Total Expenses',
      value: dashboardData.stats.totalExpenses,
      change: '+8%',
      icon: FileText,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'Total Amount',
      value: `$${dashboardData.stats.totalAmount.toFixed(2)}`,
      change: '+15%',
      icon: DollarSign,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'Recent Activity',
      value: dashboardData.stats.recentActivity,
      change: '-5%',
      icon: Clock,
      color: 'bg-primary-500',
      trend: 'down'
    }
  ];

  const handlePreviewReport = (report) => {
    window.location.href = `/admin/dashboard/report/view/${report.id}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
          <span className="text-base text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Financial Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search reports or expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'custom', label: 'Custom Range' },
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filterType === btn.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {btn.value === 'custom' && <Calendar size={18} />}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          {showCustomFilter && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
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
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Reports</h3>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.reports.length > 0 ? (
                  dashboardData.reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-500">{report.admin?.adminName || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewReport(report)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Preview Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No reports found</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/report'}
                  className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                >
                  View All Reports →
                </button>
              </div>
            </div>
          </div>
          {/* Recent Expenses */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Expenses</h3>
                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    ${dashboardData.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.expenses.length > 0 ? (
                  dashboardData.expenses.map((expense) => (
                    <div key={expense.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{expense.title}</p>
                            <p className="text-sm text-gray-500">{expense.description || 'N/A'}</p>
                            <p className="text-sm text-gray-400">{expense.admin?.adminName || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 mt-1">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No expenses found</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/expense'}
                  className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                >
                  View All Expenses →
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Admin Overview</h3>
                <button
                  onClick={() => window.location.href = '/admin/dashboard/users'}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{admin.name}</p>
                            <p className="text-sm text-gray-500">{admin.totalItems} items</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Key Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Key Metrics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.keyMetrics.length > 0 ? (
                  dashboardData.keyMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{metric.title}</p>
                        <p className="text-sm text-gray-500">{metric.adminName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${metric.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{new Date(metric.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No metrics found</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = '/admin/dashboard/expense'}
                  className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
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