import { MessageSquare, Briefcase, Coffee, User, Building2, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { getInitialsFromName, getUserDisplayName } from "@/utils/formatters";

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const displayName = getUserDisplayName(user);
  const initials = getInitialsFromName(displayName);

  const menuItems = [
    {
      to: ROUTES.PROFESSIONAL_COMMUNICATION,
      icon: MessageSquare,
      label: "Professional Communication",
      description: "Connect with professionals",
    },
    {
      to: ROUTES.COMPANY_TASKS,
      icon: Briefcase,
      label: "Company and Task",
      description: "Manage company tasks",
    },
    {
      to: "/companies",
      icon: Building2,
      label: "Partner Companies",
      description: "Explore industry partners",
    },
    {
      to: ROUTES.KUPPY_SESSIONS,
      icon: Coffee,
      label: "Kuppy Sessions",
      description: "Join networking sessions",
    },
    {
      to: ROUTES.COURSES,
      icon: BookOpen,
      label: "New Courses",
      description: "Browse courses for students",
    },
  ];

  return (
    <div className="space-y-3 sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto pb-4">
      {/* Profile Card */}
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Profile
        </h3>
        <Link
          to={ROUTES.PROFILE}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-muted)] transition-all duration-200 active:scale-[0.98] group"
        >
          {/* Avatar Circle */}
          <div className="w-11 h-11 rounded-full bg-[var(--surface-muted)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm shrink-0 group-hover:ring-2 group-hover:ring-[var(--brand-soft)] transition-all overflow-hidden border border-[var(--border-soft)]">
            {user.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : user.firstname ? (
              initials
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)] text-sm leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-[var(--text-secondary)] capitalize mt-0.5">{user.role.replace("_", " ")}</p>
          </div>
        </Link>
      </div>
      {/* Menu Card */}
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Menu
        </h3>
        <div className="space-y-1">
          {menuItems.map(({ to, icon: Icon, label, description }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ease-in-out active:scale-[0.98] group ${
                  isActive ? "bg-[var(--brand-soft)] shadow-inner" : "hover:bg-[var(--surface-muted)]"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isActive
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--surface-muted)] text-[var(--text-secondary)] group-hover:bg-[var(--brand)] group-hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm leading-tight">
                    {label}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
