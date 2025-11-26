// src/components/shared/users/hooks/useUserConfirmDialog.ts
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  showConfirmation,
  hideConfirmation,
} from "@/store/features/users/usersSlice";
import { useDeleteUser, useRestoreUser } from "@/hooks/api/useUsersApi";
import { showPromiseToast } from "../../toast/lib/toastify";

export const useUserConfirmDialog = () => {
  const dispatch = useAppDispatch();
  const { confirmState } = useAppSelector((state) => state.users);

  //  React Query Mutations
  const deleteUserMutation = useDeleteUser();
  const restoreUserMutation = useRestoreUser();

  const handleDeleteUser = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการลบ",
        message: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?",
        actionType: "delete",
        targetId: id,
      })
    );
  };

  const handleRestoreUser = (id: string) => {
    dispatch(
      showConfirmation({
        title: "ยืนยันการกู้คืน",
        message: "คุณแน่ใจหรือไม่ว่าต้องการกู้คืนผู้ใช้งานนี้?",
        actionType: "restore",
        targetId: id,
      })
    );
  };

  const handleConfirmAction = () => {
    if (!confirmState.actionType || !confirmState.targetId) return;

    let promise;
    if (confirmState.actionType === "delete") {
      // Use React Query mutation
      promise = deleteUserMutation.mutateAsync(confirmState.targetId);
      showPromiseToast(promise, {
        pending: "กำลังลบผู้ใช้...",
        success: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
        error: "เกิดข้อผิดพลาดในการลบ",
      });
    } else if (confirmState.actionType === "restore") {
      // Use React Query mutation
      promise = restoreUserMutation.mutateAsync(confirmState.targetId);
      showPromiseToast(promise, {
        pending: "กำลังกู้คืนผู้ใช้...",
        success: "กู้คืนผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการกู้คืน",
      });
    }
    dispatch(hideConfirmation());
  };

  const handleCloseConfirm = () => dispatch(hideConfirmation());

  return {
    confirmState,
    handleDeleteUser,
    handleRestoreUser,
    handleConfirmAction,
    handleCloseConfirm,
  };
};
