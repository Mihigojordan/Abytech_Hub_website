import React, { useState, useEffect } from "react";
import {
  Users2,
  TrendingUp,
  User,
  X,
  ShoppingBag,
  ClipboardList,
  MessageSquare,
  Target,
  Calendar,
  Globe,
  GraduationCap,
  Microscope,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAdminAuth from "../../context/AdminAuthContext";
import logo from "../../assets/tran.png";
import { ORG, TEAL, bc, ba } from "../../utils/homeConstants";

/* ── Always-dark sidebar palette ─────────────────────── */
const SB = {
  bg:       "#0b1923",
  item:     "#0d1f2d",
  border:   "rgba(255,255,255,.07)",
  text:     "rgba(255,255,255,.75)",
  textMuted:"rgba(255,255,255,.35)",
  activeText: "#ffffff",
  activeBg: "rgba(232,98,26,.12)",
  activeBorder: ORG,
  hoverBg:  "rgba(255,255,255,.04)",
};

interface SidebarProps {
  isOpen?: boolean;
  onToggle: () => void;
  role: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  requiredPermission?: string;
  requireSuperAdmin?: boolean;
}

interface DropdownGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const role = "admin";
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const adminAuth = useAdminAuth();
  const { user } = adminAuth;
  const navigate = useNavigate();

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const getNavlinks = (role: string): (NavItem | DropdownGroup)[] => {
    const basePath = `/${role}/dashboard`;
    return [
      { id: "dashboard",   label: "Dashboard Summary",          icon: TrendingUp,    path: basePath },
      { id: "expense",     label: "Expense Management",         icon: ShoppingBag,   path: `${basePath}/expense`,        requiredPermission: "expense_management" },
      { id: "salary",      label: "Salary Management",          icon: Wallet,        path: `${basePath}/salary`,         requiredPermission: "salary_management" },
      { id: "employee",    label: "Employee Management",        icon: Users2,        path: `${basePath}/employee`,       requiredPermission: "employee_management" },
      { id: "interns",     label: "Intern Management",          icon: GraduationCap, path: `${basePath}/interns`,        requiredPermission: "internship_management" },
      { id: "chat",        label: "Chat Management",            icon: MessageSquare, path: `${basePath}/chat`,           requiredPermission: "chat_management" },
      { id: "report",      label: "Report Management",          icon: ClipboardList, path: `${basePath}/report` },
      { id: "meeting",     label: "Meeting Management",         icon: Calendar,      path: `${basePath}/meetings`,       requiredPermission: "meeting_management" },
      { id: "weekly-goals",label: "Weekly Goals Management",    icon: Target,        path: `${basePath}/weekly-goals`,   requiredPermission: "weekly_management" },
      { id: "research",    label: "Research Management",        icon: Microscope,    path: `${basePath}/research`,       requiredPermission: "research_management" },
      { id: "hosted-web",  label: "Hosted Website Management",  icon: Globe,         path: `${basePath}/hosted-website`, requiredPermission: "hosted_website" },
      { id: "internships", label: "Internship Management",      icon: GraduationCap, path: `${basePath}/internships`,    requiredPermission: "internship_management" },
      { id: "permissions", label: "Permission Management",      icon: Users2,        path: `${basePath}/permissions`,    requireSuperAdmin: true },
    ];
  };

  const filterNavItems = (items: (NavItem | DropdownGroup)[]): (NavItem | DropdownGroup)[] => {
    return items
      .map((item) => {
        if ("items" in item) {
          const filteredItems = item.items.filter((subItem) => {
            if (subItem.requireSuperAdmin && !adminAuth.isSuperAdmin) return false;
            if (adminAuth.isSuperAdmin) return true;
            if (subItem.requiredPermission && !adminAuth.hasPermission(subItem.requiredPermission)) return false;
            return true;
          });
          if (filteredItems.length === 0) return null;
          return { ...item, items: filteredItems };
        }
        if (item.requireSuperAdmin && !adminAuth.isSuperAdmin) return null;
        if (adminAuth.isSuperAdmin) return item;
        if (item.requiredPermission && !adminAuth.hasPermission(item.requiredPermission)) return null;
        return item;
      })
      .filter((item): item is NavItem | DropdownGroup => item !== null);
  };

  const navlinks = filterNavItems(getNavlinks(role));

  useEffect(() => {
    const currentPath = location.pathname;
    for (const item of navlinks) {
      if ("items" in item) {
        const hasActiveChild = item.items.some((subItem) => currentPath === subItem.path);
        if (hasActiveChild) { setOpenDropdown(item.id); break; }
      }
    }
  }, [location.pathname]);

  const getProfileRoute = () => `/${role}/dashboard/profile/${user?.id}`;

  const displayName =
    user?.adminName || "Admin User";

  const displayEmail =
    user?.adminEmail || "admin@abytechhub.com";

  const isDropdownActive = (dropdown: DropdownGroup) =>
    dropdown.items.some((item) => location.pathname === item.path);

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 12px",
          borderRadius: 4,
          borderLeft: `3px solid ${isActive ? ORG : "transparent"}`,
          background: isActive ? SB.activeBg : "transparent",
          textDecoration: "none",
          transition: "all .15s",
        })}
        onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
      >
        {({ isActive }) => (
          <>
            <div style={{
              width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: isActive ? ORG : "rgba(255,255,255,.06)",
              transition: "background .15s",
            }}>
              <Icon size={14} color={isActive ? "#fff" : SB.text} />
            </div>
            <span style={{ ...ba(13, 500, { color: isActive ? SB.activeText : SB.text, letterSpacing: .3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>
              {item.label}
            </span>
          </>
        )}
      </NavLink>
    );
  };

  const renderDropdown = (dropdown: DropdownGroup) => {
    const Icon = dropdown.icon;
    const open = openDropdown === dropdown.id;
    const active = isDropdownActive(dropdown);

    return (
      <div key={dropdown.id}>
        <button
          onClick={() => toggleDropdown(dropdown.id)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, padding: "9px 12px", borderRadius: 4,
            borderLeft: `3px solid ${active ? ORG : "transparent"}`,
            background: active ? SB.activeBg : "transparent",
            cursor: "pointer", border: "none", transition: "all .15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: active ? ORG : "rgba(255,255,255,.06)" }}>
              <Icon size={14} color={active ? "#fff" : SB.text} />
            </div>
            <span style={{ ...ba(13, 500, { color: active ? SB.activeText : SB.text }) }}>{dropdown.label}</span>
          </div>
          <ChevronDown size={13} color={SB.textMuted} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }} />
        </button>

        <div style={{ overflow: "hidden", maxHeight: open ? 400 : 0, transition: "max-height .3s ease", marginLeft: 14, borderLeft: `1px solid ${SB.border}`, paddingLeft: 10 }}>
          {dropdown.items.map((item) => {
            const SubIcon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 4, margin: "2px 0",
                  background: isActive ? SB.activeBg : "transparent",
                  borderLeft: `2px solid ${isActive ? ORG : "transparent"}`,
                  textDecoration: "none", transition: "all .15s",
                })}
                onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
              >
                {({ isActive }) => (
                  <>
                    <SubIcon size={13} color={isActive ? ORG : SB.text} />
                    <span style={{ ...ba(12, 400, { color: isActive ? SB.activeText : SB.text }) }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 min-h-screen flex flex-col transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 w-72 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: SB.bg, borderRight: `1px solid ${SB.border}` }}
      >
        {/* Logo header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${SB.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="AbyTech" style={{ width: 36, height: 36, borderRadius: 4, objectFit: "contain" }} />
            <div>
              <div style={{ ...bc(13, 700, { color: "#fff", letterSpacing: 1 }) }}>ABYTECH-HUB</div>
              <div style={{ ...bc(9, 600, { color: ORG, letterSpacing: 3, textTransform: "uppercase" }) }}>Admin Portal</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden"
            style={{ padding: 4, borderRadius: 4, background: "rgba(255,255,255,.06)", border: "none", cursor: "pointer" }}
          >
            <X size={14} color={SB.text} />
          </button>
        </div>

        {/* Section label */}
        <div style={{ padding: "14px 16px 6px", ...bc(9, 700, { color: SB.textMuted, letterSpacing: 4, textTransform: "uppercase" }) }}>
          Navigation
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px 12px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navlinks.length > 0 ? (
              navlinks.map((item) =>
                "items" in item ? renderDropdown(item) : renderMenuItem(item)
              )
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0", ...ba(12, 400, { color: SB.textMuted }) }}>
                No menu items available
              </div>
            )}
          </nav>
        </div>

        {/* User footer */}
        <div
          onClick={() => navigate(getProfileRoute())}
          style={{ padding: "10px 12px", borderTop: `1px solid ${SB.border}`, cursor: "pointer" }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 4,
            background: "rgba(232,98,26,.08)", border: `1px solid rgba(232,98,26,.2)`,
            transition: "background .15s",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: ORG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={15} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...ba(12, 600, { color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{displayName}</div>
              <div style={{ ...ba(10, 400, { color: "rgba(232,98,26,.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{displayEmail}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
