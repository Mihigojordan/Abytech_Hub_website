import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

const MANIFEST_LINK_ID = 'app-manifest-link';
let swRegistered = false;

function registerAppSW() {
  if (swRegistered) return;
  swRegistered = true;

  registerSW({
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    },
    onRegisterError(err) {
      console.error('[PWA] SW registration failed:', err);
      swRegistered = false;
    },
  });
}

/**
 * Mounted once, at the root of the /admin route tree (DashboardLayout).
 * Its presence/absence is what scopes installability to the app: the
 * manifest link and the service worker (registered with scope: '/admin/'
 * in vite.config.js) only ever exist while this is mounted, so the public
 * marketing site never meets Chrome's installability criteria.
 */
export default function InstallScopeGate() {
  useEffect(() => {
    if (!document.getElementById(MANIFEST_LINK_ID)) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.id = MANIFEST_LINK_ID;
      link.href = '/manifest.webmanifest';
      document.head.appendChild(link);
    }

    registerAppSW();

    return () => {
      document.getElementById(MANIFEST_LINK_ID)?.remove();
    };
  }, []);

  return null;
}
