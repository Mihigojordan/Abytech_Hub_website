import React, { useState, useEffect } from 'react';
import {
  Plus, X, CheckCircle, AlertCircle, RefreshCw, TrendingUp, Clock,
  AlertTriangle, DollarSign, RotateCcw, Ban, Receipt, CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import subscriptionService, { SUBSCRIPTION_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../../services/subscriptionService';
import companyService from '../../services/companyService';
import planService from '../../services/planService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { formatMoney } from '../../utils/mockStore';

const subStatusStyle = (status) => {
  if (status === SUBSCRIPTION_STATUS.ACTIVE) return { bg: 'rgba(74,222,128,.15)', color: '#4ade80', label: 'Active' };
  if (status === SUBSCRIPTION_STATUS.TRIAL) return { bg: 'rgba(26,92,120,.15)', color: TEAL, label: 'Trial' };
  if (status === SUBSCRIPTION_STATUS.EXPIRED) return { bg: 'rgba(232,98,26,.15)', color: ORG, label: 'Expired' };
  return { bg: 'rgba(232,64,64,.15)', color: '#e84040', label: 'Cancelled' };
};

const payStatusStyle = (status) => {
  if (status === PAYMENT_STATUS.PAID) return { bg: 'rgba(74,222,128,.15)', color: '#4ade80', label: 'Paid' };
  if (status === PAYMENT_STATUS.OVERDUE) return { bg: 'rgba(232,64,64,.15)', color: '#e84040', label: 'Overdue' };
  return { bg: 'rgba(232,98,26,.15)', color: ORG, label: 'Pending' };
};

const EMPTY_SUB_FORM = { companyId: '', planId: '', status: SUBSCRIPTION_STATUS.ACTIVE, startDate: '', endDate: '', autoRenew: true };
const EMPTY_INVOICE_FORM = { subscriptionId: '', amount: '', method: 'MOMO', dueDate: '' };

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const SubscriptionsPaymentsManagement = () => {
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ activeSubscriptions: 0, overdueCount: 0, expiringSoonCount: 0, totalCollected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState(EMPTY_SUB_FORM);
  const [savingSub, setSavingSub] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE_FORM);
  const [savingInvoice, setSavingInvoice] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, payData, companyData, planData, statsData] = await Promise.all([
        subscriptionService.getAllSubscriptions(),
        subscriptionService.getAllPayments(),
        companyService.getAllCompanies(),
        planService.getAllPlans(),
        subscriptionService.getBillingStats(),
      ]);
      setSubscriptions(subData);
      setPayments(payData);
      setCompanies(companyData);
      setPlans(planData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const companyName = (id) => companies.find((c) => c.id === id)?.businessName || 'Unknown Tenant';
  const planName = (id) => plans.find((p) => p.id === id)?.name || 'No Plan';

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const daysUntil = (iso) => Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));

  // ── Subscriptions ──────────────────────────────────────
  const openSubModal = () => {
    const today = new Date();
    const end = new Date(); end.setDate(end.getDate() + 30);
    setSubForm({ ...EMPTY_SUB_FORM, startDate: toDateInput(today.toISOString()), endDate: toDateInput(end.toISOString()) });
    setShowSubModal(true);
  };

  const handleCreateSubscription = async () => {
    if (!subForm.companyId || !subForm.planId || !subForm.endDate) {
      showOperationMessage('error', 'Company, plan and end date are required');
      return;
    }
    try {
      setSavingSub(true);
      await subscriptionService.createSubscription({
        ...subForm,
        startDate: new Date(subForm.startDate).toISOString(),
        endDate: new Date(subForm.endDate).toISOString(),
      });
      showOperationMessage('success', 'Subscription created');
      setShowSubModal(false);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setSavingSub(false);
    }
  };

  const handleRenew = async (sub) => {
    try {
      setBusyId(sub.id);
      await subscriptionService.renewSubscription(sub.id, 30);
      showOperationMessage('success', `${companyName(sub.companyId)}'s subscription renewed`);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (sub) => {
    if (!window.confirm(`Cancel the subscription for ${companyName(sub.companyId)}?`)) return;
    try {
      setBusyId(sub.id);
      await subscriptionService.cancelSubscription(sub.id);
      showOperationMessage('success', 'Subscription cancelled');
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  // ── Payments ───────────────────────────────────────────
  const openInvoiceModal = () => {
    const due = new Date(); due.setDate(due.getDate() + 7);
    setInvoiceForm({ ...EMPTY_INVOICE_FORM, dueDate: toDateInput(due.toISOString()) });
    setShowInvoiceModal(true);
  };

  const handleSubSelectForInvoice = (subscriptionId) => {
    const sub = subscriptions.find((s) => s.id === subscriptionId);
    const plan = sub ? plans.find((p) => p.id === sub.planId) : null;
    setInvoiceForm((prev) => ({ ...prev, subscriptionId, amount: plan ? String(plan.price) : prev.amount }));
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.subscriptionId || !invoiceForm.amount || !invoiceForm.dueDate) {
      showOperationMessage('error', 'Subscription, amount and due date are required');
      return;
    }
    const sub = subscriptions.find((s) => s.id === invoiceForm.subscriptionId);
    try {
      setSavingInvoice(true);
      await subscriptionService.createInvoice({
        ...invoiceForm,
        companyId: sub?.companyId,
        dueDate: new Date(invoiceForm.dueDate).toISOString(),
      });
      showOperationMessage('success', 'Invoice created');
      setShowInvoiceModal(false);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleMarkPaid = async (payment) => {
    try {
      setBusyId(payment.id);
      await subscriptionService.recordPayment(payment.id);
      showOperationMessage('success', `${payment.invoiceNumber} marked as paid`);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const statList = [
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, colorKey: 'success', Icon: TrendingUp },
    { label: 'Overdue Payments',     value: stats.overdueCount,        colorKey: 'danger',  Icon: AlertTriangle },
    { label: 'Expiring ≤ 7 Days',    value: stats.expiringSoonCount,   colorKey: 'warn',     Icon: Clock },
    { label: 'Total Collected',      value: formatMoney(stats.totalCollected), colorKey: 'info', Icon: DollarSign, isText: true },
  ];
  const statColors = {
    info:    { bg: 'rgba(26,92,120,.15)',  color: TEAL },
    warn:    { bg: 'rgba(232,98,26,.15)',  color: ORG },
    success: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
    danger:  { bg: 'rgba(232,64,64,.15)',  color: '#e84040' },
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 });

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Subscriptions & Payments</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Track what each tenant pays for Abydash, and their billing status</p>
        </div>
        <button onClick={loadData}
          style={{ padding: '8px 12px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statList.map(({ label, value, colorKey, Icon, isText }) => {
          const cs = statColors[colorKey];
          return (
            <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
              <div style={{ width: 40, height: 40, background: cs.bg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: cs.color }}>
                <Icon className="w-5 h-5" />
              </div>
              {isText ? (
                <p style={bb(26, { color: ORG, lineHeight: 1.1, margin: 0 })}>{value}</p>
              ) : (
                <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>
              )}
              <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center gap-2 p-4"
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

      {error && (
        <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p style={{ fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Subscriptions */}
      <div className="flex items-center justify-between mb-3 mt-2">
        <h2 style={{ ...bb(22, { color: textC, lineHeight: 1 }) }}>SUBSCRIPTIONS</h2>
        <button onClick={openSubModal} className="flex items-center gap-2"
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> New Subscription
        </button>
      </div>
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden', marginBottom: 32 }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}><p style={{ ...ba(13, 400, { color: text2 }) }}>Loading...</p></div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}><p style={{ ...ba(13, 400, { color: text2 }) }}>No subscriptions yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Tenant', 'Plan', 'Status', 'Start', 'End', 'Auto-Renew', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 6 ? 'right' : 'left', padding: '12px 16px' })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => {
                  const st = subStatusStyle(s.status);
                  const soon = s.status === SUBSCRIPTION_STATUS.ACTIVE && daysUntil(s.endDate) <= 7 && daysUntil(s.endDate) >= 0;
                  return (
                    <tr key={s.id} style={{ background: bg2, borderBottom: '1px solid ' + border }}
                      onMouseEnter={(e) => e.currentTarget.style.background = bg3}
                      onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
                      <td style={{ padding: '12px 16px', ...ba(13, 600, { color: textC }) }}>{companyName(s.companyId)}</td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{planName(s.planId)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                        {soon && <span style={{ marginLeft: 6, ...ba(10, 700, { color: ORG }) }}>· expiring soon</span>}
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{new Date(s.startDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{new Date(s.endDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: s.autoRenew ? '#4ade80' : text2 }) }}>{s.autoRenew ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center justify-end gap-1">
                          {s.status !== SUBSCRIPTION_STATUS.CANCELLED && (
                            <>
                              <button disabled={busyId === s.id} onClick={() => handleRenew(s)}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#4ade80', cursor: 'pointer' }} title="Renew 30 days">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button disabled={busyId === s.id} onClick={() => handleCancel(s)}
                                style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: '#e84040', cursor: 'pointer' }} title="Cancel">
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      {/* Payments / Invoices */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ ...bb(22, { color: textC, lineHeight: 1 }) }}>INVOICES & PAYMENTS</h2>
        <button onClick={openInvoiceModal} className="flex items-center gap-2"
          style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, background: TEAL, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}><p style={{ ...ba(13, 400, { color: text2 }) }}>Loading...</p></div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}><p style={{ ...ba(13, 400, { color: text2 }) }}>No invoices yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Invoice', 'Tenant', 'Amount', 'Method', 'Status', 'Due Date', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 6 ? 'right' : 'left', padding: '12px 16px' })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const st = payStatusStyle(p.status);
                  return (
                    <tr key={p.id} style={{ background: bg2, borderBottom: '1px solid ' + border }}
                      onMouseEnter={(e) => e.currentTarget.style.background = bg3}
                      onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
                      <td style={{ padding: '12px 16px' }} className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" style={{ color: text2 }} />
                        <span style={{ ...ba(13, 600, { color: textC }) }}>{p.invoiceNumber}</span>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{companyName(p.companyId)}</td>
                      <td style={{ padding: '12px 16px', ...ba(13, 600, { color: textC }) }}>{formatMoney(p.amount, p.currency)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="flex items-center gap-1" style={{ ...ba(12, 400, { color: text2 }) }}>
                          <CreditCard className="w-3.5 h-3.5" /> {p.method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', ...ba(13, 400, { color: text2 }) }}>{new Date(p.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center justify-end gap-1">
                          {p.status !== PAYMENT_STATUS.PAID && (
                            <button disabled={busyId === p.id} onClick={() => handleMarkPaid(p)}
                              className="flex items-center gap-1"
                              style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.4)', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}>
                              <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                            </button>
                          )}
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

      {/* New Subscription Modal */}
      <AnimatePresence>
        {showSubModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowSubModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 480 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>New Subscription</h2>
                <button onClick={() => setShowSubModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label style={labelStyle}>Tenant *</label>
                  <select value={subForm.companyId} onChange={(e) => setSubForm({ ...subForm, companyId: e.target.value })} style={inputStyle}>
                    <option value="">Select tenant…</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Plan *</label>
                  <select value={subForm.planId} onChange={(e) => setSubForm({ ...subForm, planId: e.target.value })} style={inputStyle}>
                    <option value="">Select plan…</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.maxModules === null ? 'unlimited modules' : `up to ${p.maxModules} modules`} — {formatMoney(p.price, p.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" value={subForm.startDate} onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date *</label>
                    <input type="date" value={subForm.endDate} onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={subForm.status} onChange={(e) => setSubForm({ ...subForm, status: e.target.value })} style={inputStyle}>
                      <option value={SUBSCRIPTION_STATUS.TRIAL}>Trial</option>
                      <option value={SUBSCRIPTION_STATUS.ACTIVE}>Active</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer" style={{ ...ba(13, 400, { color: textC }) }}>
                      <input type="checkbox" checked={subForm.autoRenew} onChange={(e) => setSubForm({ ...subForm, autoRenew: e.target.checked })} />
                      Auto-renew
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowSubModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleCreateSubscription} disabled={savingSub}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: savingSub ? 0.6 : 1 }}>
                    Create Subscription
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowInvoiceModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 460 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>New Invoice</h2>
                <button onClick={() => setShowInvoiceModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label style={labelStyle}>Subscription *</label>
                  <select value={invoiceForm.subscriptionId} onChange={(e) => handleSubSelectForInvoice(e.target.value)} style={inputStyle}>
                    <option value="">Select subscription…</option>
                    {subscriptions.map((s) => (
                      <option key={s.id} value={s.id}>{companyName(s.companyId)} — {planName(s.planId)}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Amount (RWF) *</label>
                    <input type="number" min="0" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Method</label>
                    <select value={invoiceForm.method} onChange={(e) => setInvoiceForm({ ...invoiceForm, method: e.target.value })} style={inputStyle}>
                      {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} style={inputStyle} />
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowInvoiceModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleCreateInvoice} disabled={savingInvoice}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: TEAL, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: savingInvoice ? 0.6 : 1 }}>
                    Create Invoice
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

export default SubscriptionsPaymentsManagement;
