import { checkPostModeration } from "@/models/moderationModel";
import type { ModerationCheckResponse } from "@/types/moderation";

export const handleCheckPostModeration = async (
  content: string,
  image?: File
): Promise<ModerationCheckResponse> => {
  return await checkPostModeration(content, image);
};
