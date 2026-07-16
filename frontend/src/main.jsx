import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from "react";
import { AdminAuthContextProvider } from './context/AdminAuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { PWAProvider } from './context/PWAContext.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';

// Service worker registration is scoped to /admin only — see
// src/components/pwa/InstallScopeGate.jsx. Registering it unconditionally
// here would make the public marketing site installable too.

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
