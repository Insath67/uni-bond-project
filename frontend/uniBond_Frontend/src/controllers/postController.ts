import {
  createPost,
  createModeratedPostWithFile,
  createPostWithFile,
  getPosts,
  getUserPosts,
  likePost,
  addComment,
  repostPost,
  deletePost,
  updatePost,
} from "@/models/postModel";
import type { Post, PostCreateWithModerationResponse } from "@/types/post";

export const handleCreatePost = async (
  postData: Omit<Post, "id" | "likes" | "commentsCount" | "reposts" | "createdAt" | "isLikedByUser" | "isRepostedByUser" | "comments">,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
) => {
  try {
    setLoading(true);
    return await createPost(postData);
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "Failed to create post");
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * handleCreatePostWithFile
 * ------------------------
 * Controller for the new file-upload-based post creation.
 * Wraps createPostWithFile with loading and error state management.
 */
export const handleCreatePostWithFile = async (
  content: string,
  file: File | undefined,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
): Promise<Post | null> => {
  try {
    setLoading(true);
    return await createPostWithFile(content, file);
  } catch (error: unknown) {
    // Try to extract a meaningful error message from the API response
    const axiosError = error as any;
    const detail = axiosError?.response?.data?.detail;
    const message = typeof detail === "string" ? detail : (error instanceof Error ? error.message : "Failed to create post");
    setError(message);
    return null;
  } finally {
    setLoading(false);
  }
};

export const handleCreateModeratedPostWithFile = async (
  content: string,
  file: File | undefined,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
): Promise<PostCreateWithModerationResponse | null> => {
  try {
    setLoading(true);
    return await createModeratedPostWithFile(content, file);
  } catch (error: unknown) {
    const axiosError = error as any;
    const detail = axiosError?.response?.data?.detail;
    const message =
      detail?.message ||
      (typeof detail === "string" ? detail : (error instanceof Error ? error.message : "Failed to create moderated post"));
    setError(message);
    return null;
  } finally {
    setLoading(false);
  }
};

export const handleGetPosts = async (): Promise<Post[]> => {
  return await getPosts();
};

export const handleGetUserPosts = async (userId: string): Promise<Post[]> => {
  return await getUserPosts(userId);
};

export const handleLikePost = async (postId: string): Promise<{status: string, count: number}> => {
  return await likePost(postId);
};

export const handleAddComment = async (
  postId: string,
  commentText: string
): Promise<Post> => {
  return await addComment(postId, commentText);
};

export const handleRepostPost = async (postId: string): Promise<{status: string, count: number}> => {
  return await repostPost(postId);
};

export const handleDeletePost = async (
  postId: string,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
): Promise<boolean> => {
  try {
    setLoading(true);
    await deletePost(postId);
    return true;
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "Failed to delete post");
    return false;
  } finally {
    setLoading(false);
  }
};

export const handleUpdatePost = async (
  postId: string,
  postData: Partial<Pick<Post, "content" | "mediaUrl" | "mediaType">>,
  setLoading: (value: boolean) => void,
  setError: (value: string) => void
) => {
  try {
    setLoading(true);
    return await updatePost(postId, postData);
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "Failed to update post");
    return null;
  } finally {
    setLoading(false);
  }
};
