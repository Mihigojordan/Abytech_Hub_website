import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight,
  X, RefreshCw, Globe, CheckCircle, XCircle, AlertCircle,
  Pause, Play, Clock, Sparkles, Download, AlertTriangle,
  Filter, SortAsc, SortDesc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import hostedWebsiteService from '../../services/hostedWebsiteService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Active',     icon: CheckCircle },
  SUSPENDED: { label: 'Suspended',  icon: Pause },
  EXPIRED:   { label: 'Expired',    icon: Clock },
};

const getStatusStyle = (status) => {
  if (status === 'ACTIVE')    return { bg: 'rgba(74,222,128,.15)',  color: '#4ade80' };
  if (status === 'SUSPENDED') return { bg: 'rgba(232,98,26,.15)',   color: ORG };
  if (status === 'EXPIRED')   return { bg: 'rgba(232,64,64,.15)',   color: '#e84040' };
  return { bg: 'rgba(128,128,128,.15)', color: '#888' };
};

const HostedWebsiteManagement = () => {
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', domain: '', description: '', status: 'ACTIVE' });
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, expired: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [domainCheck, setDomainCheck] = useState({ checking: false, available: null });
  const [operationStatus, setOperationStatus] = useState(null);

  useEffect(() => { loadWebsites(); loadStats(); }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await hostedWebsiteService.getAllWebsites({
        page: currentPage, limit: itemsPerPage, search: searchTerm, status: statusFilter,
      });
      setWebsites(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await hostedWebsiteService.getWebsiteStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const showOperationStatus = (type, message, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const checkDomain = async (domain) => {
    if (!domain || domain.length < 3) { setDomainCheck({ checking: false, available: null }); return; }
    setDomainCheck({ checking: true, available: null });
    try {
      const result = await hostedWebsiteService.checkDomainAvailability(domain);
      setDomainCheck({ checking: false, available: result.available });
    } catch {
      setDomainCheck({ checking: false, available: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setOperationLoading(true);
      if (selectedWebsite) {
        await hostedWebsiteService.updateWebsite(selectedWebsite.id, formData);
        showOperationStatus('success', `"${formData.name}" updated successfully!`);
      } else {
        await hostedWebsiteService.createWebsite(formData);
        showOperationStatus('success', `"${formData.name}" created successfully!`);
      }
      setShowModal(false);
      resetForm();
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Operation failed');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      setOperationLoading(true);
      if (action === 'suspend') await hostedWebsiteService.suspendWebsite(id);
      else if (action === 'activate') await hostedWebsiteService.activateWebsite(id);
      else if (action === 'expire') await hostedWebsiteService.expireWebsite(id);
      showOperationStatus('success', 'Status updated successfully!');
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to update status');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (website) => {
    try {
      setOperationLoading(true);
      await hostedWebsiteService.deleteWebsite(website.id);
      setShowDeleteConfirm(null);
      showOperationStatus('success', `"${website.name}" deleted successfully!`);
      loadWebsites();
      loadStats();
    } catch (err) {
      showOperationStatus('error', err.message || 'Failed to delete website');
    } finally {
      setOperationLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', domain: '', description: '', status: 'ACTIVE' });
    setSelectedWebsite(null);
    setDomainCheck({ checking: false, available: null });
  };

  const openEditModal = (website) => {
    setSelectedWebsite(website);
    setFormData({ name: website.name, domain: website.domain, description: website.description || '', status: website.status });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
    const style = getStatusStyle(status);
    return (
      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: style.bg, color: style.color }}>
        {cfg.label}
      </span>
    );
  };

  const statCards = [
    { label: 'Total Websites', value: stats.total,     icon: Globe,        colorKey: 'org' },
    { label: 'Active',         value: stats.active,    icon: CheckCircle,  colorKey: 'green' },
    { label: 'Suspended',      value: stats.suspended, icon: Pause,        colorKey: 'warn' },
    { label: 'Expired',        value: stats.expired,   icon: Clock,        colorKey: 'danger' },
  ];

  const statColor = {
    org:    { bg: 'rgba(232,98,26,.1)',  color: ORG },
    green:  { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
    warn:   { bg: 'rgba(232,98,26,.15)', color: ORG },
    danger: { bg: 'rgba(232,64,64,.15)', color: '#e84040' },
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start < showPages - 1) start = Math.max(1, end - showPages + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const inputStyle = { width: '100%', padding: '8px 12px', fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = bc(11, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 });

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: '1px solid ' + border }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                </motion.div>
                <h1 style={{ ...bb(32, { color: ORG, lineHeight: 1, margin: 0 }) }}>Hosted Websites</h1>
              </div>
              <p style={{ ...ba(12, 400, { color: text2 }) }}>Manage hosted websites and domains</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadWebsites}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                <RefreshCw className={`w-3.5 h-3.5${loading ? ' animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Website</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((stat, index) => {
            const cs = statColor[stat.colorKey];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    style={{ background: cs.bg, border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: 10, color: cs.color }}
                  >
                    <stat.icon className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{stat.label}</p>
                    <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>
                      {loadingStats ? <span style={{ display: 'inline-block', width: 32, height: 16, background: bg3, borderRadius: 4 }} /> : (stat.value ?? '-')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 20 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
              <input
                type="text"
                placeholder="Search by name or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36, paddingRight: searchTerm ? 36 : 12 }}
              />
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: text2, padding: 2 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              {sortOrder === 'asc'
                ? <SortAsc className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
                : <SortDesc className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }} />
              }
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }}
                style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none', cursor: 'pointer' }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: 'rgba(232,64,64,.1)', border: '1px solid #e84040', borderRadius: 4, padding: '12px 16px', color: '#e84040', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 48, textAlign: 'center' }}>
            <div className="inline-flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${bg3}`, borderTopColor: ORG }}
              />
              <span style={{ ...ba(12, 600, { color: text2 }) }}>Loading websites...</span>
            </div>
          </div>
        ) : websites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 48, textAlign: 'center' }}
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: text3 }} />
            </motion.div>
            <p style={{ ...ba(15, 600, { color: textC, marginBottom: 8 }) }}>No Websites Found</p>
            <p style={{ ...ba(12, 400, { color: text2, marginBottom: 16 }) }}>
              {searchTerm || statusFilter ? 'Try adjusting your filters.' : 'Add your first website to get started.'}
            </p>
            {!searchTerm && !statusFilter && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { resetForm(); setShowModal(true); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                <Plus className="w-4 h-4" /><span>Add Website</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: 12 }}>
                  <thead style={{ background: bg3 }}>
                    <tr>
                      {['Website', 'Domain', 'Status', 'Created', 'Actions'].map((h, i) => (
                        <th
                          key={h}
                          className={i === 3 ? 'hidden md:table-cell' : ''}
                          style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 4 ? 'right' : 'left', padding: '12px 16px' })}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((website, index) => (
                      <motion.tr
                        key={website.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = bg3}
                        onMouseLeave={e => e.currentTarget.style.background = bg2}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div className="flex items-center gap-2">
                            <div style={{ width: 32, height: 32, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: ORG }}>
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <div style={{ ...ba(12, 600, { color: textC }) }}>{website.name}</div>
                              {website.description && (
                                <div style={{ ...ba(10, 400, { color: text2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }) }}>{website.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <a
                            href={/^https?:\/\//i.test(website.domain) ? website.domain : `https://${website.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: TEAL, textDecoration: 'none', fontSize: 12 }}
                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.target.style.textDecoration = 'none'}
                          >
                            {website.domain}
                          </a>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{getStatusBadge(website.status)}</td>
                        <td className="hidden md:table-cell" style={{ padding: '12px 16px', ...ba(12, 400, { color: text2 }) }}>{formatDate(website.createdAt)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="flex items-center justify-end gap-1">
                            {website.status === 'ACTIVE' && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusAction(website.id, 'suspend')}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px 8px', color: ORG, cursor: 'pointer' }} title="Suspend">
                                <Pause className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                            {website.status === 'SUSPENDED' && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusAction(website.id, 'activate')}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px 8px', color: '#4ade80', cursor: 'pointer' }} title="Activate">
                                <Play className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                              onClick={() => openEditModal(website)}
                              style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px 8px', color: text2, cursor: 'pointer' }} title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setShowDeleteConfirm(website)}
                              style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '6px 8px', color: '#e84040', cursor: 'pointer' }} title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2 py-3" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}>
                <div style={{ ...ba(12, 400, { color: text2 }) }}>
                  Page <span style={{ fontWeight: 700, color: textC }}>{currentPage}</span> of <span style={{ fontWeight: 700, color: textC }}>{totalPages}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'First', onClick: () => setCurrentPage(1), disabled: currentPage === 1 },
                    { label: <ChevronLeft className="w-3.5 h-3.5" />, onClick: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                  ].map((btn, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={btn.onClick} disabled={btn.disabled}
                      style={{ padding: '5px 10px', fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
                      {btn.label}
                    </motion.button>
                  ))}
                  {getPageNumbers().map(page => (
                    <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      style={{ padding: '5px 10px', fontSize: 12, borderRadius: 4, cursor: 'pointer', ...(currentPage === page ? { background: ORG, color: '#fff', border: 'none', fontWeight: 700 } : { background: bg3, border: '1px solid ' + border, color: text2 }) }}>
                      {page}
                    </motion.button>
                  ))}
                  {[
                    { label: <ChevronRight className="w-3.5 h-3.5" />, onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                    { label: 'Last', onClick: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
                  ].map((btn, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={btn.onClick} disabled={btn.disabled}
                      style={{ padding: '5px 10px', fontSize: 12, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
                      {btn.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Toast */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50"
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, border: '1px solid',
                ...(operationStatus.type === 'success'
                  ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
                  : { background: 'rgba(232,64,64,.15)',  borderColor: '#e84040', color: '#e84040' }),
              }}>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                  {operationStatus.type === 'success'
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 flex-shrink-0" />
                  }
                </motion.div>
                <span>{operationStatus.message}</span>
                <motion.button whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setOperationStatus(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, marginLeft: 8 }}>
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Operation Loading Overlay */}
        <AnimatePresence>
          {operationLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-40"
              style={{ background: 'rgba(0,0,0,.75)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 32 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 48, height: 48, borderRadius: '50%', border: `4px solid ${bg3}`, borderTopColor: ORG }}
                  />
                  <span style={{ ...ba(13, 600, { color: textC }) }}>Processing...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.75)' }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 24, width: '100%', maxWidth: 440 }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ delay: 0.2 }}
                    style={{ width: 48, height: 48, background: 'rgba(232,64,64,.15)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#e84040' }}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 style={{ ...ba(15, 700, { color: textC, marginBottom: 4 }) }}>Delete Website?</h3>
                    <p style={{ ...ba(12, 400, { color: text2 }) }}>This action cannot be undone</p>
                  </div>
                </div>
                <div style={{ background: bg3, borderRadius: 4, padding: 16, marginBottom: 24 }}>
                  <p style={{ ...ba(12, 400, { color: text2 }) }}>
                    Are you sure you want to delete{' '}
                    <span style={{ fontWeight: 700, color: textC }}>"{showDeleteConfirm.name}"</span>?
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(null)}
                    style={{ padding: '9px 20px', fontSize: 12, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(showDeleteConfirm)}
                    style={{ padding: '9px 20px', fontSize: 12, fontWeight: 600, background: '#e84040', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    Delete Website
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ background: 'rgba(0,0,0,.75)' }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 460 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 40, height: 40, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG }}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{selectedWebsite ? 'Edit Website' : 'Add Website'}</h3>
                      <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }}>{selectedWebsite ? 'Update website details' : 'Add a new hosted website'}</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 8, color: text2, cursor: 'pointer' }}>
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                      placeholder="My Website"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Domain *</label>
                    <div className="relative">
                      <input
                        type="text" required
                        value={formData.domain}
                        onChange={(e) => {
                          setFormData({ ...formData, domain: e.target.value });
                          if (!selectedWebsite) checkDomain(e.target.value);
                        }}
                        style={{ ...inputStyle, paddingRight: 36 }}
                        placeholder="example.com"
                      />
                      {!selectedWebsite && domainCheck.checking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: text2 }} />
                        </div>
                      )}
                      {!selectedWebsite && domainCheck.available !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {domainCheck.available
                            ? <CheckCircle className="w-4 h-4" style={{ color: '#4ade80' }} />
                            : <XCircle className="w-4 h-4" style={{ color: '#e84040' }} />
                          }
                        </div>
                      )}
                    </div>
                    {!selectedWebsite && domainCheck.available === false && (
                      <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>Domain already registered</p>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      style={{ ...inputStyle, resize: 'none' }}
                      placeholder="Website description..."
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ ...inputStyle }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                      Cancel
                    </motion.button>
                    <motion.button type="submit" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                      disabled={!selectedWebsite && domainCheck.available === false}
                      style={{ padding: '9px 20px', fontSize: 12, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: (!selectedWebsite && domainCheck.available === false) ? 0.5 : 1 }}>
                      {selectedWebsite ? 'Update Website' : 'Create Website'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HostedWebsiteManagement;
