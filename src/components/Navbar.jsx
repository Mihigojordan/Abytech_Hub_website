import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from "aos";
import "aos/dist/aos.css";



const Navbar = () => {

     const [scrolling, setScrolling] = useState(false);
      
        useEffect(() => {
          AOS.init({ duration: 200, easing: "ease-in-out", once: false });
      
          const handleScroll = () => {
            setScrolling(window.scrollY > 80); // Change background when scrolled past 50px
          };
      
          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
        }, []);
    
       
    const links = [
        {path:'/',name:'Home'},
        {path:'/services',name:'Services'},
        {path:'/blogs',name:'Blog'},
        {path:'/contact-us',name:'Contact Us'},
    
    
      ]
    
    return (

        <header
            className={`fixed top-0 left-0 w-full py-4 px-6 h-30 flex justify-between items-center transition-all duration-300 z-50 ${
              scrolling ? "bg-gray-60 shadow-md backdrop-blur-md" : "bg-transparent"
            }`}
            data-aos="fade-down"
          >
            {/* Logo Section */}
            <div className="flex items-center">
              <span className="text-4xl font-bold text-yellow-400">Abytech Hub</span>
            </div>
      
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-6">
              {links.map((link, key) => (
                <Link
                  key={key}
                  to={link.path}
                  className="text-white hover:text-yellow-400 transition"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
      
            {/* Contact Us Button */}
            
            <Link to="/contact-us">
            <button className="bg-red-500 hidden md:flex hover:bg-red-600 px-4 py-2 rounded-md text-white font-bold transition">
              Contact Us
            </button>
            </Link>
            
      
            {/* Mobile Menu (Hamburger) */}
            <div className="md:hidden">
              <button className="text-white text-2xl">&#9776;</button>
            </div>
          </header>
    )
}

export default Navbar