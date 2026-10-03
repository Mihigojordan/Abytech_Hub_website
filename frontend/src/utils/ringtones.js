// Notification ringtones: built-in tones are synthesized with the Web Audio API,
// a custom uploaded sound is kept in IndexedDB (too big for localStorage).
// Settings are saved per browser.

const SETTINGS_KEY = 'notificationRingtoneSettings';
const DB_NAME = 'abytech-ringtones';
const STORE = 'files';
const CUSTOM_KEY = 'custom';

export const MAX_CUSTOM_RINGTONE_BYTES = 10 * 1024 * 1024;
export const CUSTOM_RINGTONE_ACCEPT = 'audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg,video/mp4,.mp3,.mp4,.m4a,.wav,.ogg';

const ALLOWED_EXTENSIONS = ['mp3', 'mp4', 'm4a', 'wav', 'ogg'];

// Each tone is a list of [frequency Hz, duration s] notes (0 Hz = silence), repeated after `gap` seconds
export const RINGTONES = {
  classic: { label: 'Classic Bell', wave: 'sine', gap: 1.2, notes: [[880, 0.25], [660, 0.25], [880, 0.25], [660, 0.25]] },
  chime: { label: 'Soft Chime', wave: 'triangle', gap: 1.5, notes: [[1046.5, 0.3], [784, 0.3], [659.3, 0.5]] },
  digital: { label: 'Digital Beep', wave: 'square', gap: 0.8, notes: [[1200, 0.12], [0, 0.08], [1200, 0.12], [0, 0.08], [1200, 0.12]] },
  rising: { label: 'Rising Alert', wave: 'sawtooth', gap: 1, notes: [[523.3, 0.15], [659.3, 0.15], [784, 0.15], [1046.5, 0.3]] },
};

const DEFAULT_SETTINGS = { enabled: true, ringtone: 'classic', volume: 0.7, customName: '' };

export const isAllowedRingtoneFile = (file) => {
  if (!file) return false;
  const ext = file.name?.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) || /^audio\//.test(file.type) || file.type === 'video/mp4';
};

export const getRingtoneSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveRingtoneSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }));
    return true;
  } catch {
    return false;
  }
};

// ---- IndexedDB storage for the custom sound ----

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const withStore = async (mode, fn) => {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

export const saveCustomRingtone = (file) => withStore('readwrite', (store) => store.put(file, CUSTOM_KEY));

const loadCustomRingtone = () => withStore('readonly', (store) => store.get(CUSTOM_KEY));

// ---- Playback ----

const playSynth = (tone, volume) => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return { stop() {} };
  const ctx = new AudioCtx();
  let stopped = false;
  let timer = null;

  const playOnce = () => {
    if (stopped) return;
    let t = ctx.currentTime + 0.05;
    for (const [freq, dur] of tone.notes) {
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.wave;
        osc.frequency.value = freq;
        // Short fade in/out to avoid clicks
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume * 0.4, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      }
      t += dur;
    }
    const total = tone.notes.reduce((sum, [, dur]) => sum + dur, 0) + tone.gap;
    timer = setTimeout(playOnce, total * 1000);
  };

  ctx.resume?.().catch(() => {});
  playOnce();

  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      ctx.close().catch(() => {});
    },
  };
};

const playFile = (blob, volume) => {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = volume;
  audio.play().catch(() => {});
  return {
    stop() {
      audio.pause();
      URL.revokeObjectURL(url);
    },
  };
};

// Starts a looping ringtone and returns { stop() }.
// `settings` defaults to the saved ones; `file` lets the settings modal preview an unsaved upload.
export const playRingtone = (settings = getRingtoneSettings(), file = null) => {
  const volume = Math.min(1, Math.max(0, Number(settings.volume ?? DEFAULT_SETTINGS.volume)));
  const fallback = () => playSynth(RINGTONES[settings.ringtone] || RINGTONES[DEFAULT_SETTINGS.ringtone], volume);

  if (settings.ringtone !== 'custom') return fallback();
  if (file) return playFile(file, volume);

  // Custom sound loads asynchronously; stop() still works if called before it is ready
  let player = null;
  let stopped = false;
  loadCustomRingtone()
    .then((blob) => {
      if (stopped) return;
      player = blob ? playFile(blob, volume) : fallback();
    })
    .catch(() => {
      if (!stopped) player = fallback();
    });

  return {
    stop() {
      stopped = true;
      player?.stop();
    },
  };
};
