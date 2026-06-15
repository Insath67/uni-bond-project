import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Users,
  Bell,
  FileText,
  User,
  LogOut,
  Shield,
  Moon,
  Sun,
} from "lucide-react";

import AppLogo from "@/components/common/AppLogo";
import SearchBar from "@/components/common/SearchBar";
import IconNavButton from "@/components/common/IconNavButton";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useTheme } from "@/hooks/useTheme";
import { getInitialsFromName, getUserDisplayName } from "@/utils/formatters";

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const displayName = user ? getUserDisplayName(user) : "";
  const userInitials = displayName ? getInitialsFromName(displayName) : "";

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--text-primary)] shadow-lg backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--surface-muted)]"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center">
              <AppLogo />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <IconNavButton to={ROUTES.HOME} icon={Home} label="Home" />
            <IconNavButton to={ROUTES.GROUPS} icon={Users} label="Groups" />
            <IconNavButton to={ROUTES.NOTICES} icon={FileText} label="Notices" />
            <IconNavButton to={ROUTES.NOTIFICATIONS} icon={Bell} label="Notifications" />

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-strong)] transition overflow-hidden border-2 border-transparent hover:border-[var(--surface-elevated)] focus:outline-none"
              >
                {user ? (
                  user.avatar ? (
                    <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold uppercase">{userInitials}</span>
                  )
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 panel-surface rounded-xl py-1.5 z-50 text-[var(--text-primary)]">
                  {user && (
                    <div className="px-4 py-3 border-b border-[var(--border-soft)]">
                      <p className="font-semibold text-sm truncate">{displayName}</p>
                      <p className="text-xs text-[var(--text-secondary)] capitalize mt-0.5">{user.role.replace("_", " ")}</p>
                    </div>
                  )}
                  {/* Admin Panel link — only for admins */}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-sm hover:bg-[var(--brand-soft)] text-[var(--brand)] font-semibold flex items-center gap-2 border-b border-[var(--border-soft)]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to={ROUTES.PROFILE}
                    className="block px-4 py-2 text-sm hover:bg-[var(--surface-muted)] flex items-center gap-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--surface-muted)] flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </nav>
  );
}
