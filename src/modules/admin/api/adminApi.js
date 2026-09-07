import { apiFetch } from "../../../shared/api/apiClient.js";

export const getAdminUsers = async () => {
  const data = await apiFetch("/api/admin/users");

  return data?.users ?? [];
};


export const getAdminUserById = async (userId) => {
  const data = await apiFetch(`/api/admin/users/${userId}`);

  return data?.user ?? null;
};
export const blockAdminUser = async (userId) => {
  const data = await apiFetch(`/api/admin/users/${userId}/block`, {
    method: "PATCH",
  });

  return data?.user ?? null;
};

export const unblockAdminUser = async (userId) => {
  const data = await apiFetch(`/api/admin/users/${userId}/unblock`, {
    method: "PATCH",
  });

  return data?.user ?? null;
};
