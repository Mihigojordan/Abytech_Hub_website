import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import FooterContent from '../components/footer'

const MainLayout = () => {
  return (
    <div className='min-h-dvh text-white flex justify-between items-stretch flex-col bg-[#0D0F1A]'>

    <Navbar />
    <Outlet />
    <FooterContent />


    </div>
  )
}

export default MainLayout