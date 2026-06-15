import { useEffect, useState } from "react";
import { CompanyUser } from "@/types/user";
import { handleGetTasks, handleDeleteTask, handleUpdateApplication } from "@/controllers/taskController";

import type { Task } from "@/types/task";
import { Briefcase, CheckCircle, Edit2, Trash2, Users, ChevronDown, Plus, Eye, Check, X, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CompanyDashboard({ user }: { user: CompanyUser }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Toggling views Based on user requirements
  const [activeView, setActiveView] = useState<'overview' | 'all-tasks' | 'all-apps' | 'submissions'>('overview');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTasks();
    fetchMyTasks();
  }, [user.id]);

  const fetchMyTasks = async () => {
    setLoading(true);
    const allTasks = await handleGetTasks();
    setTasks(allTasks.filter(t => t.companyId === user.id));
    setLoading(false);
  };


  const onDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await handleDeleteTask(taskId);
      fetchMyTasks();
    }
  };

  const handleUpdateAppStatus = async (taskId: string, appId: string, status: 'accepted'|'rejected') => {
    await handleUpdateApplication(taskId, appId, { status });
    fetchMyTasks();
  };

  if (loading) return <div className="text-center py-10 font-medium text-gray-500">Loading Dashboard...</div>;

  const newlyAddedTasks = tasks.filter(t => t.applicants.length === 0 && t.status !== "completed");
  const selectedTasks = tasks.filter(t => t.applicants.length > 0 && t.status !== "completed");
  
  const totalTasks = tasks.length;
  // All applicants across all tasks
  const allApplicants = tasks.flatMap(t => t.applicants.map(a => ({...a, taskTitle: t.title, taskId: t.id})));
  // Students who completed tasks
  const submittedWork = allApplicants.filter(a => a.submissionUrl);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-black">Company Dashboard</h1>
          <p className="text-gray-700 font-medium mt-1">Manage your active opportunities and track applicant progress.</p>
        </div>
        {activeView !== 'overview' && (
           <button onClick={() => setActiveView('overview')} className="px-4 py-2 border border-gray-400/40 text-black hover:bg-gray-400/50 rounded-xl font-bold transition shadow-sm">
             Back to Overview
           </button>
        )}
      </div>

      {/* Stats Row */}
      {activeView === 'overview' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => setActiveView('all-tasks')} className="p-6 rounded-3xl bg-gray-300 shadow-sm border border-gray-400/40 flex flex-col justify-center items-start text-black relative overflow-hidden group hover:bg-gray-400/50 transition-colors duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <Briefcase className="w-32 h-32" />
          </div>
          <div className="bg-black/15 p-3 rounded-2xl mb-4 inline-block">
             <Briefcase className="w-6 h-6 text-black" />
          </div>
          <p className="text-5xl font-black mb-1 drop-shadow-sm">{totalTasks}</p>
          <p className="text-gray-700 font-bold text-lg tracking-wide">Total Tasks Posted</p>
        </div>
        
        <div onClick={() => setActiveView('all-apps')} className="p-6 rounded-3xl bg-gray-300 shadow-sm border border-gray-400/40 flex flex-col justify-center items-start text-black relative overflow-hidden group hover:bg-gray-400/50 transition-colors duration-300 cursor-pointer">
          <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <CheckCircle className="w-32 h-32" />
          </div>
          <div className="bg-black/15 p-3 rounded-2xl mb-4 inline-block">
             <Users className="w-6 h-6 text-black" />
          </div>
          <p className="text-5xl font-black mb-1 drop-shadow-sm">{allApplicants.length}</p>
          <p className="text-gray-700 font-bold text-lg tracking-wide">Total Applicants Reached</p>
        </div>
      </div>
      )}

      {/* Overview specific views */}
      {activeView === 'overview' && (
        <>
          {/* Action Bar */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setActiveView('submissions')}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400/50 text-black border border-gray-400/40 rounded-xl font-bold transition-all shadow-sm"
            >
              View Submitted Tasks ({submittedWork.length})
            </button>
            <button 
              onClick={() => navigate("/tasks/create")}
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Post a New Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
                {/* Active Opportunities */}
                <div className="bg-gray-300 rounded-3xl border border-gray-400/40 shadow-sm overflow-hidden text-black">
                  <div className="p-6 border-b border-gray-400/40 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-black shadow-sm"></span>
                        Active Opportunities
                      </h3>
                      <p className="text-sm text-gray-700 mt-1 font-medium">These tasks have active pending student applicants.</p>
                    </div>
                    <span className="bg-white px-4 py-1.5 rounded-full font-bold text-sm border border-gray-400/40 shadow-sm">{selectedTasks.length} Active</span>
                  </div>
                  <div className="p-6 space-y-4 bg-gray-100">
                    {selectedTasks.length === 0 ? <p className="text-sm text-gray-500 text-center py-8 font-medium">No active tasks with applicants.</p> : null}
                    {selectedTasks.map(task => (
                      <div key={task.id} className="bg-white border border-gray-400/40 shadow-sm rounded-2xl overflow-hidden hover:border-black transition-colors duration-300">
                        <div className="p-5 flex justify-between items-center cursor-pointer group" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                          <div>
                            <h4 className="font-bold text-lg text-black">{task.title}</h4>
                            <p className="text-sm text-gray-700 mt-1.5 flex items-center gap-2 font-medium">
                              <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1.5 text-black"><Users className="w-3.5 h-3.5"/> {task.applicants.length} Applicants</span>
                              <span className="text-gray-400">•</span>
                              <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => navigate(`/tasks/${task.id}`)} title="View Task Details" className="p-2.5 text-black bg-gray-100 rounded-xl hover:bg-gray-400/50 transition"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => navigate(`/tasks/${task.id}/edit`)} title="Limited Edit" className="p-2.5 text-black bg-gray-100 rounded-xl hover:bg-gray-400/50 transition"><Edit2 className="w-4 h-4" /></button>
                            </div>
                            <div className={`p-2 rounded-full transition-transform duration-300 bg-gray-100 ${expandedTask === task.id ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-5 h-5 text-gray-700"/>
                            </div>
                          </div>
                        </div>
                        
                        {/* Applicant Auth Dropdown */}
                        <div className={`grid transition-all duration-300 ease-in-out ${expandedTask === task.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="bg-gray-50 p-6 border-t border-gray-200">
                              <h5 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">Review Applications</h5>
                              <div className="space-y-3">
                                {task.applicants.map(app => (
                                  <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-400/40 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-black transition">
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${app.studentId}`)}>
                                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.studentName)}&background=000&color=fff`} className="w-10 h-10 rounded-full" alt="" />
                                      <div>
                                        <p className="font-bold text-black hover:underline">{app.studentName}</p>
                                        <p className="text-xs font-medium text-gray-700">{app.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {app.status === 'pending' ? (
                                        <>
                                           <button onClick={() => handleUpdateAppStatus(task.id, app.id, 'accepted')} className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded font-bold text-xs flex items-center gap-1"><Check className="w-3 h-3"/> Accept</button>
                                           <button onClick={() => handleUpdateAppStatus(task.id, app.id, 'rejected')} className="px-3 py-1.5 bg-gray-300 text-black hover:bg-gray-400/50 rounded font-bold text-xs border border-gray-400/40 flex items-center gap-1"><X className="w-3 h-3"/> Reject</button>
                                        </>
                                      ) : (
                                        <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${app.status==='accepted'?'bg-gray-100 text-black border-black':'bg-red-50 text-red-700 border-red-200'}`}>
                                          {app.status}
                                        </span>
                                      )}
                                      {app.portfolioUrl && (
                                        <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-bold text-black bg-gray-100 hover:bg-gray-300 border border-gray-400/40 rounded transition-colors ml-2">View</a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staged Tasks */}
                <div className="bg-gray-300 rounded-3xl border border-gray-400/40 shadow-sm overflow-hidden text-black mt-8">
                  <div className="p-6 border-b border-gray-400/40 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.2)]"></span>
                        Staged Tasks
                      </h3>
                      <p className="text-sm text-gray-700 mt-1 font-medium">Tasks with no applicants yet.</p>
                    </div>
                    <span className="bg-white px-4 py-1.5 rounded-full font-bold text-sm border border-gray-400/40">{newlyAddedTasks.length} Pending</span>
                  </div>
                  <div className="p-6 space-y-4 bg-gray-100">
                    {newlyAddedTasks.length === 0 ? <p className="text-sm text-gray-500 font-medium text-center py-8">No unassigned staged tasks.</p> : null}
                    {newlyAddedTasks.map(task => (
                      <div key={task.id} className="bg-white p-5 border border-gray-400/40 shadow-sm rounded-2xl hover:border-black transition duration-300">
                        <div className="flex justify-between items-center group">
                          <div>
                            <h4 className="font-bold text-lg text-black cursor-pointer hover:underline" onClick={() => navigate(`/tasks/${task.id}`)}>{task.title}</h4>
                            <p className="text-sm font-medium text-gray-700 mt-1 line-clamp-1 max-w-2xl">{task.description}</p>
                          </div>
                          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                            <button onClick={() => navigate(`/tasks/${task.id}`)} className="p-1.5 text-black rounded hover:bg-gray-300 transition-colors"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => navigate(`/tasks/${task.id}/edit`)} className="p-1.5 text-black rounded hover:bg-gray-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(task.id)} className="p-1.5 text-red-700 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <div className="space-y-8">
               {/* Top 10 Ranked Students temp removed until backend API built */}
            </div>
          </div>
        </>
      )}

      {/* ALL TASKS TABLE VIEW */}
      {activeView === 'all-tasks' && (
         <div className="bg-white border border-gray-400/40 rounded-3xl shadow-sm p-6 overflow-hidden">
           <h3 className="text-xl font-bold mb-6 text-black">All Tasks History</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 text-black border-b border-gray-400/40">
                   <tr>
                     <th className="p-4 font-bold">Title</th>
                     <th className="p-4 font-bold">Category</th>
                     <th className="p-4 font-bold">Created At</th>
                     <th className="p-4 font-bold">Status</th>
                     <th className="p-4 font-bold">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {tasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition">
                         <td className="p-4 font-medium text-black">{t.title}</td>
                         <td className="p-4 text-gray-700 text-sm">{t.category}</td>
                         <td className="p-4 text-gray-700 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                         <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-black uppercase">{t.status}</span>
                         </td>
                         <td className="p-4">
                            <button onClick={() => navigate(`/tasks/${t.id}`)} className="text-sm font-bold text-black border border-gray-400/40 px-3 py-1.5 rounded hover:bg-gray-100">View</button>
                         </td>
                      </tr>
                   ))}
                   {tasks.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500 font-medium">No tasks posted.</td></tr>}
                </tbody>
             </table>
           </div>
         </div>
      )}

      {/* ALL APPS TABLE VIEW */}
      {activeView === 'all-apps' && (
         <div className="bg-white border border-gray-400/40 rounded-3xl shadow-sm p-6 overflow-hidden">
           <h3 className="text-xl font-bold mb-6 text-black">Total Applications Received</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 text-black border-b border-gray-400/40">
                   <tr>
                     <th className="p-4 font-bold">Student Name</th>
                     <th className="p-4 font-bold">Applied Task</th>
                     <th className="p-4 font-bold">Date</th>
                     <th className="p-4 font-bold">Status</th>
                     <th className="p-4 font-bold">Profile</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {allApplicants.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition">
                         <td className="p-4 font-medium text-black">{a.studentName}</td>
                         <td className="p-4 text-gray-700 text-sm">{a.taskTitle}</td>
                         <td className="p-4 text-gray-700 text-sm">{new Date(a.appliedAt).toLocaleDateString()}</td>
                         <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-black uppercase tracking-wider">{a.status}</span>
                         </td>
                         <td className="p-4">
                            <button onClick={() => navigate(`/profile/${a.studentId}`)} className="text-sm font-bold text-black border border-gray-400/40 px-3 py-1.5 rounded hover:bg-gray-100">View Profile</button>
                         </td>
                      </tr>
                   ))}
                   {allApplicants.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500 font-medium">No applications received.</td></tr>}
                </tbody>
             </table>
           </div>
         </div>
      )}

      {/* SUBMITTED TASKS TABLE VIEW */}
      {activeView === 'submissions' && (
         <div className="bg-white border border-gray-400/40 rounded-3xl shadow-sm p-6 overflow-hidden">
           <h3 className="text-xl font-bold mb-6 text-black flex items-center gap-2"><CheckSquare className="w-6 h-6"/> Completed Task Submissions</h3>
           <p className="text-sm text-gray-700 mb-6">Review tasks that students have submitted work for.</p>
           <div className="overflow-x-auto">
             <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 text-black border-b border-gray-400/40">
                   <tr>
                     <th className="p-4 font-bold">Student</th>
                     <th className="p-4 font-bold">Task</th>
                     <th className="p-4 font-bold">Submitted Date</th>
                     <th className="p-4 font-bold">Work Link</th>
                     <th className="p-4 font-bold">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {submittedWork.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition">
                         <td className="p-4 font-medium text-black flex items-center gap-2">
                           <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(a.studentName)}&background=000&color=fff`} className="w-6 h-6 rounded-full" alt=""/>
                           <span onClick={() => navigate(`/profile/${a.studentId}`)} className="cursor-pointer hover:underline">{a.studentName}</span>
                         </td>
                         <td className="p-4 text-gray-700 text-sm hover:underline cursor-pointer" onClick={() => navigate(`/tasks/${a.taskId}`)}>{a.taskTitle}</td>
                         <td className="p-4 text-gray-700 text-sm">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'N/A'}</td>
                         <td className="p-4">
                            {a.submissionUrl && <a href={a.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black underline">View Work</a>}
                         </td>
                         <td className="p-4 w-32">
                            <button onClick={() => alert("Marked as reviewed successfully!")} className="text-xs font-bold px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded">Mark Reviewed</button>
                         </td>
                      </tr>
                   ))}
                   {submittedWork.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500 font-medium">No submitted works yet.</td></tr>}
                </tbody>
             </table>
           </div>
         </div>
      )}
    </div>
  );
}
