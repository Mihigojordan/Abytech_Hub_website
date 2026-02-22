import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import useAdminAuth from '../context/AdminAuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';

export type RoleType = 'admin';

export interface Roles {
  role: RoleType;
}

const DashboardLayout = ({role}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
 
  const { user } = useAdminAuth();
  const { setRecipient } = useNotifications();
  const { socket, isConnected, emit } = useSocket();

  const isAdminRegistered = useRef(false);

  const onToggle = () => setIsOpen(!isOpen);

  // ── Register admin presence (online status) ──
  useEffect(() => {
    if (user?.id && isConnected && !isAdminRegistered.current) {
      console.log('online ADMIN:', user.id);
      emit('registerUser', { id: user.id, type: 'ADMIN' });
      isAdminRegistered.current = true;
    }
  }, [user?.id, isConnected, emit, socket]);

  // ── Set notification recipient ──
  useEffect(() => {
    if (user?.id) {
      setRecipient(user.id, 'ADMIN');
    }
  }, [user?.id]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar onToggle={onToggle} role={role} isOpen={isOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggle={onToggle} role={role} />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ role }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;