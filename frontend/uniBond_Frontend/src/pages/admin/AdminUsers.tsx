import { useEffect, useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import {
  UserCheck, UserX, Download, Users, Clock, ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  fetchAllUsers, fetchPendingUsers, approveUser, suspendUser, activateUser,
} from "@/controllers/adminController";

type ApiUser = {
  id: number;
  user_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  mobile?: string;
  school?: string;
  cv_path?: string;
  access_status: "active" | "pending" | "suspended";
};

const STATUS_BADGE: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  pending:   "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

export default function AdminUsers() {
  const [tab, setTab] = useState<"all" | "pending">("pending");
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [all, pending] = await Promise.all([fetchAllUsers(), fetchPendingUsers()]);
      setAllUsers(all);
      setPendingUsers(pending);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: number) => {
    setActionId(id);
    await approveUser(id);
    await load();
    setActionId(null);
  };

  const handleSuspend = async (id: number) => {
    setActionId(id);
    await suspendUser(id);
    await load();
    setActionId(null);
  };

  const handleActivate = async (id: number) => {
    setActionId(id);
    await activateUser(id);
    await load();
    setActionId(null);
  };

  const users = tab === "all" ? allUsers : pendingUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {[
          { key: "pending", label: `Pending Approvals (${pendingUsers.length})`, icon: <Clock className="w-4 h-4" /> },
          { key: "all",     label: `All Users (${allUsers.length})`,              icon: <Users className="w-4 h-4" /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as "all" | "pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <SectionCard title={tab === "pending" ? "⏳ Awaiting Admin Approval" : "👥 All Users"}>
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            {tab === "pending" ? "No pending users 🎉" : "No users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">CV</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">
                      {u.user_code ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.first_name} {u.last_name}
                      {u.school && <span className="block text-xs text-gray-400">{u.school}</span>}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {u.city && u.country ? `${u.city}, ${u.country}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{u.mobile ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[u.access_status] ?? ""}`}>
                        {u.access_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.cv_path ? (
                        <a
                          href={`http://localhost:8000/users/${u.id}/cv/download`}
                          download
                          className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                        >
                          <Download className="w-3 h-3" /> CV
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.access_status === "pending" && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={actionId === u.id}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                            title="Approve"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {u.access_status === "suspended" && (
                          <button
                            onClick={() => handleActivate(u.id)}
                            disabled={actionId === u.id}
                            className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                        {u.access_status !== "suspended" && (
                          <button
                            onClick={() => handleSuspend(u.id)}
                            disabled={actionId === u.id}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                            title="Suspend"
                          >
                            <UserX className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
