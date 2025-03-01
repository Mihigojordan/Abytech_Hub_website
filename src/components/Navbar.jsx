import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import { FiMenu, FiX } from "react-icons/fi";
import React from "react";
import Logo from '../assets/images/logo.png'

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-[#171B224D] backdrop-blur-lg p-2 shadow-md transition-all duration-300"
    >
      <nav className="container mx-auto flex justify-between items-center px-4 py-2">
        {/* Logo */}
        <div className="flex items-center space-x-2">
  <img
    src={Logo}
    alt="Brand Logo"
    className="h-16 w-auto object-contain"
  />
</div>


        {/* Mobile Menu Icon */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-black focus:outline-none"
          >
            {menuOpen ? <FiX className="w-8 h-8" /> : <FiMenu className="w-8 h-8" />}
          </button>
        </div>

        {/* Menu Items */}
        <ul
          className={`lg:flex lg:space-x-6  absolute lg:relative  lg:w-auto left-0 top-16 lg:top-0 flex-col lg:flex-row pl-8 w-[100%] pr-4 transition-transform duration-300 ease-in-out ${
            menuOpen ? "flex" : "hidden"
          }`}
        >
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about-us" },
            { name: " Our Services", path: "/services" },
            { name: "Our Team", path: "/why-choose-me" },
           
            { name: "Contact Us", path: "/reviews" },
            { name: "Contact Us", path: "/contact-us" },
          ].map((item, index) => (
            <li key={index} className="py-2  lg:py-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 text-lg font-semibold capitalize transition-all ${
                    isActive ? "text-primaryColor" : "text-white hover:text-primaryColor"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}

          {/* Contact Us Button */}
          <li className="py-2 lg:py-0 lg:ml-56">
            <NavLink
              to="/contact"
              className="px-6 py-2  text-lg font-semibold text-white bg-[#FFD44D] rounded-lg transition-all hover:bg-yellow-500"
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
