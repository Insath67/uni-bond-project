import { getNotices } from "@/models/noticeModel";
import type { Notice } from "@/types/notice";

export const handleGetNotices = async (): Promise<Notice[]> => {
  return await getNotices();
};