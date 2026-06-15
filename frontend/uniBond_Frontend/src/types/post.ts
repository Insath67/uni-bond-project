import type { ModerationCheckResponse } from "@/types/moderation";

export type PostCommentUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  role: "student" | "lecturer" | "company" | "tech_lead" | "admin";
};

export type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  user: PostCommentUser;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: "student" | "lecturer" | "company" | "tech_lead" | "admin";
  content: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  likes: number;
  commentsCount: number;
  reposts: number;
  isLikedByUser?: boolean;
  isRepostedByUser?: boolean;
  comments?: PostComment[];
  createdAt: string;
};

export type PostCreateWithModerationResponse = {
  message: string;
  moderation: ModerationCheckResponse;
  post: Post;
};
