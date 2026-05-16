import { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, UserPlus, X, Phone } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG } from '../../../../utils/homeConstants';
import useAdminAuth from '../../../../context/AdminAuthContext';

const ActiveCallModal = ({
  callInfo,
  participants,
  isMuted,
  speakingPeers,
  conversationMembers = [],
  onlineUsers = new Map(),   // Map<userId, { userType }>
  pendingInvites = new Map(), // Map<"userId:userType", { name, invitedAt, timerId }>
  onEnd,
  onToggleMute,
  onInvite,
}) => {
  const { isDark } = useDashboardTheme();
  const { user: admin } = useAdminAuth();

  const bg    = '#0E1A24';
  const bg2   = '#132332';
  const bg3   = '#1B2C3D';
  const textC = '#ffffff';
  const text2 = 'rgba(255,255,255,0.6)';
  const text3 = 'rgba(255,255,255,0.3)';

  // ── Call timer ──────────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Add-to-call panel ───────────────────────────────────────────────────────
  const [showAddPanel, setShowAddPanel] = useState(false);

  // IDs already in the call (self + remote participants) — use String() to avoid type mismatches
  const inCallUserIds = new Set([
    String(admin?.id || ''),
    ...Array.from(participants.values()).map(p => String(p.userId)),
  ]);

  // Conversation members not yet in the call and not pending
  const availableToAdd = conversationMembers
    .filter(m => {
      const id = String(m.participantId || m.id || '');
      if (!id) return false;
      if (inCallUserIds.has(id)) return false;
      return true;
    })
    .sort((a, b) => {
      // Online members first
      const aOnline = onlineUsers.has(String(a.participantId || a.id || ''));
      const bOnline = onlineUsers.has(String(b.participantId || b.id || ''));
      return bOnline - aOnline;
    });

  // Countdown state — ticks every second to update invite countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    if (pendingInvites.size === 0) return;
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [pendingInvites.size]);

  // ── Participant tile ────────────────────────────────────────────────────────
  const Tile = ({ id, name, isSpeaking, isSelf = false }) => {
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '20px 16px',
        background: bg2,
        borderRadius: 16,
        border: `2px solid ${isSpeaking ? ORG : 'transparent'}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        minWidth: 120, maxWidth: 160,
        boxShadow: isSpeaking ? `0 0 24px ${ORG}50` : 'none',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: isSelf ? ORG : '#1a5c78',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff',
          border: `3px solid ${isSpeaking ? ORG : 'transparent'}`,
          transition: 'border-color 0.2s',
          boxShadow: isSpeaking ? `0 0 12px ${ORG}80` : 'none',
        }}>
          {initial}
        </div>
        <span style={{
          color: textC, fontSize: 13, fontWeight: 600,
          textAlign: 'center', maxWidth: 120,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}{isSelf ? ' (You)' : ''}
        </span>
        {isSelf && isMuted && (
          <span style={{ color: '#ef4444', fontSize: 11 }}>🔇 Muted</span>
        )}
        {isSpeaking && !isSelf && (
          <span style={{ color: ORG, fontSize: 11 }}>🎙 Speaking</span>
        )}
      </div>
    );
  };

  const selfName = admin?.adminName || admin?.name || 'You';
  const isSelfSpeaking = speakingPeers.has('self');
  const participantArray = Array.from(participants.entries());
  const totalCount = participantArray.length + 1; // +1 for self

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
    }}>

      {/* ── Header ── */}
      <div style={{
        width: '100%', padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div>
          <p style={{ color: text3, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
            Voice Call
          </p>
          <p style={{ color: textC, fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: 0.5 }}>
            {callInfo?.callerName || 'Group Call'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: ORG, fontSize: 26, fontWeight: 800, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(elapsed)}
          </p>
          <p style={{ color: text2, fontSize: 12, margin: '4px 0 0' }}>
            {totalCount} participant{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Participant grid ── */}
      <div style={{
        flex: 1, width: '100%', padding: '24px 32px',
        display: 'flex', flexWrap: 'wrap', gap: 16,
        alignContent: 'flex-start', justifyContent: 'center',
        overflowY: 'auto',
      }}>
        {/* Self */}
        <Tile id="self" name={selfName} isSpeaking={isSelfSpeaking} isSelf />

        {/* Remote participants — show real names */}
        {participantArray.map(([socketId, p]) => (
          <Tile
            key={socketId}
            id={socketId}
            name={p.name || 'Participant'}
            isSpeaking={speakingPeers.has(socketId)}
          />
        ))}
      </div>

      {/* ── Controls ── */}
      <div style={{
        padding: '24px 32px 32px',
        display: 'flex', alignItems: 'center', gap: 20,
        borderTop: `1px solid rgba(255,255,255,0.06)`,
      }}>

        {/* Mute */}
        <ControlBtn
          onClick={onToggleMute}
          active={isMuted}
          activeColor="#ef4444"
          label={isMuted ? 'UNMUTE' : 'MUTE'}
          text2={text2}
        >
          {isMuted ? <MicOff size={22} color="#fff" /> : <Mic size={22} color="#fff" />}
        </ControlBtn>

        {/* Add participant */}
        <ControlBtn
          onClick={() => setShowAddPanel(p => !p)}
          active={showAddPanel}
          activeColor={ORG}
          label="ADD"
          text2={text2}
        >
          <UserPlus size={22} color="#fff" />
        </ControlBtn>

        {/* End call */}
        <ControlBtn
          onClick={onEnd}
          active
          activeColor="#ef4444"
          label="END"
          text2={text2}
          size={72}
          shadow="0 8px 24px rgba(239,68,68,0.5)"
        >
          <PhoneOff size={28} color="#fff" />
        </ControlBtn>
      </div>

      {/* ── Add-to-call slide-up panel ── */}
      {showAddPanel && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: bg2,
          borderTop: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: '20px 20px 0 0',
          padding: '20px 24px 32px',
          maxHeight: '50vh', overflowY: 'auto',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ color: textC, fontSize: 15, fontWeight: 700, margin: 0 }}>Add to call</h3>
            <button
              onClick={() => setShowAddPanel(false)}
              style={{ background: 'none', border: 'none', color: text2, cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {conversationMembers.length === 0 ? (
            <p style={{ color: text3, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Loading participants...
            </p>
          ) : availableToAdd.length === 0 ? (
            <p style={{ color: text3, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Everyone in this conversation is already in the call
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {availableToAdd.map((member) => {
                const id = String(member.participantId || member.id || '');
                const type = member.participantType || 'ADMIN';
                const name = member.name || member.adminName || id;
                const initial = (name || '?').charAt(0).toUpperCase();
                const isOnline = onlineUsers.has(id);
                const pendingKey = `${id}:${type}`;
                const pending = pendingInvites.get(pendingKey);
                const countdown = pending
                  ? Math.max(0, 25 - Math.floor((Date.now() - pending.invitedAt) / 1000))
                  : null;

                return (
                  <div key={`${type}-${id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    background: bg3, borderRadius: 10,
                    opacity: pending ? 0.75 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    {/* Avatar with online dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: '#1a5c78',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 700, color: '#fff',
                      }}>
                        {initial}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 11, height: 11, borderRadius: '50%',
                        background: isOnline ? '#22c55e' : '#6b7280',
                        border: `2px solid ${bg3}`,
                      }} />
                    </div>

                    {/* Name + status */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: textC, fontSize: 14, fontWeight: 500, display: 'block' }}>
                        {name}
                      </span>
                      <span style={{ fontSize: 11, color: pending ? ORG : (isOnline ? '#22c55e' : text3) }}>
                        {pending ? `Calling... ${countdown}s` : (isOnline ? 'Online' : 'Offline')}
                      </span>
                    </div>

                    {/* Invite / pending button */}
                    {pending ? (
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'rgba(232,98,26,0.2)',
                        border: `2px solid ${ORG}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 11, color: ORG, fontWeight: 700,
                      }}>
                        {countdown}
                      </div>
                    ) : (
                      <button
                        onClick={() => { onInvite?.(id, type, name); }}
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: isOnline ? '#22c55e' : 'rgba(255,255,255,0.15)',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'background 0.2s',
                        }}
                        title={isOnline ? 'Invite to call' : 'Send push notification'}
                      >
                        <Phone size={15} color="#fff" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Reusable control button ─────────────────────────────────────────────── */
const ControlBtn = ({ onClick, active, activeColor, label, text2, size = 60, shadow, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: active ? activeColor : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: shadow || 'none',
        transition: 'background 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
    <span style={{ color: text2, fontSize: 11, letterSpacing: 1 }}>{label}</span>
  </div>
);

export default ActiveCallModal;
