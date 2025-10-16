"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { MetricsModal } from "./MetricsModal/MetricsModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  addUser,
  updateUser,
  updatePassword,
} from "@/store/features/users/usersSlice";
import {
  fetchMetrics,
  fetchKeywords,
  fetchRecommendKeywords,
  saveMetrics,
  addKeyword,
  deleteKeyword,
  addRecommendKeyword,
  deleteRecommendKeyword,
  clearMetricsState,
} from "@/store/features/metrics/metricsSlice";
import { User, UserFormState } from "@/types/user";
import { Role } from "@/types/auth";
import axios from "@/lib/axios";
import {
  OverallMetrics,
  OverallMetricsForm,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";
import { showPromiseToast } from "@/components/shared/toast/lib/toastify";
import { useSession } from "next-auth/react";

const UserManagementSeoDev: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const currentSeoDevId = session?.user?.id;

  const {
    users,
    status,
    error: usersError,
  } = useAppSelector((state) => state.users);

  const {
    metrics,
    keywords,
    recommendKeywords,
    status: metricsStatus,
  } = useAppSelector((state) => state.metrics);

  const loading = status === "loading";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});
  const [error, setError] = useState<string | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // Filter users to show only customers of the current SEO dev
  const managedCustomers = users.filter(
    (user) =>
      user.role === Role.CUSTOMER &&
      (user as any).customerProfile?.seoDevId === currentSeoDevId
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (usersError) {
      setError(usersError);
    }
  }, [usersError]);

  const handleOpenModal = async (user?: User) => {
    setIsEditing(!!user);
    if (user) {
      // SEO Dev can only edit their own profile or their customers
      if (
        user.id === currentSeoDevId ||
        managedCustomers.some((c) => c.id === user.id)
      ) {
        if (user.role === Role.CUSTOMER) {
          try {
            const response = await axios.get(`/users/${user.id}`);
            const userData = response.data;
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
        showPromiseToast(Promise.reject(), {
          pending: "",
          success: "",
          error: "You can only edit your own profile or your customers.",
        });
        return;
      }
    } else {
      // When creating, default role is CUSTOMER and seoDevId is the current user
      setCurrentUser({ role: Role.CUSTOMER, seoDevId: currentSeoDevId });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const handleSave = async () => {
    setError(null);

    // Ensure SEO Dev can only create CUSTOMERs
    if (!isEditing && currentUser.role !== Role.CUSTOMER) {
      setError("You can only create users with the CUSTOMER role.");
      return;
    }
    // When creating, set the seoDevId to the current logged-in SEO dev
    const userToSave = { ...currentUser };
    if (!isEditing) {
      userToSave.seoDevId = currentSeoDevId;
    }

    // If there's a new password, dispatch the updatePassword action
    if (currentUser.newPassword) {
      if (currentUser.newPassword !== currentUser.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      const passPromise = dispatch(
        updatePassword({ userId: currentUser.id!, values: currentUser })
      ).unwrap();
      showPromiseToast(passPromise, {
        pending: "กำลังอัปเดตรหัสผ่าน...",
        success: "อัปเดตรหัสผ่านสำเร็จ!",
        error: "ไม่สามารถอัปเดตรหัสผ่านได้",
      });

      // Also update other user info if needed
      const infoToUpdate = { ...userToSave };
      delete infoToUpdate.newPassword;
      delete infoToUpdate.confirmPassword;
      delete infoToUpdate.currentPassword;

      if (Object.keys(infoToUpdate).length > 1) {
        // more than just ID
        const infoPromise = dispatch(updateUser(infoToUpdate)).unwrap();
        showPromiseToast(infoPromise, {
          pending: "กำลังอัปเดตข้อมูลผู้ใช้...",
          success: "อัปเดตข้อมูลผู้ใช้สำเร็จ!",
          error: "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้",
        });
      }
    } else {
      const action = isEditing ? updateUser(userToSave) : addUser(userToSave);
      const promise = dispatch(action).unwrap();

      showPromiseToast(promise, {
        pending: "Saving user data...",
        success: isEditing
          ? "User updated successfully!"
          : "User added successfully!",
        error: "An error occurred while saving.",
      });

      try {
        await promise;
      } catch (err: any) {
        setError(typeof err === "string" ? err : "Failed to save user");
      }
    }

    handleCloseModal();
  };

  const handleOpenMetricsModal = (customer: User) => {
    setSelectedCustomer(customer);
    const promise = Promise.all([
      dispatch(fetchMetrics(customer.id)).unwrap(),
      dispatch(fetchKeywords(customer.id)).unwrap(),
      dispatch(fetchRecommendKeywords(customer.id)).unwrap(),
    ]);

    showPromiseToast(promise, {
      pending: "Loading customer data...",
      success: "Data loaded successfully!",
      error: "Could not load data.",
    });

    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    dispatch(clearMetricsState());
  };

  const handleSaveMetrics = async (data: Partial<OverallMetrics>) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      saveMetrics({
        customerId: selectedCustomer.id,
        data: data as OverallMetricsForm,
      })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "Saving Metrics...",
      success: "Metrics saved successfully!",
      error: "Failed to save Metrics.",
    });
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "Adding keyword...",
      success: "Keyword added successfully!",
      error: "Failed to add keyword.",
    });
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = dispatch(deleteKeyword(keywordId)).unwrap();
    showPromiseToast(promise, {
      pending: "Deleting keyword...",
      success: "Keyword deleted.",
      error: "Failed to delete keyword.",
    });
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addRecommendKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "Recommending keyword...",
      success: "Keyword recommended successfully!",
      error: "Failed to recommend keyword.",
    });
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = dispatch(deleteRecommendKeyword(recommendId)).unwrap();
    showPromiseToast(promise, {
      pending: "Deleting...",
      success: "Recommended keyword deleted.",
      error: "An error occurred.",
    });
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h2" component="h1" gutterBottom>
              Customer Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all customer accounts assigned to you.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
          >
            Add Customer
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <UserTable
            users={managedCustomers}
            onEdit={handleOpenModal}
            onDelete={() => {}} // Disabled for SEO Dev
            onRestore={() => {}} // Disabled for SEO Dev
            onOpenMetrics={handleOpenMetricsModal}
            isSeoDevView={true} // Pass a prop to hide delete/restore
          />
        )}

        <UserModal
          open={isModalOpen}
          isEditing={isEditing}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={handleSave}
          setCurrentUser={setCurrentUser}
          seoDevs={[]} // Not needed for this view
          isSeoDevView={true}
        />

        {selectedCustomer && (
          <MetricsModal
            open={isMetricsModalOpen}
            onClose={handleCloseMetricsModal}
            customer={selectedCustomer}
            metricsData={metrics}
            keywordsData={keywords}
            onSaveMetrics={handleSaveMetrics}
            onAddKeyword={handleAddKeyword}
            onDeleteKeyword={handleDeleteKeyword}
            recommendKeywordsData={recommendKeywords}
            onAddRecommendKeyword={handleAddRecommendKeyword}
            onDeleteRecommendKeyword={handleDeleteRecommendKeyword}
          />
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserManagementSeoDev;
