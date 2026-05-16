import { useRef, useCallback, useEffect } from 'react';

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

export function useWebRTC({ socket, callId, onSpeakingChange, onRemoteVideoStream }) {
  const peersRef              = useRef(new Map()); // socketId → RTCPeerConnection
  const localStreamRef        = useRef(null);      // mic-only MediaStream
  const localVideoStreamRef   = useRef(null);      // camera MediaStream (null when off)
  const remoteAudiosRef       = useRef(new Map()); // socketId → HTMLAudioElement
  const remoteVideoStreamsRef = useRef(new Map()); // socketId → MediaStream (video)
  const audioCtxRef           = useRef(null);
  const analysersRef          = useRef(new Map()); // 'self' | socketId → AnalyserNode
  const speakingRef           = useRef(new Set());
  const rafRef                = useRef(null);
  const pendingCandidatesRef  = useRef(new Map()); // socketId → RTCIceCandidateInit[]

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
    analysersRef.current.set(id, analyser);
  }, [ensureAudioCtx]);

  // ── Speaking detection ──────────────────────────────────────────────────────
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
      const prev = speakingRef.current;
      const changed = nowSpeaking.size !== prev.size || [...nowSpeaking].some(id => !prev.has(id));
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

    // Add local audio tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    // Add local video tracks if camera is already on
    if (localVideoStreamRef.current) {
      localVideoStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localVideoStreamRef.current)
      );
    }

    // Auto-renegotiate when a video track is added mid-call.
    // Guard: only fire after the initial handshake (currentRemoteDescription is set).
    let isNegotiating = false;
    pc.onnegotiationneeded = async () => {
      if (!pc.currentRemoteDescription || isNegotiating) return;
      if (pc.signalingState !== 'stable') return;
      isNegotiating = true;
      try {
        const offer = await pc.createOffer();
        if (pc.signalingState !== 'stable') return;
        await pc.setLocalDescription(offer);
        socket?.emit('call:offer', { targetSocketId: remoteSocketId, offer, callId });
      } catch (e) {
        console.error('Renegotiation error:', e);
      } finally {
        isNegotiating = false;
      }
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('call:ice-candidate', { targetSocketId: remoteSocketId, candidate: e.candidate, callId });
      }
    };

    // Incoming tracks — handle audio and video separately
    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);

      if (e.track.kind === 'audio') {
        let audio = remoteAudiosRef.current.get(remoteSocketId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
          getAudioContainer().appendChild(audio);
          remoteAudiosRef.current.set(remoteSocketId, audio);
        }
        audio.srcObject = stream;
        audio.play().catch(err => console.warn('Remote audio play blocked:', err));
        attachAnalyser(remoteSocketId, stream);
        startSpeakingDetection();
      } else if (e.track.kind === 'video') {
        remoteVideoStreamsRef.current.set(remoteSocketId, stream);
        onRemoteVideoStream?.(remoteSocketId, stream);

        // When the remote turns their camera off (replaceTrack(null) → track mutes)
        e.track.onmute = () => {
          onRemoteVideoStream?.(remoteSocketId, null);
        };
        e.track.onunmute = () => {
          onRemoteVideoStream?.(remoteSocketId, stream);
        };
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(remoteSocketId);
      }
    };

    peersRef.current.set(remoteSocketId, pc);
    return pc;
  }, [socket, callId, attachAnalyser, startSpeakingDetection, onRemoteVideoStream]);

  // ── Remove a peer ───────────────────────────────────────────────────────────
  const removePeer = useCallback((socketId) => {
    const pc = peersRef.current.get(socketId);
    if (pc) { pc.close(); peersRef.current.delete(socketId); }
    const audio = remoteAudiosRef.current.get(socketId);
    if (audio) { audio.srcObject = null; audio.remove(); remoteAudiosRef.current.delete(socketId); }
    analysersRef.current.delete(socketId);
    pendingCandidatesRef.current.delete(socketId);
    remoteVideoStreamsRef.current.delete(socketId);
    onRemoteVideoStream?.(socketId, null);
  }, [onRemoteVideoStream]);

  // ── Drain queued ICE candidates ─────────────────────────────────────────────
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

  // ── Create offer ────────────────────────────────────────────────────────────
  const createOfferTo = useCallback(async (remoteSocketId) => {
    const pc = createPeerConnection(remoteSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('call:offer', { targetSocketId: remoteSocketId, offer, callId });
  }, [createPeerConnection, socket, callId]);

  // ── Handle incoming offer (initial + renegotiation) ─────────────────────────
  const handleOffer = useCallback(async ({ callerSocketId, offer }) => {
    // If PC already exists this is a renegotiation offer, otherwise initial
    let pc = peersRef.current.get(callerSocketId);
    if (!pc) pc = createPeerConnection(callerSocketId);
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

  // ── ICE candidate (queue if remote description not ready) ───────────────────
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
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false,
    });
    localStreamRef.current = stream;
    attachAnalyser('self', stream);
    startSpeakingDetection();
    return stream;
  }, [attachAnalyser, startSpeakingDetection]);

  // ── Enable camera — adds video track to all existing peer connections ────────
  const enableVideo = useCallback(async () => {
    if (localVideoStreamRef.current) return localVideoStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    });
    localVideoStreamRef.current = stream;
    const [videoTrack] = stream.getTracks();
    // Add video track to every existing peer connection — onnegotiationneeded fires and renegotiates
    peersRef.current.forEach((pc) => {
      pc.addTrack(videoTrack, stream);
    });
    return stream;
  }, []);

  // ── Disable camera — replaces video sender track with null (no renegotiation) ─
  const disableVideo = useCallback(() => {
    if (!localVideoStreamRef.current) return;
    // replaceTrack(null) pauses the sender without renegotiation;
    // remote peer's track fires onmute → their UI shows avatar tile.
    peersRef.current.forEach((pc) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(null).catch(() => {});
    });
    localVideoStreamRef.current.getTracks().forEach(t => t.stop());
    localVideoStreamRef.current = null;
  }, []);

  // ── Mute / unmute mic ────────────────────────────────────────────────────────
  const setMuted = useCallback((muted) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !muted; });
    }
  }, []);

  // ── Cleanup peers only (keep local stream + camera) — used for rejoin ───────
  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();
    remoteAudiosRef.current.forEach(audio => { audio.srcObject = null; audio.remove(); });
    remoteAudiosRef.current.clear();
    remoteVideoStreamsRef.current.forEach((_, sid) => onRemoteVideoStream?.(sid, null));
    remoteVideoStreamsRef.current.clear();
    analysersRef.current.forEach((_, id) => { if (id !== 'self') analysersRef.current.delete(id); });
  }, [onRemoteVideoStream]);

  // ── Full cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    stopSpeakingDetection();
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    pendingCandidatesRef.current.clear();
    remoteAudiosRef.current.forEach(audio => { audio.srcObject = null; audio.remove(); });
    remoteAudiosRef.current.clear();
    remoteVideoStreamsRef.current.forEach((_, sid) => onRemoteVideoStream?.(sid, null));
    remoteVideoStreamsRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoStreamRef.current) {
      localVideoStreamRef.current.getTracks().forEach(t => t.stop());
      localVideoStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, [stopSpeakingDetection, onRemoteVideoStream]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    peersRef,
    localStreamRef,
    localVideoStreamRef,
    remoteAudiosRef,
    analysersRef,
    speakingRef,
    getLocalStream,
    enableVideo,
    disableVideo,
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
