// src/hooks/api/useUsersApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { User, UserFormState } from "@/types/user";
import { toast } from "react-toastify";

// --- API Functions ---
const fetchUsers = async (includeDeleted = true): Promise<User[]> => {
  const { data } = await axios.get("/users", {
    params: { includeDeleted },
  });
  return data;
};

const fetchSeoDevs = async (): Promise<User[]> => {
  const { data } = await axios.get("/users/seodevs");
  return data;
};

const addUser = async (newUser: UserFormState): Promise<User> => {
  const { data } = await axios.post("/users", newUser);
  return data;
};

const updateUser = async ({
  id,
  user,
}: {
  id: string;
  user: UserFormState;
}): Promise<User> => {
  const { data } = await axios.put(`/users/${id}`, user);
  return data;
};

const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`/users/${id}`);
};

const restoreUser = async (id: string): Promise<void> => {
  await axios.patch(`/users/${id}/restore`);
};

const updatePassword = async ({
  id,
  currentPassword,
  newPassword,
}: {
  id: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<void> => {
  await axios.patch(`/users/${id}/password`, {
    currentPassword,
    newPassword,
  });
};

// --- React Query Hooks ---

/**
 * Hook to fetch all users
 */
export const useGetUsers = (includeDeleted = true) => {
  return useQuery<User[], Error>({
    queryKey: ["users", includeDeleted],
    queryFn: () => fetchUsers(includeDeleted),
  });
};

/**
 * Hook to fetch all SEO Devs
 */
export const useGetSeoDevs = () => {
  return useQuery<User[], Error>({
    queryKey: ["seoDevs"],
    queryFn: fetchSeoDevs,
  });
};

/**
 * Hook to add a new user
 */
export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserFormState>({
    mutationFn: addUser,
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("เพิ่มผู้ใช้สำเร็จ");
    },
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { id: string; user: UserFormState }>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("อัปเดตผู้ใช้สำเร็จ");
    },
  });
};

/**
 * Hook to delete a user (soft delete)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ลบผู้ใช้สำเร็จ");
    },
  });
};

/**
 * Hook to restore a deleted user
 */
export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("กู้คืนผู้ใช้สำเร็จ");
    },
  });
};

/**
 * Hook to update user password
 */
export const useUpdatePassword = () => {
  return useMutation<
    void,
    Error,
    { id: string; currentPassword?: string; newPassword: string }
  >({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
    },
  });
};
