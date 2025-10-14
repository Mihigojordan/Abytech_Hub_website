import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX, FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import React from "react";
import Logo from '../assets/images/logo.png';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(true);

  // Hide top bar after scrolling down once (permanently)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80 && topBarVisible) {
        setTopBarVisible(false);
      }
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [topBarVisible]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in-animation {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in-up-animation {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .glass-effect {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2px;
          border-radius: 12px;
        }
        .gradient-border-inner {
          background: #1e293b;
          border-radius: 10px;
          padding: 0.5rem 1.5rem;
        }
        .nav-link-effect {
          position: relative;
          overflow: hidden;
        }
        .nav-link-effect::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .nav-link-effect:hover::before {
          width: 100%;
        }
      `}</style>

      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
        {/* Top Info Bar (disappears after first scroll) */}
        {topBarVisible && (
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-2 px-4 hidden lg:block transition-all duration-300">
            <div className="container mx-auto flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <a href="tel:+250788888888" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors duration-200">
                  <FiPhone className="w-4 h-4" />
                  <span>+250 788 888 888</span>
                </a>
                <a href="mailto:info@company.com" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors duration-200">
                  <FiMail className="w-4 h-4" />
                  <span>info@company.com</span>
                </a>
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>Kigali, Rwanda</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                  <a key={i} href="#" className="hover:text-yellow-300 transition-all duration-200 hover:scale-110">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className={`glass-effect shadow-lg transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
          <div className="container mx-auto flex justify-between items-center px-4">
            {/* Left - Logo */}
            <div className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
              <img src={Logo} alt="Brand Logo" className={`object-contain transition-all duration-300 ${scrolled ? 'h-12' : 'h-16'}`} />
            </div>

            {/* Center - NavLinks */}
            <ul className="hidden lg:flex lg:space-x-2 lg:items-center absolute left-1/2 transform -translate-x-1/2">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about-us" },
                { name: "Our Services", path: "/services" },
                { name: "Team", path: "/team-member" },
                { name: "Blogs", path: "/blogs" },
                { name: "Project", path: "/project" },
              ].map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link-effect block px-4 py-2 text-base font-semibold capitalize transition-all duration-200 rounded-lg ${
                        isActive 
                          ? "text-yellow-300 bg-white bg-opacity-10" 
                          : "text-white hover:text-yellow-300 hover:bg-white hover:bg-opacity-5"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right - Contact Us or Mobile Button */}
            <div className="flex items-center">
              {/* Desktop Button */}
              <div className="hidden lg:block gradient-border ml-4">
                <NavLink
                  to="/contact-us"
                  className="gradient-border-inner block text-base font-bold text-white transition-all duration-200"
                >
                  Contact Us
                </NavLink>
              </div>

              {/* Mobile Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-white focus:outline-none z-60 relative transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                  aria-label="Toggle menu"
                >
                  <div className={`transition-all duration-300 ${menuOpen ? 'rotate-180' : 'rotate-0'}`}>
                    {menuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Overlay & Menu */}
        {menuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="lg:hidden fixed top-0 left-0 w-4/5 max-w-sm h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-40 slide-in-animation shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-white border-opacity-10 bg-black bg-opacity-20">
                <img src={Logo} alt="Brand Logo" className="h-12 w-auto object-contain" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white focus:outline-none transition-all duration-200 hover:scale-110 hover:bg-white hover:bg-opacity-10 p-2 rounded-lg"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6" />
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
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-base font-semibold capitalize transition-all duration-200 rounded-lg ${
                          isActive
                            ? "text-yellow-300 bg-white bg-opacity-20 shadow-lg"
                            : "text-white hover:text-yellow-300 hover:bg-white hover:bg-opacity-10"
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white border-opacity-10 bg-black bg-opacity-20">
                <div className="flex justify-center space-x-6">
                  {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                    <a key={i} href="#" className="text-white hover:text-yellow-300 transition-all duration-200 hover:scale-110">
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}

export default NavBar;
