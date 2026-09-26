'use client'

import { useSession } from 'next-auth/react'
import { Loader2, LockKeyhole, ShieldAlert } from 'lucide-react'
import { Role } from '@/types/auth'
import { ReactNode } from 'react'

interface RoleGuardProps {
  allowedRoles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Client-side role-based access control component
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8" role="status">
        <Loader2 aria-hidden className="text-info-strong size-7 animate-spin" />
        <span className="sr-only">กำลังตรวจสอบสิทธิ์</span>
      </div>
    )
  }

  if (!session?.user) {
    return (
      fallback || (
        <div className="text-text-secondary flex flex-col items-center gap-2 p-8 text-center text-sm">
          <LockKeyhole aria-hidden className="size-6" />
          <p>กรุณาเข้าสู่ระบบเพื่อดูเนื้อหานี้</p>
        </div>
      )
    )
  }

  if (!allowedRoles.includes(session.user.role)) {
    return (
      fallback || (
        <div className="p-8">
          <div
            role="alert"
            className="bg-danger-subtle mx-auto flex max-w-md flex-col items-center gap-2 rounded-[20px] p-6 text-center"
          >
            <ShieldAlert aria-hidden className="text-danger-strong size-7" />
            <h3 className="text-danger-strong text-lg font-semibold">ไม่มีสิทธิ์เข้าถึง</h3>
            <p className="text-danger-strong text-sm">
              คุณไม่มีสิทธิ์ในการเข้าถึงเนื้อหาในส่วนนี้ หากคิดว่าผิดพลาดกรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

/**
 * Component for admin-only content
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Component for staff-only content (Admin + SEO Dev)
 */
export function StaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.SEO_DEV]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Component for customer-only content
 */
export function CustomerOnly({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGuard allowedRoles={[Role.CUSTOMER]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
