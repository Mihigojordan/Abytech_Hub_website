import { useState, useEffect, useCallback, useRef } from 'react';
import { WifiOff } from 'lucide-react';

const CHECK_URL = (import.meta.env.VITE_API_URL || '') + '/api/health';
const CHECK_INTERVAL = 10_000; // 10 s while offline

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const timerRef = useRef(null);

  const checkConnectivity = useCallback(async () => {
    try {
      await fetch(CHECK_URL, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    // Initial check — navigator.onLine is unreliable on WiFi with no internet route,
    // so we always do a real fetch unless we're already known-offline.
    if (!navigator.onLine) {
      setOffline(true);
    } else {
      checkConnectivity();
    }

    const handleOffline = () => setOffline(true);
    const handleOnline  = () => checkConnectivity();

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, [checkConnectivity]);

  // Poll every 10 s while offline so we auto-recover without user action
  useEffect(() => {
    if (offline) {
      timerRef.current = setInterval(checkConnectivity, CHECK_INTERVAL);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [offline, checkConnectivity]);

  if (!offline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 9999,
      background: '#e8621a',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 2px 12px rgba(232,98,26,0.45)',
    }}>
      <WifiOff size={16} style={{ flexShrink: 0 }} />
      <span>You are offline — please reconnect to the internet to continue.</span>
    </div>
  );
}
