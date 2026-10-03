export const RINGTONES = {
  chime: { label: 'Chime', type: 'sine', notes: [[880, 0.18], [1320, 0.28]], gap: 1.2 },
  bell: { label: 'Bell', type: 'triangle', notes: [[660, 0.5], [990, 0.4]], gap: 1.6 },
  alarm: { label: 'Alarm', type: 'square', notes: [[1000, 0.15], [0, 0.1], [1000, 0.15], [0, 0.1], [1000, 0.15]], gap: 1.0 },
  pulse: { label: 'Pulse', type: 'sine', notes: [[523, 0.12], [659, 0.12], [784, 0.12]], gap: 1.0 },
};

export const MAX_CUSTOM_RINGTONE_BYTES = 10 * 1024 * 1024;
export const CUSTOM_RINGTONE_ACCEPT = '.mp3,.mp4,.m4a,.wav,.ogg';

const AUDIO_EXTENSION = /\.(mp3|mp4|m4a|wav|ogg)$/i;
export const isAllowedRingtoneFile = (file) => AUDIO_EXTENSION.test(file?.name || '');

const SETTINGS_KEY = 'notificationRingtone';
const DEFAULT_SETTINGS = { enabled: true, ringtone: 'chime', volume: 0.8, customName: null };

export function getRingtoneSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveRingtoneSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

const DB_NAME = 'abydash-ringtones';
const STORE = 'files';
const CUSTOM_KEY = 'custom';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomRingtone(file) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, CUSTOM_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadCustomRingtone() {
  const db = await openDb();
  const blob = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(CUSTOM_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

function playSynth(tone, volume) {
  let stopped = false;
  let context = null;
  let timer = null;

  const playOnce = () => {
    if (stopped) return;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      context.resume?.();
      let start = context.currentTime + 0.05;
      tone.notes.forEach(([frequency, duration]) => {
        if (frequency > 0) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = tone.type;
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(volume * 0.4, start + 0.01);
          gain.gain.linearRampToValueAtTime(0, start + duration);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.02);
        }
        start += duration;
      });
      const total = tone.notes.reduce((sum, [, duration]) => sum + duration, 0);
      timer = setTimeout(playOnce, (total + tone.gap) * 1000);
    } catch {
      stopped = true;
    }
  };

  playOnce();

  return {
    stop() {
      stopped = true;
      clearTimeout(timer);
      context?.close().catch(() => {});
    },
  };
}

function playCustom(pendingFile, volume) {
  let stopped = false;
  let audio = null;
  let url = null;

  (async () => {
    const blob = pendingFile || (await loadCustomRingtone().catch(() => null));
    if (stopped || !blob) return;
    url = URL.createObjectURL(blob);
    audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {});
  })();

  return {
    stop() {
      stopped = true;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      if (url) URL.revokeObjectURL(url);
    },
  };
}

export function playRingtone(settings = getRingtoneSettings(), pendingFile = null) {
  const volume = settings.volume ?? DEFAULT_SETTINGS.volume;
  if (settings.ringtone === 'custom') return playCustom(pendingFile, volume);
  return playSynth(RINGTONES[settings.ringtone] || RINGTONES.chime, volume);
}
