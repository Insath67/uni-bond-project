import { useNavigate } from "react-router-dom";
import Avatar from "@/components/common/Avatar";
import EmptyState from "@/components/common/EmptyState";
import { Radio } from "lucide-react";
import type { OnlineContact } from "@/types/user";

type Props = {
  contacts: OnlineContact[];
  loading?: boolean;
};

export default function OnlineContactsList({ contacts, loading }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-[var(--surface-muted)] rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-[var(--surface-muted)] rounded w-24 mb-1"></div>
              <div className="h-3 bg-[var(--surface-muted)] rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        title="No active users right now"
        description="When people are using UniBond, they will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <button
          key={contact.id}
          type="button"
          onClick={() => navigate(contact.profilePath)}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-[var(--surface-elevated)] px-2 py-2 text-left transition hover:border-[var(--border-soft)] hover:bg-[var(--surface-muted)]"
        >
          <div className="relative">
            <Avatar src={contact.avatar} alt={contact.fullName} size="sm" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[var(--surface-elevated)] bg-green-500"></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-[var(--text-primary)]">{contact.fullName}</p>
            <p className="truncate text-xs capitalize text-[var(--text-secondary)]">
              {contact.role.replace("_", " ")}
              {contact.location ? ` • ${contact.location}` : ""}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
