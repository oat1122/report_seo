// src/components/shared/users/hooks/useUserManagementSeoDev.ts
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useUserManagement } from "./useUserManagement";
import { Role } from "@/types/auth";

export const useUserManagementSeoDev = () => {
  const { data: session } = useSession();
  const userManagement = useUserManagement();

  const currentSeoDevId = session?.user?.id;

  const managedCustomers = useMemo(() => {
    return userManagement.users.filter(
      (user) =>
        user.role === Role.CUSTOMER &&
        (user as any).customerProfile?.seoDevId === currentSeoDevId
    );
  }, [userManagement.users, currentSeoDevId]);

  return {
    ...userManagement,
    users: managedCustomers, // Override `users` with filtered customers
  };
};
