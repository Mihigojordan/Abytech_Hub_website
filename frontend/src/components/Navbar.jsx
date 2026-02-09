import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Link as ScrollLink, scroller } from "react-scroll";
import {
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import Logo from "../assets/tran.png";
import navImage1 from "../assets/images/navbar/image1.png";
import navImage2 from "../assets/images/navbar/image2.png";
import navImage3 from "../assets/images/navbar/image3.png";
import navImage4 from "../assets/images/navbar/image4.png";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dropdownMenus = {
    about: {
      title: "About AbyTech",
      image: navImage1,
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
      image: navImage2,
      isScroll: true,
      rootPath: "/services",
      links: [
        { name: "Data Analysis", to: "analysis", desc: "Transform data into insights" },
        { name: "Cyber Security", to: "cybersecurity", desc: "Protect your digital assets" },
        { name: "Software Development", to: "software-development", desc: "Custom solutions built" },
        { name: "Database Management", to: "database-management", desc: "Efficient data systems" },
        { name: "UI/UX Design", to: "ui-ux-design", desc: "Beautiful user experiences" },
        { name: "Web & App Hosting", to: "web-hosting", desc: "Reliable cloud hosting" },
        { name: "IoT Solutions", to: "iot-solutions", desc: "Connected smart devices" },
        { name: "DevOps Automation", to: "devops", desc: "Streamline deployments" },
      ],
    },
    training: {
      title: "Training Programs",
      image: navImage3,
      isScroll: true,
      rootPath: "/training",
      links: [
        { name: "Academic Training", to: "academic-partnership", desc: "Comprehensive courses" },
        { name: "AWS Cloud Training", to: "amazon-career-choice", desc: "Cloud certification prep" },
        { name: "Apprenticeship Program", to: "tech-apprenticeship", desc: "Hands-on experience" },
        { name: "Cisco Training", to: "cisco-training", desc: "Network expertise" },
        { name: "3 Month Program", to: "three-month-training", desc: "Deep dive courses" },
        { name: "6 Month Certification", to: "six-month-training", desc: "Professional mastery" },
      ],
    },
    insights: {
      title: "News & Insights",
      image: navImage4,
      isScroll: true,
      rootPath: "/insights",
      links: [
        { name: "Tech Trends", to: "trends", desc: "Digital shifts in Rwanda" },
        { name: "Past Events", to: "events", desc: "Recaps and highlights" },
        { name: "Announcements", to: "announcements", desc: "Latest Hub updates" },
        { name: "Career Opportunities", to: "jobs", desc: "Join our tech team" },
      ],
    },
  };

  const handleScrollLink = (rootPath, to) => {
    if (location.pathname === rootPath) {
      scroller.scrollTo(to, {
        duration: 800,
        delay: 0,
        smooth: "easeInOutQuart",
        offset: -100,
      });
    } else {
      navigate(rootPath, { state: { scrollTo: to } });
    }
    setActiveDropdown(null);
    setMenuOpen(false);
  };

  // Effect to handle scrolling after navigation
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        scroller.scrollTo(location.state.scrollTo, {
          duration: 800,
          delay: 0,
          smooth: "easeInOutQuart",
          offset: -100,
        });
      }, 500);
      // Clear state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <style>{`
        .nav-transition { transition: all 0.3s ease; }
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #ff5a00; transition: width 0.3s ease; }
        .nav-link:hover::after { width: 100%; }
        .dropdown-menu { opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; }
        .dropdown-menu.active { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
        .dropdown-overlay { opacity: 0; visibility: hidden; transition: all 0.3s ease; }
        .dropdown-overlay.active { opacity: 1; visibility: visible; }
        .mega-menu-item { transition: all 0.3s ease; }
        .mega-menu-item:hover { transform: translateX(8px); background: rgba(255, 90, 0, 0.05); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .mega-menu-item { animation: fadeInUp 0.4s ease forwards; opacity: 0; }
        ${[...Array(10)].map((_, i) => `.mega-menu-item:nth-child(${i + 1}) { animation-delay: ${i * 0.05}s; }`).join('\n')}
      `}</style>

      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 dropdown-overlay ${activeDropdown ? 'active' : ''}`}
        onClick={closeDropdown}
      />

      <header className={`fixed top-0 left-0 w-full z-50 nav-transition ${scrolled ? 'shadow-lg' : ''}`}>
        <nav className="bg-[#F5F7FF] shadow-md">
          <div className="px-10">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-105" onClick={closeDropdown}>
                <img src={Logo} alt="Brand Logo" className="h-16 scale-140 w-auto object-contain" />
              </Link>

              <ul className="hidden lg:flex items-center space-x-8">
                <li>
                  <NavLink to="/" onClick={closeDropdown} className={({ isActive }) => `nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${isActive ? 'text-[#ff5a00]' : ''}`}>
                    <span>Home</span>
                  </NavLink>
                </li>

                <li className="relative">
                  <button onClick={() => handleDropdownClick('about')} className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${activeDropdown === 'about' ? 'text-[#ff5a00]' : ''}`}>
                    <span>About Us</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                <li className="relative">
                  <button onClick={() => handleDropdownClick('services')} className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${activeDropdown === 'services' || location.pathname === '/services' ? 'text-[#ff5a00]' : ''}`}>
                    <span>Our Services</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                <li>
                  <NavLink to="/team-member" onClick={closeDropdown} className={({ isActive }) => `nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${isActive ? 'text-[#ff5a00]' : ''}`}>
                    <span>Team Member</span>
                  </NavLink>
                </li>

                <li className="relative">
                  <button onClick={() => handleDropdownClick('training')} className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${activeDropdown === 'training' || location.pathname === '/training' ? 'text-[#ff5a00]' : ''}`}>
                    <span>Training Programs</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'training' ? 'rotate-180' : ''}`} />
                  </button>
                </li>

                <li className="relative">
                  <button onClick={() => handleDropdownClick('insights')} className={`nav-link flex items-center space-x-1 text-gray-700 hover:text-[#ff5a00] font-medium transition-colors ${activeDropdown === 'insights' || location.pathname === '/insights' ? 'text-[#ff5a00]' : ''}`}>
                    <span>News And Insights</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'insights' ? 'rotate-180' : ''}`} />
                  </button>
                </li>
              </ul>

              <div className="flex items-center space-x-4">
                <Link to="/contact-us" className="hidden lg:block bg-[#ff5a00] text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-all duration-300">
                  Contact Us
                </Link>
                <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-700 hover:text-[#ff5a00] transition-colors">
                  {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {Object.entries(dropdownMenus).map(([key, menu]) => (
            <div key={key} className={`dropdown-menu absolute left-0 right-0 bg-white shadow-2xl border-t-4 border-[#ff5a00] ${activeDropdown === key ? 'active' : ''}`}>
              <div className="container mx-auto px-10 py-8">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4">
                    <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden group">
                      <img src={menu.image} alt={menu.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                        <h3 className="text-white text-2xl font-bold">{menu.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-8">
                    <div className="grid grid-cols-2 gap-4">
                      {menu.links.map((link, index) => (
                        menu.isScroll ? (
                          <button
                            key={index}
                            onClick={() => handleScrollLink(menu.rootPath, link.to)}
                            className="mega-menu-item text-left group p-4 rounded-lg border border-gray-100 hover:border-[#ff5a00]"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-[#ff5a00] rounded-full mt-2 group-hover:scale-150 transition-transform" />
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-base mb-1 group-hover:text-[#ff5a00] transition-colors">{link.name}</h4>
                                <p className="text-gray-600 text-sm">{link.desc}</p>
                              </div>
                            </div>
                          </button>
                        ) : (
                          <Link key={index} to={link.path} onClick={closeDropdown} className="mega-menu-item group p-4 rounded-lg border border-gray-100 hover:border-[#ff5a00]">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-[#ff5a00] rounded-full mt-2 group-hover:scale-150 transition-transform" />
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-base mb-1 group-hover:text-[#ff5a00] transition-colors">{link.name}</h4>
                                <p className="text-gray-600 text-sm">{link.desc}</p>
                              </div>
                            </div>
                          </Link>
                        )
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
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div className="lg:hidden fixed top-0 left-0 w-4/5 max-w-sm h-full bg-white z-40 shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <img src={Logo} alt="Brand Logo" className="h-10 w-auto object-contain" />
                <button onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-[#ff5a00] p-2"><FiX className="w-6 h-6" /></button>
              </div>
              <ul className="flex flex-col p-6 space-y-1 text-gray-700">
                <li><NavLink to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 hover:text-[#ff5a00] font-medium">Home</NavLink></li>

                <li>
                  <div className="px-4 py-3 font-bold">About Us</div>
                  <ul className="pl-4 border-l-2 border-[#ff5a00]/10 ml-4">
                    {dropdownMenus.about.links.map((link, i) => (
                      <li key={i}><Link to={link.path} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:text-[#ff5a00]">{link.name}</Link></li>
                    ))}
                  </ul>
                </li>

                <li>
                  <div className="px-4 py-3 font-bold">Our Services</div>
                  <ul className="pl-4 border-l-2 border-[#ff5a00]/10 ml-4">
                    {dropdownMenus.services.links.map((link, i) => (
                      <li key={i}><button onClick={() => handleScrollLink('/services', link.to)} className="block w-full text-left px-4 py-2 text-sm hover:text-[#ff5a00]">{link.name}</button></li>
                    ))}
                  </ul>
                </li>

                <li><NavLink to="/team-member" onClick={() => setMenuOpen(false)} className="block px-4 py-3 hover:text-[#ff5a00] font-medium">Team Member</NavLink></li>

                <li>
                  <div className="px-4 py-3 font-bold">Training Programs</div>
                  <ul className="pl-4 border-l-2 border-[#ff5a00]/10 ml-4">
                    {dropdownMenus.training.links.map((link, i) => (
                      <li key={i}><button onClick={() => handleScrollLink('/training', link.to)} className="block w-full text-left px-4 py-2 text-sm hover:text-[#ff5a00]">{link.name}</button></li>
                    ))}
                  </ul>
                </li>

                <li>
                  <div className="px-4 py-3 font-bold">News And Insights</div>
                  <ul className="pl-4 border-l-2 border-[#ff5a00]/10 ml-4">
                    {dropdownMenus.insights.links.map((link, i) => (
                      <li key={i}><button onClick={() => handleScrollLink('/insights', link.to)} className="block w-full text-left px-4 py-2 text-sm hover:text-[#ff5a00]">{link.name}</button></li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          </>
        )}
      </header>
    </>
  );
}

export default NavBar;