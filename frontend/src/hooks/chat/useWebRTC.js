import { useRef, useCallback, useEffect } from 'react';

// Lazily creates a single off-screen container for all remote <audio> elements.
// Off-screen (not display:none) prevents Android Chrome from leaking media
// pipeline rendering artifacts through the page layout.
const getAudioContainer = () => {
  let el = document.getElementById('__webrtc_audio_sink__');
  if (!el) {
    el = document.createElement('div');
    el.id = '__webrtc_audio_sink__';
    el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;pointer-events:none;';
    document.body.appendChild(el);
  }
  return el;
};

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
  const peersRef = useRef(new Map());               // socketId → RTCPeerConnection
  const localStreamRef = useRef(null);
  const remoteAudiosRef = useRef(new Map());        // socketId → HTMLAudioElement
  const audioCtxRef = useRef(null);
  const analysersRef = useRef(new Map());           // 'self' | socketId → AnalyserNode
  const speakingRef = useRef(new Set());
  const rafRef = useRef(null);
  // ICE candidates that arrive before setRemoteDescription completes are queued here
  const pendingCandidatesRef = useRef(new Map());  // socketId → RTCIceCandidateInit[]

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
      // Fallback: Firefox sometimes delivers an empty streams array
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      let audio = remoteAudiosRef.current.get(remoteSocketId);
      if (!audio) {
        audio = document.createElement('audio');
        // Use off-screen positioning instead of display:none — on Android Chrome,
        // display:none on a live MediaStream element causes rendering glitches where
        // the media pipeline bleeds through the page layout.
        audio.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
        getAudioContainer().appendChild(audio);
        remoteAudiosRef.current.set(remoteSocketId, audio);
      }
      audio.srcObject = stream;
      audio.play().catch(err => console.warn('Remote audio play blocked:', err));
      attachAnalyser(remoteSocketId, stream);
      startSpeakingDetection();
    };

    pc.onconnectionstatechange = () => {
      // 'disconnected' is transient (wifi blip) — browser can self-recover.
      // Only remove on terminal states.
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
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
    pendingCandidatesRef.current.delete(socketId);
  }, []);

  // ── Drain queued ICE candidates after setRemoteDescription completes ────────
  const drainPendingCandidates = useCallback(async (socketId) => {
    const pc = peersRef.current.get(socketId);
    const queue = pendingCandidatesRef.current.get(socketId);
    if (!pc || !queue?.length) return;
    pendingCandidatesRef.current.delete(socketId);
    for (const candidate of queue) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (e) { console.error('ICE error (queued):', e); }
    }
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
    await drainPendingCandidates(callerSocketId);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('call:answer-sdp', { targetSocketId: callerSocketId, answer, callId });
  }, [createPeerConnection, drainPendingCandidates, socket, callId]);

  // ── Handle incoming answer ──────────────────────────────────────────────────
  const handleAnswer = useCallback(async ({ answererSocketId, answer }) => {
    const pc = peersRef.current.get(answererSocketId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await drainPendingCandidates(answererSocketId);
    }
  }, [drainPendingCandidates]);

  // ── Handle ICE candidate ────────────────────────────────────────────────────
  // If the remote description isn't set yet (setRemoteDescription still in progress),
  // queue the candidate and apply it once the description is ready. This mirrors
  // what PeerJS does internally and is the fix for "connected but no audio."
  const addIceCandidate = useCallback(async ({ senderSocketId, candidate }) => {
    const pc = peersRef.current.get(senderSocketId);
    if (!pc || !candidate) return;
    if (!pc.remoteDescription) {
      const q = pendingCandidatesRef.current.get(senderSocketId) || [];
      q.push(candidate);
      pendingCandidatesRef.current.set(senderSocketId, q);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
    catch (e) { console.error('ICE error:', e); }
  }, []);

  // ── Get local mic stream ────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
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

  // ── Cleanup peers only (keep local stream) — used for seamless call rejoin ──
  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();
    remoteAudiosRef.current.forEach(audio => { audio.srcObject = null; audio.remove(); });
    remoteAudiosRef.current.clear();
    // Remove all analysers except 'self' (local stream stays connected)
    analysersRef.current.forEach((_, id) => {
      if (id !== 'self') analysersRef.current.delete(id);
    });
  }, []);

  // ── Full cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopSpeakingDetection();
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();
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
    cleanupPeers,
    cleanup,
  };
}
