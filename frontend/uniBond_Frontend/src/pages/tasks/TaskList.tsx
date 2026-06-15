import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetTasks } from "@/controllers/taskController";
import type { Task } from "@/types/task";
import type { CompanyUser } from "@/types/user";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { Briefcase, ArrowRight, Tags } from "lucide-react";
import CompanyDashboard from "@/pages/profile/CompanyDashboard";

export default function TaskList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (user?.role === "company") {
    return <CompanyDashboard user={user as CompanyUser} />;
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await handleGetTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
      setError("We couldn't load tasks right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (t: Task) => {
    if (!user) return false;
    return t.applicants.some(a => a.studentId === user.id);
  };

  const formatDate = (value: string) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      
      {/* Task List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8 px-2">
           <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-indigo-600"/> Tasks & Opportunities
           </h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading amazing opportunities...</div>
        ) : error ? (
          <SectionCard title="Available Tasks">
             <EmptyState icon={Briefcase} title="Tasks Unavailable" description={error} />
          </SectionCard>
        ) : tasks.length === 0 ? (
          <SectionCard title="Available Tasks">
             <EmptyState icon={Briefcase} title="No Tasks Available" description="There are currently no tasks posted by companies." />
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-5">
             {tasks.map(t => (
                <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-3">
                     <h3 className="font-extrabold text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                     <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 tracking-wide shrink-0 shadow-sm">
                       {t.stipend || "Unpaid"}
                     </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400"/> {t.companyName}</p>
                    <span className="text-slate-300 mx-1">•</span>
                    <p className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full shadow-sm">{t.category}</p>
                    <span className="text-slate-300 mx-1">•</span>
                    <p className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{t.projectType}</p>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed">{t.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {t.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-lg border border-violet-100/50">
                        {skill}
                      </span>
                    ))}
                    {t.skills.length > 3 && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                        +{t.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5 items-center">
                      <Tags className="w-3 h-3 text-slate-400" />
                      {t.tags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-5 pt-5 border-t border-slate-100">
                     <div className="text-xs font-semibold text-slate-500 flex items-center gap-3">
                       <span>Duration: <strong className="text-slate-700">{t.duration}</strong></span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span>Deadline: <strong className="text-slate-700">{formatDate(t.deadline)}</strong></span>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => navigate(`/tasks/${t.id}`)} className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-1 shadow-sm">
                          Details
                        </button>
                        {user?.role === "student" && (
                          <button 
                            disabled={hasApplied(t)}
                            onClick={() => navigate(`/tasks/${t.id}`)} 
                            className={`px-6 py-2 font-bold rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-lg ${hasApplied(t) ? 'bg-indigo-50 text-indigo-600 shadow-none border border-indigo-200 cursor-default' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-0.5'}`}
                          >
                            {hasApplied(t) ? "Applied" : (
                              <>
                                Apply <ArrowRight className="w-4 h-4"/>
                              </>
                            )}
                          </button>
                        )}
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
