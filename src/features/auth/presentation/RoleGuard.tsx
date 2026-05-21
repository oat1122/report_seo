"use client";

import { useSession } from "next-auth/react";
import { Role } from "@/types/auth";
import { ReactNode } from "react";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side role-based access control component
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      fallback || (
        <div className="text-center p-8">
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อดูเนื้อหานี้</p>
        </div>
      )
    );
  }

  if (!allowedRoles.includes(session.user.role)) {
    return (
      fallback || (
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ไม่มีสิทธิ์เข้าถึง
            </h3>
            <p className="text-red-600">
              คุณไม่มีสิทธิ์ในการเข้าถึงเนื้อหาในส่วนนี้
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Component for admin-only content
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component for staff-only content (Admin + SEO Dev)
 */
export function StaffOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.SEO_DEV]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Component for customer-only content
 */
export function CustomerOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[Role.CUSTOMER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
