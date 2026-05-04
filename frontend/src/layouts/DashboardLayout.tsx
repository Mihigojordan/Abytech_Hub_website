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
    answerCall,
    declineCall,
    endCall,
    toggleMute,
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

      {/* ── Incoming call overlay — visible on any dashboard page ── */}
      {callState === 'ringing-in' && callInfo && (
        <IncomingCallModal
          callInfo={callInfo}
          onAnswer={answerCall}
          onDecline={declineCall}
        />
      )}

      {/* ── Active call overlay — visible on any dashboard page ── */}
      {callState === 'active' && callInfo && (
        <ActiveCallModal
          callInfo={callInfo}
          participants={callParticipants}
          isMuted={isMuted}
          speakingPeers={speakingPeers}
          conversationMembers={conversationMembers}
          onEnd={endCall}
          onToggleMute={toggleMute}
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
