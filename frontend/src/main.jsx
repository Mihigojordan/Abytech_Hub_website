import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AdminAuthContextProvider } from "./context/AdminAuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <SocketProvider serverUrl={import.meta.env.VITE_API_URL}>
        <AdminAuthContextProvider>
          <App />
        </AdminAuthContextProvider>
      </SocketProvider>
    </HelmetProvider>
  </StrictMode>
);
