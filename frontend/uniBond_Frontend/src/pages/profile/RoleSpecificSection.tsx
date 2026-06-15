import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { BookOpen, Users, PlusCircle, Briefcase, CheckCircle, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { handleGetTasks, handleSubmitTaskWork } from "@/controllers/taskController";
import type { Task } from "@/types/task";

export default function RoleSpecificSection({ user, isOwnProfile: _isOwnProfile = true }: { user: User; isOwnProfile?: boolean }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Application details
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTaskAndApp, setSelectedTaskAndApp] = useState<{taskId: string, appId: string} | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");

  const fetchStudentTasks = async () => {
    if (user.role !== 'student') return;
    const allTasks = await handleGetTasks();
    const myTasks = allTasks.filter(t => t.applicants.some(a => a.studentId === user.id));
    setTasks(myTasks);
  };

  useEffect(() => {
    fetchStudentTasks();
  }, [user.id, user.role]);

  const handleSubmitting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskAndApp || !submissionUrl) return;
    try {
      await handleSubmitTaskWork(selectedTaskAndApp.taskId, selectedTaskAndApp.appId, submissionUrl);
      alert("Work submitted successfully!");
      setShowSubmitModal(false);
      setSubmissionUrl("");
      fetchStudentTasks();
    } catch(err) {
      console.error(err);
    }
  };

  if (user.role === "student") {
    const myApps = tasks.map(t => ({
      task: t,
      app: t.applicants.find(a => a.studentId === user.id)!
    }));
    
    const activeTasks = myApps.filter(item => item.app.status === 'accepted' && !item.app.submissionUrl);
    const completedTasks = myApps.filter(item => item.app.submissionUrl);
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-blue-100">
        <h3 className="flex items-center gap-2 font-bold text-gray-900 w-full mb-4 pb-2 border-b border-gray-100">
          <Briefcase className="w-5 h-5 text-blue-600" /> My Tasks
        </h3>

        {/* Active Tasks To Submit */}
        {activeTasks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Action Required</h4>
            <div className="space-y-3">
              {activeTasks.map(({task, app}) => (
                <div key={task.id} className="p-4 border rounded-xl bg-blue-50/50 flex justify-between items-center sm:flex-row flex-col gap-3">
                  <div>
                    <h5 className="font-bold text-black border-transparent cursor-pointer hover:underline" onClick={() => navigate(`/tasks/${task.id}`)}>{task.title}</h5>
                    <p className="text-xs text-gray-600 font-medium">Company: {task.companyName}</p>
                  </div>
                  <button onClick={() => {setSelectedTaskAndApp({taskId: task.id, appId: app.id}); setShowSubmitModal(true);}} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow flex items-center gap-2 hover:bg-blue-700">
                    <Upload className="w-4 h-4"/> Submit Work
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Completed Tasks</h4>
          {completedTasks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No completed tasks yet.</p>
          ) : (
            <div className="space-y-3">
               {completedTasks.map(({task, app}) => (
                 <div key={task.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-gray-900 line-through decoration-gray-400">{task.title}</h5>
                      <p className="text-xs text-green-700 font-bold flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3"/> Submitted on {new Date(app.submittedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <a href={app.submissionUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-black hover:text-black"><Eye className="w-4 h-4"/></a>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
                <h3 className="font-bold text-lg mb-4 text-black">Submit Completed Work</h3>
                <form onSubmit={handleSubmitting}>
                   <div className="mb-4">
                     <label className="block text-sm font-bold text-gray-700 mb-1">Work Link / Repository</label>
                     <input type="url" required value={submissionUrl} onChange={e => setSubmissionUrl(e.target.value)} placeholder="https://github.com/my-work" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" />
                     <p className="text-xs text-gray-500 mt-2">Submit a link to your final deliverable (e.g., GitHub, Google Drive, Vercel).</p>
                   </div>
                   <div className="flex justify-end gap-2">
                     <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                     <button type="submit" className="px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700">Submit</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Non-student logic (unchanged essentially)
  let title = "";
  let icon = null;
  let btnLabel = "";
  let linkTarget = "";
  
  if (user.role === "lecturer") {
    title = "Best Courses";
    icon = <BookOpen className="w-5 h-5 text-blue-600" />;
    btnLabel = "Create Course";
    linkTarget = ROUTES.CREATE_COURSE;
  } else if (user.role === "tech_lead") {
    title = "Featured Classrooms";
    icon = <Users className="w-5 h-5 text-blue-600" />;
    btnLabel = "Create Classroom";
    linkTarget = "/classrooms/create";
  } else if (user.role === "company") {
    title = "Company Operations";
    icon = <Briefcase className="w-5 h-5 text-blue-600" />;
    btnLabel = "Manage Tasks";
    linkTarget = "/tasks";
  }

  if (!title) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-blue-100">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h3 className="flex items-center gap-2 font-bold text-gray-900 w-full mb-0">
          {icon}
          {title}
        </h3>
      </div>
      
      {/* Cards Mock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {[1, 2].map(i => (
          <div key={i} className="p-4 border rounded-lg bg-gray-50 flex flex-col justify-between">
            <h4 className="font-semibold text-gray-800 text-sm">Sample {title.split(' ')[1]} {i}</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">High engagement & excellent ratings on this {title.split(' ')[1]?.toLowerCase()}.</p>
            <button className="text-xs font-semibold text-blue-600 hover:underline text-left">View Details</button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate(linkTarget)}
        className="w-full py-2.5 bg-blue-50 text-blue-700 hover:text-white hover:bg-blue-600 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm shadow-sm"
      >
        <PlusCircle className="w-4 h-4" />
        {btnLabel}
      </button>
    </div>
  );
}
