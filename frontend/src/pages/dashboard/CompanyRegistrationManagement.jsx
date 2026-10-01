import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, Building2, Plus, Grid3x3, Power, Percent } from 'lucide-react';
import abydashService from '../../services/abydashService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// Real Organizations — straight from AbyDash via abydashService, same data
// already proven working on the Modules & Access page. Replaces what used
// to be a fully mocked "review a submitted registration" workflow
// (companyRegistrationService.js, localStorage-only, no backend at all) —
// there's no fake "pending/approved/rejected" step in front of this
// anymore: creating an organization here creates a real one immediately.
const CompanyRegistrationManagement = () => {
  const navigate = useNavigate();
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // AbyDash's SCM Purchase payment gate (Pesapal) takes this % as AbyDash's
  // own cut of every purchase paid through the platform — see Report
  // Managment's purchase.service.ts#initiatePayment.
  const [commissionRate, setCommissionRate] = useState('');
  const [savingCommission, setSavingCommission] = useState(false);
  const [commissionSaved, setCommissionSaved] = useState(false);

  useEffect(() => {
    load();
    abydashService.getPaymentSettings().then((s) => setCommissionRate(String(s.commissionRatePercent))).catch(() => {});
  }, []);

  const saveCommissionRate = async () => {
    const rate = Number(commissionRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return;
    setSavingCommission(true);
    setCommissionSaved(false);
    try {
      await abydashService.updatePaymentSettings(rate);
      setCommissionSaved(true);
      setTimeout(() => setCommissionSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCommission(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await abydashService.getAllOrganizations();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return organizations;
    const q = searchTerm.toLowerCase();
    return organizations.filter((o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
  }, [organizations, searchTerm]);

  const stats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((o) => o.status === 'ACTIVE').length,
    unassigned: organizations.filter((o) => !o.planId).length,
  }), [organizations]);

  // One click, no confirmation dialog — AbyDash pushes the change live to
  // that org's connected employees the moment it lands (see
  // OrganizationService.adminUpdateOrganization), so this is deliberately
  // as immediate on this side as its effect is on theirs.
  const toggleStatus = async (o) => {
    setTogglingId(o.id);
    try {
      await abydashService.updateOrganization(o.id, { status: o.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ ...bb(36, { color: ORG, lineHeight: 1, margin: 0 }) }}>Organizations</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Every real AbyDash tenant — create new ones, then assign modules from Modules &amp; Access</p>
        </div>
        <button onClick={() => navigate('/admin/dashboard/organizations/new')}
          className="flex items-center gap-2"
          style={{ padding: '10px 18px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Organizations', value: stats.total, color: TEAL, bg: 'rgba(26,92,120,.15)' },
          { label: 'Active', value: stats.active, color: '#4ade80', bg: 'rgba(74,222,128,.15)' },
          { label: 'No Plan Assigned', value: stats.unassigned, color: ORG, bg: 'rgba(232,98,26,.15)' },
        ].map(({ label, value, color, bg: chipBg }) => (
          <div key={label} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16 }}>
            <div style={{ width: 40, height: 40, background: chipBg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color }}>
              <Building2 className="w-5 h-5" />
            </div>
            <p style={bb(40, { color: ORG, lineHeight: 1, margin: 0 })}>{value}</p>
            <p style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, margin: 0 })}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div style={{ width: 36, height: 36, background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORG, flexShrink: 0 }}>
            <Percent className="w-4 h-4" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ ...ba(13, 600, { color: textC }) }}>Platform commission rate</div>
            <div style={{ ...ba(11, 400, { color: text2 }) }}>AbyDash's cut of every SCM purchase paid via Pesapal</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="100" step="0.1" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} style={{ ...inputStyle, width: 90 }} />
            <span style={{ ...ba(13, 400, { color: text2 }) }}>%</span>
            <button onClick={saveCommissionRate} disabled={savingCommission}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: commissionSaved ? '#4ade80' : ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: savingCommission ? 'default' : 'pointer', opacity: savingCommission ? 0.7 : 1 }}>
              {savingCommission ? 'Saving...' : commissionSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 16, marginBottom: 24 }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: text2 }} />
            <input type="text" placeholder="Search by organization name or slug…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
          </div>
          <button onClick={load} style={{ padding: '8px 12px', background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>Loading organizations...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#e84040' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p style={{ fontSize: 13 }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ ...ba(13, 400, { color: text2 }) }}>No organizations yet — create the first one above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13 }}>
              <thead style={{ background: bg3 }}>
                <tr>
                  {['Organization', 'Plan', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, textAlign: i === 3 ? 'right' : 'left', padding: '12px 16px' })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
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
                        <button onClick={() => toggleStatus(o)} disabled={togglingId === o.id}
                          style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: o.status === 'ACTIVE' ? '#e84040' : '#4ade80', cursor: togglingId === o.id ? 'default' : 'pointer', opacity: togglingId === o.id ? 0.6 : 1 }}
                          title={o.status === 'ACTIVE' ? 'Deactivate organization' : 'Activate organization'}>
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/dashboard/organizations/${o.id}/edit`)}
                          style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: '5px 7px', color: TEAL, cursor: 'pointer' }} title="Edit organization">
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
    </div>
  );
};

export default CompanyRegistrationManagement;
