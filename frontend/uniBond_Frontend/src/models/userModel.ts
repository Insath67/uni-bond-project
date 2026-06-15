import apiClient from "@/services/api/axiosClient";
import type { DiscoverUser, OnlineContact, Role, User, UserProfileData, UserProfileUpdatePayload, UserSummary } from "@/types/user";
import { buildAvatar, buildUserAvatar, resolveAssetUrl } from "@/utils/userMedia";

const buildLocation = (city?: string, country?: string) =>
  [city, country].filter(Boolean).join(", ") || undefined;

export const mapApiUserToFrontendUser = (data: any): User => {
  const base = {
    id: String(data.id),
    user_code: data.user_code,
    firstname: data.first_name || data.firstname || "User",
    lastname: data.last_name || data.lastname || "",
    email: data.email || "",
    password: "",
    role: (data.role || "student") as Role,
    description: data.description || undefined,
    avatar:
      resolveAssetUrl(data.avatar_path || data.avatar) ||
      buildAvatar(data.first_name || data.firstname || "User", data.last_name || data.lastname || "", data.email || ""),
    avatar_path: data.avatar_path || undefined,
    cover: resolveAssetUrl(data.cover_path || data.cover),
    cover_path: data.cover_path || undefined,
    city: data.city || "",
    country: data.country || "",
    mobile: data.mobile || "",
    school: data.school || undefined,
    cv_path: data.cv_path || undefined,
    access_status: data.access_status || "active",
  };

  if (base.role === "student") {
    return {
      ...base,
      role: "student",
      school: data.school || "",
      education: data.education_status || "Bachelor",
    };
  }

  if (base.role === "lecturer") {
    return {
      ...base,
      role: "lecturer",
      school: data.school || "",
      education: data.education_status || "Master",
    };
  }

  if (base.role === "company") {
    return {
      ...base,
      role: "company",
      companyName: data.company_name || data.companyName || `${base.firstname} ${base.lastname}`.trim(),
      industry: data.industry || "",
      companySize: data.company_size || data.companySize || "",
    };
  }

  if (base.role === "tech_lead") {
    return {
      ...base,
      role: "tech_lead",
      industryExpertise: data.industry_expertise || data.industryExpertise || "",
      yearsOfExperience: String(data.years_of_experience || data.yearsOfExperience || ""),
    };
  }

  return {
    ...base,
    role: "admin",
    adminLevel: data.admin_level || data.adminLevel || undefined,
  };
};

const mapDiscoverUserResponse = (data: any): DiscoverUser => {
  const firstname = data.first_name || data.firstname || "User";
  const lastname = data.last_name || data.lastname || "";
  const email = data.email || "";

  return {
    id: String(data.id),
    firstname,
    lastname,
    fullName: `${firstname} ${lastname}`.trim(),
    email,
    role: (data.role || "student") as Role,
    avatar: buildUserAvatar(data),
    city: data.city || undefined,
    country: data.country || undefined,
    location: buildLocation(data.city, data.country),
    profilePath: `/profile/${data.id}`,
    isFollowing: Boolean(data.is_following),
  };
};

export const getDiscoverUsers = async (
  limit = 5,
  roles?: Role[],
  options?: { excludeFollowed?: boolean; excludeUserId?: string }
): Promise<DiscoverUser[]> => {
  const response = await apiClient.get("/users/discover", {
    params: {
      limit,
      roles,
      exclude_followed: options?.excludeFollowed,
      exclude_user_id: options?.excludeUserId,
    },
  });
  return response.data.map(mapDiscoverUserResponse);
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get(`/users/${userId}`);
  return mapApiUserToFrontendUser(response.data);
};

const mapUserSummaryResponse = (data: any): UserSummary => {
  const firstname = data.first_name || data.firstname || "User";
  const lastname = data.last_name || data.lastname || "";
  const email = data.email || "";
  const avatar =
    resolveAssetUrl(data.avatar_path || data.avatar) ||
    buildAvatar(firstname, lastname, email);

  return {
    id: String(data.id),
    firstname,
    lastname,
    fullName: `${firstname} ${lastname}`.trim(),
    email,
    role: (data.role || "student") as Role,
    avatar,
    city: data.city || undefined,
    country: data.country || undefined,
    location: buildLocation(data.city, data.country),
    profilePath: `/profile/${data.id}`,
    isFollowing: Boolean(data.is_following),
  };
};

const mapOnlineContactResponse = (data: any): OnlineContact => {
  const firstname = data.first_name || data.firstname || "User";
  const lastname = data.last_name || data.lastname || "";
  const email = data.email || "";

  return {
    id: String(data.id),
    firstname,
    lastname,
    fullName: `${firstname} ${lastname}`.trim(),
    email,
    role: (data.role || "student") as Role,
    avatar: buildUserAvatar(data),
    city: data.city || undefined,
    country: data.country || undefined,
    location: buildLocation(data.city, data.country),
    lastSeen: data.last_seen || undefined,
    isOnline: Boolean(data.is_online),
    isFollowing: Boolean(data.is_following),
    profilePath: `/profile/${data.id}`,
  };
};

const mapUserProfileResponse = (data: any): UserProfileData => {
  const user = mapApiUserToFrontendUser(data);

  return {
    user,
    followersCount: Number(data.followers_count || 0),
    followingCount: Number(data.following_count || 0),
    isFollowing: Boolean(data.is_following),
    isOwnProfile: Boolean(data.is_own_profile),
  };
};

export const getUserProfile = async (userId: string): Promise<UserProfileData> => {
  const response = await apiClient.get(`/users/${userId}/profile`);
  return mapUserProfileResponse(response.data);
};

export const followUser = async (userId: string): Promise<UserProfileData> => {
  const response = await apiClient.post(`/users/${userId}/follow`);
  return mapUserProfileResponse(response.data);
};

export const unfollowUser = async (userId: string): Promise<UserProfileData> => {
  const response = await apiClient.delete(`/users/${userId}/follow`);
  return mapUserProfileResponse(response.data);
};

export const getFollowers = async (userId: string): Promise<UserSummary[]> => {
  const response = await apiClient.get(`/users/${userId}/followers`);
  return response.data.map(mapUserSummaryResponse);
};

export const getFollowing = async (userId: string): Promise<UserSummary[]> => {
  const response = await apiClient.get(`/users/${userId}/following`);
  return response.data.map(mapUserSummaryResponse);
};

export const getFollowStatus = async (userId: string): Promise<boolean> => {
  const response = await apiClient.get(`/users/${userId}/follow-status`);
  return Boolean(response.data?.is_following);
};

export const getOnlineUsers = async (limit = 10): Promise<OnlineContact[]> => {
  const response = await apiClient.get("/users/online-users", { params: { limit } });
  return response.data.map(mapOnlineContactResponse);
};

export const sendPresenceHeartbeat = async (): Promise<void> => {
  await apiClient.post("/users/presence/heartbeat");
};

export const updateUserProfile = async (userId: string, payload: UserProfileUpdatePayload): Promise<User> => {
  const response = await apiClient.put(`/users/${userId}`, {
    first_name: payload.firstname.trim(),
    last_name: payload.lastname.trim(),
    username: payload.email.trim().toLowerCase(),
    email: payload.email.trim().toLowerCase(),
    city: payload.city.trim(),
    country: payload.country.trim(),
    mobile: payload.mobile.trim(),
    password: payload.password?.trim() || undefined,
    school: payload.school?.trim() || undefined,
    education_status: payload.education?.trim() || undefined,
    company_name: payload.companyName?.trim() || undefined,
    industry: payload.industry?.trim() || undefined,
    company_size: payload.companySize?.trim() || undefined,
    industry_expertise: payload.industryExpertise?.trim() || undefined,
    years_of_experience: payload.yearsOfExperience?.trim() || undefined,
  });

  return mapApiUserToFrontendUser(response.data);
};

export const uploadUserAvatar = async (userId: string, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapApiUserToFrontendUser(response.data);
};

export const uploadUserCover = async (userId: string, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/users/${userId}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapApiUserToFrontendUser(response.data);
};
