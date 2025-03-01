import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import React from "react";
import Logo from '../assets/images/logo.png';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#171B224D] backdrop-blur-lg p-2 shadow-md transition-all duration-300">
      <nav className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="Brand Logo" className="h-16 w-auto object-contain" />
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="text-white focus:outline-none"
          >
            {menuOpen ? <FiX className="w-8 h-8" /> : <FiMenu className="w-8 h-8" />}
          </button>
        </div>

        {/* Menu Items */}
        <ul className={`lg:flex lg:space-x-6 fixed lg:relative bg-slate-900  md:bg-transparent w-3/4 lg:w-auto md:h-full h-[500px] lg:h-auto md:top-0 top-24 left-0 p-6 lg:p-0 transition-transform duration-300 ease-in-out transform   ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:flex-row flex-col`}>
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about-us" },
            { name: "Our Services", path: "/services" },
            { name: "Blogs", path: "/blogs" },
            { name: "Contact Us", path: "/contact-us" },
          ].map((item, index) => (
            <li key={index} className="py-3 lg:py-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 text-lg font-semibold capitalize transition-all ${
                    isActive ? "text-[#FFD44D]" : "text-white hover:text-[#FFD44D]"
                  }`
                }
                onClick={() => setMenuOpen(false)} // Close menu on click
              >
                {item.name}
              </NavLink>
            </li>
          ))}

          {/* Contact Us Button */}
          <li className="py-3 lg:py-0 md:ml-56">
            <NavLink 
              to="/contact-us" 
              className="px-6 py-2 text-lg font-semibold text-white bg-[#FFD44D] rounded-lg transition-all hover:bg-yellow-500"
            >
              Contact Us
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default NavBar;
