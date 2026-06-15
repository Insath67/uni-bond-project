export type Role = "student" | "lecturer" | "company" | "tech_lead" | "admin";

export interface BaseUser {
  id: string;
  user_code?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
  description?: string;
  avatar?: string;
  avatar_path?: string;
  cover?: string;
  cover_path?: string;
  // Common new fields
  city: string;
  country: string;
  mobile: string;
  school?: string;       // student & lecturer
  cv_path?: string;
  access_status?: "active" | "pending" | "suspended";
}

export interface StudentUser extends BaseUser {
  role: "student";
  school: string;
  education: "Diploma" | "Higher Diploma" | "Bachelor" | "Master";
}

export interface LecturerUser extends BaseUser {
  role: "lecturer";
  school: string;
  education: "Diploma" | "Higher Diploma" | "Bachelor" | "Master";
}

export interface CompanyUser extends BaseUser {
  role: "company";
  companyName: string;
  industry: string;
  companySize: string;
}

export interface TechLeadUser extends BaseUser {
  role: "tech_lead";
  industryExpertise: string;
  yearsOfExperience: string;
}

export interface AdminUser extends BaseUser {
  role: "admin";
  adminLevel?: string;
}

export type User = StudentUser | LecturerUser | CompanyUser | TechLeadUser | AdminUser;

export interface DiscoverUser {
  id: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  role: Role;
  avatar: string;
  city?: string;
  country?: string;
  location?: string;
  profilePath: string;
  isFollowing: boolean;
}

export interface ProfileConnectionStats {
  followers: number;
  following: number;
  connections: number;
}

export interface UserSummary {
  id: string;
  firstname: string;
  lastname: string;
  fullName: string;
  email: string;
  role: Role;
  avatar: string;
  city?: string;
  country?: string;
  location?: string;
  profilePath: string;
  isFollowing?: boolean;
}

export interface OnlineContact extends UserSummary {
  fullName: string;
  location?: string;
  lastSeen?: string;
  isOnline: boolean;
  profilePath: string;
}

export interface UserProfileData {
  user: User;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export type UserProfileUpdatePayload = {
  firstname: string;
  lastname: string;
  email: string;
  city: string;
  country: string;
  mobile: string;
  password?: string;
  school?: string;
  education?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  industryExpertise?: string;
  yearsOfExperience?: string;
};
