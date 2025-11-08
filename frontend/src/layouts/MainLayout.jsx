import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import FooterContent from '../components/footer'

const MainLayout = () => {

  const navigate = useNavigate()

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isPWA) {
      navigate('/admin/dashboard')
    }
  }, [])

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