import apiClient from "@/services/api/axiosClient";

export const fetchAllUsers = async () => {
  const res = await apiClient.get("/users/");
  return res.data;
};

export const fetchPendingUsers = async () => {
  const res = await apiClient.get("/admin/pending-users");
  return res.data;
};

export const approveUser = async (userId: number) => {
  const res = await apiClient.put(`/admin/users/${userId}/approve`);
  return res.data;
};

export const suspendUser = async (userId: number) => {
  const res = await apiClient.put(`/admin/users/${userId}/suspend`);
  return res.data;
};

export const activateUser = async (userId: number) => {
  const res = await apiClient.put(`/admin/users/${userId}/activate`);
  return res.data;
};

export const fetchAdminStats = async () => {
  const res = await apiClient.get("/admin/stats");
  return res.data;
};
