import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetTaskById, handleUpdateTask } from "@/controllers/taskController";
import SectionCard from "@/components/common/SectionCard";
import TaskForm, { TaskFormData } from "@/components/tasks/TaskForm";
import type { Task } from "@/types/task";
import { ArrowLeft } from "lucide-react";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) {
      handleGetTaskById(id).then(res => setTask(res || null));
    }
  }, [id]);

  if (!user || user.role !== "company") {
    return (
      <SectionCard title="Access Denied">
        <p>Only Company accounts can edit tasks.</p>
      </SectionCard>
    );
  }

  if (!task) return <div className="p-10 text-center">Loading task details...</div>;

  // Make sure only the owner can edit
  if (task.companyId !== user.id) {
    return (
      <SectionCard title="Access Denied">
        <p>You can only edit tasks that belong to your company.</p>
      </SectionCard>
    );
  }

  const handleSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true);
      await handleUpdateTask(task.id, { ...task, ...data });
      navigate(`/tasks/${task.id}`);
    } catch (error) {
      console.error("Failed to update task", error);
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const initialData: Partial<TaskFormData> = {
    title: task.title,
    description: task.description,
    category: task.category,
    projectType: task.projectType,
    skills: task.skills,
    technologies: task.technologies,
    experienceLevel: task.experienceLevel,
    studentsNeeded: task.studentsNeeded,
    duration: task.duration,
    startDate: task.startDate,
    deadline: task.deadline,
    stipend: task.stipend,
    certificate: task.certificate,
    internshipOpportunity: task.internshipOpportunity,
    tags: task.tags,
    contactEmail: task.contactEmail,
    status: task.status,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-left-4 duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
      <TaskForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/tasks/${task.id}`)}
        loading={loading}
        isEdit={true}
      />
    </div>
  );
}
