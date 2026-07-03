import {
  MessageSquare,
  Briefcase,
  GraduationCap,
  User,
  Building2,
  BookOpen,
} from "lucide-react";
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
      icon: GraduationCap,
      label: "Student Support Sessions",
      description: "Get academic help and peer support",
    },
    {
      to: ROUTES.COURSES,
      icon: BookOpen,
      label: "New Courses",
      description: "Browse courses for students",
    },
  ];

  return (
    <div className="sticky top-0 max-h-full space-y-3 overflow-y-auto pb-4">
      {/* Profile Card */}
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Profile
        </h3>

        <Link
          to={ROUTES.PROFILE}
          className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-[var(--surface-muted)] active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] text-sm font-bold text-[var(--text-primary)] transition-all group-hover:ring-2 group-hover:ring-[var(--brand-soft)]">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : user.firstname ? (
              initials
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs capitalize text-[var(--text-secondary)]">
              {user.role.replace("_", " ")}
            </p>
          </div>
        </Link>
      </div>

      {/* Menu Card */}
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Menu
        </h3>

        <div className="space-y-1">
          {menuItems.map(({ to, icon: Icon, label, description }) => {
            const isActive = location.pathname === to;

            return (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 ease-in-out active:scale-[0.98] ${
                  isActive
                    ? "bg-[var(--brand-soft)] shadow-inner"
                    : "hover:bg-[var(--surface-muted)]"
                }`}
              >
                <div
                  className={`shrink-0 rounded-lg p-2 transition-colors ${
                    isActive
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--surface-muted)] text-[var(--text-secondary)] group-hover:bg-[var(--brand)] group-hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}