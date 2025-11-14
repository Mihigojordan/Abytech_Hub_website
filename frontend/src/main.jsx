import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from "react";
import { AdminAuthContextProvider } from './context/AdminAuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Check if it's a background tab
    if (document.hidden) {
      // Auto-refresh background tabs (user won't notice)
      console.log('Background tab, auto-updating...');
      updateSW(true);
    } else {
      // Active tab - ask user
      const shouldUpdate = confirm(
        'New version available! Update now?\n\n' +
        '(You can also update later by refreshing the page)'
      );
      
      if (shouldUpdate) {
        updateSW(true);
      }
    }
  },
  
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider serverUrl={import.meta.env.VITE_API_URL}>

    <AdminAuthContextProvider>

      <App />
    </AdminAuthContextProvider>
    </SocketProvider>
    
  </StrictMode>
);
