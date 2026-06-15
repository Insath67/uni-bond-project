import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type Props = {
  to: string;
  icon: LucideIcon;
  label: string;
  description?: string;
};

export default function SidebarButton({ to, icon: Icon, label, description }: Props) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ease-in-out active:scale-[0.98] group ${
        isActive ? "bg-[var(--brand-soft)] shadow-sm ring-1 ring-[var(--border-soft)]" : "hover:bg-[var(--surface-muted)]"
      }`}
    >
      <div
        className={`p-2.5 rounded-xl transition-colors ${
          isActive
            ? "bg-[var(--brand)] text-white shadow-sm"
            : "bg-[var(--surface-elevated)] border border-[var(--border-soft)] text-[var(--text-muted)] group-hover:bg-[var(--brand-soft)] group-hover:text-[var(--brand)] group-hover:border-[var(--brand-soft)]"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`font-semibold ${isActive ? "text-[var(--brand-strong)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs mt-0.5 ${isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`}>
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
