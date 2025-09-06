import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import React from "react";
import Logo from '../assets/images/logo.png';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint in Tailwind
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* CSS Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .slide-in-animation {
          animation: slideIn 0.5s ease-out;
        }
        
        .fade-in-up-animation {
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .overlay-fade-in {
          animation: fadeInUp 0.3s ease-out forwards;
        }

        /* Enhanced mobile navbar background */
        .mobile-navbar-bg {
          background: rgba(23, 27, 34, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        /* Fallback for browsers that don't support backdrop-filter */
        @supports not (backdrop-filter: blur(10px)) {
          .mobile-navbar-bg {
            background: rgba(23, 27, 34, 0.98);
          }
        }
        
        /* Desktop navbar background */
        .desktop-navbar-bg {
          background: rgba(23, 27, 34, 0.3);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        
        @supports not (backdrop-filter: blur(16px)) {
          .desktop-navbar-bg {
            background: rgba(23, 27, 34, 0.9);
          }
        }
      `}</style>
      
      <header className="fixed top-0 left-0 w-full z-50 p-2 shadow-md transition-all duration-300">
        {/* Conditional background based on screen size */}
        <div className="absolute inset-0 mobile-navbar-bg lg:hidden"></div>
        <div className="absolute inset-0 desktop-navbar-bg hidden lg:block"></div>
        
        <nav className="container mx-auto flex justify-between items-center px-2 py-2 relative">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Brand Logo" className="h-16 w-auto object-contain" />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none z-60 relative transition-transform duration-200 hover:scale-110"
              aria-label="Toggle menu"
            >
              <div className={`transition-all duration-300 ${menuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {menuOpen ? <FiX className="w-8 h-8" /> : <FiMenu className="w-8 h-8" />}
              </div>
            </button>
          </div>

          {/* Desktop Menu Items */}
          <ul className="hidden lg:flex lg:space-x-4 lg:justify-around lg:items-center">
            {[
              { name: "Home", path: "/" },
              { name: "About Us", path: "/about-us" },
              { name: "Our Services", path: "/services" },
              { name: "Team", path: "/team-member" },
              { name: "Blogs", path: "/blogs" },
              { name: "Project", path: "/project" },
              { name: "Contact Us", path: "/contact-us" },
            ].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-2 py-2 text-lg font-semibold capitalize transition-all duration-200 ${
                      isActive ? "text-[#FFD44D]" : "text-white hover:text-[#FFD44D]"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}

            {/* Desktop Contact Us Button */}
            <li className="ml-6">
              <NavLink
                to="/contact-us"
                className="px-6 py-2 text-lg font-semibold text-white bg-[#FFD44D] rounded-lg transition-all duration-200 hover:bg-yellow-500 hover:scale-105"
              >
                Contact Us
              </NavLink>
            </li>
          </ul>

          {/* Mobile Menu Overlay */}
          {menuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 overlay-fade-in"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Mobile Menu Items - Only render when open */}
          {menuOpen && (
            <div className="lg:hidden fixed top-0 left-0 w-3/4 h-full bg-slate-900 z-40 slide-in-animation">
              {/* Mobile menu header with close button */}
              <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <img src={Logo} alt="Brand Logo" className="h-12 w-auto object-contain" />
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="text-white focus:outline-none transition-transform duration-200 hover:scale-110"
                  aria-label="Close menu"
                >
                  {/* <FiX className="w-6 h-6" /> */}
                </button>
              </div>

              <ul className="flex flex-col p-6 space-y-2">
                {[
                  { name: "Home", path: "/" },
                  { name: "About Us", path: "/about-us" },
                  { name: "Our Services", path: "/services" },
                  { name: "Team", path: "/team-member" },
                  { name: "Blogs", path: "/blogs" },
                  { name: "Project", path: "/project" },
                  { name: "Contact Us", path: "/contact-us" },
                ].map((item, index) => (
                  <li 
                    key={index}
                    className="fade-in-up-animation"
                    style={{ 
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-lg font-semibold capitalize transition-all duration-200 rounded-lg ${
                          isActive 
                            ? "text-[#FFD44D] bg-slate-800" 
                            : "text-white hover:text-[#FFD44D] hover:bg-slate-800"
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}

                {/* Mobile Contact Us Button */}
                <li 
                  className="pt-4 fade-in-up-animation"
                  style={{ 
                    animationDelay: '700ms'
                  }}
                >
                  <NavLink
                    to="/contact-us"
                    className="block px-6 py-3 text-lg font-semibold text-slate-900 bg-[#FFD44D] rounded-lg transition-all duration-200 hover:bg-yellow-500 hover:scale-105 text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact Us
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}

export default NavBar;