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
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  // Dropdown menu data with images
  const dropdownMenus = {
    about: {
      title: "About AbyTech",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      links: [
     
        { name: "Who We Are", path: "/about-us", desc: "Learn about our story" },
        { name: "Our Values", path: "/values", desc: "What drives us forward" },
        { name: "Empowering Inclusion", path: "/empowering-inclusion", desc: "Our commitment to diversity" },
        { name: "Vision & Mission", path: "/Vision-mission", desc: "Our purpose and goals" },
        { name: "Our Story", path: "/Story", desc: "Journey and culture" },
      ],
    },
    services: {
      title: "Our Services",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80",
      links: [
        { name: "Data Analysis", path: "/analysis-service", desc: "Transform data into insights" },
        { name: "Cyber Security", path: "/cyber-security", desc: "Protect your digital assets" },
        { name: "Software Development", path: "/software-development", desc: "Custom solutions built" },
        { name: "Database Management", path: "/Databasemanagement", desc: "Efficient data systems" },
        { name: "UI/UX Design", path: "/ui&uxdesign", desc: "Beautiful user experiences" },
        { name: "Web & App Hosting", path: "/webandapphost", desc: "Reliable cloud hosting" },
        { name: "IoT Solutions", path: "/iotsolution", desc: "Connected smart devices" },
        { name: "DevOps Automation", path: "/devops", desc: "Streamline deployments" },
      ],
    },
    training: {
      title: "Training Programs",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
      links: [
        { name: "Academic Training", path: "/Academic", desc: "Comprehensive courses" },
        { name: "AWS Cloud Training", path: "/amazon", desc: "Cloud certification prep" },
        { name: "Apprenticeship Program", path: "/Apprenticeship", desc: "Hands-on experience" },
        { name: "Cisco Training", path: "/ciscotraining", desc: "Network expertise" },
        { name: "1 Month Bootcamp", path: "/onemonth", desc: "Intensive learning" },
        { name: "3 Month Program", path: "/threemonths", desc: "Deep dive courses" },
        { name: "6 Month Certification", path: "/sixmonths", desc: "Professional mastery" },
      ],
    },
  };

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

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
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .dropdown-menu.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }
        .dropdown-overlay {
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .dropdown-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .mega-menu-item {
          transition: all 0.3s ease;
        }
        .mega-menu-item:hover {
          transform: translateX(8px);
          background: rgba(255, 90, 0, 0.05);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mega-menu-item {
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }
        .mega-menu-item:nth-child(1) { animation-delay: 0.05s; }
        .mega-menu-item:nth-child(2) { animation-delay: 0.1s; }
        .mega-menu-item:nth-child(3) { animation-delay: 0.15s; }
        .mega-menu-item:nth-child(4) { animation-delay: 0.2s; }
        .mega-menu-item:nth-child(5) { animation-delay: 0.25s; }
        .mega-menu-item:nth-child(6) { animation-delay: 0.3s; }
        .mega-menu-item:nth-child(7) { animation-delay: 0.35s; }
        .mega-menu-item:nth-child(8) { animation-delay: 0.4s; }
      `}</style>

      {/* Dropdown Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 dropdown-overlay ${
          activeDropdown ? 'active' : ''
        }`}
        onClick={closeDropdown}
      />

      <header className={`fixed top-0 left-0 w-full z-50 nav-transition ${scrolled ? 'shadow-lg' : ''}`}>
        {/* Main Navigation */}
        <nav className="bg-[#F5F7FF] shadow-md">
          <div className="px-10">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-105">
                <img
                  src={Logo}
                  alt="Brand Logo"
                  className="h-16 scale-140 w-auto object-contain"
                />
              </Link>

              {/* Desktop Navigation */}
              <ul className="hidden lg:flex items-center space-x-8">
                <li>
                  <NavLink
                    to="/"
                    onClick={closeDropdown}
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00]' : ''
                      }`
                    }
                  >
                    <span>Home</span>
                  </NavLink>
                </li>

                {/* About Us Dropdown */}
                <li className="relative">
                  <button
                    onClick={() => handleDropdownClick('about')}
                    className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                      activeDropdown === 'about' ? 'text-[#ff5a00]' : ''
                    }`}
                  >
                    <span>About Us</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                {/* Services Dropdown */}
                <li className="relative">
                  <button
                    onClick={() => handleDropdownClick('services')}
                    className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                      activeDropdown === 'services' ? 'text-[#ff5a00]' : ''
                    }`}
                  >
                    <span>Our Services</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                <li>
                  <NavLink
                    to="/team-member"
                    onClick={closeDropdown}
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00]' : ''
                      }`
                    }
                  >
                    <span>Team Member</span>
                  </NavLink>
                </li>

                {/* Training Programs Dropdown */}
                <li className="relative">
                  <button
                    onClick={() => handleDropdownClick('training')}
                    className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                      activeDropdown === 'training' ? 'text-[#ff5a00]' : ''
                    }`}
                  >
                    <span>Training Programs</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'training' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                <li>
                  <NavLink
                    to="/blogs"
                    onClick={closeDropdown}
                    className={({ isActive }) =>
                      `nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00]' : ''
                      }`
                    }
                  >
                    <span>News And Insights</span>
                  </NavLink>
                </li>
              </ul>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4 md:w-[12%]">
                <Link
                  to="/contact-us"
                  className="hidden lg:block bg-[#ff5a00] md:w-[100%] text-center text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-all duration-300"
                >
                  Contact Us
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2 text-gray-700 hover:text-[#ff5a00] transition-colors"
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

          {/* Mega Menu Dropdowns */}
          {Object.entries(dropdownMenus).map(([key, menu]) => (
            <div
              key={key}
              className={`dropdown-menu absolute left-0 right-0 bg-white shadow-2xl border-t-4 border-[#ff5a00] ${
                activeDropdown === key ? 'active' : ''
              }`}
            >
              <div className="container mx-auto px-10 py-8">
                <div className="grid grid-cols-12 gap-8">
                  {/* Image Section */}
                  <div className="col-span-4">
                    <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden group">
                      <img
                        src={menu.image}
                        alt={menu.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                        <h3 className="text-white text-2xl font-bold">{menu.title}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="col-span-8">
                    <div className="grid grid-cols-2 gap-4">
                      {menu.links.map((link, index) => (
                        <Link
                          key={index}
                          to={link.path}
                          onClick={closeDropdown}
                          className="mega-menu-item group p-4 rounded-lg border border-gray-100 hover:border-[#ff5a00]"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-[#ff5a00] rounded-full mt-2 group-hover:scale-150 transition-transform" />
                            <div className="flex-1">
                              <h4 className="text-gray-900 font-semibold text-base mb-1 group-hover:text-[#ff5a00] transition-colors">
                                {link.name}
                              </h4>
                              <p className="text-gray-600 text-sm">{link.desc}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                  className="text-gray-700 hover:text-[#ff5a00] transition-colors p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <ul className="flex flex-col p-6 space-y-1">
                <li>
                  <NavLink
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 text-gray-700 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                      }`
                    }
                  >
                    Home
                  </NavLink>
                </li>

                {/* Mobile About Submenu */}
                <li>
                  <div className="px-4 py-3 text-gray-900 font-semibold">About Us</div>
                  <ul className="pl-4 space-y-1">
                    {dropdownMenus.about.links.map((link, i) => (
                      <li key={i}>
                        <NavLink
                          to={link.path}
                          onClick={() => setMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm text-gray-600 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md transition-colors ${
                              isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Mobile Services Submenu */}
                <li>
                  <div className="px-4 py-3 text-gray-900 font-semibold">Our Services</div>
                  <ul className="pl-4 space-y-1">
                    {dropdownMenus.services.links.map((link, i) => (
                      <li key={i}>
                        <NavLink
                          to={link.path}
                          onClick={() => setMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm text-gray-600 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md transition-colors ${
                              isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <li>
                  <NavLink
                    to="/team-member"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 text-gray-700 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                      }`
                    }
                  >
                    Team Member
                  </NavLink>
                </li>

                {/* Mobile Training Submenu */}
                <li>
                  <div className="px-4 py-3 text-gray-900 font-semibold">Training Programs</div>
                  <ul className="pl-4 space-y-1">
                    {dropdownMenus.training.links.map((link, i) => (
                      <li key={i}>
                        <NavLink
                          to={link.path}
                          onClick={() => setMenuOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm text-gray-600 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md transition-colors ${
                              isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <li>
                  <NavLink
                    to="/blogs"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 text-gray-700 hover:text-[#ff5a00] hover:bg-gray-50 rounded-md font-medium transition-colors ${
                        isActive ? 'text-[#ff5a00] bg-gray-50' : ''
                      }`
                    }
                  >
                    News And Insights
                  </NavLink>
                </li>
              </ul>

              <div className="p-6 border-t">
                <Link
                  to="/contact-us"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-[#ff5a00] text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-all"
                >
                  Contact Us
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
                      className="text-gray-600 hover:text-[#ff5a00] transition-all"
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