import apiClient from "@/services/api/axiosClient";
import type { ModerationCheckResponse } from "@/types/moderation";

export const checkPostModeration = async (
  content: string,
  image?: File
): Promise<ModerationCheckResponse> => {
  const formData = new FormData();

  if (content.trim()) {
    formData.append("text", content.trim());
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await apiClient.post("/api/v1/moderation/check", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
