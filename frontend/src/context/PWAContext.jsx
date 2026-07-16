import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/* global __APP_VERSION__ */
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

const PWAContext = createContext(null);

export function PWAProvider({ children }) {
  const swRegRef = useRef(null);
  const deferredPromptRef = useRef(null);

  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone
  );
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swStatus, setSwStatus] = useState('checking'); // 'checking'|'active'|'installing'|'waiting'|'error'|'unsupported'
  const [notifPermission, setNotifPermission] = useState(
    () => ('Notification' in window ? Notification.permission : 'unsupported')
  );

  useEffect(() => {
    // ── Install prompt ──
    // Deliberately NOT calling preventDefault(): the browser's own native
    // install UI (address-bar icon / mini-infobar) is what shows up. We just
    // keep a reference so the in-app "Install" button can re-invoke the same
    // native prompt — it never draws a custom dialog of its own.
    const onBeforeInstallPrompt = (e) => {
      deferredPromptRef.current = e;
      setIsInstallable(true);
    };
    const onInstalled = () => {
      deferredPromptRef.current = null;
      setIsInstallable(false);
      setIsInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // ── Update available — fired by registerSW onNeedRefresh in main.jsx ──
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', onUpdate);

    // ── SW status tracking ──
    if (!('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
    } else {
      navigator.serviceWorker.ready
        .then(reg => {
          swRegRef.current = reg;
          setSwStatus('active');

          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            if (!newSW) return;
            setSwStatus('installing');
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                setSwStatus('waiting');
                setUpdateAvailable(true);
              } else if (newSW.state === 'activated') {
                setSwStatus('active');
              }
            });
          });
        })
        .catch(() => setSwStatus('error'));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('pwa-update-available', onUpdate);
    };
  }, []);

  const install = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return false;
    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      deferredPromptRef.current = null;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, []);

  const update = useCallback(() => {
    swRegRef.current?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, []);

  const checkForUpdate = useCallback(async () => {
    if (!swRegRef.current) return false;
    try {
      await swRegRef.current.update();
    } catch { /* ignore */ }
    return updateAvailable;
  }, [updateAvailable]);

  const requestNotifPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    return result;
  }, []);

  // ── Feature detection (computed once, stable) ──
  const features = {
    pushNotifications: 'PushManager' in window,
    backgroundSync:    'SyncManager' in window,
    badgeAPI:          'setAppBadge' in navigator,
    shareAPI:          'share' in navigator,
    periodicSync:      'periodicSync' in (navigator.serviceWorker ?? {}),
  };

  // ── Device info ──
  const ua = navigator.userAgent;
  const platform    = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Desktop';
  const browser     = /Edg\//i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Unknown';
  const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser Tab';

  return (
    <PWAContext.Provider value={{
      appVersion: APP_VERSION,
      isInstalled,
      isInstallable,
      updateAvailable,
      swStatus,
      notifPermission,
      platform,
      browser,
      displayMode,
      features,
      install,
      update,
      checkForUpdate,
      requestNotifPermission,
    }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error('usePWA must be used within PWAProvider');
  return ctx;
}
