import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import FooterContent from '../components/footer'
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
    <div className='min-h-dvh text-white flex justify-between items-stretch flex-col bg-white'>

      <Navbar />
      <Outlet />
      <FooterContent />


    </div>
  )
}

export default MainLayout