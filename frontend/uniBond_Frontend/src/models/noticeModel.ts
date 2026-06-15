import apiClient from "@/services/api/axiosClient";
import type { Notice } from "@/types/notice";

export const getNotices = async (): Promise<Notice[]> => {
  const res = await apiClient.get("/notices/");
  return res.data.map((n: any) => ({
    id: String(n.id),
    title: n.title,
    content: n.content,
    targetRole: n.target_role,
    datePosted: n.created_at,
    author: `Admin ${n.id}` // Placeholder for now
  }));
};