import apiClient from "@/services/api/axiosClient";
import type { User, StudentUser, LecturerUser, CompanyUser, TechLeadUser } from "@/types/user";

export const registerUser = async (data: User) => {
  const email = data.email.trim().toLowerCase();
  const payload: Record<string, unknown> = {
    first_name: data.firstname.trim(),
    last_name: data.lastname.trim(),
    username: email,
    email,
    password: data.password,
    role: data.role,
    city: data.city.trim(),
    country: data.country.trim(),
    mobile: data.mobile.trim(),
    school: data.school?.trim() || null,
  };

  if (data.role === "student" || data.role === "lecturer") {
    payload.education_status = (data as StudentUser | LecturerUser).education;
    payload.school = (data as StudentUser | LecturerUser).school;
  }

  if (data.role === "company") {
    const c = data as CompanyUser;
    payload.description = `${c.companyName} | ${c.industry} | Size: ${c.companySize}`;
  }

  if (data.role === "tech_lead") {
    const t = data as TechLeadUser;
    payload.description = `Expert in ${t.industryExpertise} | ${t.yearsOfExperience} years`;
  }

  const response = await apiClient.post("/users/", payload);
  return { message: "Registration successful.", user: response.data };
};

export const loginUser = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append("username", email.trim().toLowerCase());
  formData.append("password", password);
  const res = await apiClient.post("/users/login", formData);
  return res.data;
};

export const forgotPassword = async (
  email: string,
  mobile: string,
  newPassword: string,
  confirmPassword: string
) => {
  const res = await apiClient.post("/users/forgot-password", {
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

  return res.data as { message: string };
};

export const uploadCV = async (userId: string, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await apiClient.post(`/users/${userId}/cv`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
