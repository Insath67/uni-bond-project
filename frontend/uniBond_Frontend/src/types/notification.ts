export type Notification = {
  id: string;
  userId: string;
  type: "like" | "comment" | "friend_request" | "notice" | "kuppy" | "group";
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // post id, etc.
};

export type NotificationFilter = "all" | "unread";

export type NotificationSummary = {
  totalCount: number;
  unreadCount: number;
};
