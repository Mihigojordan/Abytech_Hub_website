import { PhoneOff } from 'lucide-react';
import { ORG } from '../../../../utils/homeConstants';

/**
 * Full-screen overlay shown when the local user initiated a call
 * and is waiting for someone to answer (callState === 'ringing-out').
 * No countdown — the caller decides when to cancel.
 */
const CallingOutModal = ({ callInfo, onCancel }) => {
  const bg    = '#0E1A24';
  const textC = '#ffffff';
  const text2 = 'rgba(255,255,255,0.65)';
  const text3 = 'rgba(255,255,255,0.35)';

  const initial = (callInfo?.callerName || '?').charAt(0).toUpperCase();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Label */}
      <p style={{ color: text2, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
        {callInfo?.callType === 'video' ? 'Video Call' : 'Voice Call'}
      </p>

      {/* Ripple + avatar */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {[0, 0.5, 1].map((delay, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: -(i + 1) * 20,
            borderRadius: '50%',
            border: `2px solid ${ORG}`,
            opacity: 0.25 - i * 0.06,
            animation: `ripple 2s ease-out ${delay}s infinite`,
          }} />
        ))}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: ORG,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, fontWeight: 800, color: '#fff',
          position: 'relative', zIndex: 1,
          boxShadow: `0 0 40px ${ORG}60`,
        }}>
          {initial}
        </div>
      </div>

      <h1 style={{ color: textC, fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>
        {callInfo?.callerName || 'Group Call'}
      </h1>

      <p style={{ color: text2, fontSize: 14, margin: '0 0 48px' }}>
        Calling... Waiting for someone to answer
      </p>

      {/* Cancel button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#ef4444', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <PhoneOff size={28} color="#fff" />
        </button>
        <span style={{ color: text2, fontSize: 12, letterSpacing: 1 }}>CANCEL</span>
      </div>

      <p style={{ color: text3, fontSize: 11, marginTop: 24 }}>
        You can end the call at any time
      </p>

      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CallingOutModal;
