import type { Notification, NotificationSummary } from "@/types/notification";

const notifications: Notification[] = [
  {
    id: "not1",
    userId: "1",
    type: "like",
    message: "Chamudika liked your post",
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedId: "1",
  },
  {
    id: "not2",
    userId: "1",
    type: "comment",
    message: "Dr. Nimal commented on your post",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    relatedId: "2",
  },
];

export const mockGetNotifications = (options?: { unreadOnly?: boolean }): Promise<Notification[]> => {
  const data = options?.unreadOnly ? notifications.filter((n) => !n.isRead) : notifications;
  return Promise.resolve(data);
};

export const mockGetNotificationSummary = (): Promise<NotificationSummary> => {
  return Promise.resolve({
    totalCount: notifications.length,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  });
};

export const mockMarkAsRead = (notificationId: string): Promise<Notification> => {
  return new Promise((resolve, reject) => {
    const notif = notifications.find((n) => n.id === notificationId);
    if (!notif) return reject(new Error("Notification not found"));
    notif.isRead = true;
    resolve(notif);
  });
};

export const mockMarkAllAsRead = (): Promise<NotificationSummary> => {
  notifications.forEach((notification) => {
    notification.isRead = true;
  });

  return Promise.resolve({
    totalCount: notifications.length,
    unreadCount: 0,
  });
};
