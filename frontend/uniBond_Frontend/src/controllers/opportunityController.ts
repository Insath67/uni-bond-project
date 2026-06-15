import apiClient from "@/services/api/axiosClient";

type OpportunityApplicationPayload = {
  opportunity_id: number;
  cover_letter?: string;
  resume_url?: string;
};

type TaskSubmissionPayload = {
  task_id: number;
  submission_text?: string;
  submission_url?: string;
};

export const applicationService = {
  applyForOpportunity(payload: OpportunityApplicationPayload) {
    return apiClient.post("/opportunities/apply", payload);
  },
};

export const submissionService = {
  submitTask(payload: TaskSubmissionPayload) {
    return apiClient.post("/opportunities/submissions", payload);
  },
};

export const notificationService = {
  markAsRead(notificationId: number) {
    return apiClient.put(`/opportunities/notifications/${notificationId}`);
  },
  markAllAsRead() {
    return apiClient.put("/opportunities/notifications/read-all");
  },
};

export const dashboardService = {
  getCompanyDashboard() {
    return apiClient.get("/opportunities/dashboard/company");
  },
  getStudentDashboard() {
    return apiClient.get("/opportunities/dashboard/student");
  },
};

export const opportunityService = {
  getOpportunities() {
    return apiClient.get("/opportunities");
  },
  getOpportunityById(opportunityId: number) {
    return apiClient.get(`/opportunities/${opportunityId}`);
  },
};
