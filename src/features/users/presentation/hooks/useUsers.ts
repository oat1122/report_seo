"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import { User, UserFormState } from "@/types/user";
import { toast } from "react-toastify";

type ApiData<T> = { data: T };

function invalidateUserListQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["users"] });
  queryClient.invalidateQueries({ queryKey: ["seoDevs"] });
  queryClient.invalidateQueries({ queryKey: ["managedCustomers"] });
}

export const useGetUsers = (includeDeleted = true) =>
  useQuery<User[], Error>({
    queryKey: ["users", includeDeleted],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<User[]>>("/users", {
        params: { includeDeleted },
      });
      return data.data;
    },
  });

export const useGetSeoDevs = () =>
  useQuery<User[], Error>({
    queryKey: ["seoDevs"],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<User[]>>("/users/seodevs");
      return data.data;
    },
  });

export const useGetManagedCustomers = () =>
  useQuery<User[], Error>({
    queryKey: ["managedCustomers"],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<User[]>>("/users/managed-customers");
      return data.data;
    },
  });

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UserFormState>({
    mutationFn: async (newUser) => {
      const { data } = await axios.post<ApiData<User>>("/users", newUser);
      return data.data;
    },
    onSuccess: () => invalidateUserListQueries(queryClient),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; user: UserFormState }>({
    mutationFn: async ({ id, user }) => {
      const { data } = await axios.put<ApiData<User>>(`/users/${id}`, user);
      return data.data;
    },
    onSuccess: () => invalidateUserListQueries(queryClient),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axios.delete(`/users/${id}`);
    },
    onSuccess: () => {
      invalidateUserListQueries(queryClient);
      toast.success("ลบผู้ใช้สำเร็จ");
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axios.patch(`/users/${id}/restore`);
    },
    onSuccess: () => {
      invalidateUserListQueries(queryClient);
      toast.success("กู้คืนผู้ใช้สำเร็จ");
    },
  });
};

export const useUpdatePassword = () =>
  useMutation<
    void,
    Error,
    {
      id: string;
      currentPassword?: string;
      newPassword: string;
      confirmPassword: string;
    }
  >({
    mutationFn: async ({ id, currentPassword, newPassword, confirmPassword }) => {
      await axios.patch(`/users/${id}/password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
    },
  });
