'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FadeSwap } from '@/components/motion'
import { NotificationSocketInit } from '@/features/notifications/presentation/components/NotificationSocketInit'
import type { Role } from '@/types/auth'
import { DashboardHeader } from './DashboardHeader'
import { AppSidebar } from './AppSidebar'
import { getShellConfig, roleFromPath } from './nav-config'

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * App shell (UI Kit Foundations 05/07): เต็มจอ: sidebar 260 + main · มือถือไม่มี rim/sidebar ใช้แถบบน + sheet แทน
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const role = (session?.user?.role as Role | undefined) ?? roleFromPath(pathname)
  const config = getShellConfig(role, session?.user?.id)
  // ว่าง = กำลังโหลด → UserCard แสดง skeleton
  const userName = status === 'loading' ? '' : session?.user?.name || 'ผู้ใช้งาน'

  return (
    <div className="relative grid min-h-dvh md:grid-cols-[260px_minmax(0,1fr)] md:bg-[image:var(--shell-surface)]">
      <NotificationSocketInit />
      {/* ponytail: เอา rim + blob blur-[90px] ออก — blob ใต้ backdrop-blur หลายชั้นทำให้ scroll แลค */}
      <Suspense fallback={<aside className="hidden md:block" />}>
        <AppSidebar config={config} userName={userName} userRole={role} />
      </Suspense>

      <div className="relative z-[1] flex min-w-0 flex-col gap-4 px-4 pb-8 md:gap-5 md:px-7 md:pt-6 md:pb-7">
        <DashboardHeader config={config} userName={userName} userRole={role} />
        <main className="min-w-0 flex-1">
          <FadeSwap key={pathname}>{children}</FadeSwap>
        </main>
      </div>
    </div>
  )
}
