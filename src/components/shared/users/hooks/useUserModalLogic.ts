// src/components/shared/users/hooks/useUserModalLogic.ts
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  openUserModal,
  closeUserModal,
  setCurrentUser,
} from "@/store/features/users/usersSlice";
import {
  useAddUser,
  useUpdateUser,
  useUpdatePassword,
} from "@/hooks/api/useUsersApi";
import { User } from "@/types/user";
import { showPromiseToast } from "../../toast/lib/toastify";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { Role } from "@/types/auth";

export const useUserModalLogic = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen, isEditing, currentUser } = useAppSelector(
    (state) => state.users
  );

  // 🆕 React Query Mutations
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();

  const handleOpenUserModal = async (user?: User) => {
    if (user && user.role === Role.CUSTOMER) {
      try {
        const response = await axios.get(`/users/${user.id}`);
        const apiUserData = response.data;
        const flattenedData = {
          ...apiUserData,
          companyName: apiUserData.customerProfile?.name || "",
          domain: apiUserData.customerProfile?.domain || "",
          seoDevId: apiUserData.customerProfile?.seoDevId || null,
        };
        dispatch(openUserModal(flattenedData));
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
        dispatch(openUserModal(user));
      }
    } else {
      dispatch(openUserModal(user));
    }
  };

  const handleCloseUserModal = () => dispatch(closeUserModal());

  const handleSaveUser = async (sessionUser: { id: string; role: Role }) => {
    if (!currentUser) return;
    const infoToUpdate = { ...currentUser };
    delete infoToUpdate.newPassword;
    delete infoToUpdate.confirmPassword;
    delete infoToUpdate.currentPassword;

    if (
      sessionUser?.role === Role.SEO_DEV &&
      !isEditing &&
      infoToUpdate.role === Role.CUSTOMER
    ) {
      infoToUpdate.seoDevId = sessionUser.id;
    }

    // 🆕 Use React Query mutations
    const promise = isEditing
      ? updateUserMutation.mutateAsync({
          id: infoToUpdate.id!,
          user: infoToUpdate,
        })
      : addUserMutation.mutateAsync(infoToUpdate);

    showPromiseToast(promise, {
      pending: "กำลังบันทึกข้อมูล...",
      success: isEditing ? "อัปเดตผู้ใช้สำเร็จ!" : "เพิ่มผู้ใช้สำเร็จ!",
      error: "เกิดข้อผิดพลาดในการบันทึก",
    });

    try {
      await promise;
      dispatch(closeUserModal());
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handlePasswordUpdate = () => {
    if (!currentUser || !currentUser.id || !currentUser.newPassword) return;

    if (currentUser.newPassword !== currentUser.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // 🆕 Use React Query mutation
    const promise = updatePasswordMutation.mutateAsync({
      id: currentUser.id,
      currentPassword: currentUser.currentPassword,
      newPassword: currentUser.newPassword,
    });

    showPromiseToast(promise, {
      pending: "กำลังอัปเดตรหัสผ่าน...",
      success: "อัปเดตรหัสผ่านสำเร็จ!",
      error: "ไม่สามารถอัปเดตรหัสผ่านได้",
    });

    promise.then(() => dispatch(closeUserModal())).catch(() => {});
  };

  const handleFormChange = (name: string, value: unknown) => {
    dispatch(setCurrentUser({ [name]: value }));
  };

  return {
    isModalOpen,
    isEditing,
    currentUser,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handlePasswordUpdate,
    handleFormChange,
  };
};
