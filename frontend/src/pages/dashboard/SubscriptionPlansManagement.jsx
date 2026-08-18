import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, X, CheckCircle, AlertCircle, Package, Edit, Archive, RotateCcw,
  Trash2, Layers, Users, Infinity as InfinityIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import planService, { BILLING_CYCLES } from '../../services/planService';
import companyService from '../../services/companyService';
import { MODULES } from '../../services/companyRegistrationService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { formatMoney } from '../../utils/mockStore';

const EMPTY_FORM = { name: '', description: '', price: '', currency: 'RWF', billingCycle: 'MONTHLY', maxModules: '', unlimited: false };

const quotaLabel = (maxModules) => (maxModules === null ? 'Unlimited modules' : `Up to ${maxModules} module${maxModules === 1 ? '' : 's'}`);

const SubscriptionPlansManagement = () => {
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [plans, setPlans] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationStatus, setOperationStatus] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planData, companyData] = await Promise.all([
        planService.getAllPlans(),
        companyService.getAllCompanies(),
      ]);
      setPlans(planData);
      setCompanies(companyData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const subscriberCount = useMemo(() => {
    const map = {};
    companies.forEach((c) => { if (c.planId) map[c.planId] = (map[c.planId] || 0) + 1; });
    return map;
  }, [companies]);

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setShowFormModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name, description: plan.description, price: String(plan.price),
      currency: plan.currency, billingCycle: plan.billingCycle,
      maxModules: plan.maxModules === null ? '' : String(plan.maxModules),
      unlimited: plan.maxModules === null,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showOperationMessage('error', 'Plan name is required'); return; }
    if (!form.price || Number(form.price) < 0) { showOperationMessage('error', 'Enter a valid price'); return; }
    if (!form.unlimited && (!form.maxModules || Number(form.maxModules) < 1)) {
      showOperationMessage('error', 'Set a module limit of at least 1, or mark the plan unlimited');
      return;
    }
    const payload = { ...form, maxModules: form.unlimited ? null : Number(form.maxModules) };
    try {
      setSaving(true);
      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, payload);
        showOperationMessage('success', `${form.name} updated`);
      } else {
        await planService.createPlan(payload);
        showOperationMessage('success', `${form.name} created`);
      }
      setShowFormModal(false);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      setBusyId(plan.id);
      await planService.setPlanActive(plan.id, !plan.isActive);
      showOperationMessage('success', `${plan.name} ${plan.isActive ? 'archived' : 'restored'}`);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (plan) => {
    if (subscriberCount[plan.id]) {
      showOperationMessage('error', `Can't delete — ${subscriberCount[plan.id]} tenant(s) are on this plan`);
      return;
    }
    if (!window.confirm(`Delete the "${plan.name}" plan? This cannot be undone.`)) return;
    try {
      setBusyId(plan.id);
      await planService.deletePlan(plan.id);
      showOperationMessage('success', `${plan.name} deleted`);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
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
          <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Subscription Plans</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>The plan catalog tenants subscribe to — pricing, billing cycle, and how many modules each tier allows</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> New Plan
        </button>
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

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${bg3}`, borderTopColor: ORG, margin: '0 auto 12px' }} />
          <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading plans...</p>
        </div>
      ) : error ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p style={{ fontSize: 13 }}>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="relative overflow-hidden"
              style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, opacity: plan.isActive ? 1 : 0.55 }}>
              {!plan.isActive && (
                <span style={{ position: 'absolute', top: 12, right: 12, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(128,128,128,.2)', color: text2 }}>
                  ARCHIVED
                </span>
              )}
              <div className="w-11 h-11 rounded flex items-center justify-center mb-4"
                style={{ background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.25)' }}>
                <Package size={18} color={ORG} />
              </div>
              <h3 style={{ ...bb(28, { color: textC, lineHeight: 1, marginBottom: 4 }) }}>{plan.name}</h3>
              <p style={{ ...ba(12, 400, { color: text2, lineHeight: 1.5, minHeight: 34 }) }}>{plan.description}</p>
              <div className="flex items-baseline gap-1 my-4">
                <span style={{ ...bb(34, { color: ORG, lineHeight: 1 }) }}>{formatMoney(plan.price, plan.currency)}</span>
                <span style={{ ...ba(12, 400, { color: text2 }) }}>/ {plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-3" style={{ ...ba(12, 600, { color: TEAL }) }}>
                <Users className="w-3.5 h-3.5" /> {subscriberCount[plan.id] || 0} tenant{subscriberCount[plan.id] === 1 ? '' : 's'} subscribed
              </div>
              <div className="flex items-center gap-2 mb-6 p-3" style={{ background: bg3, borderRadius: 4 }}>
                {plan.maxModules === null
                  ? <InfinityIcon className="w-4 h-4" style={{ color: ORG, flexShrink: 0 }} />
                  : <Layers className="w-4 h-4" style={{ color: ORG, flexShrink: 0 }} />}
                <span style={{ ...ba(13, 700, { color: textC }) }}>{quotaLabel(plan.maxModules)}</span>
                <span style={{ ...ba(11, 400, { color: text2 }) }}>of {MODULES.length} available</span>
              </div>
              <div className="flex items-center gap-2 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                <button onClick={() => openEditModal(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5"
                  style={{ padding: '8px', fontSize: 12, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button disabled={busyId === plan.id} onClick={() => handleToggleActive(plan)}
                  style={{ padding: '8px 10px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: text2, cursor: 'pointer' }}
                  title={plan.isActive ? 'Archive' : 'Restore'}>
                  {plan.isActive ? <Archive className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                </button>
                <button disabled={busyId === plan.id} onClick={() => handleDelete(plan)}
                  style={{ padding: '8px 10px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: '#e84040', cursor: 'pointer' }}
                  title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowFormModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
                <button onClick={() => setShowFormModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <label style={labelStyle}>Plan Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Pro" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description shown to admins" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Price *</label>
                    <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="80000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Billing Cycle</label>
                    <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} style={inputStyle}>
                      {BILLING_CYCLES.map((c) => <option key={c} value={c}>{c === 'MONTHLY' ? 'Monthly' : 'Yearly'}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Module Limit *</label>
                  <div className="flex items-center gap-3">
                    <input type="number" min="1" max={MODULES.length} value={form.maxModules} disabled={form.unlimited}
                      onChange={(e) => setForm({ ...form, maxModules: e.target.value })}
                      placeholder="e.g. 7" style={{ ...inputStyle, flex: 1, opacity: form.unlimited ? 0.5 : 1 }} />
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap" style={{ ...ba(13, 400, { color: textC }) }}>
                      <input type="checkbox" checked={form.unlimited}
                        onChange={(e) => setForm({ ...form, unlimited: e.target.checked, maxModules: e.target.checked ? '' : form.maxModules })} />
                      Unlimited
                    </label>
                  </div>
                  <p style={{ ...ba(11, 400, { color: text2, marginTop: 6 }) }}>
                    Caps how many of the {MODULES.length} available modules a tenant on this plan can have enabled at once — admins choose which specific ones from Modules & Access.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowFormModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
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

export default SubscriptionPlansManagement;
