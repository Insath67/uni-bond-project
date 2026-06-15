import apiClient from "@/services/api/axiosClient";
import type { Post, PostCreateWithModerationResponse } from "@/types/post";
import { buildUserAvatar, resolveAssetUrl } from "@/utils/userMedia";

// Mapper function
function mapPostResponse(p: any): Post {
  return {
    id: String(p.id),
    authorId: String(p.user_id),
    authorName: p.user ? `${p.user.first_name} ${p.user.last_name}` : `User ${p.user_id}`,
    authorAvatar: p.user ? buildUserAvatar(p.user) : buildUserAvatar({ first_name: "User", last_name: String(p.user_id) }),
    authorRole: p.user ? p.user.role : "student",
    content: p.content || "",
    mediaUrl: p.media && p.media.length > 0 ? resolveAssetUrl(p.media[0].media_url) : undefined,
    mediaType: p.media && p.media.length > 0 ? p.media[0].media_type : undefined,
    createdAt: p.created_at,
    likes: p.likes_count || 0,
    commentsCount: p.comments_count || 0,
    reposts: p.reposts_count || 0,
    isLikedByUser: p.is_liked_by_user || false,
    isRepostedByUser: p.is_reposted_by_user || false,
    comments: (p.comments || []).map((comment: any) => ({
      id: String(comment.id),
      content: comment.content || "",
      createdAt: comment.created_at,
      user: {
        id: String(comment.user?.id || ""),
        firstName: comment.user?.first_name || "User",
        lastName: comment.user?.last_name || "",
        fullName: `${comment.user?.first_name || "User"} ${comment.user?.last_name || ""}`.trim(),
        avatar: buildUserAvatar(comment.user || {}),
        role: comment.user?.role || "student",
      },
    })),
  };
}

export const createPost = async (
  data: Omit<Post, "id" | "likes" | "commentsCount" | "reposts" | "createdAt" | "isLikedByUser" | "isRepostedByUser" | "comments">
): Promise<Post> => {
  const payload = {
    content: data.content,
    media: data.mediaUrl ? [
      {
        media_url: data.mediaUrl,
        media_type: data.mediaType || "image"
      }
    ] : []
  };
  const res = await apiClient.post("/posts/", payload);
  return mapPostResponse(res.data);
};

/**
 * createPostWithFile
 * ------------------
 * Sends a real file upload as multipart/form-data to POST /posts/upload.
 * Used by the new CreatePost component with file picker.
 *
 * @param content - Text content of the post (optional)
 * @param file    - The File object chosen by the user (optional)
 */
export const createPostWithFile = async (
  content: string,
  file?: File
): Promise<Post> => {
  // FormData automatically sets Content-Type: multipart/form-data with boundary
  const formData = new FormData();

  if (content) {
    formData.append("content", content);
  }

  if (file) {
    formData.append("file", file);
  }

  // Don't set Content-Type manually — Axios + FormData sets it correctly
  const res = await apiClient.post("/posts/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapPostResponse(res.data);
};

export const createModeratedPostWithFile = async (
  content: string,
  file?: File
): Promise<PostCreateWithModerationResponse> => {
  const formData = new FormData();

  if (content.trim()) {
    formData.append("content", content.trim());
  }

  if (file) {
    formData.append("image", file);
  }

  const res = await apiClient.post("/api/v1/posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    message: res.data?.message || "Post created successfully.",
    moderation: res.data?.moderation,
    post: mapPostResponse(res.data?.post),
  };
};


export const getPosts = async (): Promise<Post[]> => {
  const res = await apiClient.get("/posts/");
  return res.data.map(mapPostResponse);
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const res = await apiClient.get(`/posts/user/${userId}`);
  return res.data.map(mapPostResponse);
};

export const likePost = async (postId: string): Promise<{ status: string, count: number }> => {
  const res = await apiClient.post(`/posts/${postId}/like`);
  return res.data;
};

export const addComment = async (
  postId: string,
  commentText: string
): Promise<Post> => {
  const res = await apiClient.post(`/posts/${postId}/comments`, { content: commentText });
  return mapPostResponse(res.data);
};

export const repostPost = async (postId: string): Promise<{ status: string, count: number }> => {
  const res = await apiClient.post(`/posts/${postId}/repost`);
  return res.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

export const updatePost = async (
  postId: string,
  data: Partial<Pick<Post, "content" | "mediaUrl" | "mediaType">>
): Promise<Post> => {
  const payload = {
    content: data.content,
    media: data.mediaUrl ? [
      {
        media_url: data.mediaUrl,
        media_type: data.mediaType || "image"
      }
    ] : []
  };
  const res = await apiClient.put(`/posts/${postId}`, payload);
  return mapPostResponse(res.data);
};
