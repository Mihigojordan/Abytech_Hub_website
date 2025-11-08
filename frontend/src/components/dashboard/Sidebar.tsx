import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plane,
  Users,
  TrendingUp,
  User,
  X,
  Building,
  Briefcase,
  User2,
  Cog,
  Settings,
  Grid,
  ShoppingBasket,
  LucideBoxes,
  Inbox,
  PackageSearch,
  History,
  Store,
  ClipboardList,
  FolderTree,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPinned,
  Truck,
  TruckIcon,
  FlaskConical,
  FishSymbol,
  Database,
  Droplet,
  Beaker,
  Microscope,
  Egg,
  Waves,
  Soup,
  MoveRight,
  ClipboardCheck,
  SoupIcon,
  WheatIcon,
  Milk,
  ShoppingBag,
  File,
  Users2,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import useAdminAuth from "../../context/AdminAuthContext";
import logo from '../../assets/tran.png'


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
  allowedRoles?: string[];
}

interface DropdownGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle, }) => {
  const role = 'admin'
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const adminAuth = useAdminAuth();
 
  const auth =  adminAuth ;
  const user = auth.user;
  const navigate = useNavigate();

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };



  const getNavlinks = (role: string): (NavItem | DropdownGroup)[] => {
    const basePath = `/${role}/dashboard`;

    return [
      {
        id: "dashboard",
        label: "Dashboard Summary",
        icon: TrendingUp,
        path: basePath,
      },
      {
        id: "expense ",
        label: "Expense Management",
        icon: ShoppingBag,
        path: `${basePath}/expense`,
        
      },
      {
        id: "employee",
        label: "Employee Management",
        icon: Users2,
        path: `${basePath}/employee`,
        
      },
      {
        id: "report",
        label: "Report Management ",
        icon: File,
        path: `${basePath}/report`,
        
      },
      

    ];
  };


  const filterNavItems = (items: (NavItem | DropdownGroup)[]): (NavItem | DropdownGroup)[] => {
    return items
      .map((item) => {
        if ("items" in item) {
          const filteredItems = item.items.filter(
            (subItem) => !subItem.allowedRoles || subItem.allowedRoles.includes(role)
          );
          if (filteredItems.length === 0) return null;
          return { ...item, items: filteredItems };
        }
        if (!item.allowedRoles || item.allowedRoles.includes(role)) {
          return item;
        }
        return null;
      })
      .filter((item): item is NavItem | DropdownGroup => item !== null);
  };

  const navlinks = filterNavItems(getNavlinks(role));

  // Auto-open dropdown if current path matches any item inside it
  useEffect(() => {
    const currentPath = location.pathname;
    for (const item of navlinks) {
      if ("items" in item) {
        const hasActiveChild = item.items.some((subItem) => currentPath === subItem.path);
        if (hasActiveChild) {
          setOpenDropdown(item.id);
          break;
        }
      }
    }
  }, [location.pathname]);

  const getProfileRoute = () => `/${role}/dashboard/profile/${user?.id}`;

  const handleNavigateProfile = () => {
    const route = getProfileRoute();
    navigate(route, { replace: true });
  };

  const displayName =
    role === "admin"
      ? user?.adminName || "Admin User"
      : `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Employee User";

  const displayEmail =
    role === "admin"
      ? user?.adminEmail || "admin@example.com"
      : user?.email || "employee@example.com";

  const portalTitle = `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`;

  const isDropdownActive = (dropdown: DropdownGroup) => {
    const currentPath = location.pathname;
    return dropdown.items.some((item) => currentPath === item.path);
  };

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        className={({ isActive }) =>
          `w-full flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-200 group border-l-4 ${isActive
            ? "bg-white/15 text-white border-white"
            : "text-white/80 hover:bg-white/10 border-transparent"
          }`
        }
        onClick={() => {
          if (window.innerWidth < 1024) onToggle();
        }}
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-md ${isActive ? "bg-white text-[rgb(81,96,146)]" : "bg-white/10 text-white"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  const renderDropdown = (dropdown: DropdownGroup) => {
    const Icon = dropdown.icon;
    const isOpen = openDropdown === dropdown.id;
    const hasActiveChild = isDropdownActive(dropdown);

    return (
      <div key={dropdown.id} className="w-full">
        <button
          onClick={() => toggleDropdown(dropdown.id)}
          className={`w-full flex items-center justify-between px-2 py-4 rounded-lg transition-all duration-200 ${hasActiveChild
            ? "bg-white/15 text-white border-l-4 border-white"
            : "text-white/80 hover:bg-white/10 border-l-4 border-transparent"
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-md ${hasActiveChild ? "bg-white text-[rgb(81,96,146)]" : "bg-white/10 text-white"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{dropdown.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
              } ${hasActiveChild ? "text-white" : "text-white/60"}`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}
        >
          <div className="ml-4 space-y-0.5 border-l-2 border-white/20 pl-3 py-0.5">
            {dropdown.items.map((item) => {
              const SubIcon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-4 px-2 py-6 rounded-md transition-all duration-200 group relative ${isActive
                      ? "bg-white text-[rgb(81,96,146)] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full -ml-3"></div>
                      )}
                      <SubIcon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed left-0 top-0 min-h-screen bg-[rgb(81,96,146)] flex flex-col border-r border-[rgb(71,86,136)] shadow-lg transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-72`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <img src={logo} className="flex items-center justify-center w-10 h-10 rounded-lg" />
             
            
            <div>
              <h2 className="font-bold text-base text-white">
                ABYTECH-HUB LTD 
              </h2>
              <p className="text-xs text-white/70">{portalTitle}</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-0.5">
            {navlinks.length > 0 ? (
              navlinks.map((item) => {
                if ("items" in item) {
                  return renderDropdown(item);
                }
                return renderMenuItem(item);
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-white/60 text-xs">No menu items available</p>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className="p-2 border-t border-white/10 cursor-pointer"
          onClick={handleNavigateProfile}
        >
          <div className="flex items-center space-x-2 p-1.5 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-white/70 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;