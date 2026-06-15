import {
  followUser,
  getDiscoverUsers,
  getFollowers,
  getFollowStatus,
  getFollowing,
  getOnlineUsers,
  getUserById,
  getUserProfile,
  sendPresenceHeartbeat,
  unfollowUser,
  uploadUserAvatar,
  uploadUserCover,
  updateUserProfile,
} from "@/models/userModel";
import type { DiscoverUser, OnlineContact, Role, User, UserProfileData, UserProfileUpdatePayload, UserSummary } from "@/types/user";

export const handleGetDiscoverUsers = async (
  limit = 5,
  roles?: Role[],
  options?: { excludeFollowed?: boolean; excludeUserId?: string }
): Promise<DiscoverUser[]> => {
  return getDiscoverUsers(limit, roles, options);
};

export const handleGetUserById = async (userId: string): Promise<User> => {
  return getUserById(userId);
};

export const handleGetUserProfile = async (userId: string): Promise<UserProfileData> => {
  return getUserProfile(userId);
};

export const handleFollowUser = async (userId: string): Promise<UserProfileData> => {
  return followUser(userId);
};

export const handleUnfollowUser = async (userId: string): Promise<UserProfileData> => {
  return unfollowUser(userId);
};

export const handleGetFollowers = async (userId: string): Promise<UserSummary[]> => {
  return getFollowers(userId);
};

export const handleGetFollowing = async (userId: string): Promise<UserSummary[]> => {
  return getFollowing(userId);
};

export const handleGetFollowStatus = async (userId: string): Promise<boolean> => {
  return getFollowStatus(userId);
};

export const handleGetOnlineUsers = async (limit = 10): Promise<OnlineContact[]> => {
  return getOnlineUsers(limit);
};

export const handlePresenceHeartbeat = async (): Promise<void> => {
  return sendPresenceHeartbeat();
};

export const handleUpdateUserProfile = async (userId: string, payload: UserProfileUpdatePayload): Promise<User> => {
  return updateUserProfile(userId, payload);
};

export const handleUploadUserAvatar = async (userId: string, file: File): Promise<User> => {
  return uploadUserAvatar(userId, file);
};

export const handleUploadUserCover = async (userId: string, file: File): Promise<User> => {
  return uploadUserCover(userId, file);
};
