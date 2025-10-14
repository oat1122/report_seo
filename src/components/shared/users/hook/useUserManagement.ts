import { useState, useEffect, useCallback } from "react";
import { Role } from "@/types/auth";
import { User, UserFormState } from "@/types/user";
import {
  fetchUsersAPI,
  fetchSeoDevsAPI,
  fetchUserByIdAPI,
  saveUserAPI,
  deleteUserAPI,
} from "../lib/userService";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [seoDevs, setSeoDevs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsersAPI();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeoDevs = useCallback(async () => {
    try {
      const data = await fetchSeoDevsAPI();
      setSeoDevs(data);
    } catch (err) {
      console.error((err as Error).message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSeoDevs();
  }, [fetchUsers, fetchSeoDevs]);

  const handleOpenModal = useCallback(async (user?: User) => {
    setIsEditing(!!user);
    if (user) {
      if (user.role === Role.CUSTOMER) {
        try {
          const userData = await fetchUserByIdAPI(user.id);
          setCurrentUser({
            ...user,
            companyName: userData.customerProfile?.name,
            domain: userData.customerProfile?.domain,
            seoDevId: userData.customerProfile?.seoDevId,
          });
        } catch (err) {
          console.error("Failed to fetch customer data:", err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }
    } else {
      setCurrentUser({});
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const handleSave = async () => {
    setError(null);
    try {
      await saveUserAPI(currentUser, isEditing);
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserAPI(id);
        fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return {
    users,
    seoDevs,
    loading,
    error,
    isModalOpen,
    isEditing,
    currentUser,
    setCurrentUser,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    setError,
  };
};
