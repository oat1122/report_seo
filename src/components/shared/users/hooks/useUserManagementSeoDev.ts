// src/components/shared/users/hooks/useUserManagementSeoDev.ts
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useUserManagementPage } from "./useUserManagementPage"; // เปลี่ยนไปใช้ Hook ใหม่
import { Role } from "@/types/auth";
import { User } from "@/types/user";

export const useUserManagementSeoDev = () => {
  const { data: session } = useSession();
  const userManagementPage = useUserManagementPage(); // เรียกใช้ Hook ใหม่

  const currentSeoDevId = session?.user?.id;

  // Filter `users` จาก Hook ตัวใหม่
  const managedCustomers = useMemo(() => {
    return userManagementPage.users.filter(
      (user: User) =>
        user.role === Role.CUSTOMER &&
        user.customerProfile?.seoDevId === currentSeoDevId
    );
  }, [userManagementPage.users, currentSeoDevId]);

  return {
    ...userManagementPage, // Return ค่าทั้งหมดจาก Hook ใหม่
    users: managedCustomers, // และทับค่า `users` ด้วย list ที่ผ่านการ filter แล้ว
  };
};
