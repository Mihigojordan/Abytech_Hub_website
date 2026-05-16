// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { Outlet, useSearchParams } from 'react-router-dom';
import useAdminAuth from '../context/AdminAuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';
import { useDashboardTheme } from '../utils/dashboardTheme';
import { CallProvider, useCallContext } from '../context/CallContext';
import IncomingCallModal from '../components/dashboard/chat/ui/IncomingCallModal';
import ActiveCallModal from '../components/dashboard/chat/ui/ActiveCallModal';
import CallingOutModal from '../components/dashboard/chat/ui/CallingOutModal';

export type RoleType = 'admin';

export interface Roles {
  role: RoleType;
}

// ── Inner layout — has access to CallContext ──────────────────────────────────
const DashboardInner = ({ role, isOpen, onToggle }) => {
  const { bg } = useDashboardTheme();
  const {
    callState,
    callInfo,
    participants: callParticipants,
    conversationMembers,
    isMuted,
    speakingPeers,
    busyCallToast,
    onlineUsers,
    pendingInvites,
    isVideoEnabled,
    localVideoStream,
    remoteVideoStreams,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    inviteToCall,
  } = useCallContext();

  return (
    <div className="flex h-screen" style={{ background: bg }}>
      <Sidebar onToggle={onToggle} role={role} isOpen={isOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggle={onToggle} role={role} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ role }} />
        </main>
      </div>

      {/* ── Outgoing call overlay — waiting for someone to answer ── */}
      {callState === 'ringing-out' && callInfo && (
        <CallingOutModal
          callInfo={callInfo}
          onCancel={endCall}
        />
      )}

      {/* ── Incoming / Rejoin call overlay — visible on any dashboard page ── */}
      {callState === 'ringing-in' && callInfo && (
        <IncomingCallModal
          callInfo={callInfo}
          onAnswer={answerCall}
          onDecline={declineCall}
        />
      )}

      {/* ── Busy-call toast — someone called while already in/handling a call ── */}
      {busyCallToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
          background: '#1B2C3D', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.2s ease-out',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(232,98,26,0.2)', border: '1px solid rgba(232,98,26,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            📞
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>
              {busyCallToast.callerName} is calling
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '2px 0 0' }}>
              You are already in a call
            </p>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* ── Active call overlay — visible on any dashboard page ── */}
      {callState === 'active' && callInfo && (
        <ActiveCallModal
          callInfo={callInfo}
          participants={callParticipants}
          isMuted={isMuted}
          speakingPeers={speakingPeers}
          conversationMembers={conversationMembers}
          onlineUsers={onlineUsers}
          pendingInvites={pendingInvites}
          isVideoEnabled={isVideoEnabled}
          localVideoStream={localVideoStream}
          remoteVideoStreams={remoteVideoStreams}
          onEnd={endCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onInvite={inviteToCall}
        />
      )}
    </div>
  );
};

// ── Outer layout — provides CallContext + registers user online ───────────────
const DashboardLayout = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAdminAuth();
  const { setRecipient } = useNotifications();
  const { socket, isConnected, emit, emitUserOnline } = useSocket();

  const isAdminRegistered = useRef(false);
  const isOnlineEmitted = useRef(false);

  const onToggle = () => setIsOpen(!isOpen);

  // Register with the global socket gateway (for notifications etc.)
  useEffect(() => {
    if (user?.id && isConnected && !isAdminRegistered.current) {
      emit('registerUser', { id: user.id, type: 'ADMIN' });
      isAdminRegistered.current = true;
    }
  }, [user?.id, isConnected, emit, socket]);

  // Emit user:online for the chat gateway — done here so the user is
  // considered online across the whole dashboard, not just the chat page
  useEffect(() => {
    if (user?.id && isConnected && !isOnlineEmitted.current) {
      emitUserOnline(user.id, 'ADMIN');
      isOnlineEmitted.current = true;
    }
  }, [user?.id, isConnected, emitUserOnline]);

  // Reset flags on disconnect so they re-fire on reconnect
  useEffect(() => {
    if (!isConnected) {
      isAdminRegistered.current = false;
      isOnlineEmitted.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    if (user?.id) {
      setRecipient(user.id, 'ADMIN');
    }
  }, [user?.id]);

  return (
    <CallProvider>
      <DashboardInner role={role} isOpen={isOpen} onToggle={onToggle} />
    </CallProvider>
  );
};

export default DashboardLayout;
