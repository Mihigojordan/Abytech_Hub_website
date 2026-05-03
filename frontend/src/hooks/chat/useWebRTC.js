import { useRef, useCallback, useEffect } from 'react';

/**
 * ICE servers — Google STUN (free, no account) + OpenRelay public TURN (no account, no keys).
 * OpenRelay is a community TURN server maintained by Metered — the public credentials
 * below are intentionally public and require no sign-up.
 */
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

/**
 * useWebRTC — manages the WebRTC mesh for audio calls.
 *
 * Exposes:
 *   peers            Map<socketId, RTCPeerConnection>
 *   localStreamRef   ref to the local MediaStream
 *   remoteAudios     Map<socketId, HTMLAudioElement>
 *   analysers        Map<id, AnalyserNode>  ('self' + socketId per peer)
 *   speakingRef      ref to Set<id> of currently speaking participants
 *   createOfferTo    (socketId) → creates PC + offer → emits call:offer
 *   handleOffer      (data)     → creates PC + answer → emits call:answer-sdp
 *   handleAnswer     (data)     → sets remote description
 *   addIceCandidate  (socketId, candidate)
 *   cleanup          ()         → closes everything
 */
export function useWebRTC({ socket, callId, onSpeakingChange }) {
  const peersRef = useRef(new Map());          // socketId → RTCPeerConnection
  const localStreamRef = useRef(null);
  const remoteAudiosRef = useRef(new Map());   // socketId → HTMLAudioElement
  const audioCtxRef = useRef(null);
  const analysersRef = useRef(new Map());      // 'self' | socketId → AnalyserNode
  const speakingRef = useRef(new Set());
  const rafRef = useRef(null);

  // ── AudioContext helpers ────────────────────────────────────────────────────
  const ensureAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const attachAnalyser = useCallback((id, stream) => {
    const ctx = ensureAudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);
    // Do NOT connect to destination — avoids echo
    analysersRef.current.set(id, analyser);
  }, [ensureAudioCtx]);

  // ── Speaking detection RAF loop ─────────────────────────────────────────────
  const startSpeakingDetection = useCallback(() => {
    if (rafRef.current) return;
    const data = new Uint8Array(512);
    const THRESHOLD = 18;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const nowSpeaking = new Set();
      analysersRef.current.forEach((analyser, id) => {
        analyser.getByteFrequencyData(data);
        const bins = Math.floor(analyser.frequencyBinCount / 4);
        let sum = 0;
        for (let i = 0; i < bins; i++) sum += data[i];
        if (sum / bins > THRESHOLD) nowSpeaking.add(id);
      });
      // Only call back if the set changed
      const prev = speakingRef.current;
      const changed =
        nowSpeaking.size !== prev.size ||
        [...nowSpeaking].some(id => !prev.has(id));
      if (changed) {
        speakingRef.current = nowSpeaking;
        onSpeakingChange?.(new Set(nowSpeaking));
      }
    };
    tick();
  }, [onSpeakingChange]);

  const stopSpeakingDetection = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    analysersRef.current.clear();
    speakingRef.current = new Set();
  }, []);

  // ── Create RTCPeerConnection ────────────────────────────────────────────────
  const createPeerConnection = useCallback((remoteSocketId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    // ICE candidates → relay via server
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('call:ice-candidate', {
          targetSocketId: remoteSocketId,
          candidate: e.candidate,
          callId,
        });
      }
    };

    // Remote audio track
    pc.ontrack = (e) => {
      let audio = remoteAudiosRef.current.get(remoteSocketId);
      if (!audio) {
        audio = document.createElement('audio');
        audio.autoplay = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        remoteAudiosRef.current.set(remoteSocketId, audio);
      }
      audio.srcObject = e.streams[0];
      attachAnalyser(remoteSocketId, e.streams[0]);
      startSpeakingDetection();
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'closed'
      ) {
        removePeer(remoteSocketId);
      }
    };

    peersRef.current.set(remoteSocketId, pc);
    return pc;
  }, [socket, callId, attachAnalyser, startSpeakingDetection]);

  // ── Remove a peer ───────────────────────────────────────────────────────────
  const removePeer = useCallback((socketId) => {
    const pc = peersRef.current.get(socketId);
    if (pc) { pc.close(); peersRef.current.delete(socketId); }
    const audio = remoteAudiosRef.current.get(socketId);
    if (audio) { audio.srcObject = null; audio.remove(); remoteAudiosRef.current.delete(socketId); }
    analysersRef.current.delete(socketId);
  }, []);

  // ── Create offer (we initiate to an existing participant) ───────────────────
  const createOfferTo = useCallback(async (remoteSocketId) => {
    const pc = createPeerConnection(remoteSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('call:offer', { targetSocketId: remoteSocketId, offer, callId });
  }, [createPeerConnection, socket, callId]);

  // ── Handle incoming offer (they initiated to us) ────────────────────────────
  const handleOffer = useCallback(async ({ callerSocketId, offer }) => {
    const pc = createPeerConnection(callerSocketId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('call:answer-sdp', { targetSocketId: callerSocketId, answer, callId });
  }, [createPeerConnection, socket, callId]);

  // ── Handle incoming answer ──────────────────────────────────────────────────
  const handleAnswer = useCallback(async ({ answererSocketId, answer }) => {
    const pc = peersRef.current.get(answererSocketId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  // ── Handle ICE candidate ────────────────────────────────────────────────────
  const addIceCandidate = useCallback(async ({ senderSocketId, candidate }) => {
    const pc = peersRef.current.get(senderSocketId);
    if (pc && candidate) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.error('ICE error:', e); }
    }
  }, []);

  // ── Get local mic stream ────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    attachAnalyser('self', stream);
    startSpeakingDetection();
    return stream;
  }, [attachAnalyser, startSpeakingDetection]);

  // ── Mute / unmute ───────────────────────────────────────────────────────────
  const setMuted = useCallback((muted) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !muted; });
    }
  }, []);

  // ── Full cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopSpeakingDetection();
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    remoteAudiosRef.current.forEach(audio => { audio.srcObject = null; audio.remove(); });
    remoteAudiosRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, [stopSpeakingDetection]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  return {
    peersRef,
    localStreamRef,
    remoteAudiosRef,
    analysersRef,
    speakingRef,
    getLocalStream,
    createOfferTo,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    removePeer,
    setMuted,
    cleanup,
  };
}
