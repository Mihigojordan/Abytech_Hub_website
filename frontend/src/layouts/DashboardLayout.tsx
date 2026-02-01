import React, { useEffect, useState } from 'react';

import Header from '../components/dashboard/Header';

import Sidebar from '../components/dashboard/Sidebar';

import { Outlet } from 'react-router-dom';
import PWAInstallButton from '../components/PWAInstallButton';
import { useSocket } from '../context/SocketContext';
import useAdminAuth from '../context/AdminAuthContext';

const DashboardLayout = ({role}:{role:string}) => {

    const [isOpen, setIsOpen] = useState(false)
    const {emit} = useSocket()
    const {user} = useAdminAuth()
 
  const onToggle = () => {
    setIsOpen(!isOpen)
  }
   
  useEffect(()=>{
    navigator.serviceWorker.getRegistrations().then(console.warn)


  },[])


  // useEffect(()=>{

  //   emit('user:online',{userType:'ADMIN',userId:user?.id})
    
  // },[])
  return (
    <div className="flex h-screen bg-slate-50">
      <PWAInstallButton />
      <Sidebar onToggle={onToggle} role={role} isOpen={isOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggle={onToggle} role={role} />
        <main className="flex-1 overflow-y-auto">
         <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;