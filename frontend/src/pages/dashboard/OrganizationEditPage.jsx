import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import abydashService from '../../services/abydashService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// Editing a real organization: its name, active/inactive status, and
// business type (all real now — AbyDash pushes any change live to that
// org's connected employees, see OrganizationService.adminUpdateOrganization),
// plus its plan and individual module overrides on top of that — the same
// real calls already proven on Modules & Access
// (assignPlan/setModuleOverride/getOrganizationModuleAccess), just scoped
// to one org as its own page instead of a modal.
const OrganizationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [org, setOrg] = useState(null);
  const [plans, setPlans] = useState([]);
  const [moduleDefs, setModuleDefs] = useState([]);
  const [access, setAccess] = useState([]);
  const [draftModuleKeys, setDraftModuleKeys] = useState([]);
  const [draftPlanId, setDraftPlanId] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftStatus, setDraftStatus] = useState('ACTIVE');
  const [draftBusinessType, setDraftBusinessType] = useState('RETAILER');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const [orgs, planData, moduleData, accessRows] = await Promise.all([
        abydashService.getAllOrganizations(),
        abydashService.getAllPlans(),
        abydashService.getAllModuleDefinitions(),
        abydashService.getOrganizationModuleAccess(id),
      ]);
      const found = orgs.find((o) => o.id === id);
      if (!found) throw new Error('Organization not found');
      setOrg(found);
      setPlans(planData);
      setModuleDefs(moduleData);
      setAccess(accessRows);
      setDraftPlanId(found.planId || '');
      setDraftModuleKeys(accessRows.filter((r) => r.enabled).map((r) => r.moduleKey));
      setDraftName(found.name || '');
      setDraftStatus(found.status || 'ACTIVE');
      setDraftBusinessType(found.businessType || 'RETAILER');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (key) => {
    setDraftModuleKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSave = async () => {
    if (!org) return;
    try {
      setSaving(true);
      setError(null);
      const nameChanged = draftName.trim() && draftName.trim() !== org.name;
      const statusChanged = draftStatus !== org.status;
      const businessTypeChanged = draftBusinessType !== (org.businessType || 'RETAILER');
      if (nameChanged || statusChanged || businessTypeChanged) {
        await abydashService.updateOrganization(org.id, {
          ...(nameChanged && { name: draftName.trim() }),
          ...(statusChanged && { status: draftStatus }),
          ...(businessTypeChanged && { businessType: draftBusinessType }),
        });
      }
      if (draftPlanId !== (org.planId || '') && draftPlanId) {
        await abydashService.assignPlan(org.id, draftPlanId);
      }
      const currentlyEnabled = new Set(access.filter((r) => r.enabled).map((r) => r.moduleKey));
      const draftEnabled = new Set(draftModuleKeys);
      const changed = moduleDefs.filter((m) => currentlyEnabled.has(m.key) !== draftEnabled.has(m.key));
      for (const m of changed) {
        await abydashService.setModuleOverride(org.id, m.key, draftEnabled.has(m.key));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  if (loading) {
    return <div className="min-h-screen" style={{ background: bg, padding: 24 }}><p style={{ ...ba(13, 400, { color: text2 }) }}>Loading organization...</p></div>;
  }
  if (error && !org) {
    return (
      <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
        <p style={{ color: '#e84040', fontSize: 13 }}>{error}</p>
        <button onClick={() => navigate('/admin/dashboard/company-registrations')} style={{ marginTop: 12, padding: '8px 16px', fontSize: 13, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/dashboard/company-registrations')}
          style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 8, color: text2, cursor: 'pointer' }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 style={{ ...bb(30, { color: ORG, lineHeight: 1, margin: 0 }) }}>Edit — {org.name}</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>{org.slug} · {org.status}</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', borderRadius: 4, background: 'rgba(232,64,64,.15)', border: '1px solid #e84040', color: '#e84040', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          <AlertCircle className="w-4 h-4" style={{ display: 'inline', marginRight: 6 }} />{error}
        </div>
      )}
      {saved && (
        <div style={{ padding: '10px 12px', borderRadius: 4, background: 'rgba(74,222,128,.15)', border: '1px solid #4ade80', color: '#4ade80', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
          <CheckCircle className="w-4 h-4" style={{ display: 'inline', marginRight: 6 }} />Saved.
        </div>
      )}

      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 24, marginBottom: 20 }}>
        <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Organization Name</label>
        <input type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />

        <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Status</label>
        <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
          {[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'SUSPENDED', label: 'Inactive' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDraftStatus(opt.value)}
              style={{
                padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                background: draftStatus === opt.value ? (opt.value === 'ACTIVE' ? '#4ade80' : '#e84040') : bg3,
                border: '1px solid ' + (draftStatus === opt.value ? (opt.value === 'ACTIVE' ? '#4ade80' : '#e84040') : border),
                color: draftStatus === opt.value ? '#fff' : text2,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {draftStatus === 'SUSPENDED' && (
          <p style={{ ...ba(11.5, 400, { color: '#e84040', marginTop: -12, marginBottom: 20 }) }}>
            An inactive organization's employees are immediately signed out of AbyDash and shown a
            "contact Abytech Hub" screen — including anyone already using it right now.
          </p>
        )}

        <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Business Type</label>
        <div className="flex items-center gap-2">
          {[
            { value: 'MANUFACTURER', label: 'Manufacturer' },
            { value: 'RETAILER', label: 'Retailer' },
            { value: 'WHOLESALER', label: 'Wholesaler' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDraftBusinessType(opt.value)}
              style={{
                padding: '8px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                background: draftBusinessType === opt.value ? ORG : bg3,
                border: '1px solid ' + (draftBusinessType === opt.value ? ORG : border),
                color: draftBusinessType === opt.value ? '#fff' : text2,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 24 }}>
        <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Assigned Plan</label>
        <select value={draftPlanId} onChange={(e) => setDraftPlanId(e.target.value)} style={inputStyle}>
          <option value="">No Plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.modules.length} module{p.modules.length !== 1 ? 's' : ''}</option>
          ))}
        </select>
        <p style={{ ...ba(11, 400, { color: text2, marginTop: 6, marginBottom: 20 }) }}>
          Changing the plan grants every module it includes. Toggle individual modules below for a one-off exception on top of the plan.
        </p>

        <div className="flex items-center justify-between mb-2">
          <label style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Module Access</label>
          <span style={{ ...ba(12, 700, { color: TEAL }) }}>{draftModuleKeys.length} enabled</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {moduleDefs.map(({ key, label }) => {
            const active = draftModuleKeys.includes(key);
            return (
              <button type="button" key={key} onClick={() => toggleModule(key)}
                style={{
                  padding: '7px 12px', border: `1px solid ${active ? ORG : border}`,
                  background: active ? 'rgba(232,98,26,.12)' : bg3, color: active ? ORG : text2,
                  cursor: 'pointer', ...bc(12, 600, { letterSpacing: .5 }),
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-5" style={{ borderTop: '1px solid ' + border, marginTop: 20 }}>
          <button onClick={() => navigate('/admin/dashboard/company-registrations')}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
            Back
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2"
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationEditPage;
