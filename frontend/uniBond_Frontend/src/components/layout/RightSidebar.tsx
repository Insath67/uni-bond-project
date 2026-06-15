import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OnlineContactsList from "@/components/friend/OnlineContactsList";
import DiscoverUsersList from "@/components/user/DiscoverUsersList";
import { handleGetDiscoverUsers, handleGetOnlineUsers } from "@/controllers/userController";
import { handleGetTasks } from "@/controllers/taskController";
import type { DiscoverUser, OnlineContact } from "@/types/user";
import type { Task } from "@/types/task";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

const DISCOVER_LIMIT = 6;
const ONLINE_LIMIT = 8;

export default function RightSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [onlineContacts, setOnlineContacts] = useState<OnlineContact[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [topTasks, setTopTasks] = useState<Task[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [contactsError, setContactsError] = useState("");
  const [discoverError, setDiscoverError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const viewedProfileId = location.pathname.startsWith("/profile/")
      ? location.pathname.split("/")[2]
      : undefined;

    const loadSidebarData = async () => {
      try {
        setContactsLoading(true);
        setDiscoverLoading(true);
        setContactsError("");
        setDiscoverError("");

        const [contacts, users, tasks] = await Promise.all([
          handleGetOnlineUsers(ONLINE_LIMIT),
          handleGetDiscoverUsers(DISCOVER_LIMIT, undefined, {
            excludeFollowed: true,
            excludeUserId: viewedProfileId,
          }),
          handleGetTasks()
        ]);

        if (cancelled) return;

        setOnlineContacts(contacts);
        setDiscoverUsers(users.filter((user) => !user.isFollowing));
        const sorted = tasks.sort((a,b) => b.applicants.length - a.applicants.length).slice(0, 10);
        setTopTasks(sorted);
      } catch (error) {
        console.error("Failed to load right sidebar data:", error);
        if (cancelled) return;
        setOnlineContacts([]);
        setDiscoverUsers([]);
        setContactsError("Online contacts could not be loaded.");
        setDiscoverError("People suggestions are unavailable right now.");
      } finally {
        if (!cancelled) {
          setContactsLoading(false);
          setDiscoverLoading(false);
        }
      }
    };

    void loadSidebarData();
    const intervalId = window.setInterval(() => {
      void loadSidebarData();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [location.pathname]);

  return (
    <div className="space-y-3 sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto pb-4">
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Contacts
        </h3>
        {contactsError && (
          <p className="mb-3 rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]">
            {contactsError}
          </p>
        )}
        <OnlineContactsList contacts={onlineContacts} loading={contactsLoading} />
      </div>

      <div className="panel-surface rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Discover Users
        </h3>
        <DiscoverUsersList
          users={discoverUsers}
          loading={discoverLoading}
          error={discoverError}
        />
      </div>
      
      {/* Top 10 Opportunities */}
      <div className="panel-surface rounded-2xl p-5">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          🔥 Top 10 Opportunities
        </h3>
        {discoverLoading ? (
          <div className="animate-pulse space-y-3 p-2">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-[var(--surface-muted)] rounded-lg w-full"></div>)}
          </div>
        ) : (
          <div className="space-y-3">
             {topTasks.map((t, i) => (
                <div key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="bg-[var(--surface-elevated)] p-3 border border-[var(--border-soft)] rounded-xl hover:bg-[var(--surface-muted)] cursor-pointer transition">
                  <div className="flex gap-2 items-start">
                     <div className="font-black text-[var(--text-muted)] w-5 block shrink-0">{i+1}</div>
                     <div className="flex-1">
                       <h5 className="text-[var(--text-primary)] font-bold text-sm line-clamp-1">{t.title}</h5>
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-[var(--text-secondary)] font-medium">{t.companyName}</span>
                         <span className="text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] flex items-center gap-1 font-bold px-1.5 py-0.5 rounded border border-[var(--border-soft)]"><Users className="w-3 h-3"/> {t.applicants.length}</span>
                       </div>
                     </div>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
