import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Play, Square, Upload } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- used as <motion.div>
import { motion, AnimatePresence } from 'framer-motion';
import {
  RINGTONES, MAX_CUSTOM_RINGTONE_BYTES, CUSTOM_RINGTONE_ACCEPT, isAllowedRingtoneFile,
  getRingtoneSettings, saveRingtoneSettings, saveCustomRingtone, playRingtone,
} from '../../../utils/ringtones';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, bc, ba } from '../../../utils/homeConstants';

// Choose the ringtone that plays (looping until stopped) when a notification arrives
const NotificationSoundModal = ({ isOpen, onClose }) => {
  const { bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
  const [settings, setSettings] = useState(getRingtoneSettings);
  const [error, setError] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [pendingFile, setPendingFile] = useState(null); // uploaded but not saved yet
  const [saving, setSaving] = useState(false);
  const previewRef = useRef(null);

  const stopPreview = () => {
    previewRef.current?.stop();
    previewRef.current = null;
    setPreviewing(false);
  };

  // Reload saved settings each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getRingtoneSettings());
      setPendingFile(null);
      setError('');
    } else {
      stopPreview();
    }
  }, [isOpen]);

  useEffect(() => () => previewRef.current?.stop(), []);

  const update = (changes) => {
    stopPreview();
    setSettings((prev) => ({ ...prev, ...changes }));
  };

  const togglePreview = () => {
    if (previewing) return stopPreview();
    previewRef.current = playRingtone(settings, pendingFile);
    setPreviewing(true);
  };

  const handleCustomFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setError('');
    if (!file) return;
    if (!isAllowedRingtoneFile(file)) return setError('Please choose an MP3, MP4, M4A, WAV or OGG file');
    if (file.size > MAX_CUSTOM_RINGTONE_BYTES) return setError('File must be 10 MB or smaller');
    setPendingFile(file);
    update({ ringtone: 'custom', customName: file.name });
  };

  const close = () => {
    stopPreview();
    onClose();
  };

  const save = async () => {
    try {
      setSaving(true);
      if (pendingFile) await saveCustomRingtone(pendingFile);
      if (!saveRingtoneSettings(settings)) throw new Error('settings');
      close();
    } catch {
      setError('Could not save the sound in this browser. Try a smaller file.');
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { ...bc(11, 700, { color: text2, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }) };
  const options = [
    ...Object.entries(RINGTONES).map(([key, t]) => ({ key, label: t.label })),
    ...(settings.customName ? [{ key: 'custom', label: `Custom: ${settings.customName}` }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', zIndex: 60 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 style={bc(15, 700, { color: textC, borderLeft: `3px solid ${ORG}`, paddingLeft: 10 })}>Notification Sound</h3>
              <button onClick={close} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X className="w-4 h-4" style={{ color: text2 }} />
              </button>
            </div>
            <p style={ba(12, 400, { color: text2, marginBottom: 16 })}>
              Rings when a new notification arrives and keeps ringing until you press Stop. Saved for this browser.
            </p>

            {error && (
              <div style={{
                background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: 10,
                color: '#e84040', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, ...ba(12),
              }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* On / off */}
            <label className="flex items-center justify-between" style={{
              padding: '10px 12px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, marginBottom: 16, cursor: 'pointer',
            }}>
              <span style={ba(13, 600, { color: textC })}>Ring for new notifications</span>
              <input type="checkbox" checked={settings.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: ORG, cursor: 'pointer' }} />
            </label>

            <div style={{ opacity: settings.enabled ? 1 : 0.5, pointerEvents: settings.enabled ? 'auto' : 'none' }}>
              <span style={labelStyle}>Ringtone</span>
              <div className="space-y-2" role="radiogroup" aria-label="Ringtone">
                {options.map(({ key, label }) => {
                  const active = settings.ringtone === key;
                  return (
                    <button key={key} type="button" role="radio" aria-checked={active}
                      onClick={() => update({ ringtone: key })}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 4, cursor: 'pointer',
                        background: active ? 'rgba(232,98,26,.12)' : bg3, border: `1px solid ${active ? ORG : border}`,
                        display: 'flex', alignItems: 'center', gap: 10, ...ba(12, active ? 600 : 400, { color: textC }),
                      }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                        border: `2px solid ${active ? ORG : text3}`, background: active ? ORG : 'transparent',
                        boxShadow: active ? `inset 0 0 0 2px ${bg3}` : 'none',
                      }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                    </button>
                  );
                })}

                <label className="flex items-center justify-center gap-2"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 4, cursor: 'pointer', border: `1px dashed ${border}`, color: text2, ...ba(12) }}>
                  <Upload className="w-3.5 h-3.5" />
                  {settings.customName ? 'Replace custom sound' : 'Upload your own sound (MP3 / MP4)'}
                  <input type="file" accept={CUSTOM_RINGTONE_ACCEPT} onChange={handleCustomFile} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle} htmlFor="ringtone-volume">Volume — {Math.round(settings.volume * 100)}%</label>
                <input id="ringtone-volume" type="range" min="0" max="1" step="0.05" value={settings.volume}
                  onChange={(e) => update({ volume: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: ORG }} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3" style={{ marginTop: 20 }}>
              <button type="button" onClick={togglePreview} disabled={!settings.enabled}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 14px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC,
                  cursor: settings.enabled ? 'pointer' : 'not-allowed', opacity: settings.enabled ? 1 : 0.5, ...ba(12),
                }}>
                {previewing ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {previewing ? 'Stop preview' : 'Preview'}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={close}
                  style={{ padding: '8px 14px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, cursor: 'pointer', ...ba(12) }}>
                  Cancel
                </button>
                <button type="button" onClick={save} disabled={saving}
                  style={{ padding: '8px 14px', background: ORG, border: 'none', borderRadius: 4, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, ...bc(12, 600) }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationSoundModal;
