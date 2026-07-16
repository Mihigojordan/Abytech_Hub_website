import { useState } from 'react';
import { Cookie, ShieldAlert, X, RefreshCw, ChevronRight } from 'lucide-react';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const BROWSER_STEPS = [
  {
    id: 'chrome',
    label: 'Chrome',
    steps: [
      'Click the eye icon (👁) at the right of the address bar',
      'Select "Site not working?" or "Cookies not allowed"',
      'Choose "Allow" for this site, then reload the page',
    ],
  },
  {
    id: 'edge',
    label: 'Edge',
    steps: [
      'Click the lock icon at the left of the address bar',
      'Open "Permissions for this site" → "Cookies and site data"',
      'Set it to "Allow", then reload the page',
    ],
  },
  {
    id: 'firefox',
    label: 'Firefox',
    steps: [
      'Click the shield icon at the left of the address bar',
      'Turn off "Enhanced Tracking Protection" for this site',
      'Reload the page when prompted',
    ],
  },
  {
    id: 'safari',
    label: 'Safari',
    steps: [
      'Open Safari → Settings → Privacy',
      'Uncheck "Prevent cross-site tracking" (or add abytechhub.com as an exception on iOS under Settings → Safari → Advanced)',
      'Reload the page',
    ],
  },
];

function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Firefox/i.test(ua)) return 'firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'safari';
  return 'chrome';
}

/**
 * Shown when we detect the browser is silently dropping the SameSite=None
 * auth cookie (no browser prompt exists for this — the user has to flip a
 * privacy setting themselves). Styled to match the admin login screen:
 * dark navy panel, orange accent, Bebas/Barlow type.
 */
export default function ThirdPartyCookieModal({ onRetry, onDismiss, retrying }) {
  const [activeTab, setActiveTab] = useState(detectBrowser());

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(4,10,16,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 460, background: '#0b1923', borderRadius: 6,
          border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 24px 64px rgba(0,0,0,.5)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,${ORG},${TEAL})` }} />

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 4,
          }}
        >
          <X size={16} />
        </button>

        <div style={{ padding: '28px 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 6, flexShrink: 0,
              background: 'rgba(232,98,26,.15)', border: `1px solid ${ORG}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={18} color={ORG} />
            </div>
            <div style={{ ...bc(10, 700, { color: ORG, letterSpacing: 4, textTransform: 'uppercase' }) }}>
              Sign-in blocked
            </div>
          </div>

          <div style={{ ...bb('clamp(24px,3vw,32px)', { color: '#fff', lineHeight: 1.05, marginBottom: 10 }) }}>
            Your browser is blocking third-party cookies
          </div>

          <p style={{ ...ba(13.5, 300, { color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 18 }) }}>
            Abytech Hub keeps you signed in with a cookie your browser now blocks by default.
            There's no in-page way to grant this — you'll need to allow it in your browser's
            privacy settings for this site, then try again.
          </p>

          {/* Browser tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
            {BROWSER_STEPS.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveTab(b.id)}
                style={{
                  padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
                  background: activeTab === b.id ? ORG : 'rgba(255,255,255,.05)',
                  border: `1px solid ${activeTab === b.id ? ORG : 'rgba(255,255,255,.1)'}`,
                  ...bc(11.5, 600, { color: activeTab === b.id ? '#fff' : 'rgba(255,255,255,.6)', letterSpacing: 1 }),
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
            {BROWSER_STEPS.find((b) => b.id === activeTab).steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i === 2 ? 0 : 10 }}>
                <ChevronRight size={14} color={ORG} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ ...ba(13, 400, { color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }) }}>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onRetry}
              disabled={retrying}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 4, border: 'none',
                cursor: retrying ? 'not-allowed' : 'pointer', background: ORG,
                opacity: retrying ? .6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                ...bc(12.5, 700, { color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }),
              }}
            >
              <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Checking…' : "I've allowed it — try again"}
            </button>
          </div>

          <button
            onClick={onDismiss}
            style={{
              display: 'block', margin: '14px auto 0', background: 'none', border: 'none',
              cursor: 'pointer', ...ba(12, 400, { color: 'rgba(255,255,255,.35)' }),
            }}
          >
            Continue anyway
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 28px', background: 'rgba(0,0,0,.2)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <Cookie size={12} color="rgba(255,255,255,.3)" />
          <span style={{ ...bc(9.5, 600, { color: 'rgba(255,255,255,.3)', letterSpacing: 2, textTransform: 'uppercase' }) }}>
            AbytechHub.com
          </span>
        </div>
      </div>
    </div>
  );
}
