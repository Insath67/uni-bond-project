import axios from "axios";

import apiClient from "@/services/api/axiosClient";
import type { KuppyOffer, KuppyRequest, KuppySession, KuppyUserSummary } from "@/types/kuppy";

const parseError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail;
    if (typeof message === "string" && message.trim()) {
      return new Error(message);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Something went wrong while processing the Kuppy request.");
};

const mapUserSummary = (data: any): KuppyUserSummary => {
  const firstname = data.first_name || data.firstname || "User";
  const lastname = data.last_name || data.lastname || "";

  return {
    id: String(data.id),
    firstname,
    lastname,
    fullName: `${firstname} ${lastname}`.trim(),
    role: String(data.role || ""),
  };
};

const mapOffer = (data: any): KuppyOffer => ({
  id: String(data.id),
  requestId: String(data.request_id),
  lecturerId: String(data.lecturer_id),
  availabilityStart: data.availability_start,
  availabilityEnd: data.availability_end,
  description: data.description || "",
  status: data.status,
  createdAt: data.created_at,
  lecturer: mapUserSummary(data.lecturer || {}),
});

const mapRequest = (data: any): KuppyRequest => ({
  id: String(data.id),
  studentId: String(data.student_id),
  moduleName: data.module_name,
  description: data.description || "",
  requestedBefore: data.requested_before,
  currentStudentCount: Number(data.current_student_count || 0),
  status: data.status,
  selectedOfferId: data.selected_offer_id ? String(data.selected_offer_id) : undefined,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  student: mapUserSummary(data.student || {}),
  votes: (data.votes || []).map((vote: any) => String(vote.user_id)),
  voteCount: (data.votes || []).length,
  offers: (data.offers || []).map(mapOffer),
});

const mapSession = (data: any): KuppySession => ({
  id: String(data.id),
  lecturerId: String(data.lecturer_id),
  requestId: data.request_id ? String(data.request_id) : undefined,
  title: data.title,
  moduleName: data.module_name,
  description: data.description || "",
  scheduledStart: data.scheduled_start,
  scheduledEnd: data.scheduled_end,
  maxStudents: Number(data.max_students || 0),
  status: data.status,
  autoDeleteAt: data.auto_delete_at || undefined,
  createdAt: data.created_at,
  lecturer: mapUserSummary(data.lecturer || {}),
  participants: (data.participants || []).map((participant: any) => ({
    userId: String(participant.user_id),
    joinedAt: participant.joined_at,
    user: mapUserSummary(participant.user || {}),
  })),
});

export const handleGetKuppyRequests = async (): Promise<KuppyRequest[]> => {
  try {
    const res = await apiClient.get("/kuppy/requests");
    return res.data.map(mapRequest);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleCreateKuppyRequest = async (
  moduleName: string,
  description: string,
  requestedBefore: string,
  currentStudentCount: number
): Promise<KuppyRequest> => {
  try {
    const res = await apiClient.post("/kuppy/requests", {
      module_name: moduleName,
      description,
      requested_before: requestedBefore,
      current_student_count: currentStudentCount,
    });
    return mapRequest(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleVoteKuppyRequest = async (requestId: string): Promise<KuppyRequest> => {
  try {
    const res = await apiClient.post(`/kuppy/requests/${requestId}/vote`);
    return mapRequest(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleRemoveKuppyVote = async (requestId: string): Promise<KuppyRequest> => {
  try {
    const res = await apiClient.delete(`/kuppy/requests/${requestId}/vote`);
    return mapRequest(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleCreateKuppyOffer = async (
  requestId: string,
  availabilityStart: string,
  availabilityEnd: string,
  description: string
): Promise<KuppyOffer> => {
  try {
    const res = await apiClient.post(`/kuppy/requests/${requestId}/offers`, {
      availability_start: availabilityStart,
      availability_end: availabilityEnd,
      description,
    });
    return mapOffer(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleConfirmKuppyOffer = async (requestId: string, offerId: string): Promise<KuppySession> => {
  try {
    const res = await apiClient.post(`/kuppy/requests/${requestId}/offers/${offerId}/confirm`);
    return mapSession(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleGetKuppySessions = async (): Promise<KuppySession[]> => {
  try {
    const res = await apiClient.get("/kuppy/sessions");
    return res.data.map(mapSession);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleCreateKuppySession = async (
  title: string,
  moduleName: string,
  description: string,
  scheduledStart: string,
  scheduledEnd: string,
  maxStudents: number
): Promise<KuppySession> => {
  try {
    const res = await apiClient.post("/kuppy/sessions", {
      title,
      module_name: moduleName,
      description,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      max_students: maxStudents,
    });
    return mapSession(res.data);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleJoinKuppySession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.post(`/kuppy/sessions/${sessionId}/join`);
  } catch (error) {
    throw parseError(error);
  }
};

export const handleLeaveKuppySession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.delete(`/kuppy/sessions/${sessionId}/leave`);
  } catch (error) {
    throw parseError(error);
  }
};
