import { useState } from 'react';
import { Phone, PhoneMissed, PhoneOff, PhoneIncoming, X } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, ba, bc } from '../../../../utils/homeConstants';

/**
 * Call message bubble — shown in the chat timeline for every call event.
 *
 * message.callData = {
 *   callId, callType, status,   // ended | missed | declined
 *   duration,                   // seconds | null
 *   startedAt, endedAt
 * }
 *
 * Clicking the bubble opens a small modal:
 *   - "Send message" → pre-fills the message input with a call-back prompt
 *   - "Call back"    → triggers initiateCall()
 */
const CallMessage = ({
  message,
  selectionMode,
  onCallBack,       // (conversationId) => void
  onSendMessage,    // (text) => void  — pre-fills the input
}) => {
  const { bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();
  const [showModal, setShowModal] = useState(false);

  const callData = message.callData || {};
  const status   = callData.status || 'ended';
  const isSent   = message.isSent;

  // ── Appearance per status ──────────────────────────────────────────────────
  const config = {
    ringing: {
      Icon: Phone,
      label: isSent ? 'Calling...' : 'Incoming call...',
      color: '#f59e0b',
      bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
      pulse: true,
    },
    ended: {
      Icon: isSent ? Phone : PhoneIncoming,
      label: isSent ? 'Voice call' : 'Incoming call',
      color: '#22c55e',
      bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
      pulse: false,
    },
    missed: {
      Icon: PhoneMissed,
      label: 'Missed call',
      color: '#ef4444',
      bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
      pulse: false,
    },
    declined: {
      Icon: PhoneOff,
      label: 'Declined call',
      color: '#ef4444',
      bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
      pulse: false,
    },
  }[status] || {
    Icon: Phone,
    label: 'Voice call',
    color: '#22c55e',
    bg: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
    pulse: false,
  };

  const { Icon, label, color, bg, pulse } = config;

  const duration = callData.duration != null ? formatDuration(callData.duration) : null;

  const handleClick = () => {
    if (selectionMode || status === 'ringing') return;
    setShowModal(true);
  };

  return (
    <>
      {/* ── Call bubble ── */}
      <div
        onClick={handleClick}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          padding: '10px 16px',
          background: bg,
          border: `1px solid ${color}30`,
          borderRadius: isSent ? '12px 12px 0 12px' : '12px 12px 12px 0',
          cursor: (selectionMode || status === 'ringing') ? 'default' : 'pointer',
          minWidth: 180, maxWidth: 280,
          transition: 'opacity 0.15s',
          userSelect: 'none',
          animation: pulse ? 'callPulse 1.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => { if (!selectionMode && status !== 'ringing') e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {/* Icon circle */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color={color} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...ba(13, 600, { color: textC, margin: 0 }) }}>{label}</p>
          <p style={{ ...ba(11, 400, { color: text3, margin: '2px 0 0' }) }}>
            {status === 'ringing'
              ? 'Ringing...'
              : duration
                ? duration
                : 'Tap to call back'}
          </p>
        </div>

        {/* Timestamp */}
        <span style={{ ...ba(10, 400, { color: text3, flexShrink: 0 }) }}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* ── Click modal ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: isDark ? '#0a1e28' : '#ffffff',
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: '28px 24px',
              width: '100%', maxWidth: 340,
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{label}</p>
                  {duration && (
                    <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }}>{duration}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ ...ba(13, 400, { color: text2, margin: '0 0 20px', lineHeight: 1.5 }) }}>
              What would you like to do?
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Call back */}
              <button
                onClick={() => {
                  setShowModal(false);
                  onCallBack?.();
                }}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: '#22c55e', border: 'none', borderRadius: 12,
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  ...ba(14, 700, {}),
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Phone size={16} />
                Call back
              </button>

              {/* Send message */}
              <button
                onClick={() => {
                  setShowModal(false);
                  onSendMessage?.(`📞 Hey, I'm trying to reach you. Please call me back when you're free.`);
                }}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                  border: `1px solid ${border}`, borderRadius: 12,
                  color: textC, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  ...ba(14, 600, {}),
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Send a message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// Inject pulse keyframe once
if (typeof document !== 'undefined' && !document.getElementById('call-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'call-pulse-style';
  style.textContent = `
    @keyframes callPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

export default CallMessage;
