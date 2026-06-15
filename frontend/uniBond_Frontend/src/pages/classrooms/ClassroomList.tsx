import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetClassrooms, handleJoinClassroom } from "@/controllers/classroomController";
import type { Classroom } from "@/types/classroom";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { Users, Star, UserPlus, Presentation } from "lucide-react";

export default function ClassroomList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    const data = await handleGetClassrooms();
    setClassrooms(data);
    setLoading(false);
  };

  const onJoin = async (id: string) => {
    if (!user) return;
    try {
      await handleJoinClassroom(id, user.id);
      alert("Successfully joined classroom!");
      fetchClassrooms();
    } catch (err: any) {
      alert(err.message || "Failed to join");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 px-2">
         <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Presentation className="w-6 h-6 text-blue-600"/> Classrooms</h1>
         {user?.role === "tech_lead" && (
           <button onClick={() => navigate("/classrooms/create")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
             + Create Classroom
           </button>
         )}
      </div>

      {loading ? (
        <div className="text-center py-10">Loading classrooms...</div>
      ) : classrooms.length === 0 ? (
        <SectionCard title="Classrooms">
           <EmptyState icon={Users} title="No Classrooms Available" description="There are currently no professional classrooms hosted by our Tech Leads." />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {classrooms.map(c => (
              <div key={c.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-xl text-gray-900">{c.title}</h3>
                     <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-bold">
                        <Star className="w-4 h-4 fill-current"/>
                        {c.rating.toFixed(1)} <span className="font-normal text-xs text-yellow-600">({c.totalRatings})</span>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-blue-600 mb-3">Host: {c.techLeadName}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{c.description}</p>
                </div>

                <div className="mt-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(c.currentStudents / c.maxStudents) * 100}%` }}></div>
                   </div>
                   <div className="flex justify-between items-center text-sm font-medium mb-4">
                     <span className={`${c.currentStudents >= c.maxStudents ? 'text-red-500' : 'text-gray-500'}`}>
                        {c.currentStudents} / {c.maxStudents} Students
                     </span>
                     {user?.role === "student" && c.enrolledStudents.includes(user.id) && (
                        <span className="text-green-600 flex items-center gap-1"><UserPlus className="w-4 h-4"/> Enrolled</span>
                     )}
                   </div>
                   
                   <div className="flex gap-2 w-full">
                      <button onClick={() => navigate(`/classrooms/${c.id}`)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition text-sm">
                        View Details
                      </button>
                      {user?.role === "student" && !c.enrolledStudents.includes(user.id) && c.currentStudents < c.maxStudents && (
                        <button onClick={() => onJoin(c.id)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm shadow-sm flex justify-center items-center gap-2">
                          <UserPlus className="w-4 h-4"/> Join
                        </button>
                      )}
                      {user?.role === "student" && !c.enrolledStudents.includes(user.id) && c.currentStudents >= c.maxStudents && (
                         <button disabled className="flex-1 py-2 bg-gray-300 text-white rounded-lg font-semibold cursor-not-allowed text-sm text-center">
                           Full
                         </button>
                      )}
                   </div>
                </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
