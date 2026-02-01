import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import Logo from "../assets/tran.png";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = [
    { icon: FiFacebook, href: "https://www.facebook.com/profile.php?id=61561463187987" },
    { icon: FiTwitter, href: "https://x.com/AbytechHUB" },
    { icon: FiInstagram, href: "https://www.instagram.com/abytechhubltd" },
    { icon: FiLinkedin, href: "https://www.linkedin.com/in/abytech-hub-754226354/" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style>{`
        .nav-transition {
          transition: all 0.3s ease;
        }
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #4668a2;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .dropdown-menu {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }
        .dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>

      <header className={`fixed top-0 left-0 w-full z-50 nav-transition ${scrolled ? 'shadow-lg' : ''}`}>
        {/* Top Bar - Hidden on scroll and mobile */}
  

        {/* Main Navigation */}
        <nav className="bg-[#F5F7FF] shadow-md">
          <div className="container mx-auto px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-105">
                <img
                  src={Logo}
                  alt="Brand Logo"
                  className="h-14 w-auto object-contain"
                />
              </Link>

              {/* Desktop Navigation */}
              <ul className="hidden lg:flex items-center space-x-8">
                <li className="dropdown">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span>Home</span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>

                <li className="dropdown">
                  <NavLink
                    to="/about-us"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span>About Us </span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>

                <li className="dropdown">
                  <NavLink
                    to="/services"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span> Our Services</span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>
                    <li className="dropdown">
                  <NavLink
                    to="/team-member"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span> Team Member</span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>

                <li className="dropdown">
                  <NavLink
                    to="/project"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span>Our Projects</span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>

                <li className="dropdown">
                  <NavLink
                    to="/blogs"
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                        isActive ? 'text-blue-600' : ''
                      }`
                    }
                  >
                    <span>News And Insights</span>
                    {/* <FiChevronDown className="w-4 h-4" /> */}
                  </NavLink>
                </li>

              
              </ul>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4 md:w-[12%]">
          

                {/* Get Quote Button */}
                <Link
                  to="/contact-us"
                  className="hidden lg:block bg-[#1d293d] md:w-[100%] text-center text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-all duration-300"
                >
               Contact Us
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {menuOpen ? (
                    <FiX className="w-6 h-6" />
                  ) : (
                    <FiMenu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="lg:hidden fixed top-0 left-0 w-4/5 max-w-sm h-full bg-white z-40 shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <img src={Logo} alt="Brand Logo" className="h-10 w-auto object-contain" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <ul className="flex flex-col p-6 space-y-1">
                {[
                  { name: "Home", path: "/" },
                  { name: "About Us", path: "/about-us" },
                  { name: "Our Services", path: "/services" },
                  { name: "Team Member", path: "/team-member" },
                  { name: "News And Insights", path: "/blogs" },
                  { name: "Our Projects", path: "/project" },
            
                ].map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium transition-colors ${
                          isActive ? 'text-blue-600 bg-gray-50' : ''
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="p-6 border-t">
                <Link
                  to="/contact-us"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-[#1d293d] text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-all"
                >Contact us 
                </Link>
              </div>

              <div className="p-6 border-t">
                <div className="flex justify-center space-x-6">
                  {socialLinks.map(({ icon: Icon, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-all"
                    >
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