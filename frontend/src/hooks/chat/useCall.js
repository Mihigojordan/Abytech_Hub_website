import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import useAdminAuth from '../../context/AdminAuthContext';
import { useWebRTC } from './useWebRTC';

/**
 * Call states:
 *   idle         — no call activity
 *   ringing-out  — we initiated, waiting for someone to answer
 *   ringing-in   — someone is calling us
 *   active       — call is live
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

  // Pending accept from service worker push notification
  const pendingSwAcceptRef = useRef(null);
  // 30-second no-answer timeout ref
  const noAnswerTimerRef = useRef(null);

  const webrtc = useWebRTC({
    socket,
    callId: callInfo?.callId,
    onSpeakingChange: setSpeakingPeers,
  });

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
    // Clear no-answer timer
    if (noAnswerTimerRef.current) {
      clearTimeout(noAnswerTimerRef.current);
      noAnswerTimerRef.current = null;
    }
    webrtc.cleanup();
    setCallState('idle');
    setCallInfo(null);
    setParticipants(new Map());
    setIsMuted(false);
    setSpeakingPeers(new Set());
  }, [stopRingtone, stopVibration, webrtc]);

  // ── Initiate a call ─────────────────────────────────────────────────────────
  const initiateCall = useCallback(async (conversationId) => {
    if (callState !== 'idle') return;
    try {
      await webrtc.getLocalStream();
      const callerName = admin?.adminName || admin?.name || 'Unknown';
      emit('call:initiate', { conversationId: String(conversationId), callType: 'audio', callerName });
      setCallState('ringing-out');
      playRingtone();

      // Auto-cancel after 30 seconds if nobody answers
      noAnswerTimerRef.current = setTimeout(() => {
        noAnswerTimerRef.current = null;
        // Only cancel if still ringing out (nobody answered yet)
        setCallState(prev => {
          if (prev === 'ringing-out') {
            // Emit end so server marks it missed and posts the call message
            emit('call:end', { callId: null }); // callId will be set by then via callInfo ref
            return prev; // resetCall handles the state
          }
          return prev;
        });
        // Use a ref-based approach to get the latest callId
        setCallInfo(prev => {
          if (prev?.callId) emit('call:end', { callId: prev.callId });
          return prev;
        });
        resetCall();
      }, 30000);
    } catch (err) {
      console.error('Failed to get mic:', err);
      alert('Could not access microphone. Please grant permission.');
      webrtc.cleanup();
    }
  }, [callState, webrtc, admin, emit, playRingtone, resetCall]);

  // ── Answer an incoming call ─────────────────────────────────────────────────
  const answerCall = useCallback(async () => {
    if (callState !== 'ringing-in' || !callInfo) return;
    stopRingtone();
    stopVibration();
    try {
      await webrtc.getLocalStream();
      emit('call:answer', { callId: callInfo.callId });
    } catch (err) {
      console.error('Failed to get mic:', err);
      alert('Could not access microphone.');
      resetCall();
    }
  }, [callState, callInfo, stopRingtone, stopVibration, webrtc, emit, resetCall]);

  // ── Decline an incoming call ────────────────────────────────────────────────
  const declineCall = useCallback(() => {
    if (!callInfo) return;
    stopRingtone();
    stopVibration();
    emit('call:decline', { callId: callInfo.callId });
    resetCall();
  }, [callInfo, stopRingtone, stopVibration, emit, resetCall]);

  // ── End / leave an active call ──────────────────────────────────────────────
  const endCall = useCallback(() => {
    if (callInfo) emit('call:end', { callId: callInfo.callId });
    resetCall();
  }, [callInfo, emit, resetCall]);

  // ── Toggle mute ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    webrtc.setMuted(next);
  }, [isMuted, webrtc]);

  // ── Invite someone mid-call ─────────────────────────────────────────────────
  const inviteToCall = useCallback((targetUserId, targetUserType) => {
    if (!callInfo?.callId) return;
    emit('call:invite', {
      callId: callInfo.callId,
      targetUserId,
      targetUserType,
    });
  }, [callInfo, emit]);

  // ── Socket event: call confirmed initiated ──────────────────────────────────
  useSocketEvent('call:initiated', (data) => {
    setCallInfo(prev => ({ ...prev, callId: data.callId, conversationId: data.conversationId }));
    // Host joins their own call immediately
    emit('call:answer', { callId: data.callId });
  });

  // ── Socket event: incoming call ─────────────────────────────────────────────
  useSocketEvent('call:incoming', (data) => {
    if (callState !== 'idle') return;
    setCallInfo({
      callId: data.callId,
      conversationId: data.conversationId,
      callerId: data.callerId,
      callerType: data.callerType,
      callerName: data.callerName,
      callType: data.callType,
    });
    setCallState('ringing-in');
    playRingtone();
    startVibration();

    // Auto-answer if push notification was tapped while app was closed
    if (pendingSwAcceptRef.current?.callId === data.callId) {
      pendingSwAcceptRef.current = null;
      setTimeout(() => answerCall(), 400);
    }
  });

  // ── Socket event: we joined — here are existing participants ────────────────
  useSocketEvent('call:joined', async (data) => {
    stopRingtone();
    stopVibration();
    // Someone answered — clear the no-answer timer
    if (noAnswerTimerRef.current) {
      clearTimeout(noAnswerTimerRef.current);
      noAnswerTimerRef.current = null;
    }
    setCallInfo(prev => ({ ...prev, ...data }));
    setCallState('active');

    // Seed participants map with existing members (with names from server)
    const initialMap = new Map();
    for (const p of (data.existingParticipants || [])) {
      initialMap.set(p.socketId, {
        userId: p.userId,
        userType: p.userType,
        name: p.name || p.userId,
      });
    }
    setParticipants(initialMap);

    // Create WebRTC offers to everyone already in the call
    for (const p of (data.existingParticipants || [])) {
      await webrtc.createOfferTo(p.socketId);
    }
  });

  // ── Socket event: someone else joined ──────────────────────────────────────
  useSocketEvent('call:participant-joined', (data) => {
    setParticipants(prev => {
      const next = new Map(prev);
      next.set(data.participantSocketId, {
        userId: data.userId,
        userType: data.userType,
        name: data.name || data.userId,   // name now comes from server
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

      // If no one is left in the call with us, end it automatically
      if (next.size === 0 && callState === 'active') {
        // Use setTimeout to avoid calling endCall inside a state updater
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

  // ── Service worker messages (push notification Accept/Decline) ──────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (e) => {
      const { type, callId } = e.data || {};
      if (type === 'ACCEPT_CALL') {
        if (callState === 'ringing-in' && callInfo?.callId === callId) {
          answerCall();
        } else {
          pendingSwAcceptRef.current = { callId };
        }
      }
      if (type === 'DECLINE_CALL') {
        if (callInfo?.callId === callId) declineCall();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [callState, callInfo, answerCall, declineCall]);

  return {
    callState,
    callInfo,
    participants,
    isMuted,
    speakingPeers,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    inviteToCall,
  };
}
