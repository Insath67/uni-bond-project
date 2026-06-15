import apiClient from "@/services/api/axiosClient";
import type { Notification, NotificationSummary } from "@/types/notification";
const mapNotificationResponse = (n: any): Notification => ({
  id: String(n.id),
  userId: String(n.user_id),
  message: n.message || "",
  type: (n.type || "notice") as Notification["type"],
  isRead: Boolean(n.is_read),
  createdAt: n.created_at,
  relatedId: n.related_id ? String(n.related_id) : undefined,
});

const mapNotificationSummaryResponse = (data: any): NotificationSummary => ({
  totalCount: Number(data.total_count || 0),
  unreadCount: Number(data.unread_count || 0),
});

export const getNotifications = async (options?: { unreadOnly?: boolean }): Promise<Notification[]> => {
  const res = await apiClient.get("/notifications", {
    params: { unread_only: options?.unreadOnly || undefined },
  });
  return res.data.map(mapNotificationResponse);
};

export const getNotificationSummary = async (): Promise<NotificationSummary> => {
  const res = await apiClient.get("/notifications/summary");
  return mapNotificationSummaryResponse(res.data);
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const res = await apiClient.put(`/notifications/${notificationId}/read`);
  return mapNotificationResponse(res.data);
};

export const markAllAsRead = async (): Promise<NotificationSummary> => {
  const res = await apiClient.put("/notifications/read-all");
  return mapNotificationSummaryResponse(res.data);
};
