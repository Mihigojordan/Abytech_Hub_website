import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import useAdminAuth from '../../context/AdminAuthContext';
import { useWebRTC } from './useWebRTC';
import adminAuthService from '../../services/adminAuthService';

/**
 * Call states:
 *   idle       — no call activity
 *   ringing-in — someone is calling us (incoming call banner)
 *   active     — call is live (initiator enters this immediately on call start)
 */

export function useCall() {
  const { socket, emit } = useSocket();
  const { user: admin } = useAdminAuth();

  const [callState, setCallState] = useState('idle');
  const [callInfo, setCallInfo] = useState(null);
  // participants: Map<socketId, { userId, userType, name }>
  const [participants, setParticipants] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [speakingPeers, setSpeakingPeers] = useState(new Set());
  // All admins for the add-to-call panel (fetched once on mount)
  const [allAdmins, setAllAdmins] = useState([]);
  // Toast shown when someone calls while we're already in a call
  const [busyCallToast, setBusyCallToast] = useState(null);
  // Online users — tracked here so ActiveCallModal can show who's online
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId → { userType }
  // Pending invites — Map<"userId:userType", { name, invitedAt, timerId }>
  const [pendingInvites, setPendingInvites] = useState(new Map());
  // Video state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState(new Map()); // socketId → MediaStream

  const onRemoteVideoStream = useCallback((socketId, stream) => {
    setRemoteVideoStreams(prev => {
      const next = new Map(prev);
      if (stream) next.set(socketId, stream);
      else next.delete(socketId);
      return next;
    });
  }, []);

  // Called by useWebRTC when the camera track is force-stopped by the OS/browser
  const onVideoTrackEnded = useCallback(() => {
    setIsVideoEnabled(false);
    setLocalVideoStream(null);
  }, []);

  // Pending accept from service worker push notification
  const pendingSwAcceptRef = useRef(null);
  // Refs to always have latest values in async callbacks
  const callInfoRef = useRef(null);
  const callStateRef = useRef('idle');
  useEffect(() => { callInfoRef.current = callInfo; }, [callInfo]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const webrtc = useWebRTC({
    socket,
    callId: callInfo?.callId,
    onSpeakingChange: setSpeakingPeers,
    onRemoteVideoStream,
    onVideoTrackEnded,
  });

  // ── Fetch all admins for the add-to-call panel ─────────────────────────────
  const fetchAllAdmins = useCallback(async () => {
    try {
      const admins = await adminAuthService.getAllAdmins();
      if (admins) setAllAdmins(admins);
    } catch { /* non-critical */ }
  }, []);

  // ── Ringtone via AudioContext oscillator ────────────────────────────────────
  const ringtoneRef = useRef(null);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current.interval);
      try { ringtoneRef.current.ctx.close(); } catch (e) {}
      ringtoneRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    stopRingtone();
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.25;
      osc.start();
      let on = true;
      const interval = setInterval(() => {
        if (!ringtoneRef.current) { clearInterval(interval); return; }
        gain.gain.setValueAtTime(on ? 0.25 : 0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(on ? 0.01 : 0.25, ctx.currentTime + 0.5);
        on = !on;
      }, 1000);
      ringtoneRef.current = { ctx, interval };
    } catch (e) { /* AudioContext blocked — ignore */ }
  }, [stopRingtone]);

  // ── Vibration ───────────────────────────────────────────────────────────────
  const vibIntervalRef = useRef(null);
  const startVibration = useCallback(() => {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate([500, 500]);
    vibIntervalRef.current = setInterval(() => navigator.vibrate([500, 500]), 1000);
  }, []);
  const stopVibration = useCallback(() => {
    if (vibIntervalRef.current) { clearInterval(vibIntervalRef.current); vibIntervalRef.current = null; }
    if ('vibrate' in navigator) navigator.vibrate(0);
  }, []);

  // ── Full reset ──────────────────────────────────────────────────────────────
  const resetCall = useCallback(() => {
    stopRingtone();
    stopVibration();
    // Clear all pending invite timers
    setPendingInvites(prev => {
      prev.forEach(invite => clearTimeout(invite.timerId));
      return new Map();
    });
    webrtc.cleanup();
    setCallState('idle');
    setCallInfo(null);
    setParticipants(new Map());
    setIsMuted(false);
    setSpeakingPeers(new Set());
    setIsVideoEnabled(false);
    setLocalVideoStream(null);
    setRemoteVideoStreams(new Map());
  }, [stopRingtone, stopVibration, webrtc]);

  // ── Initiate a call ─────────────────────────────────────────────────────────
  const initiateCall = useCallback(async (conversationId) => {
    if (callState !== 'idle') return;
    try {
      await webrtc.getLocalStream();
      const callerName = admin?.adminName || admin?.name || 'Unknown';
      // Go straight to active — the caller is in the call immediately.
      // Others who accept will join them; no "waiting" screen is shown.
      setCallInfo({ callerName, conversationId: String(conversationId) });
      setCallState('active');
      emit('call:initiate', { conversationId: String(conversationId), callType: 'audio', callerName });
    } catch (err) {
      console.error('Failed to get mic:', err);
      alert('Could not access microphone. Please grant permission.');
      webrtc.cleanup();
    }
  }, [callState, webrtc, admin, emit]);

  // ── Answer an incoming call ─────────────────────────────────────────────────
  const answerCall = useCallback(async () => {
    // Use ref so this works even when called from SW message handler on fresh load
    const info = callInfoRef.current;
    if (!info?.callId) return;
    stopRingtone();
    stopVibration();
    try {
      await webrtc.getLocalStream();
      emit('call:answer', { callId: info.callId }, (response) => {
        if (response && !response.success) {
          // Call no longer exists (ended before we could join)
          webrtc.cleanup();
          resetCall();
        }
      });
    } catch (err) {
      console.error('Failed to get mic:', err);
      alert('Could not access microphone.');
      resetCall();
    }
  }, [stopRingtone, stopVibration, webrtc, emit, resetCall]);

  // ── Decline an incoming call ────────────────────────────────────────────────
  const declineCall = useCallback(() => {
    const info = callInfoRef.current;
    if (!info?.callId) return;
    stopRingtone();
    stopVibration();
    emit('call:decline', { callId: info.callId });
    resetCall();
  }, [stopRingtone, stopVibration, emit, resetCall]);

  // ── End / leave an active call ──────────────────────────────────────────────
  const endCall = useCallback(() => {
    const info = callInfoRef.current;
    if (info?.callId) emit('call:end', { callId: info.callId });
    resetCall();
  }, [emit, resetCall]);

  // ── Toggle mute ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    webrtc.setMuted(next);
  }, [isMuted, webrtc]);

  // ── Toggle camera ────────────────────────────────────────────────────────────
  const toggleVideo = useCallback(async () => {
    if (isVideoEnabled) {
      webrtc.disableVideo();
      setIsVideoEnabled(false);
      setLocalVideoStream(null);
    } else {
      try {
        const stream = await webrtc.enableVideo();
        setIsVideoEnabled(true);
        setLocalVideoStream(stream);
      } catch (err) {
        console.error('Camera access failed:', err);
        alert('Could not access camera. Please grant camera permission.');
      }
    }
  }, [isVideoEnabled, webrtc]);

  // ── Invite someone mid-call ─────────────────────────────────────────────────
  const inviteToCall = useCallback((targetUserId, targetUserType, targetName = '') => {
    const info = callInfoRef.current;
    if (!info?.callId) return;
    emit('call:invite', { callId: info.callId, targetUserId, targetUserType });

    // Track the invite with a 25-second timeout
    const key = `${targetUserId}:${targetUserType}`;
    const timerId = setTimeout(() => {
      setPendingInvites(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    }, 25000);
    setPendingInvites(prev => {
      const next = new Map(prev);
      next.set(key, { name: targetName || targetUserId, invitedAt: Date.now(), timerId });
      return next;
    });
  }, [emit]);

  // ── Join an active call directly from a ringing call message bubble ─────────
  // Called when a user clicks "Join call" on a ringing message in chat.
  // Unlike answerCall() which requires call:incoming to have fired first,
  // this works on any active callId (e.g. joining from history after a page reload).
  const joinCallDirectly = useCallback(async (callId, conversationId) => {
    if (callState !== 'idle') {
      alert('You are already in a call.');
      return;
    }
    try {
      await webrtc.getLocalStream();
      setCallInfo({ callId, conversationId });
      emit('call:answer', { callId }, (response) => {
        if (response && !response.success) {
          webrtc.cleanup();
          setCallState('idle');
          setCallInfo(null);
          alert('This call has already ended.');
        }
      });
    } catch (err) {
      console.error('Failed to get mic:', err);
      alert('Could not access microphone. Please grant permission.');
      webrtc.cleanup();
    }
  }, [callState, webrtc, emit]);

  // ── Socket event: call confirmed initiated ──────────────────────────────────
  useSocketEvent('call:initiated', (data) => {
    // Merge in callId only — callerName and conversationId already set in initiateCall
    setCallInfo(prev => ({ ...prev, callId: data.callId }));
    // Host joins their own call immediately
    emit('call:answer', { callId: data.callId });
  });

  // ── Socket event: incoming call ─────────────────────────────────────────────
  useSocketEvent('call:incoming', (data) => {
    // Allow receiving even if we have a pending SW accept (fresh page load scenario)
    if (callState !== 'idle' && !pendingSwAcceptRef.current) {
      // Show a toast — user is already in / handling a call
      setBusyCallToast({ callerName: data.callerName, callId: data.callId });
      setTimeout(() => setBusyCallToast(null), 6000);
      return;
    }

    const info = {
      callId: data.callId,
      conversationId: data.conversationId,
      callerId: data.callerId,
      callerType: data.callerType,
      callerName: data.callerName,
      callType: data.callType,
    };
    setCallInfo(info);
    setCallState('ringing-in');
    playRingtone();
    startVibration();

    // Auto-answer if push notification was tapped (pendingSwAccept set before socket connected)
    if (pendingSwAcceptRef.current?.callId === data.callId) {
      pendingSwAcceptRef.current = null;
      setTimeout(() => answerCall(), 400);
    }
  });

  // ── Socket event: rejoin needed (socket reconnected mid-call, or page refreshed) ──
  useSocketEvent('call:rejoin-needed', async (data) => {
    if (callStateRef.current === 'active') {
      // Seamless rejoin — don't interrupt the UI, just re-establish WebRTC
      webrtc.cleanupPeers();
      // Re-answer to get a fresh call:joined with current participant socket IDs
      emit('call:answer', { callId: data.callId });
    } else {
      // Page was refreshed — show the call as incoming so the user can rejoin
      const info = {
        callId: data.callId,
        conversationId: data.conversationId,
        callerName: data.callerName,
        callType: data.callType,
        isRejoin: true,
      };
      setCallInfo(info);
      setCallState('ringing-in');
      playRingtone();
      startVibration();
    }
  });

  // ── Socket event: we joined — here are existing participants ────────────────
  useSocketEvent('call:joined', async (data) => {
    stopRingtone();
    stopVibration();
    setCallInfo(prev => ({ ...prev, ...data }));
    setCallState('active');

    const initialMap = new Map();
    for (const p of (data.existingParticipants || [])) {
      initialMap.set(p.socketId, {
        userId: p.userId,
        userType: p.userType,
        name: p.name || p.userId,
      });
    }
    setParticipants(initialMap);

    for (const p of (data.existingParticipants || [])) {
      await webrtc.createOfferTo(p.socketId);
    }
  });

  // ── Socket event: someone else joined ──────────────────────────────────────
  useSocketEvent('call:participant-joined', (data) => {
    // Clear any pending invite for this person
    const inviteKey = `${data.userId}:${data.userType}`;
    setPendingInvites(prev => {
      const invite = prev.get(inviteKey);
      if (invite) clearTimeout(invite.timerId);
      const next = new Map(prev);
      next.delete(inviteKey);
      return next;
    });
    setParticipants(prev => {
      const next = new Map(prev);
      next.set(data.participantSocketId, {
        userId: data.userId,
        userType: data.userType,
        name: data.name || data.userId,
      });
      return next;
    });
  });

  // ── Socket event: someone left ──────────────────────────────────────────────
  useSocketEvent('call:participant-left', (data) => {
    webrtc.removePeer(data.participantSocketId);
    setParticipants(prev => {
      const next = new Map(prev);
      next.delete(data.participantSocketId);
      if (next.size === 0) {
        // We are now alone — tell the backend to close the call so any pending
        // invitees cannot join a ghost call. endCall() emits call:end which
        // triggers the backend cleanup and call:cancelled broadcast to invitees.
        setTimeout(() => endCall(), 0);
      }
      return next;
    });
  });

  // ── Socket event: our call was declined ────────────────────────────────────
  useSocketEvent('call:declined', () => {
    stopRingtone();
    resetCall();
  });

  // ── Socket event: call ended while we hadn't joined yet ───────────────────
  // Fires when the last active participant leaves while we still have an
  // incoming call modal open (we were invited but never accepted).
  useSocketEvent('call:cancelled', () => {
    if (callStateRef.current === 'ringing-in') {
      stopRingtone();
      stopVibration();
      resetCall();
    }
  });

  // ── WebRTC signaling relay ──────────────────────────────────────────────────
  useSocketEvent('call:offer', (data) => {
    webrtc.handleOffer({ callerSocketId: data.callerSocketId, offer: data.offer });
  });

  useSocketEvent('call:answer-sdp', (data) => {
    webrtc.handleAnswer({ answererSocketId: data.answererSocketId, answer: data.answer });
  });

  useSocketEvent('call:ice-candidate', (data) => {
    webrtc.addIceCandidate({ senderSocketId: data.senderSocketId, candidate: data.candidate });
  });

  // ── Load all admins once on mount for the add-to-call panel ────────────────
  useEffect(() => { fetchAllAdmins(); }, [fetchAllAdmins]);

  // ── Handle ?call=<callId> URL param on fresh page load ─────────────────────
  // When the user opens the app from a push notification, the URL contains
  // ?call=<callId>. We store it as a pending accept so when call:incoming
  // fires (after socket connects), we auto-answer.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callIdFromUrl = params.get('call');
    if (callIdFromUrl) {
      pendingSwAcceptRef.current = { callId: callIdFromUrl };
      // Clean the URL so it doesn't re-trigger on navigation
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // ── Service worker messages (push notification Accept/Decline) ──────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (e) => {
      const { type, callId } = e.data || {};
      if (type === 'ACCEPT_CALL') {
        const currentInfo = callInfoRef.current;
        if (currentInfo?.callId === callId) {
          // Call is already ringing — answer immediately
          answerCall();
        } else {
          // Page just opened — store pending accept, call:incoming will trigger it
          pendingSwAcceptRef.current = { callId };
        }
      }
      if (type === 'DECLINE_CALL') {
        const currentInfo = callInfoRef.current;
        if (currentInfo?.callId === callId) declineCall();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [answerCall, declineCall]);

  // ── Online users — track who's online so ActiveCallModal can show status ────
  useSocketEvent('online:users', (data) => {
    setOnlineUsers(new Map((data.users || []).map(u => [u.userId, { userType: u.userType }])));
  });

  useSocketEvent('user:status', (data) => {
    const { userId, userType, status } = data;
    setOnlineUsers(prev => {
      const next = new Map(prev);
      if (status === 'online') next.set(userId, { userType });
      else next.delete(userId);
      return next;
    });
  });

  // ── Socket reconnect watchdog ────────────────────────────────────────────────
  // When the socket reconnects, the backend will send call:rejoin-needed if the call
  // still exists. If it doesn't send anything within 5 seconds (e.g. server restarted
  // and lost all call state), we clean up so the UI doesn't hang in active/ringing state.
  useEffect(() => {
    if (!socket) return;
    let watchdogTimer = null;

    const handleConnect = () => {
      if (callStateRef.current === 'idle') return;
      watchdogTimer = setTimeout(() => {
        // Still in a call state 5s after reconnect with no rejoin event — assume call is gone
        if (callStateRef.current !== 'idle') {
          resetCall();
        }
      }, 5000);
    };

    // Cancel the watchdog if we receive a rejoin or any call state transition
    const cancelWatchdog = () => {
      if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
    };

    socket.on('connect', handleConnect);
    socket.on('call:rejoin-needed', cancelWatchdog);
    socket.on('call:joined', cancelWatchdog);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('call:rejoin-needed', cancelWatchdog);
      socket.off('call:joined', cancelWatchdog);
      if (watchdogTimer) clearTimeout(watchdogTimer);
    };
  }, [socket, resetCall]);

  return {
    callState,
    callInfo,
    participants,
    allAdmins,
    isMuted,
    speakingPeers,
    busyCallToast,
    onlineUsers,
    pendingInvites,
    isVideoEnabled,
    localVideoStream,
    remoteVideoStreams,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    inviteToCall,
    joinCallDirectly,
  };
}
