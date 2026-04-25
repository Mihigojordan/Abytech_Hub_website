import React, { useEffect, useState } from 'react'

import { Outlet, useNavigate } from 'react-router-dom'

import Nav from '../components/home/Nav';
import Footer from '../components/home/Footer';
import { GLOBAL_CSS } from '../utils/homeConstants';
function usePWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsPWA(standalone);
    };

    checkPWA();

    // Optional: listen for changes if display-mode changes dynamically
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => mediaQuery.removeEventListener('change', checkPWA);
  }, []);

  return isPWA;
}


const MainLayout = () => {

  const navigate = useNavigate()
const isPWA = usePWA();
 useEffect(() => {
    if (isPWA) {
      navigate('/admin/dashboard');
    }
  }, [isPWA, navigate]);

  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);
  
  return (
    <div className='flex justify-between items-stretch flex-col bg-white dark:bg-[#0e0e0e] text-gray-900 dark:text-white transition-colors duration-300'>
<style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS}}></style>
      <Nav />
      <Outlet />
      <Footer />


    </div>
  )
}

export default MainLayout