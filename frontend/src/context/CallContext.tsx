// @ts-nocheck
import React, { createContext, useContext } from 'react';
import { useCall } from '../hooks/chat/useCall';

const CallContext = createContext<ReturnType<typeof useCall> | null>(null);

/**
 * Provides call state to the entire dashboard.
 * Wrap DashboardLayout with this so IncomingCallModal appears
 * regardless of which dashboard page the user is on.
 */
export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const call = useCall();
  return <CallContext.Provider value={call}>{children}</CallContext.Provider>;
};

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCallContext must be used inside CallProvider');
  return ctx;
};
