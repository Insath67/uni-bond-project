import { Search, AlertCircle } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import UserDiscoveryCard from "@/components/user/UserDiscoveryCard";
import type { DiscoverUser } from "@/types/user";

type Props = {
  users: DiscoverUser[];
  loading?: boolean;
  error?: string;
};

export default function DiscoverUsersList({ users, loading, error }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-3 shadow-sm animate-pulse"
          >
            <div className="h-8 w-8 rounded-full bg-[var(--surface-muted)]" />
            <div className="flex-1">
              <div className="mb-2 h-4 w-28 rounded bg-[var(--surface-muted)]" />
              <div className="mb-2 h-3 w-20 rounded bg-[var(--surface-muted)]" />
              <div className="h-3 w-24 rounded bg-[var(--surface-muted)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load people"
        description={error}
        className="py-5"
      />
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No new people yet"
        description="We'll show more UniBond members here when available."
        className="py-5"
      />
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserDiscoveryCard key={user.id} user={user} />
      ))}
    </div>
  );
}
