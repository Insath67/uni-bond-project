import type { ProfileConnectionStats, User, UserSummary } from "@/types/user";
import SectionCard from "@/components/common/SectionCard";
import { Mail, GraduationCap, MapPin, Home, Briefcase, Star } from "lucide-react";
import ProfileConnectionsCard from "./ProfileConnectionsCard";

type Props = {
  user: User;
  stats: ProfileConnectionStats;
  connections: UserSummary[];
  connectionsLoading?: boolean;
  connectionsError?: string;
  isOwnProfile: boolean;
};

export default function ProfileLeftColumn({
  user,
  stats,
  connections,
  connectionsLoading = false,
  connectionsError = "",
  isOwnProfile,
}: Props) {
  const currentLocation = [user.city, user.country].filter(Boolean).join(", ") || "Location not shared";

  return (
    <div className="space-y-4">
      <SectionCard title="Intro">
        <div className="space-y-4 text-sm text-gray-700 p-2">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="break-all">{user.email}</span>
          </div>
          
          {"education" in user && (
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-gray-400 shrink-0" />
              <span>Studied <strong>{user.education}</strong></span>
            </div>
          )}
          
          {"industry" in user && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
              <span>Industry: <strong>{user.industry}</strong></span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Lives in <strong>{currentLocation}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
            <span>From <strong>{currentLocation}</strong></span>
          </div>
        </div>
      </SectionCard>

      <ProfileConnectionsCard
        connections={connections}
        totalConnections={stats.connections}
        loading={connectionsLoading}
        error={connectionsError}
        isOwnProfile={isOwnProfile}
      />

      {/* Top 10 Students Leaderboard */}
      {user.role === "company" && (
        <div className="bg-white rounded-xl shadow-sm p-4 w-full border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top 10 Students
            </h3>
            <button className="text-blue-600 font-semibold cursor-pointer text-sm hover:underline">View All</button>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg mb-4">
             Based on successfully completed tasks
          </div>
          
          <div className="space-y-3">
             {[1,2,3,4,5,6,7,8,9,10].map(rank => (
               <div key={rank} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition group">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${rank === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : rank === 2 ? 'bg-gray-200 text-gray-700' : rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                   #{rank}
                 </div>
                 <img src={`https://ui-avatars.com/api/?name=Student+${rank}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                 <div className="flex-1 truncate">
                   <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate text-sm">Student Name {rank}</h4>
                   <p className="text-xs text-blue-600 font-medium">{(200 - rank * 15)} Points</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
