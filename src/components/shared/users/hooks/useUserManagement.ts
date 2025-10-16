import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  fetchSeoDevs,
  addUser,
  updateUser,
  deleteUser,
  restoreUser,
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
import {
  OverallMetrics,
  OverallMetricsForm,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";
import { showPromiseToast } from "@/components/shared/toast/lib/toastify";
import axios from "@/lib/axios";

export const useUserManagement = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    seoDevs,
    status,
    error: usersError,
  } = useAppSelector((state) => state.users);
  const { metrics, keywords, recommendKeywords } = useAppSelector(
    (state) => state.metrics
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({});
  const [error, setError] = useState<string | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
      dispatch(fetchSeoDevs());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (usersError) {
      setError(usersError);
    }
  }, [usersError]);

  const handleOpenModal = useCallback(async (user?: User) => {
    setIsEditing(!!user);
    if (user) {
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
      setCurrentUser({ role: Role.CUSTOMER }); // Default role
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const handleSave = async () => {
    setError(null);

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
      const infoToUpdate = { ...currentUser };
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
      const action = isEditing ? updateUser(currentUser) : addUser(currentUser);
      const promise = dispatch(action).unwrap();

      showPromiseToast(promise, {
        pending: "กำลังบันทึกข้อมูล...",
        success: isEditing ? "อัปเดตผู้ใช้สำเร็จ!" : "เพิ่มผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการบันทึก",
      });

      try {
        await promise;
      } catch (err: any) {
        setError(typeof err === "string" ? err : "Failed to save user");
      }
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setConfirmTitle("ยืนยันการลบ");
    setConfirmMessage("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?");
    setConfirmAction(() => () => {
      const promise = dispatch(deleteUser(id)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังลบผู้ใช้...",
        success: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
        error: "เกิดข้อผิดพลาดในการลบ",
      });
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleRestore = (id: string) => {
    setConfirmTitle("ยืนยันการกู้คืน");
    setConfirmMessage("คุณแน่ใจหรือไม่ว่าต้องการกู้คืนผู้ใช้งานนี้?");
    setConfirmAction(() => () => {
      const promise = dispatch(restoreUser(id)).unwrap();
      showPromiseToast(promise, {
        pending: "กำลังกู้คืนผู้ใช้...",
        success: "กู้คืนผู้ใช้สำเร็จ!",
        error: "เกิดข้อผิดพลาดในการกู้คืน",
      });
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  };

  const handleOpenMetricsModal = useCallback(
    (customer: User) => {
      setSelectedCustomer(customer);
      const promise = Promise.all([
        dispatch(fetchMetrics(customer.id)).unwrap(),
        dispatch(fetchKeywords(customer.id)).unwrap(),
        dispatch(fetchRecommendKeywords(customer.id)).unwrap(),
      ]);
      showPromiseToast(promise, {
        pending: "กำลังโหลดข้อมูลลูกค้า...",
        success: "โหลดข้อมูลสำเร็จ!",
        error: "ไม่สามารถโหลดข้อมูลได้",
      });
      setIsMetricsModalOpen(true);
    },
    [dispatch]
  );

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedCustomer(null);
    dispatch(clearMetricsState());
  };

  const createMetricsHandler =
    (
      action: Function,
      messages: { pending: string; success: string; error: string }
    ) =>
    async (data: any) => {
      if (!selectedCustomer) return;
      const promise = dispatch(action(data)).unwrap();
      showPromiseToast(promise, messages);
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
      pending: "กำลังบันทึก Metrics...",
      success: "บันทึก Metrics สำเร็จ!",
      error: "บันทึก Metrics ไม่สำเร็จ",
    });
  };

  const handleAddKeyword = async (keyword: KeywordReportForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังเพิ่มคีย์เวิร์ด...",
      success: "เพิ่มคีย์เวิร์ดสำเร็จ!",
      error: "เพิ่มคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    const promise = dispatch(deleteKeyword(keywordId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังลบคีย์เวิร์ด...",
      success: "ลบคีย์เวิร์ดแล้ว",
      error: "ลบคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleAddRecommendKeyword = async (keyword: KeywordRecommendForm) => {
    if (!selectedCustomer) return;
    const promise = dispatch(
      addRecommendKeyword({ customerId: selectedCustomer.id, data: keyword })
    ).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังแนะนำคีย์เวิร์ด...",
      success: "แนะนำคีย์เวิร์ดสำเร็จ!",
      error: "แนะนำคีย์เวิร์ดไม่สำเร็จ",
    });
  };

  const handleDeleteRecommendKeyword = async (recommendId: string) => {
    const promise = dispatch(deleteRecommendKeyword(recommendId)).unwrap();
    showPromiseToast(promise, {
      pending: "กำลังลบ...",
      success: "ลบคีย์เวิร์ดแนะนำแล้ว",
      error: "เกิดข้อผิดพลาด",
    });
  };

  return {
    users,
    seoDevs,
    status,
    error,
    setError,
    metrics,
    keywords,
    recommendKeywords,
    isModalOpen,
    isEditing,
    currentUser,
    setCurrentUser,
    isMetricsModalOpen,
    selectedCustomer,
    confirmOpen,
    confirmTitle,
    confirmMessage,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    handleRestore,
    handleOpenMetricsModal,
    handleCloseMetricsModal,
    handleSaveMetrics,
    handleAddKeyword,
    handleDeleteKeyword,
    handleAddRecommendKeyword,
    handleDeleteRecommendKeyword,
    setConfirmOpen,
    confirmAction,
  };
};
