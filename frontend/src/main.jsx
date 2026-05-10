import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from "react";
import { AdminAuthContextProvider } from './context/AdminAuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { registerSW } from 'virtual:pwa-register';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { PWAProvider } from './context/PWAContext.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';

registerSW({
  onNeedRefresh() {
    // Dispatch event so PWAContext and the profile PWA panel can show a non-blocking update banner
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    console.log('[PWA] Service worker installed');
  },
  onRegisterError(err) {
    console.error('[PWA] SW registration failed:', err);
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PWAProvider>
      <HelmetProvider>
        <OfflineBanner />
        <SocketProvider serverUrl={import.meta.env.VITE_API_URL}>
          <AdminAuthContextProvider>
            <NotificationProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </NotificationProvider>
          </AdminAuthContextProvider>
        </SocketProvider>
      </HelmetProvider>
    </PWAProvider>
  </StrictMode>
);
