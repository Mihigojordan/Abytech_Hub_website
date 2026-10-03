import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Clock } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- used as <motion.div>
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocketEvent } from '../../../context/SocketContext';
import useAdminAuth from '../../../context/AdminAuthContext';
import { getRingtoneSettings, playRingtone } from '../../../utils/ringtones';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, bc, ba } from '../../../utils/homeConstants';

const SNOOZE_MINUTES = 5;

// Rings (looping) when any new notification arrives, until the admin stops or snoozes it
const NotificationAlarm = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const { bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [alarms, setAlarms] = useState([]); // queue of { key, title, message, link }
  const playerRef = useRef(null);
  const snoozeTimersRef = useRef([]);

  useSocketEvent('new-notification', (notification) => {
    if (!user?.id || !getRingtoneSettings().enabled) return;
    const mine = notification?.recipients?.find((r) => r.id === user.id && r.type === 'ADMIN');
    // Skip notifications not for me, already read, or caused by my own action
    if (!mine || mine.read || notification.senderId === user.id) return;
    setAlarms((prev) =>
      prev.some((a) => a.key === notification.id)
        ? prev
        : [...prev, { key: notification.id, title: notification.title, message: notification.message, link: mine.link }],
    );
  });

  // Keep ringing while any alarm is waiting
  const ringing = alarms.length > 0;
  useEffect(() => {
    if (ringing && !playerRef.current) {
      playerRef.current = playRingtone();
    } else if (!ringing && playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
  }, [ringing]);

  useEffect(() => () => {
    playerRef.current?.stop();
    snoozeTimersRef.current.forEach(clearTimeout);
  }, []);

  const current = alarms[0];

  const dismiss = () => setAlarms((prev) => prev.slice(1));

  const snooze = () => {
    const alarm = current;
    dismiss();
    const timer = setTimeout(() => {
      setAlarms((prev) => [...prev, { ...alarm, key: `${alarm.key}-snooze-${Date.now()}` }]);
    }, SNOOZE_MINUTES * 60 * 1000);
    snoozeTimersRef.current.push(timer);
  };

  const open = () => {
    const link = current.link;
    dismiss();
    if (link) navigate(link);
  };

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.7)', zIndex: 100 }}
          role="alertdialog" aria-labelledby="notification-alarm-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            style={{ background: bg2, border: `1px solid ${border}`, borderTop: `3px solid ${ORG}`, borderRadius: 4, padding: 24, width: '100%', maxWidth: 380, textAlign: 'center' }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4 }}
              style={{ display: 'inline-flex', padding: 14, borderRadius: 999, background: 'rgba(232,98,26,.12)', marginBottom: 12 }}
            >
              <BellRing className="w-7 h-7" style={{ color: ORG }} />
            </motion.div>
            <h3 id="notification-alarm-title" style={bc(16, 700, { color: textC, marginBottom: 6, wordBreak: 'break-word' })}>{current.title}</h3>
            <p style={ba(13, 400, { color: textC, marginBottom: 4, wordBreak: 'break-word' })}>{current.message}</p>
            {alarms.length > 1 && (
              <p style={ba(11, 400, { color: text2 })}>+{alarms.length - 1} more notification{alarms.length > 2 ? 's' : ''} waiting</p>
            )}

            <div className="flex flex-col gap-2" style={{ marginTop: 18 }}>
              <button
                onClick={dismiss}
                autoFocus
                style={{ padding: '10px 16px', background: ORG, border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', ...bc(13, 700) }}
              >
                Stop
              </button>
              <div className="flex gap-2">
                <button
                  onClick={snooze}
                  className="flex items-center justify-center gap-1"
                  style={{ flex: 1, padding: '8px 12px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, cursor: 'pointer', ...ba(12) }}
                >
                  <Clock className="w-3.5 h-3.5" /> Snooze {SNOOZE_MINUTES} min
                </button>
                {current.link && (
                  <button
                    onClick={open}
                    style={{ flex: 1, padding: '8px 12px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, cursor: 'pointer', ...ba(12) }}
                  >
                    Open
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationAlarm;
