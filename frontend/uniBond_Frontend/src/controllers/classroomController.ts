import apiClient from "@/services/api/axiosClient";
import type { Classroom } from "@/types/classroom";

export const handleGetClassrooms = async (): Promise<Classroom[]> => {
  const res = await apiClient.get("/classrooms/");
  return res.data.map((c: any) => ({
    id: String(c.id),
    techLeadId: String(c.techlead_id),
    techLeadName: `User ${c.techlead_id}`,
    title: c.title,
    description: c.description || "",
    maxStudents: c.max_capacity,
    currentStudents: c.students?.length || 0,
    rating: 0,
    totalRatings: 0,
    createdAt: c.created_at || "",
    enrolledStudents: c.students?.map((s: any) => String(s.user_id)) || []
  }));
};

export const handleGetClassroomById = async (id: string): Promise<Classroom | undefined> => {
  const res = await apiClient.get(`/classrooms/${id}`);
  const c = res.data;
  return {
    id: String(c.id),
    techLeadId: String(c.techlead_id),
    techLeadName: `User ${c.techlead_id}`,
    title: c.title,
    description: c.description || "",
    maxStudents: c.max_capacity,
    currentStudents: c.students?.length || 0,
    rating: 0,
    totalRatings: 0,
    createdAt: c.created_at || "",
    enrolledStudents: c.students?.map((s: any) => String(s.user_id)) || []
  };
};

export const handleCreateClassroom = async (_techLeadId: string, _techLeadName: string, title: string, description: string, maxStudents: number): Promise<Classroom> => {
  const res = await apiClient.post("/classrooms/", { title, description, max_capacity: maxStudents });
  return handleGetClassroomById(String(res.data.id)) as unknown as Classroom;
};

export const handleJoinClassroom = async (classroomId: string, _studentId: string): Promise<Classroom> => {
  await apiClient.post(`/classrooms/${classroomId}/join`);
  return handleGetClassroomById(classroomId) as unknown as Classroom;
};
