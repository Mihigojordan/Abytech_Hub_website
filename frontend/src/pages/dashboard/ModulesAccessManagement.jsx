import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, RefreshCw, X, CheckCircle, AlertCircle, Grid3x3,
  Building2, Layers, Save, Plus, Trash2, FolderCog, CornerDownRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import abydashService from '../../services/abydashService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// Real data — Organization/Plan/ModuleDefinition/ModuleGroup straight from
// AbyDash, via this app's own /abydash/* backend routes (see
// abydashService.js). No mock, no localStorage, no "maxModules" cap: a Plan
// explicitly lists which modules it includes (PlanModule), and an org's
// actual access is whatever is materialized in OrgnisationModuleAccess —
// PLAN-sourced rows from whichever plan is assigned, OVERRIDE rows from the
// per-module toggles / per-group grants set here. Modules are organised into
// ModuleGroups; a grant can be a whole group at once or a hand-picked
// subset. See D:\project\JOB\Report Managment's Abytech Hub integration plan.

const ModulesAccessManagement = () => {
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [moduleDefs, setModuleDefs] = useState([]);
  const [moduleGroups, setModuleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);

  const [selected, setSelected] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [access, setAccess] = useState([]); // current OrgnisationModuleAccess rows for `selected`
  const [draftModuleKeys, setDraftModuleKeys] = useState([]); // enabled module keys, editable
  const [draftPlanId, setDraftPlanId] = useState('');
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showGroupsModal, setShowGroupsModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, planData, moduleData, groupData] = await Promise.all([
        abydashService.getAllOrganizations(),
        abydashService.getAllPlans(),
        abydashService.getAllModuleDefinitions(),
        abydashService.getModuleGroups(),
      ]);
      setOrganizations(orgData);
      setPlans(planData);
      setModuleDefs(moduleData);
      setModuleGroups(groupData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = useMemo(() => {
    if (!searchTerm) return organizations;
    const q = searchTerm.toLowerCase();
    return organizations.filter((o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
  }, [organizations, searchTerm]);

  const stats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((o) => o.status === 'ACTIVE').length,
    unassigned: organizations.filter((o) => !o.planId).length,
  }), [organizations]);

  // Modules laid out by group, ordered — the shape both the registry
  // reference and the manage modal render from. Falls back to bucketing the
  // flat module list by groupKey if /module-groups returned nothing, and
  // sweeps any module whose group is missing into a trailing "Ungrouped"
  // bucket so nothing silently disappears.
  const displayGroups = useMemo(() => {
    const byKey = new Map(moduleDefs.map((m) => [m.key, m]));
    const seen = new Set();
    const groups = [...moduleGroups]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((g) => {
        const mods = (g.modules && g.modules.length ? g.modules : moduleDefs.filter((m) => m.groupKey === g.key))
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((m) => byKey.get(m.key) || m);
        mods.forEach((m) => seen.add(m.key));
        return { key: g.key, label: g.label, description: g.description, modules: mods };
      });
    const orphans = moduleDefs.filter((m) => !seen.has(m.key));
    if (orphans.length) groups.push({ key: '__ungrouped__', label: 'Ungrouped', modules: orphans });
    return groups;
  }, [moduleGroups, moduleDefs]);

  const showOperationMessage = (type, message) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 3500);
  };

  const openManageModal = async (org) => {
    setSelected(org);
    setDraftPlanId(org.planId || '');
    setShowManageModal(true);
    setLoadingAccess(true);
    try {
      const rows = await abydashService.getOrganizationModuleAccess(org.id);
      setAccess(rows);
      setDraftModuleKeys(rows.filter((r) => r.enabled).map((r) => r.moduleKey));
    } catch (err) {
      showOperationMessage('error', err.message);
      setShowManageModal(false);
    } finally {
      setLoadingAccess(false);
    }
  };

  const toggleDraftModule = (key) => {
    setDraftModuleKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  // "Check the whole group" — add (or remove) every non-core module in the
  // group to the draft. Core modules are never gated so they're left out.
  const grantableKeys = (group) => group.modules.filter((m) => !m.isCore).map((m) => m.key);

  const grantWholeGroup = (group) => {
    const keys = grantableKeys(group);
    setDraftModuleKeys((prev) => [...new Set([...prev, ...keys])]);
  };
  const clearWholeGroup = (group) => {
    const keys = new Set(grantableKeys(group));
    setDraftModuleKeys((prev) => prev.filter((k) => !keys.has(k)));
  };

  // Diffs the draft against what's actually enabled right now and fires only
  // the calls needed to reach that state — assign-plan if the plan changed,
  // then ONE bulk module-overrides call for every module whose enabled state
  // changed (whether that came from an individual toggle or a whole-group
  // grant). This Save button is a client-side draft/diff over at most two
  // real calls.
  const handleSaveAccess = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      if (draftPlanId !== (selected.planId || '') && draftPlanId) {
        await abydashService.assignPlan(selected.id, draftPlanId);
      }
      const currentlyEnabled = new Set(access.filter((r) => r.enabled).map((r) => r.moduleKey));
      const draftEnabled = new Set(draftModuleKeys);
      const changed = moduleDefs.filter((m) => currentlyEnabled.has(m.key) !== draftEnabled.has(m.key));
      if (changed.length) {
        await abydashService.setModuleOverrides(
          selected.id,
          changed.map((m) => ({ moduleKey: m.key, enabled: draftEnabled.has(m.key) })),
        );
      }
      showOperationMessage('success', `Updated access for ${selected.name}`);
      setShowManageModal(false);
      loadData();
    } catch (err) {
      showOperationMessage('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const statList = [
    { label: 'Total Organizations', value: stats.total, colorKey: 'info' },
    { label: 'Active', value: stats.active, colorKey: 'success' },
    { label: 'No Plan Assigned', value: stats.unassigned, colorKey: 'warn' },
  ];
  const statColors = {
    info:    { bg: 'rgba(26,92,120,.15)',  color: TEAL },
    warn:    { bg: 'rgba(232,98,26,.15)',  color: ORG },
    success: { bg: 'rgba(74,222,128,.15)', color: '#4ade80' },
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  const draftEnabledSet = useMemo(() => new Set(draftModuleKeys), [draftModuleKeys]);

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Modules & Access</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Control which modules each AbyDash organization can use — a whole group at a time or a hand-picked set — and which plan they're assigned</p>
        </div>
        <button onClick={() => setShowGroupsModal(true)}
          className="flex items-center gap-2"
          style={{ padding: '8px 14px', ...bc(13, 700, { letterSpacing: .5 }), background: bg3, border: '1px solid ' + border, borderRadius: 4, color: TEAL, cursor: 'pointer' }}>
          <FolderCog className="w-4 h-4" /> Manage Groups
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

      {/* Module registry reference — grouped */}
      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" style={{ color: TEAL }} />
          <span style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Module Registry</span>
        </div>
        <div className="space-y-3">
          {displayGroups.map((group) => (
            <div key={group.key}>
              <p style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: TEAL, margin: '0 0 6px' })}>{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.modules.map(({ key, label, isCore }) => (
                  <span key={key} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg3, border: '1px solid ' + border, color: isCore ? text2 : textC }}>
                    {label}{isCore ? ' · core' : ''}
                  </span>
                ))}
              </div>
            </div>
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
              type="text" placeholder="Search by organization name or slug…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
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
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading organizations...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p style={{ fontSize: 13 }}>{error}</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>No organizations yet — create one from Company Registrations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Organization', 'Plan', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 3 ? 'right' : 'left', padding: '12px 16px' })}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((o) => (
                  <tr key={o.id} style={{ background: bg2, borderBottom: '1px solid ' + border, transition: 'background .15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = bg3}
                    onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: 36, height: 36, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div style={{ ...ba(13, 600, { color: textC }) }}>{o.name}</div>
                          <div style={{ ...ba(11, 400, { color: text2 }) }}>{o.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: o.planId ? 'rgba(26,92,120,.15)' : 'rgba(232,98,26,.15)', color: o.planId ? TEAL : ORG }}>
                        {o.plan?.name || 'No Plan'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: o.status === 'ACTIVE' ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)', color: o.status === 'ACTIVE' ? '#4ade80' : '#e84040' }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openManageModal(o)}
                          style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: TEAL, cursor: 'pointer' }} title="Manage Access">
                          <Grid3x3 className="w-4 h-4" />
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
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
                <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Manage Access — {selected.name}</h2>
                <button onClick={() => setShowManageModal(false)}
                  style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {loadingAccess ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading current access...</p>
                </div>
              ) : (
                <div className="p-4 space-y-5 overflow-y-auto">
                  <div>
                    <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Assigned Plan</label>
                    <select value={draftPlanId} onChange={(e) => setDraftPlanId(e.target.value)} style={inputStyle}>
                      <option value="">No Plan</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.modules.length} module{p.modules.length !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <p style={{ ...ba(11, 400, { color: text2, marginTop: 6 }) }}>
                      Changing the plan grants every module it includes. Use the group grants / individual toggles below for a one-off exception on top of the plan.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Module Access</label>
                      <span style={{ ...ba(12, 700, { color: TEAL }) }}>{draftModuleKeys.length} enabled</span>
                    </div>

                    <div className="space-y-4">
                      {displayGroups.map((group) => {
                        const grantable = grantableKeys(group);
                        const enabledInGroup = grantable.filter((k) => draftEnabledSet.has(k)).length;
                        const allOn = grantable.length > 0 && enabledInGroup === grantable.length;
                        return (
                          <div key={group.key} style={{ border: '1px solid ' + border, borderRadius: 4, padding: 12, background: bg }}>
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-baseline gap-2">
                                <span style={bc(12, 700, { letterSpacing: 1, textTransform: 'uppercase', color: TEAL })}>{group.label}</span>
                                <span style={ba(11, 400, { color: text2 })}>{enabledInGroup}/{grantable.length}</span>
                              </div>
                              {grantable.length > 0 && (
                                <div className="flex gap-1.5">
                                  <button type="button" onClick={() => grantWholeGroup(group)}
                                    style={{ padding: '4px 10px', ...bc(11, 700, { letterSpacing: .5 }), border: `1px solid ${ORG}`, background: allOn ? 'rgba(232,98,26,.12)' : bg3, color: ORG, borderRadius: 4, cursor: 'pointer' }}>
                                    Grant all
                                  </button>
                                  <button type="button" onClick={() => clearWholeGroup(group)}
                                    style={{ padding: '4px 10px', ...bc(11, 700, { letterSpacing: .5 }), border: '1px solid ' + border, background: bg3, color: text2, borderRadius: 4, cursor: 'pointer' }}>
                                    Clear
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.modules.map(({ key, label, isCore }) => {
                                const active = draftEnabledSet.has(key);
                                return (
                                  <button type="button" key={key}
                                    onClick={() => !isCore && toggleDraftModule(key)}
                                    disabled={isCore}
                                    className="transition-colors duration-150"
                                    style={{
                                      padding: '7px 12px', border: `1px solid ${active ? ORG : border}`,
                                      background: active ? 'rgba(232,98,26,.12)' : bg3,
                                      color: isCore ? text2 : (active ? ORG : textC),
                                      cursor: isCore ? 'not-allowed' : 'pointer',
                                      opacity: isCore ? 0.6 : 1,
                                      ...bc(12, 600, { letterSpacing: .5 }),
                                    }}
                                    title={isCore ? 'Core module — always available, never gated' : undefined}>
                                    {label}{isCore ? ' · core' : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
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
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Access'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Groups Modal */}
      <AnimatePresence>
        {showGroupsModal && (
          <ManageGroupsModal
            groups={moduleGroups}
            moduleDefs={moduleDefs}
            theme={{ bg, bg2, bg3, textC, text2, border }}
            inputStyle={inputStyle}
            onClose={() => setShowGroupsModal(false)}
            onChanged={(msg) => { showOperationMessage('success', msg); loadData(); }}
            onError={(msg) => showOperationMessage('error', msg)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Group registry management: create / relabel / reorder / delete a group,
// and move a module from one group to another. Every change is an immediate
// call to AbyDash (no draft/diff here — these are low-frequency structural
// edits, unlike the per-org access toggles).
const ManageGroupsModal = ({ groups, moduleDefs, theme, inputStyle, onClose, onChanged, onError }) => {
  const { bg2, bg3, textC, text2, border } = theme;
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState(() =>
    [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((g) => ({ key: g.key, label: g.label, order: g.order ?? 0 })));
  const [newGroup, setNewGroup] = useState({ key: '', label: '', order: '' });
  const [move, setMove] = useState({ moduleKey: '', groupKey: '' });

  useEffect(() => {
    setRows([...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((g) => ({ key: g.key, label: g.label, order: g.order ?? 0 })));
  }, [groups]);

  const run = async (fn, okMsg) => {
    try {
      setBusy(true);
      await fn();
      onChanged(okMsg);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveRow = (row) => run(
    () => abydashService.updateModuleGroup(row.key, { label: row.label, order: Number(row.order) || 0 }),
    `Group "${row.key}" updated`,
  );
  const deleteRow = (row) => run(
    () => abydashService.deleteModuleGroup(row.key),
    `Group "${row.key}" deleted`,
  );
  const createGroup = () => run(
    () => abydashService.createModuleGroup({
      key: newGroup.key.trim(),
      label: newGroup.label.trim(),
      order: newGroup.order === '' ? undefined : Number(newGroup.order),
    }),
    `Group "${newGroup.key.trim()}" created`,
  ).then(() => setNewGroup({ key: '', label: '', order: '' }));
  const moveModule = () => run(
    () => abydashService.setModuleGroup(move.moduleKey, move.groupKey),
    `Moved ${move.moduleKey} → ${move.groupKey}`,
  ).then(() => setMove({ moduleKey: '', groupKey: '' }));

  const countInGroup = (key) => moduleDefs.filter((m) => m.groupKey === key).length;
  const smallBtn = (extra = {}) => ({ padding: '6px 10px', ...bc(11, 700, { letterSpacing: .5 }), borderRadius: 4, cursor: 'pointer', ...extra });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,.75)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4" style={{ background: bg3, borderBottom: '1px solid ' + border }}>
          <h2 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>Module Groups</h2>
          <button onClick={onClose} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 6, color: text2, cursor: 'pointer' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Existing groups */}
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={row.key} className="flex items-center gap-2 flex-wrap" style={{ border: '1px solid ' + border, borderRadius: 4, padding: 10 }}>
                <span style={{ ...bc(11, 700, { letterSpacing: .5 }), color: text2, minWidth: 120 }}>{row.key}</span>
                <input value={row.label} onChange={(e) => setRows((p) => p.map((r, j) => j === i ? { ...r, label: e.target.value } : r))}
                  style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
                <input type="number" value={row.order} onChange={(e) => setRows((p) => p.map((r, j) => j === i ? { ...r, order: e.target.value } : r))}
                  style={{ ...inputStyle, width: 70 }} title="Display order" />
                <span style={ba(11, 400, { color: text2 })}>{countInGroup(row.key)} mod</span>
                <button disabled={busy} onClick={() => saveRow(row)} style={smallBtn({ border: `1px solid ${TEAL}`, background: bg3, color: TEAL })}>Save</button>
                <button disabled={busy || countInGroup(row.key) > 0} onClick={() => deleteRow(row)}
                  title={countInGroup(row.key) > 0 ? 'Move its modules elsewhere first' : 'Delete group'}
                  style={smallBtn({ border: '1px solid #e84040', background: bg3, color: '#e84040', opacity: countInGroup(row.key) > 0 ? 0.4 : 1 })}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* New group */}
          <div style={{ borderTop: '1px solid ' + border, paddingTop: 14 }}>
            <p style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 8 })}>New group</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input placeholder="key (lower_snake_case)" value={newGroup.key}
                onChange={(e) => setNewGroup((p) => ({ ...p, key: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
              <input placeholder="Label" value={newGroup.label}
                onChange={(e) => setNewGroup((p) => ({ ...p, label: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
              <input type="number" placeholder="order" value={newGroup.order}
                onChange={(e) => setNewGroup((p) => ({ ...p, order: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
              <button disabled={busy || !newGroup.key.trim() || !newGroup.label.trim()} onClick={createGroup}
                className="flex items-center gap-1"
                style={smallBtn({ border: `1px solid ${ORG}`, background: bg3, color: ORG, opacity: (!newGroup.key.trim() || !newGroup.label.trim()) ? 0.4 : 1 })}>
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Move a module between groups */}
          <div style={{ borderTop: '1px solid ' + border, paddingTop: 14 }}>
            <p style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 8 })}>Move a module</p>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={move.moduleKey} onChange={(e) => setMove((p) => ({ ...p, moduleKey: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 160 }}>
                <option value="">Select module…</option>
                {[...moduleDefs].sort((a, b) => a.label.localeCompare(b.label)).map((m) => (
                  <option key={m.key} value={m.key}>{m.label} ({m.groupKey})</option>
                ))}
              </select>
              <CornerDownRight className="w-4 h-4" style={{ color: text2 }} />
              <select value={move.groupKey} onChange={(e) => setMove((p) => ({ ...p, groupKey: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 140 }}>
                <option value="">Target group…</option>
                {rows.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <button disabled={busy || !move.moduleKey || !move.groupKey} onClick={moveModule}
                style={smallBtn({ border: `1px solid ${TEAL}`, background: bg3, color: TEAL, opacity: (!move.moduleKey || !move.groupKey) ? 0.4 : 1 })}>
                Move
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModulesAccessManagement;
