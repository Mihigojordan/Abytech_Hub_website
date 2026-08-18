import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, RefreshCw, X, CheckCircle, XCircle, AlertCircle, Eye,
  Building2, User, Mail, Phone, MapPin, Globe, Trash2, Clock,
  RotateCcw, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import companyRegistrationService, { BUSINESS_TYPES, MODULES, STATUS } from '../../services/companyRegistrationService';
import companyService from '../../services/companyService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const getStatusStyle = (status) => {
  if (status === STATUS.APPROVED) return { bg: 'rgba(74,222,128,.15)', color: '#4ade80', label: 'Approved' };
  if (status === STATUS.REJECTED) return { bg: 'rgba(232,64,64,.15)', color: '#e84040', label: 'Rejected' };
  return { bg: 'rgba(232,98,26,.15)', color: ORG, label: 'Pending' };
};

const moduleLabel = (key) => MODULES.find((m) => m.key === key)?.label || key;

const CompanyRegistrationManagement = () => {
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();
  const { user } = useAdminAuth();
  const reviewerName = user?.adminName || 'Admin';

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { loadRegistrations(); }, [searchTerm, statusFilter, typeFilter]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await companyRegistrationService.getAllRegistrations({
        search: searchTerm, status: statusFilter, businessType: typeFilter,
      });
      setRegistrations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: registrations.length,
    pending: registrations.filter((r) => r.status === STATUS.PENDING).length,
    approved: registrations.filter((r) => r.status === STATUS.APPROVED).length,
    rejected: registrations.filter((r) => r.status === STATUS.REJECTED).length,
  }), [registrations]);

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const handleApprove = async () => {
    if (!selected) return;
    try {
      setBusyId(selected.id);
      await companyRegistrationService.approveRegistration(selected.id, { reviewedBy: reviewerName, reviewNotes: approveNotes });
      // Provision the tenant with whatever modules they asked for at sign-up —
      // admins can fine-tune access afterwards from Modules & Access.
      await companyService.createFromRegistration(selected);
      showOperationMessage('success', `${selected.businessName} approved and granted access to ${selected.interestedModules.length || 0} module${selected.interestedModules.length !== 1 ? 's' : ''}`);
      setShowApproveModal(false);
      setShowViewModal(false);
      setApproveNotes('');
      loadRegistrations();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      showOperationMessage('error', 'A rejection reason is required');
      return;
    }
    try {
      setBusyId(selected.id);
      await companyRegistrationService.rejectRegistration(selected.id, { reviewedBy: reviewerName, rejectionReason: rejectReason });
      showOperationMessage('success', `${selected.businessName} rejected`);
      setShowRejectModal(false);
      setShowViewModal(false);
      setRejectReason('');
      loadRegistrations();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetToPending = async (registration) => {
    try {
      setBusyId(registration.id);
      await companyRegistrationService.resetToPending(registration.id);
      showOperationMessage('success', 'Moved back to pending');
      loadRegistrations();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (registration) => {
    if (!window.confirm(`Delete the registration for "${registration.businessName}"? This cannot be undone.`)) return;
    try {
      setBusyId(registration.id);
      await companyRegistrationService.deleteRegistration(registration.id);
      showOperationMessage('success', 'Registration deleted');
      loadRegistrations();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' });
  };
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  const statList = [
    { label: 'Total',    value: stats.total,    colorKey: 'info' },
    { label: 'Pending',  value: stats.pending,  colorKey: 'warn' },
    { label: 'Approved', value: stats.approved, colorKey: 'success' },
    { label: 'Rejected', value: stats.rejected, colorKey: 'danger' },
  ];
  const statColors = {
    info:    { bg: 'rgba(26,92,120,.15)',  color: TEAL },
    warn:    { bg: 'rgba(232,98,26,.15)',  color: ORG },
    success: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
    danger:  { bg: 'rgba(232,64,64,.15)',  color: '#e84040' },
  };

  const labelStyle = bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 4 });

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Company Registrations</h1>
        <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Review and approve businesses requesting access to Abydash</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statList.map(({ label, value, colorKey }) => {
          const cs = statColors[colorKey];
          return (
            <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
              <div style={{ width: 40, height: 40, background: cs.bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: cs.color }}>
                <Building2 className="w-5 h-5" />
              </div>
              <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>
              <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Operation Status */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="mb-4 flex items-center gap-2 p-4"
            style={{
              borderRadius: 4, fontSize: 13, fontWeight: 600, border: '1px solid',
              ...(operationStatus.type === 'success'
                ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
                : { background: 'rgba(232,64,64,.15)', borderColor: '#e84040', color: '#e84040' }),
            }}
          >
            {operationStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {operationStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: text2 }} />
            <input
              type="text" placeholder="Search by business, contact, email, city…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none' }}>
            <option value="">All Status</option>
            <option value={STATUS.PENDING}>Pending</option>
            <option value={STATUS.APPROVED}>Approved</option>
            <option value={STATUS.REJECTED}>Rejected</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none' }}>
            <option value="">All Types</option>
            {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={loadRegistrations}
            style={{ padding: '8px 12px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${bg3}`, borderTopColor: ORG, margin: '0 auto 12px' }} />
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading registrations...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p style={{ fontSize: 13 }}>{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Business', 'Contact', 'Type', 'Location', 'Status', 'Submitted', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 6 ? 'right' : 'left', padding: '12px 16px' })}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const s = getStatusStyle(r.status);
                  return (
                    <tr key={r.id} style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = bg3}
                      onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 36, height: 36, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div style={{ ...ba(13, 600, { color: textC }) }}>{r.businessName}</div>
                            <div style={{ ...ba(11, 400, { color: text2 }) }}>{r.interestedModules.length} module{r.interestedModules.length !== 1 ? 's' : ''} of interest</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ ...ba(13, 400, { color: textC }) }}>{r.contactName}</div>
                        <div style={{ ...ba(11, 400, { color: text2 }) }}>{r.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{r.businessType === 'Other' ? r.businessTypeOther : r.businessType}</td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{r.city}, {r.country}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{formatDate(r.submittedAt)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(r); setShowViewModal(true); }}
                            style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: TEAL, cursor: 'pointer' }} title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {r.status === STATUS.PENDING && (
                            <>
                              <button disabled={busyId === r.id}
                                onClick={() => { setSelected(r); setApproveNotes(''); setShowApproveModal(true); }}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#4ade80', cursor: 'pointer' }} title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button disabled={busyId === r.id}
                                onClick={() => { setSelected(r); setRejectReason(''); setShowRejectModal(true); }}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#e84040', cursor: 'pointer' }} title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {r.status !== STATUS.PENDING && (
                            <button disabled={busyId === r.id} onClick={() => handleResetToPending(r)}
                              style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: text2, cursor: 'pointer' }} title="Move back to pending">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button disabled={busyId === r.id} onClick={() => handleDelete(r)}
                            style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#e84040', cursor: 'pointer' }} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowViewModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Registration Details</h2>
                <button onClick={() => setShowViewModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div style={{ width: 56, height: 56, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 style={{ ...ba(18, 700, { color: textC, margin: 0 }) }}>{selected.businessName}</h3>
                      {(() => { const s = getStatusStyle(selected.status); return (
                        <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      ); })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <div>
                    <label style={labelStyle}>Business Type</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.businessType === 'Other' ? selected.businessTypeOther : selected.businessType}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Employees</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.numberOfEmployees || '-'}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Branches</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.numberOfBranches || '-'}</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Website</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.website || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Address</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: textC }) }}>
                      <MapPin className="w-4 h-4" style={{ color: text2 }} />
                      {selected.address}, {selected.city}, {selected.country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <div>
                    <label style={labelStyle}>Contact Person</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: textC }) }}>
                      <User className="w-4 h-4" style={{ color: text2 }} />{selected.contactName} — {selected.contactRole}
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: textC }) }}>
                      <Mail className="w-4 h-4" style={{ color: text2 }} />{selected.email}
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: textC }) }}>
                      <Phone className="w-4 h-4" style={{ color: text2 }} />{selected.phone}
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Heard About Us Via</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.hearAboutUs || '-'}</p>
                  </div>
                </div>

                {selected.interestedModules.length > 0 && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={labelStyle}>Modules of Interest</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selected.interestedModules.map((m) => (
                        <span key={m} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(26,92,120,.15)', color: TEAL }}>
                          {moduleLabel(m)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.currentSystem && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={labelStyle}>Currently Using</label>
                    <p style={{ ...ba(13, 400, { color: textC }) }}>{selected.currentSystem}</p>
                  </div>
                )}

                <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <label style={labelStyle}>Why They Want Abydash</label>
                  <p style={{ ...ba(13, 400, { color: textC, lineHeight: 1.6 }) }}>{selected.reasonForInterest}</p>
                </div>

                {selected.additionalNotes && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={labelStyle}>Additional Notes</label>
                    <p style={{ ...ba(13, 400, { color: textC, lineHeight: 1.6 }) }}>{selected.additionalNotes}</p>
                  </div>
                )}

                {selected.status !== STATUS.PENDING && (
                  <div className="pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <label style={labelStyle}>Review</label>
                    <p className="flex items-center gap-2" style={{ ...ba(13, 400, { color: text2 }) }}>
                      <Clock className="w-4 h-4" /> {formatDateTime(selected.reviewedAt)} by {selected.reviewedBy}
                    </p>
                    {selected.status === STATUS.REJECTED && selected.rejectionReason && (
                      <p className="mt-2 p-3" style={{ background: 'rgba(232,64,64,.08)', border: '1px solid rgba(232,64,64,.25)', borderRadius: 4, ...ba(13, 400, { color: textC }) }}>
                        {selected.rejectionReason}
                      </p>
                    )}
                    {selected.status === STATUS.APPROVED && selected.reviewNotes && (
                      <p className="mt-2 p-3" style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 4, ...ba(13, 400, { color: textC }) }}>
                        {selected.reviewNotes}
                      </p>
                    )}
                  </div>
                )}

                {selected.status === STATUS.PENDING && (
                  <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                    <button onClick={() => { setRejectReason(''); setShowRejectModal(true); }}
                      className="flex items-center gap-2"
                      style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid rgba(232,64,64,.4)', borderRadius: 4, color: '#e84040', cursor: 'pointer' }}>
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => { setApproveNotes(''); setShowApproveModal(true); }}
                      className="flex items-center gap-2"
                      style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: '#4ade80', border: 'none', borderRadius: 4, color: '#052e16', cursor: 'pointer' }}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowApproveModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 440 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Approve Registration</h2>
                <button onClick={() => setShowApproveModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p style={{ ...ba(13, 400, { color: text2, lineHeight: 1.6 }) }}>
                  Approve <strong style={{ color: textC }}>{selected.businessName}</strong> to access Abydash.
                  A tenant account will be created automatically, granted the modules they requested at sign-up.
                  You can fine-tune access anytime from Modules & Access.
                </p>
                {selected.interestedModules.length > 0 && (
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Will be granted</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.interestedModules.map((m) => (
                        <span key={m} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(74,222,128,.12)', color: '#4ade80' }}>
                          {moduleLabel(m)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Internal Notes (optional)</label>
                  <textarea value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} rows={3}
                    placeholder="e.g. Verified registration certificate…" style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowApproveModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleApprove} disabled={busyId === selected.id}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: '#4ade80', color: '#052e16', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: busyId === selected.id ? 0.6 : 1 }}>
                    Confirm Approval
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowRejectModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 440 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Reject Registration</h2>
                <button onClick={() => setShowRejectModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p style={{ ...ba(13, 400, { color: text2, lineHeight: 1.6 }) }}>
                  Reject <strong style={{ color: textC }}>{selected.businessName}</strong>. This reason will help track why the application was declined.
                </p>
                <div>
                  <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Reason *</label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} required
                    placeholder="e.g. Could not verify business address…" style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowRejectModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleReject} disabled={!rejectReason.trim() || busyId === selected.id}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: '#e84040', color: '#fff', border: 'none', borderRadius: 4, cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer', opacity: !rejectReason.trim() ? 0.5 : 1 }}>
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyRegistrationManagement;
