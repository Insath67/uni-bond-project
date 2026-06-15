import { apiCall } from "./apiClient";
import type { Post } from "@/types/post";

export interface CreatePostRequest {
  content: string;
  media?: Array<{
    url: string;
    type: string;
  }>;
}

export const postService = {
  async createPost(post: CreatePostRequest): Promise<Post> {
    return apiCall("/posts/", {
      method: "POST",
      body: post,
    });
  },

  async getPost(postId: string): Promise<Post> {
    return apiCall(`/posts/${postId}`);
  },

  async getAllPosts(): Promise<Post[]> {
    return apiCall("/posts/");
  },

  async updatePost(postId: string, post: Partial<Post>): Promise<Post> {
    return apiCall(`/posts/${postId}`, {
      method: "PUT",
      body: post,
    });
  },

  async deletePost(postId: string): Promise<{ message: string }> {
    return apiCall(`/posts/${postId}`, {
      method: "DELETE",
    });
  },

  async likePost(postId: string): Promise<{ message: string }> {
    return apiCall(`/posts/${postId}/like`, {
      method: "POST",
    });
  },

  async unlikePost(postId: string): Promise<{ message: string }> {
    return apiCall(`/posts/${postId}/unlike`, {
      method: "POST",
    });
  },

  async getComments(postId: string): Promise<any[]> {
    return apiCall(`/posts/${postId}/comments`);
  },

  async addComment(postId: string, content: string): Promise<any> {
    return apiCall(`/posts/${postId}/comments`, {
      method: "POST",
      body: { content },
    });
  },
};
