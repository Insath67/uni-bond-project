import { getNotificationSummary, getNotifications, markAllAsRead, markAsRead } from "@/models/notificationModel";
import type { Notification, NotificationSummary } from "@/types/notification";

export const handleGetNotifications = async (options?: { unreadOnly?: boolean }): Promise<Notification[]> => {
  return await getNotifications(options);
};

export const handleGetNotificationSummary = async (): Promise<NotificationSummary> => {
  return await getNotificationSummary();
};

export const handleMarkAsRead = async (notificationId: string): Promise<Notification> => {
  return await markAsRead(notificationId);
};

export const handleMarkAllAsRead = async (): Promise<NotificationSummary> => {
  return await markAllAsRead();
};
