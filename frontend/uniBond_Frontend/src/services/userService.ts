import { apiCall } from "./apiClient";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export const userService = {
  async getUser(userId: string): Promise<User> {
    return apiCall(`/users/${userId}`);
  },

  async getAllUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return apiCall(`/users/?skip=${skip}&limit=${limit}`);
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return apiCall(`/users/${userId}`, {
      method: "PUT",
      body: userData,
    });
  },

  async getCurrentUser(): Promise<User> {
    return apiCall("/users/me");
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiCall(`/users/${userId}`, {
      method: "DELETE",
    });
  },

  async searchUsers(query: string): Promise<User[]> {
    return apiCall(`/users/search?query=${encodeURIComponent(query)}`);
  },
};
