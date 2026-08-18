import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, RefreshCw, X, CheckCircle, AlertCircle, Grid3x3,
  Building2, Mail, Ban, RotateCcw, Layers, Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import companyService, { COMPANY_STATUS } from '../../services/companyService';
import planService from '../../services/planService';
import { MODULES } from '../../services/companyRegistrationService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const moduleLabel = (key) => MODULES.find((m) => m.key === key)?.label || key;

const ModulesAccessManagement = () => {
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [draftModules, setDraftModules] = useState([]);
  const [draftPlanId, setDraftPlanId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, planData] = await Promise.all([
        companyService.getAllCompanies({ search: searchTerm, status: statusFilter }),
        planService.getAllPlans(),
      ]);
      setCompanies(companyData);
      setPlans(planData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: companies.length,
    active: companies.filter((c) => c.status === COMPANY_STATUS.ACTIVE).length,
    suspended: companies.filter((c) => c.status === COMPANY_STATUS.SUSPENDED).length,
    unassigned: companies.filter((c) => !c.planId).length,
  }), [companies]);

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3000);
  };

  const planName = (planId) => plans.find((p) => p.id === planId)?.name || 'No Plan';
  const draftPlan = plans.find((p) => p.id === draftPlanId) || null;
  const draftCap = draftPlan ? draftPlan.maxModules : null; // null = unlimited
  const atCap = draftCap !== null && draftModules.length >= draftCap;

  const openManageModal = (company) => {
    setSelected(company);
    setDraftModules(company.moduleAccess || []);
    setDraftPlanId(company.planId || '');
    setShowManageModal(true);
  };

  const toggleDraftModule = (key) => {
    setDraftModules((prev) => {
      if (prev.includes(key)) return prev.filter((m) => m !== key);
      if (draftCap !== null && prev.length >= draftCap) return prev; // at cap — ignore
      return [...prev, key];
    });
  };

  const handlePlanChange = (planId) => {
    setDraftPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    const cap = plan ? plan.maxModules : null;
    if (cap !== null) {
      setDraftModules((prev) => prev.slice(0, cap));
    }
  };

  const handleSaveAccess = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      if (draftPlanId !== (selected.planId || '')) {
        await companyService.assignPlan(selected.id, draftPlanId || null);
      }
      await companyService.updateModuleAccess(selected.id, draftModules);
      showOperationMessage('success', `Updated access for ${selected.businessName}`);
      setShowManageModal(false);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (company) => {
    const next = company.status === COMPANY_STATUS.ACTIVE ? COMPANY_STATUS.SUSPENDED : COMPANY_STATUS.ACTIVE;
    try {
      setBusyId(company.id);
      await companyService.setStatus(company.id, next);
      showOperationMessage('success', `${company.businessName} ${next === COMPANY_STATUS.ACTIVE ? 'reactivated' : 'suspended'}`);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setBusyId(null);
    }
  };

  const statList = [
    { label: 'Total Tenants', value: stats.total, colorKey: 'info' },
    { label: 'Active', value: stats.active, colorKey: 'success' },
    { label: 'Suspended', value: stats.suspended, colorKey: 'danger' },
    { label: 'No Plan Assigned', value: stats.unassigned, colorKey: 'warn' },
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

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="mb-6">
        <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Modules & Access</h1>
        <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Control which modules each tenant can use, and which plan they're assigned</p>
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

      {/* Module registry reference */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" style={{ color: TEAL }} />
          <span style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Module Registry</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MODULES.map(({ key, label }) => (
            <span key={key} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg3, border: '1px solid ' + border, color: text2 }}>
              {label}
            </span>
          ))}
        </div>
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
              type="text" placeholder="Search by business, contact, email…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, outline: 'none' }}>
            <option value="">All Status</option>
            <option value={COMPANY_STATUS.ACTIVE}>Active</option>
            <option value={COMPANY_STATUS.SUSPENDED}>Suspended</option>
          </select>
          <button onClick={loadData}
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
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading tenants...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p style={{ fontSize: 13 }}>{error}</p>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>No tenants yet — approve a company registration to provision one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Business', 'Plan', 'Modules Granted', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 4 ? 'right' : 'left', padding: '12px 16px' })}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = bg3}
                    onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: 36, height: 36, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ ...ba(13, 600, { color: textC }) }}>{c.businessName}</div>
                          <div className="flex items-center gap-1" style={{ ...ba(11, 400, { color: text2 }) }}>
                            <Mail className="w-3 h-3" />{c.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.planId ? 'rgba(26,92,120,.15)' : 'rgba(232,98,26,.15)', color: c.planId ? TEAL : ORG }}>
                        {planName(c.planId)}
                        {(() => {
                          const p = plans.find((pl) => pl.id === c.planId);
                          if (!p) return null;
                          const cap = p.maxModules === null ? '∞' : p.maxModules;
                          return ` · ${(c.moduleAccess || []).length}/${cap}`;
                        })()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {(c.moduleAccess || []).length === 0 ? (
                          <span style={{ ...ba(12, 400, { color: text2 }) }}>None</span>
                        ) : (c.moduleAccess || []).slice(0, 3).map((m) => (
                          <span key={m} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg3, color: text2 }}>
                            {moduleLabel(m)}
                          </span>
                        ))}
                        {(c.moduleAccess || []).length > 3 && (
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg3, color: text2 }}>
                            +{c.moduleAccess.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.status === COMPANY_STATUS.ACTIVE ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)', color: c.status === COMPANY_STATUS.ACTIVE ? '#4ade80' : '#e84040' }}>
                        {c.status === COMPANY_STATUS.ACTIVE ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openManageModal(c)}
                          style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: TEAL, cursor: 'pointer' }} title="Manage Access">
                          <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button disabled={busyId === c.id} onClick={() => handleToggleStatus(c)}
                          style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: c.status === COMPANY_STATUS.ACTIVE ? '#e84040' : '#4ade80', cursor: 'pointer' }}
                          title={c.status === COMPANY_STATUS.ACTIVE ? 'Suspend' : 'Reactivate'}>
                          {c.status === COMPANY_STATUS.ACTIVE ? <Ban className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Access Modal */}
      <AnimatePresence>
        {showManageModal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,.75)' }} onClick={() => setShowManageModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Manage Access — {selected.businessName}</h2>
                <button onClick={() => setShowManageModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-5 overflow-y-auto">
                <div>
                  <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Assigned Plan</label>
                  <select value={draftPlanId} onChange={(e) => handlePlanChange(e.target.value)} style={inputStyle}>
                    <option value="">No Plan</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.maxModules === null ? 'unlimited modules' : `up to ${p.maxModules} modules`}
                      </option>
                    ))}
                  </select>
                  <p style={{ ...ba(11, 400, { color: text2, marginTop: 6 }) }}>
                    {draftPlan
                      ? `The plan caps how many modules can be enabled — pick which ones below.`
                      : `Without a plan, module access is unlimited.`}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Module Access</label>
                    <span style={{ ...ba(12, 700, { color: atCap ? '#e84040' : TEAL }) }}>
                      {draftModules.length}{draftCap !== null ? ` / ${draftCap}` : ''} enabled
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MODULES.map(({ key, label }) => {
                      const active = draftModules.includes(key);
                      const locked = !active && atCap;
                      return (
                        <button type="button" key={key} onClick={() => toggleDraftModule(key)}
                          disabled={locked}
                          title={locked ? 'Module cap reached — upgrade the plan or deselect another module' : undefined}
                          className="transition-colors duration-150"
                          style={{
                            padding: '7px 12px', border: `1px solid ${active ? ORG : border}`,
                            background: active ? 'rgba(232,98,26,.12)' : bg3,
                            color: active ? ORG : text2,
                            opacity: locked ? 0.5 : 1,
                            cursor: locked ? 'not-allowed' : 'pointer',
                            ...bc(12, 600, { letterSpacing: .5 }),
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid ' + border }}>
                  <button onClick={() => setShowManageModal(false)}
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveAccess} disabled={saving}
                    className="flex items-center gap-2"
                    style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                    <Save className="w-4 h-4" /> Save Access
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

export default ModulesAccessManagement;
