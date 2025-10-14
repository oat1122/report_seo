import { useState, useEffect, useCallback } from "react";
import { Role } from "@/types/auth";
import { User, UserFormState } from "@/types/user";
import {
  fetchUsersAPI,
  fetchSeoDevsAPI,
  fetchUserByIdAPI,
  saveUserAPI,
  deleteUserAPI,
  fetchMetricsAPI,
  saveMetricsAPI,
  fetchKeywordsAPI,
  addKeywordAPI,
  deleteKeywordAPI,
} from "../lib/userService";
import {
  OverallMetrics,
  KeywordReport,
  KeywordReportForm,
  OverallMetricsForm,
} from "@/types/metrics";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [seoDevs, setSeoDevs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});

  // === New State for Metrics Modal ===
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [metricsData, setMetricsData] = useState<OverallMetrics | null>(null);
  const [keywordsData, setKeywordsData] = useState<KeywordReport[]>([]);

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

  // === New Handlers for Metrics Modal ===
  const handleOpenMetricsModal = useCallback(async (customer: User) => {
    setSelectedCustomer(customer);
    try {
      const [metrics, keywords] = await Promise.all([
        fetchMetricsAPI(customer.id),
        fetchKeywordsAPI(customer.id),
      ]);
      setMetricsData(metrics);
      setKeywordsData(keywords);
    } catch (err) {
      setError((err as Error).message);
    }
    setIsMetricsModalOpen(true);
  }, []);

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    setMetricsData(null);
    setKeywordsData([]);
  };

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomer) return;
    try {
      const updatedMetrics = await saveMetricsAPI(
        selectedCustomer.id,
        data as OverallMetricsForm
      );
      setMetricsData(updatedMetrics);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const refreshKeywords = async () => {
    if (!selectedCustomer) return;
    try {
      const keywords = await fetchKeywordsAPI(selectedCustomer.id);
      setKeywordsData(keywords);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    try {
      await addKeywordAPI(selectedCustomer.id, keyword);
      await refreshKeywords();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await deleteKeywordAPI(keywordId);
      setKeywordsData((prev) => prev.filter((kw) => kw.id !== keywordId));
    } catch (err) {
      setError((err as Error).message);
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
    // Metrics Modal
    isMetricsModalOpen,
    selectedCustomer,
    metricsData,
    keywordsData,
    handleOpenMetricsModal,
    handleCloseMetricsModal,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
  };
};
