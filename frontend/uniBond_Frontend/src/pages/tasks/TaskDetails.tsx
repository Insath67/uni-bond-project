import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import {
  handleGetTaskById,
  handleDeleteTask,
  handleApplyTask,
  handleDeleteApplication,
} from "@/controllers/taskController";
import type { Task } from "@/types/task";
import SectionCard from "@/components/common/SectionCard";
import {
  ArrowLeft,
  Building,
  Clock,
  Edit2,
  Trash2,
  CheckCircle,
  Briefcase,
  Link as LinkIcon,
  Mail,
  ArrowRight,
} from "lucide-react";

const formatDate = (value: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  // App Form State
  const [showAppForm, setShowAppForm] = useState(false);
  const [isEditingApp, setIsEditingApp] = useState(false);
  const [appForm, setAppForm] = useState({ portfolioUrl: "", coverLetter: "", email: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskInfo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await handleGetTaskById(id);
      setTask(response || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskInfo();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading task details...</div>;
  if (!task) return <div className="p-10 text-center">Task Not Found</div>;

  const isOwner = user?.role === "company" && task.companyId === user?.id;
  const isStudent = user?.role === "student";
  const myApplication = task.applicants.find((applicant) => applicant.studentId === user?.id);
  const isPrivileged = user?.role === "tech_lead" || user?.role === "lecturer" || user?.role === "admin";

  const handleTaskDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await handleDeleteTask(task.id);
      navigate("/tasks");
    }
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!appForm.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (appForm.portfolioUrl && !appForm.portfolioUrl.match(/^https?:\/\/.+/)) {
      setFormError("Portfolio URL must be a valid link starting with http:// or https://");
      return;
    }
    if (appForm.coverLetter.length < 50) {
      setFormError("Cover letter must be at least 50 characters to stand out.");
      return;
    }

    if (!user) return;
    setSubmitting(true);

    try {
      await handleApplyTask(task.id, appForm);
      setShowAppForm(false);
      alert("Application submitted successfully.");
      await fetchTaskInfo();
    } catch (error: any) {
      alert(error?.response?.data?.detail || error?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawApplication = async () => {
    if (!myApplication || !confirm("Withdraw application?")) return;
    await handleDeleteApplication(task.id);
    alert("Application withdrawn.");
    await fetchTaskInfo();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-2">
        <button
          onClick={() => navigate("/tasks")}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold text-sm px-4 py-2 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {isOwner && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/tasks/${task.id}/edit`)}
              className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-all"
            >
              <Edit2 className="w-4 h-4" /> Edit Task
            </button>
            <button
              onClick={handleTaskDelete}
              className="px-5 py-2.5 flex items-center gap-2 text-sm font-bold bg-white text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 hover:shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <SectionCard title="">
            <div className="-mt-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wide border border-blue-100">
                  {task.category}
                </span>
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md uppercase tracking-wide border border-gray-200">
                  {task.projectType}
                </span>
                {task.internshipOpportunity && (
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md uppercase tracking-wide border border-green-100">
                    Internship
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 font-medium mb-6">
                <div className="flex items-center gap-1.5 border border-gray-200 bg-gray-50 px-3 py-1 rounded-lg">
                  <Building className="w-4 h-4 text-gray-400" /> {task.companyName}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" /> Posted {formatDate(task.createdAt)}
                </div>
              </div>
            </div>

            <div className="prose prose-blue max-w-none text-gray-700 mb-8 border-b border-gray-100 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Description
              </h3>
              <p className="whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {task.description}
              </p>
            </div>

            <div className="space-y-6 border-b border-gray-100 pb-8 mb-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Requirements & Skills
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-2">Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {task.skills.length > 0 ? task.skills.map((skill, index) => (
                      <span key={index} className="bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                        {skill}
                      </span>
                    )) : <span className="text-sm text-gray-500">No skills listed.</span>}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-2">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {task.technologies.length > 0 ? task.technologies.map((technology, index) => (
                      <span key={index} className="bg-white border border-purple-200 text-purple-700 px-2 py-1 rounded text-sm font-medium">
                        {technology}
                      </span>
                    )) : <span className="text-sm text-gray-500">No technologies listed.</span>}
                  </div>
                </div>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 items-center">
                <span className="font-bold text-gray-700 mr-2 text-sm">Tags:</span>
                {task.tags.map((tag, index) => (
                  <span key={index} className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          {(isOwner || isPrivileged) && (
            <SectionCard title={`Applicants (${task.applicants.length})`}>
              {task.applicants.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No applications received yet.</p>
              ) : (
                <div className="space-y-4 mt-2">
                  {task.applicants.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                          {application.studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{application.studentName}</h4>
                          <span className="text-xs text-gray-500">Applied on {formatDate(application.appliedAt)}</span>
                        </div>
                        <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded uppercase">
                          {application.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                            {application.email}
                          </a>
                        </div>
                        {application.portfolioUrl && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <LinkIcon className="w-4 h-4" />
                            <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Portfolio Link
                            </a>
                          </div>
                        )}
                      </div>

                      {application.coverLetter && (
                        <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
                          <span className="font-semibold text-gray-900 block mb-1">Cover Letter:</span>
                          <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {isPrivileged && (
            <SectionCard title="Company Reputation & Reviews">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm mb-3">
                <p className="font-semibold">Instructor View Only</p>
                <p>You are viewing internal reviews for {task.companyName}.</p>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800">Reviewer: System Admin</span>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Verified Partner</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Consistent with internship offerings. Students highly rate their mentorship programs.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <SectionCard title="Summary">
            <div className="space-y-4 divide-y divide-gray-100">
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Experience</span>
                <span className="font-bold text-gray-900 text-sm">{task.experienceLevel}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Duration</span>
                <span className="font-bold text-gray-900 text-sm">{task.duration || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Start Date</span>
                <span className="font-bold text-gray-900 text-sm">{formatDate(task.startDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-sm text-red-500">Deadline</span>
                <span className="font-bold text-red-600 text-sm">{formatDate(task.deadline)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Students Needed</span>
                <span className="font-bold text-gray-900 text-sm">{task.studentsNeeded}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Stipend</span>
                <span className="font-bold text-blue-700 text-sm bg-blue-50 px-2 py-0.5 rounded">{task.stipend || "None"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium text-sm">Certificate Offered</span>
                <span className="font-bold text-gray-900 text-sm">{task.certificate ? "Yes" : "No"}</span>
              </div>
            </div>

            {isStudent && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                {myApplication ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl flex items-center gap-2 font-medium">
                      <CheckCircle className="w-5 h-5" /> Application Submitted
                    </div>
                    <button
                      onClick={handleWithdrawApplication}
                      className="w-full py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 flex justify-center items-center gap-2 font-semibold rounded-lg transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Withdraw
                    </button>
                  </div>
                ) : (
                  <button onClick={() => {setShowAppForm(true); setFormError(""); setIsEditingApp(false); setAppForm({portfolioUrl:"", coverLetter:"", email:""})}} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md flex justify-center items-center gap-2 text-lg">
                    Apply Now <ArrowRight className="w-5 h-5"/>
                  </button>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
      {/* Application Form Modal */}
      {showAppForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {isEditingApp ? "Edit Application" : "Apply for Task"}
              </h3>
              <button onClick={() => setShowAppForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <Trash2 className="w-5 h-5 hidden" />
                &#x2715;
              </button>
            </div>
            
            <form onSubmit={submitApplication} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm font-bold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Contact *</label>
                <input type="email" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={appForm.email} onChange={e => setAppForm({...appForm, email: e.target.value})} placeholder="student@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Portfolio / Resume Link</label>
                <input type="url" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={appForm.portfolioUrl} onChange={e => setAppForm({...appForm, portfolioUrl: e.target.value})} placeholder="https://github.com/your-profile" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Letter / Pitch</label>
                <textarea rows={4} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={appForm.coverLetter} onChange={e => setAppForm({...appForm, coverLetter: e.target.value})} placeholder="Why are you a good fit for this task?" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAppForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {submitting ? "Sending..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
