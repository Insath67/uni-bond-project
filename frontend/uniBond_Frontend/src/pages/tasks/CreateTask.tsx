import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleCreateTask } from "@/controllers/taskController";
import SectionCard from "@/components/common/SectionCard";
import TaskForm, { TaskFormData } from "@/components/tasks/TaskForm";
import type { CompanyUser } from "@/types/user";

export default function CreateTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "company") {
    return (
      <SectionCard title="Access Denied">
        <p>Only Company accounts can create tasks.</p>
      </SectionCard>
    );
  }

  const handleSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true);
      const companyUser = user as CompanyUser;
      await handleCreateTask({
        companyId: user.id || "c1",
        companyName: companyUser.companyName || `${companyUser.firstname} ${companyUser.lastname}`.trim(),
        ...data,
        status: data.status || "open"
      });
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to create task", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskForm 
      onSubmit={handleSubmit} 
      onCancel={() => navigate("/tasks")} 
      loading={loading} 
    />
  );
}
