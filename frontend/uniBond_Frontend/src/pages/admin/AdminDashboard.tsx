import { useEffect, useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import { Users, GraduationCap, Clock, UserCheck } from "lucide-react";
import { fetchAdminStats } from "@/controllers/adminController";

type Stats = {
  total_users: number;
  pending_users: number;
  active_users: number;
  suspended_users: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          title="Total Users"
          value={stats ? String(stats.total_users) : "…"}
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          title="Pending Approval"
          value={stats ? String(stats.pending_users) : "…"}
          highlight={stats && stats.pending_users > 0}
        />
        <StatCard
          icon={<UserCheck className="w-6 h-6 text-green-600" />}
          title="Active Users"
          value={stats ? String(stats.active_users) : "…"}
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-purple-600" />}
          title="Suspended"
          value={stats ? String(stats.suspended_users) : "…"}
        />
      </div>

      {/* Info panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <SectionCard title="Approval Workflow">
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">S</span>
              <span><strong>Students</strong> — auto-approved and can log in immediately after registration.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">L</span>
              <span><strong>Lecturers, Companies, Tech Leads, Admins</strong> — start as pending and require admin approval before login.</span>
            </li>
          </ul>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-800">
              {stats?.pending_users
                ? `⚠️ ${stats.pending_users} user(s) waiting for approval.`
                : "✅ No pending approvals."}
            </p>
            <a
              href="/admin/users"
              className="mt-2 inline-block text-sm text-blue-600 font-semibold hover:underline"
            >
              Go to User Management →
            </a>
          </div>
        </SectionCard>

        <SectionCard title="User ID Format">
          <p className="text-sm text-gray-500 mb-3">IDs are auto-generated when users register:</p>
          <ul className="space-y-2">
            {[
              { prefix: "STD0001", label: "Student" },
              { prefix: "LEC0001", label: "Lecturer" },
              { prefix: "COM0001", label: "Company" },
              { prefix: "TLE0001", label: "Tech Lead" },
              { prefix: "AD01",    label: "Admin" },
            ].map(({ prefix, label }) => (
              <li key={prefix} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-800 text-xs font-bold">{prefix}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, highlight }: {
  icon: React.ReactNode; title: string; value: string; highlight?: boolean | null;
}) {
  return (
    <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition ${highlight ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}>
      <div className="p-4 bg-gray-50 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
