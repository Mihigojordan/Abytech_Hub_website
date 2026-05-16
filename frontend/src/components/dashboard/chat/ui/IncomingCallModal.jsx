import { useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG } from '../../../../utils/homeConstants';

/**
 * Full-screen incoming call overlay.
 * Shown when callState === 'ringing-in'.
 */
const IncomingCallModal = ({ callInfo, onAnswer, onDecline }) => {
  const { isDark } = useDashboardTheme();

  const bg      = isDark ? '#071418' : '#0E1A24';
  const textC   = '#ffffff';
  const text2   = 'rgba(255,255,255,0.65)';

  const isRejoin = !!callInfo?.isRejoin;
  const initial = (callInfo?.callerName || '?').charAt(0).toUpperCase();

  // Vibration on mount
  useEffect(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 300, 500, 300, 500]);
    }
    return () => { if ('vibrate' in navigator) navigator.vibrate(0); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 0,
    }}>
      {/* Call type label */}
      <p style={{ color: text2, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
        {isRejoin ? 'Active Call' : (callInfo?.callType === 'video' ? 'Incoming Video Call' : 'Incoming Voice Call')}
      </p>

      {/* Ripple + avatar */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* Ripple rings */}
        {[0, 0.4, 0.8].map((delay, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: -(i + 1) * 20,
            borderRadius: '50%',
            border: `2px solid ${ORG}`,
            opacity: 0.3 - i * 0.08,
            animation: `ripple 2s ease-out ${delay}s infinite`,
          }} />
        ))}
        {/* Avatar */}
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

      {/* Caller name */}
      <h1 style={{ color: textC, fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: 0.5 }}>
        {callInfo?.callerName || 'Unknown'}
      </h1>
      <p style={{ color: text2, fontSize: 14, margin: '0 0 64px' }}>
        {isRejoin ? 'Call still active — tap to rejoin' : 'is calling you...'}
      </p>

      {/* Accept / Decline */}
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Decline / Dismiss */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onDecline}
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
          <span style={{ color: text2, fontSize: 12, letterSpacing: 1 }}>{isRejoin ? 'DISMISS' : 'DECLINE'}</span>
        </div>

        {/* Accept / Rejoin */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onAnswer}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#22c55e', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Phone size={28} color="#fff" />
          </button>
          <span style={{ color: text2, fontSize: 12, letterSpacing: 1 }}>{isRejoin ? 'REJOIN' : 'ACCEPT'}</span>
        </div>
      </div>

      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default IncomingCallModal;
