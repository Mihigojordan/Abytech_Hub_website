import { useState, useEffect, useRef, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, UserPlus, X, Phone, Video, VideoOff } from 'lucide-react';
import { ORG } from '../../../../utils/homeConstants';
import useAdminAuth from '../../../../context/AdminAuthContext';

// ── Video tile — handles its own <video> ref ───────────────────────────────────
const VideoTile = ({ videoStream, name, isSpeaking, isSelf, isMuted, isVideoEnabled }) => {
  const videoRef = useRef(null);
  const initial  = (name || '?').charAt(0).toUpperCase();

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = videoStream || null;
  }, [videoStream]);

  const bg2     = '#132332';
  const textC   = '#ffffff';
  const text2   = 'rgba(255,255,255,0.6)';
  const hasVideo = !!videoStream && isVideoEnabled !== false;

  return (
    <div style={{
      position: 'relative',
      background: bg2,
      borderRadius: 12,
      border: `2px solid ${isSpeaking ? ORG : 'rgba(255,255,255,0.06)'}`,
      overflow: 'hidden',
      aspectRatio: '16/9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: isSpeaking ? `0 0 20px ${ORG}50` : 'none',
      minHeight: 0,
    }}>
      {/* Video element — always rendered, srcObject drives visibility */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasVideo ? 'block' : 'none',
          background: '#000',
        }}
      />

      {/* Avatar shown when camera is off */}
      {!hasVideo && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isSelf ? ORG : '#1a5c78',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
            border: `3px solid ${isSpeaking ? ORG : 'transparent'}`,
            transition: 'border-color 0.2s',
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <VideoOff size={12} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Camera off</span>
          </div>
        </div>
      )}

      {/* Bottom name bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '20px 10px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: textC, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}{isSelf ? ' (You)' : ''}
        </span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {isSelf && isMuted && <MicOff size={12} color="#ef4444" />}
          {isSpeaking && !isSelf && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORG, animation: 'pulse 1s infinite' }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Self video PIP (picture-in-picture overlay) ────────────────────────────────
const SelfPIP = ({ videoStream, name, isMuted, isVideoEnabled }) => {
  const videoRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const initial  = (name || '?').charAt(0).toUpperCase();
  const hasVideo = !!videoStream && isVideoEnabled;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = videoStream || null;
  }, [videoStream]);

  return (
    <div
      onClick={() => setCollapsed(c => !c)}
      style={{
        position: 'absolute',
        bottom: 96, right: 16,
        width: collapsed ? 48 : 140,
        height: collapsed ? 48 : 79,
        borderRadius: collapsed ? '50%' : 10,
        overflow: 'hidden',
        background: '#0a1929',
        border: `2px solid rgba(255,255,255,0.15)`,
        cursor: 'pointer',
        zIndex: 20,
        transition: 'width 0.25s, height 0.25s, border-radius 0.25s',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      title={collapsed ? 'Show your camera' : 'Minimise'}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: hasVideo ? 'block' : 'none',
        }}
      />
      {(!hasVideo || collapsed) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hasVideo && collapsed ? 'transparent' : '#132332',
        }}>
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{initial}</span>
          )}
          {collapsed && (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: ORG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff',
            }}>
              {initial}
            </div>
          )}
        </div>
      )}
      {!collapsed && isMuted && (
        <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', borderRadius: '50%', padding: 2 }}>
          <MicOff size={8} color="#fff" />
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const ActiveCallModal = ({
  callInfo,
  participants,
  isMuted,
  speakingPeers,
  allAdmins      = [],
  onlineUsers    = new Map(),
  pendingInvites = new Map(),
  isVideoEnabled = false,
  localVideoStream = null,
  remoteVideoStreams = new Map(),
  onEnd,
  onToggleMute,
  onToggleVideo,
  onInvite,
}) => {
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
  const [searchQuery, setSearchQuery] = useState('');

  // Countdown tick for pending invite display
  const [, setTick] = useState(0);
  useEffect(() => {
    if (pendingInvites.size === 0) return;
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [pendingInvites.size]);

  const inCallUserIds = new Set([
    String(admin?.id || ''),
    ...Array.from(participants.values()).map(p => String(p.userId)),
  ]);

  const availableToAdd = allAdmins
    .filter(m => {
      const id = String(m.id || '');
      return id && !inCallUserIds.has(id);
    })
    .filter(m => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (m.adminName || '').toLowerCase().includes(q) ||
             (m.adminEmail || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Real-time online map takes priority; fall back to DB isOnline field
      const aOnline = onlineUsers.has(String(a.id)) || !!a.isOnline;
      const bOnline = onlineUsers.has(String(b.id)) || !!b.isOnline;
      return Number(bOnline) - Number(aOnline);
    });

  // ── Responsive grid columns ─────────────────────────────────────────────────
  const participantArray = Array.from(participants.entries());
  const totalRemote      = participantArray.length;
  const cols = totalRemote === 0 ? 1 : totalRemote === 1 ? 1 : totalRemote <= 4 ? 2 : 3;

  const selfName     = admin?.adminName || admin?.name || 'You';
  const isSelfSpeak  = speakingPeers.has('self');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: bg,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        flexShrink: 0,
      }}>
        <div>
          <p style={{ color: text3, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
            {isVideoEnabled ? 'Video Call' : 'Voice Call'}
          </p>
          <p style={{ color: textC, fontSize: 16, fontWeight: 800, margin: '2px 0 0' }}>
            {callInfo?.callerName || 'Group Call'}
          </p>
          {totalRemote === 0 && (
            <p style={{ color: text3, fontSize: 11, margin: '4px 0 0', fontStyle: 'italic' }}>
              Waiting for others to join…
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: ORG, fontSize: 22, fontWeight: 800, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(elapsed)}
          </p>
          <p style={{ color: text2, fontSize: 11, margin: '2px 0 0' }}>
            {totalRemote + 1} participant{totalRemote !== 0 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Video / Participant grid ── */}
      <div style={{
        flex: 1,
        padding: 12,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 8,
        alignContent: 'start',
        position: 'relative',
      }}>
        {/* Remote participants */}
        {participantArray.map(([socketId, p]) => (
          <VideoTile
            key={socketId}
            videoStream={remoteVideoStreams.get(socketId) || null}
            name={p.name || 'Participant'}
            isSpeaking={speakingPeers.has(socketId)}
            isSelf={false}
            isMuted={false}
          />
        ))}

        {/* Self tile (only shown when no remote participants yet — otherwise use PIP) */}
        {totalRemote === 0 && (
          <VideoTile
            videoStream={localVideoStream}
            name={selfName}
            isSpeaking={isSelfSpeak}
            isSelf
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
          />
        )}
      </div>

      {/* Self PIP — shown when there are remote participants */}
      {totalRemote > 0 && (
        <SelfPIP
          videoStream={localVideoStream}
          name={selfName}
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
        />
      )}

      {/* ── Controls ── */}
      <div style={{
        padding: '16px 20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        borderTop: `1px solid rgba(255,255,255,0.06)`,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Mute */}
        <ControlBtn onClick={onToggleMute} active={isMuted} activeColor="#ef4444" label={isMuted ? 'UNMUTE' : 'MUTE'} text2={text2}>
          {isMuted ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
        </ControlBtn>

        {/* Camera toggle */}
        <ControlBtn onClick={onToggleVideo} active={!isVideoEnabled} activeColor="#374151" label={isVideoEnabled ? 'CAM OFF' : 'CAM ON'} text2={text2}>
          {isVideoEnabled ? <Video size={20} color="#fff" /> : <VideoOff size={20} color="#fff" />}
        </ControlBtn>

        {/* End call */}
        <ControlBtn onClick={onEnd} active activeColor="#ef4444" label="END" text2={text2} size={68} shadow="0 8px 24px rgba(239,68,68,0.5)">
          <PhoneOff size={26} color="#fff" />
        </ControlBtn>

        {/* Add participant */}
        <ControlBtn onClick={() => setShowAddPanel(p => !p)} active={showAddPanel} activeColor={ORG} label="ADD" text2={text2}>
          <UserPlus size={20} color="#fff" />
        </ControlBtn>
      </div>

      {/* ── Add-to-call panel (slide up) ── */}
      {showAddPanel && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: bg2,
          borderTop: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px 32px',
          maxHeight: '55vh', overflowY: 'auto',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ color: textC, fontSize: 14, fontWeight: 700, margin: 0 }}>Add to call</h3>
            <button onClick={() => setShowAddPanel(false)} style={{ background: 'none', border: 'none', color: text2, cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px', marginBottom: 12,
              background: bg3, border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 8, color: textC, fontSize: 13, outline: 'none',
            }}
          />

          {allAdmins.length === 0 ? (
            <p style={{ color: text3, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Loading admins...</p>
          ) : availableToAdd.length === 0 ? (
            <p style={{ color: text3, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
              {searchQuery.trim() ? 'No admins match your search' : 'Everyone is already in the call'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {availableToAdd.map((member) => {
                const id      = String(member.id || '');
                const type    = 'ADMIN';
                const name    = member.adminName || member.adminEmail || id;
                const initial = (name || '?').charAt(0).toUpperCase();
                // Real-time online map first, then DB isOnline as fallback
                const isOnline   = onlineUsers.has(id) || !!member.isOnline;
                const pendingKey = `${id}:${type}`;
                const pending    = pendingInvites.get(pendingKey);
                const countdown  = pending ? Math.max(0, 25 - Math.floor((Date.now() - pending.invitedAt) / 1000)) : null;

                return (
                  <div key={`${type}-${id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    background: bg3, borderRadius: 10,
                    opacity: pending ? 0.75 : 1,
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#1a5c78',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>
                        {initial}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: '50%',
                        background: isOnline ? '#22c55e' : '#6b7280',
                        border: `2px solid ${bg3}`,
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: textC, fontSize: 13, fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ fontSize: 10, color: pending ? ORG : (isOnline ? '#22c55e' : text3) }}>
                        {pending ? `Calling... ${countdown}s` : (isOnline ? 'Online' : 'Offline')}
                      </span>
                    </div>
                    {pending ? (
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(232,98,26,0.2)', border: `2px solid ${ORG}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: ORG, fontWeight: 700, flexShrink: 0,
                      }}>{countdown}</div>
                    ) : (
                      <button
                        onClick={() => onInvite?.(id, type, name)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: isOnline ? '#22c55e' : 'rgba(255,255,255,0.12)',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        title={isOnline ? 'Invite to call' : 'Send push notification'}
                      >
                        <Phone size={14} color="#fff" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

const ControlBtn = ({ onClick, active, activeColor, label, text2, size = 56, shadow, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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
    <span style={{ color: text2, fontSize: 10, letterSpacing: 0.8 }}>{label}</span>
  </div>
);

export default ActiveCallModal;
