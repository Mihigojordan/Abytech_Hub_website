/* ------------------------------------------------------------------
   1. Install:  npm i react-flag-icon-css
   2. Import the CSS once (e.g. in index.tsx or App.tsx):
        import "flag-icon-css/css/flag-icon.min.css";
   ------------------------------------------------------------------ */
import {
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  Lock,
  ChevronDown,
  Search,
  Maximize,
  Moon,
  Sun,
  ShoppingCart,
  Grid3x3,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminAuth from "../../context/AdminAuthContext";
import { API_URL } from "../../api/api";
import ReactCountryFlag from "react-country-flag";
interface HeaderProps {
  onToggle: () => void;
  role: string;
}

/* ------------------------------------------------------------------
   Helper – build a full URL for reports / profile images
   ------------------------------------------------------------------ */
function handleReportUrl(url: string) {
  if (!url) return null;
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes("://")) return trimmedUrl;
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : "/" + trimmedUrl;
  return baseUrl + path;
}

/* ------------------------------------------------------------------
   Country list – now uses ISO-3166-1 alpha-2 codes required by flag-icon-css
   ------------------------------------------------------------------ */
const countryOptions = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },   // <-- "gb" for UK flag
  { value: "ca", label: "Canada" },
  { value: "rw", label: "Rwanda" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
];

/* ------------------------------------------------------------------
   Mock employee auth – replace with real hook in your app
   ------------------------------------------------------------------ */
const useEmployeeAuth = () => {
  return {
    user: {},
    logout: () => {},
    lockEmployee: () => {},
  };
};

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */
const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const role = "admin";
  const navigate = useNavigate();
  const { user: adminUser, logout: adminLogout, lockAdmin } = useAdminAuth();
  const { user: employeeUser, logout: employeeLogout, lockEmployee } = useEmployeeAuth();

  const user = role === "admin" ? adminUser : employeeUser;
  const logout = role === "admin" ? adminLogout : employeeLogout;
  const lock = role === "admin" ? lockAdmin : lockEmployee;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCountryOpen, setIsCountryOpen] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const countryRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------------------------------------
     Logout / Lock
     ---------------------------------------------------------------- */
  const onLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLock = async () => {
    setIsLocking(true);
    try {
      await lock();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Lock error:", error);
    } finally {
      setIsLocking(false);
    }
  };

  /* ----------------------------------------------------------------
     Fullscreen / Dark-mode
     ---------------------------------------------------------------- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    // TODO: persist / apply dark-mode class to <html> if needed
  };

  /* ----------------------------------------------------------------
     User helpers
     ---------------------------------------------------------------- */
  const getDisplayName = (): string => {
    if (role === "admin") return adminUser?.adminName || "Admin";
    return employeeUser?.first_name
      ? `${employeeUser.first_name} ${employeeUser.last_name || ""}`.trim()
      : "Employee";
  };

  const getProfileImage = (): string | undefined => {
    return role === "admin"
      ? handleReportUrl(adminUser?.profileImage)
      : employeeUser?.profile_image;
  };

  const getEmail = (): string | undefined => {
    return role === "admin" ? adminUser?.adminEmail : employeeUser?.email;
  };

  const getInitials = (): string => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ----------------------------------------------------------------
     Close dropdowns on outside click / ESC
     ---------------------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  /* ----------------------------------------------------------------
     RENDER
     ---------------------------------------------------------------- */
  return (
    <header className="bg-white shadow-md border-b-2 border-gray-100"> {/* ← thinner border */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT – Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onToggle}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-4 h-4" /> {/* ← smaller icon */}
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* RIGHT – Icons + Profile */}
          <div className="flex items-center gap-1.5"> {/* ← tighter gap */}
            {/* COUNTRY SELECTOR */}
            {/* COUNTRY SELECTOR */}
<div className="relative" ref={countryRef}>
  <button
    onClick={() => setIsCountryOpen((v) => !v)}
    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
    title="Select Country"
  >
    <ReactCountryFlag
      countryCode={selectedCountry.value.toUpperCase()}
      svg
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
      title={selectedCountry.label}
    />
  </button>

  {isCountryOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
      <div className="py-1">
        {countryOptions.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setSelectedCountry(c);
              setIsCountryOpen(false);
            }}
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              selectedCountry.value === c.value
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <ReactCountryFlag
              countryCode={c.value.toUpperCase()}
              svg
              style={{
                width: '20px',
                height: '20px',
                marginRight: '12px',
                borderRadius: '3px',
              }}
            />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  )}
</div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold shadow-sm">
                3
              </span>
            </button>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative md:ml-4" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLocking}
              >
                <div className="w-8 h-8 bg-[rgb(81,96,146)] rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                  {getProfileImage() ? (
                    <img
                      src={getProfileImage()!}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs">
                      {getInitials()}
                    </span>
                  )}
                </div>

                <div className="text-left hidden md:block">
                  <div className="text-sm font-semibold text-gray-800">
                    {getDisplayName()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {role === "admin" ? "Administrator" : "Employee"}
                  </div>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 hidden md:block ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[rgb(81,96,146)] rounded-full flex items-center justify-center shadow-md">
                        {getProfileImage() ? (
                          <img
                            src={getProfileImage()!}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {getDisplayName()}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {getEmail()}
                        </div>
                        <div className="text-xs font-medium text-blue-600 mt-0.5">
                          {role === "admin" ? "Administrator" : "Employee"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate(
                          role === "admin"
                            ? `/admin/dashboard/profile/${user.id}`
                            : "/employee/dashboard/profile"
                        );
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                      My Profile
                    </button>

                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-500" />
                      Settings
                    </button>

                    <button
                      onClick={handleLock}
                      disabled={isLocking}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 mr-3 text-gray-500" />
                      {isLocking ? "Locking..." : "Lock Screen"}
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;