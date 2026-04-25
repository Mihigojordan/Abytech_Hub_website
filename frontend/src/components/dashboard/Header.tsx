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
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminAuth from "../../context/AdminAuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { NotificationPanel } from "./NotificationPanel";
import { API_URL } from "../../api/api";
import ReactCountryFlag from "react-country-flag";
import { useDashboardTheme } from "../../utils/dashboardTheme";
import { ORG, TEAL, bc, ba } from "../../utils/homeConstants";

interface HeaderProps {
  onToggle: () => void;
  role: string;
}

function handleReportUrl(url: string) {
  if (!url) return null;
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes("://")) return trimmedUrl;
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const path = trimmedUrl.startsWith("/") ? trimmedUrl : "/" + trimmedUrl;
  return baseUrl + path;
}

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "rw", label: "Rwanda" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
];

const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const { user: adminUser, logout: adminLogout, lockAdmin } = useAdminAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const countryRef = useRef<HTMLDivElement | null>(null);

  const onLogout = async () => {
    try { await adminLogout(); setIsDropdownOpen(false); }
    catch (error) { console.error("Logout error:", error); }
  };

  const handleLock = async () => {
    setIsLocking(true);
    try { await lockAdmin(); setIsDropdownOpen(false); }
    catch (error) { console.error("Lock error:", error); }
    finally { setIsLocking(false); }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDisplayName = (): string => adminUser?.adminName || "Admin";
  const getProfileImage = (): string | null => handleReportUrl(adminUser?.profileImage);
  const getEmail = (): string | undefined => adminUser?.adminEmail;
  const getInitials = (): string =>
    getDisplayName().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setIsCountryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsDropdownOpen(false); setIsCountryOpen(false); setIsNotificationOpen(false); }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const iconBtn: React.CSSProperties = {
    padding: "6px 8px", borderRadius: 4, background: "transparent",
    border: `1px solid ${border}`, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", transition: "background .15s",
  };

  return (
    <>
      <header style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div style={{ padding: "10px 20px" }}>
          <div className="flex items-center justify-between gap-4">

            {/* LEFT — Menu + Search */}
            <div className="flex items-center gap-3 flex-1">
              <button onClick={onToggle} style={{ ...iconBtn }} className="lg:hidden">
                <Menu size={16} color={textC} />
              </button>

              <div className="relative flex-1 max-w-md">
                <Search size={14} color={text2} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                    background: bg3, border: `1px solid ${border}`, borderRadius: 4, outline: "none",
                    ...ba(13, 400, { color: textC }),
                  }}
                />
              </div>
            </div>

            {/* RIGHT — Controls + Profile */}
            <div className="flex items-center gap-2">

              {/* Country Selector */}
              <div className="relative" ref={countryRef}>
                <button onClick={() => setIsCountryOpen((v) => !v)} style={iconBtn} title="Select Country">
                  <ReactCountryFlag
                    countryCode={selectedCountry.value.toUpperCase()}
                    svg
                    style={{ width: 18, height: 18, borderRadius: 3 }}
                    title={selectedCountry.label}
                  />
                </button>

                {isCountryOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: 180, background: bg2, border: `1px solid ${border}`, borderRadius: 4, zIndex: 50, overflow: "hidden" }}>
                    {countryOptions.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", padding: "8px 14px",
                          background: selectedCountry.value === c.value ? "rgba(232,98,26,.1)" : "transparent",
                          border: "none", cursor: "pointer", transition: "background .12s",
                          ...ba(13, 400, { color: selectedCountry.value === c.value ? ORG : textC }),
                        }}
                      >
                        <ReactCountryFlag countryCode={c.value.toUpperCase()} svg style={{ width: 16, height: 16, borderRadius: 2 }} />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} style={iconBtn} title="Toggle Fullscreen">
                <Maximize size={15} color={text2} />
              </button>

              {/* Dark Mode Toggle — now wired to real ThemeContext */}
              <button onClick={toggleTheme} style={iconBtn} title="Toggle Dark Mode">
                {isDark ? <Sun size={15} color={ORG} /> : <Moon size={15} color={TEAL} />}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                style={{ ...iconBtn, position: "relative" }}
                title="Notifications"
              >
                <Bell size={15} color={text2} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4, minWidth: 16, height: 16,
                    padding: "0 4px", background: "#e84040", color: "#fff",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    ...bc(9, 700, {}),
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  disabled={isLocking}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 4, border: `1px solid ${border}`, background: "transparent", cursor: "pointer" }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: ORG, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {getProfileImage() ? (
                      <img src={getProfileImage()!} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ ...bc(11, 700, { color: "#fff" }) }}>{getInitials()}</span>
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <div style={{ ...ba(12, 600, { color: textC }) }}>{getDisplayName()}</div>
                    <div style={{ ...ba(10, 400, { color: ORG }) }}>Administrator</div>
                  </div>
                  <ChevronDown size={12} color={text2} style={{ transition: "transform .2s", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} className="hidden md:block" />
                </button>

                {isDropdownOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: 240, background: bg2, border: `1px solid ${border}`, borderRadius: 4, zIndex: 50, overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, background: bg3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: ORG, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                          {getProfileImage() ? (
                            <img src={getProfileImage()!} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ ...bc(13, 700, { color: "#fff" }) }}>{getInitials()}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...ba(13, 600, { color: textC, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{getDisplayName()}</div>
                          <div style={{ ...ba(11, 400, { color: text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{getEmail()}</div>
                          <div style={{ ...ba(10, 600, { color: ORG }) }}>Administrator</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "4px 0" }}>
                      {[
                        { icon: User,     label: "My Profile", onClick: () => { navigate(`/admin/dashboard/profile/${adminUser?.id}`); setIsDropdownOpen(false); } },
                        { icon: Settings, label: "Settings",   onClick: () => setIsDropdownOpen(false) },
                        { icon: Lock,     label: isLocking ? "Locking…" : "Lock Screen", onClick: handleLock, disabled: isLocking },
                      ].map(({ icon: Icon, label, onClick, disabled }) => (
                        <button
                          key={label}
                          onClick={onClick}
                          disabled={disabled}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "9px 16px", background: "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer",
                            ...ba(13, 400, { color: textC }), opacity: disabled ? .5 : 1, transition: "background .12s",
                          }}
                        >
                          <Icon size={14} color={text2} />
                          {label}
                        </button>
                      ))}

                      <div style={{ height: 1, background: border, margin: "4px 0" }} />

                      <button
                        onClick={onLogout}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%",
                          padding: "9px 16px", background: "transparent", border: "none", cursor: "pointer",
                          ...ba(13, 400, { color: "#e84040" }), transition: "background .12s",
                        }}
                      >
                        <LogOut size={14} color="#e84040" />
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

      <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
};

export default Header;
