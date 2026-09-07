import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Copy, CheckCircle } from 'lucide-react';
import abydashService from '../../services/abydashService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';

// A real organization needs exactly three inputs: its name, and the name +
// email of the one employee who becomes its super admin — matching
// OrganizationService.provisionOrganization's actual contract on the
// AbyDash side (organizationName, superAdmin.{name,email,password}). The
// password itself isn't something an admin should have to invent: generated
// here, sent for real in the new org's welcome email (AbyDash now passes
// temporaryPassword through), and shown once below as a fallback/backup.
function genTempPassword() {
  return `Aby-${Math.random().toString(36).slice(-6)}${Math.floor(Math.random() * 90 + 10)}!`;
}

const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [organizationName, setOrganizationName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // { organizationName, email, password }
  const [copied, setCopied] = useState(false);

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    background: bg3, border: '1px solid ' + border, borderRadius: 4,
    color: textC, outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!organizationName.trim() || !adminName.trim() || !adminEmail.trim()) {
      setError('Organization name, admin name and admin email are all required.');
      return;
    }
    const password = genTempPassword();
    try {
      setSaving(true);
      await abydashService.createOrganization({
        organizationName: organizationName.trim(),
        superAdmin: { name: adminName.trim(), email: adminEmail.trim(), password },
      });
      setCreated({ organizationName: organizationName.trim(), email: adminEmail.trim(), password });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard?.writeText(created.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (created) {
    return (
      <div className="min-h-screen" style={{ background: bg, padding: 24 }}>
        <div style={{ margin: '40px auto' }}>
          <div style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 24 }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6" style={{ color: '#4ade80' }} />
              <h2 style={{ ...ba(18, 700, { color: textC, margin: 0 }) }}>Organization created</h2>
            </div>
            <p style={{ ...ba(13, 400, { color: text2, lineHeight: 1.6 }) }}>
              <strong style={{ color: textC }}>{created.organizationName}</strong> is now live on AbyDash. A
              welcome email with these sign-in details was sent to <strong style={{ color: textC }}>{created.email}</strong> —
              the password below is shown only this once, so save it now if you need it.
            </p>
            <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 4, padding: 12, marginTop: 12 }}>
              <div style={{ ...ba(11, 700, { color: text2, textTransform: 'uppercase', letterSpacing: 1 }) }}>Email</div>
              <div style={{ ...ba(13, 600, { color: textC, marginBottom: 8 }) }}>{created.email}</div>
              <div style={{ ...ba(11, 700, { color: text2, textTransform: 'uppercase', letterSpacing: 1 }) }}>Temporary Password</div>
              <div className="flex items-center gap-2">
                <div style={{ ...ba(14, 700, { color: ORG, fontFamily: 'monospace' }) }}>{created.password}</div>
                <button onClick={copyPassword} title="Copy" style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 4, color: text2, cursor: 'pointer' }}>
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copied && <span style={{ ...ba(11, 600, { color: '#4ade80' }) }}>Copied</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-5">
              <button onClick={() => navigate('/admin/dashboard/company-registrations')}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Back to Organizations
              </button>
            </div>
          </div>
        </div>
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
          <h1 style={{ ...bb(30, { color: ORG, lineHeight: 1, margin: 0 }) }}>New Organization</h1>
          <p style={{ ...ba(13, 400, { color: text2, marginTop: 4 }) }}>Create a real AbyDash tenant and its first (super admin) employee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, padding: 24 }}>
        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 4, background: 'rgba(232,64,64,.15)', border: '1px solid #e84040', color: '#e84040', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4" style={{ color: ORG }} />
          <span style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Organization</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Organization Name *</label>
          <input type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="e.g. Kigali Bites Restaurant" style={inputStyle} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span style={bc(10, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2 })}>Super Admin (first employee)</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Admin Name *</label>
          <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="e.g. Aline Uwase" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2, display: 'block', marginBottom: 6 })}>Admin Email *</label>
          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="e.g. aline@business.rw" style={inputStyle} />
        </div>
        <p style={{ ...ba(11.5, 400, { color: text2, marginTop: 6 }) }}>
          A temporary password is generated automatically and emailed to this address — no plan or
          modules are assigned yet; do that afterward from Modules &amp; Access.
        </p>

        <div className="flex justify-end gap-2 pt-5" style={{ borderTop: '1px solid ' + border, marginTop: 20 }}>
          <button type="button" onClick={() => navigate('/admin/dashboard/company-registrations')}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 4, color: textC, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, background: ORG, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationCreatePage;
