import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import React from "react";
import { AdminAuthContextProvider } from './context/AdminAuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider serverUrl={import.meta.env.VITE_API_URL}>

    <AdminAuthContextProvider>

      <App />
    </AdminAuthContextProvider>
    </SocketProvider>
    
  </StrictMode>
);
