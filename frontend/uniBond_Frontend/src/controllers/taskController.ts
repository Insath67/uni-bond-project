import apiClient from "@/services/api/axiosClient";

import type { Task, TaskApplication } from "@/types/task";

export type TaskUpsertPayload = Omit<Task, "id" | "createdAt" | "applicants">;

const mapApplicant = (taskId: string, applicant: any): TaskApplication => ({
  id: String(applicant.id),
  taskId,
  studentId: String(applicant.user_id),
  studentName: applicant.student_name || "Student",
  email: applicant.email || "",
  portfolioUrl: applicant.portfolio_url || undefined,
  coverLetter: applicant.cover_letter || undefined,
  status: applicant.status || "pending",
  appliedAt: applicant.applied_at || "",
});

const mapTask = (task: any): Task => ({
  id: String(task.id),
  companyId: String(task.company_id),
  companyName: task.company_name || `Company ${task.company_id}`,
  title: task.title,
  description: task.description || "",
  category: task.category || "General",
  projectType: task.project_type || "Individual",
  skills: Array.isArray(task.skills) ? task.skills : [],
  technologies: Array.isArray(task.technologies) ? task.technologies : [],
  experienceLevel: task.experience_level || "Intermediate",
  studentsNeeded: Number(task.students_needed || 1),
  duration: task.duration || "",
  startDate: task.start_date || "",
  deadline: task.deadline || "",
  stipend: task.stipend || "",
  certificate: Boolean(task.certificate),
  internshipOpportunity: Boolean(task.internship_opportunity),
  tags: Array.isArray(task.tags) ? task.tags : [],
  contactEmail: task.contact_email || "",
  status: task.status || "open",
  createdAt: task.created_at || "",
  applicants: Array.isArray(task.applicants)
    ? task.applicants.map((applicant: any) => mapApplicant(String(task.id), applicant))
    : [],
});

const mapTaskPayload = (payload: Partial<TaskUpsertPayload>) => ({
  title: payload.title,
  description: payload.description,
  category: payload.category,
  project_type: payload.projectType,
  skills: payload.skills,
  technologies: payload.technologies,
  experience_level: payload.experienceLevel,
  students_needed: payload.studentsNeeded,
  duration: payload.duration,
  start_date: payload.startDate,
  deadline: payload.deadline,
  stipend: payload.stipend,
  certificate: payload.certificate,
  internship_opportunity: payload.internshipOpportunity,
  tags: payload.tags,
  contact_email: payload.contactEmail,
  status: payload.status,
});

export const handleGetTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get("/tasks/");
  return response.data.map(mapTask);
};

export const handleGetTaskById = async (id: string): Promise<Task | undefined> => {
  const response = await apiClient.get(`/tasks/${id}`);
  return mapTask(response.data);
};

export const handleCreateTask = async (data: TaskUpsertPayload): Promise<Task> => {
  const response = await apiClient.post("/tasks/", mapTaskPayload(data));
  return mapTask(response.data);
};

export const handleUpdateTask = async (taskId: string, updates: Partial<TaskUpsertPayload>): Promise<Task> => {
  const response = await apiClient.put(`/tasks/${taskId}`, mapTaskPayload(updates));
  return mapTask(response.data);
};

export const handleDeleteTask = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`);
};

export const handleApplyTask = async (
  taskId: string,
  application?: { email?: string; portfolioUrl?: string; coverLetter?: string }
): Promise<Task> => {
  const response = await apiClient.post(`/tasks/${taskId}/apply`, {
    email: application?.email,
    portfolio_url: application?.portfolioUrl,
    cover_letter: application?.coverLetter,
  });
  return mapTask(response.data);
};

export const handleDeleteApplication = async (taskId: string): Promise<Task> => {
  const response = await apiClient.delete(`/tasks/${taskId}/apply`);
  return mapTask(response.data);
};

export const handleUpdateApplication = async (_taskId: string, appId: string, payload: { status: 'accepted' | 'rejected' }): Promise<Task> => {
  const response = await apiClient.patch(`/opportunities/applications/${appId}`, payload);
  return mapTask(response.data);
};

export const handleSubmitTaskWork = async (taskId: string, appId: string, submissionUrl: string): Promise<Task> => {
  const response = await apiClient.post(`/opportunities/submissions`, {
    task_id: taskId,
    application_id: appId,
    submission_url: submissionUrl
  });
  return mapTask(response.data);
};
