import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { UserSummary } from "@/types/user";
import { getInitialsFromName } from "@/utils/formatters";

type Props = {
  connections: UserSummary[];
  totalConnections: number;
  loading?: boolean;
  error?: string;
  isOwnProfile: boolean;
};

const FALLBACK_TILE_STYLES = [
  "bg-[#7ae7ea] text-slate-950",
  "bg-[#6aa533] text-white",
  "bg-[#ffbf16] text-slate-950",
  "bg-[#6c4b3f] text-white",
  "bg-[#3d505a] text-white",
  "bg-[#f5ff67] text-slate-950",
];

export default function ProfileConnectionsCard({
  connections,
  totalConnections,
  loading = false,
  error = "",
  isOwnProfile,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const visibleConnections = useMemo(() => {
    if (showAll) {
      return connections;
    }

    return connections.slice(0, 6);
  }, [connections, showAll]);

  const helperText = isOwnProfile
    ? "People you followed most recently appear here."
    : "This user's latest followed connections appear here.";

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[1.65rem] font-bold tracking-tight text-slate-900">Connections</h3>
        {connections.length > 6 ? (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="text-base font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            {showAll ? "Show Less" : "See All"}
          </button>
        ) : null}
      </div>

      <p className="text-[1.05rem] text-slate-500">
        {totalConnections} {totalConnections === 1 ? "connection" : "connections"}
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square rounded-[1.3rem] bg-slate-200" />
              <div className="mx-auto mt-2 h-4 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !error && visibleConnections.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5">
          {visibleConnections.map((connection, index) => {
            const displayName = connection.fullName.trim() || "UniBond User";
            const fallbackStyle = FALLBACK_TILE_STYLES[index % FALLBACK_TILE_STYLES.length];

            return (
              <Link
                key={connection.id}
                to={connection.profilePath}
                className="group flex min-w-0 flex-col items-center text-center"
              >
                {connection.avatar ? (
                  <img
                    src={connection.avatar}
                    alt={displayName}
                    className="aspect-square w-full rounded-[1.3rem] object-cover shadow-sm transition duration-200 group-hover:scale-[1.02] group-hover:shadow-md"
                  />
                ) : (
                  <div
                    className={`flex aspect-square w-full items-center justify-center rounded-[1.3rem] text-[2.85rem] font-semibold shadow-sm transition duration-200 group-hover:scale-[1.02] group-hover:shadow-md ${fallbackStyle}`}
                  >
                    {getInitialsFromName(displayName)}
                  </div>
                )}
                <span className="mt-2 w-full truncate text-[0.97rem] font-medium text-slate-700 transition group-hover:text-blue-700">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && visibleConnections.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">No connections to show yet.</p>
          <p className="mt-1">{helperText}</p>
        </div>
      ) : null}
    </div>
  );
}
