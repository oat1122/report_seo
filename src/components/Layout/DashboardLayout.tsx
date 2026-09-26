'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
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
 * App shell (UI Kit Foundations 05/07): พื้น gradient → กรอบ rim 8px (ม่วง = ลูกค้า, ดำ-ม่วง = staff)
 * → sidebar 260 + main · มือถือไม่มี rim/sidebar ใช้แถบบน + sheet แทน
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const role = (session?.user?.role as Role | undefined) ?? roleFromPath(pathname)
  const config = getShellConfig(role, session?.user?.id)
  // ว่าง = กำลังโหลด → UserCard แสดง skeleton
  const userName = status === 'loading' ? '' : session?.user?.name || 'ผู้ใช้งาน'

  return (
    <div className="min-h-dvh md:p-6 lg:p-9">
      <NotificationSocketInit />
      <div
        className={cn(
          'md:rounded-[30px] md:p-2',
          config.variant === 'admin'
            ? 'md:bg-[image:var(--rim-admin)] md:shadow-[0_50px_90px_-40px_rgba(47,47,47,0.45)]'
            : 'md:bg-[image:var(--rim-customer)] md:shadow-[0_50px_90px_-40px_rgba(108,104,232,0.55)]',
        )}
      >
        <div className="relative grid min-h-dvh overflow-clip md:min-h-[calc(100dvh-4rem)] md:grid-cols-[260px_minmax(0,1fr)] md:rounded-[23px] md:bg-[image:var(--shell-surface)] lg:min-h-[calc(100dvh-5.5rem)]">
          <div
            aria-hidden
            className="bg-accent pointer-events-none absolute -top-40 -right-30 hidden size-[460px] rounded-full opacity-45 blur-[90px] md:block dark:opacity-15"
          />
          <div
            aria-hidden
            className="bg-secondary pointer-events-none absolute -bottom-50 left-35 hidden size-[420px] rounded-full opacity-20 blur-[90px] md:block dark:opacity-10"
          />

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
      </div>
    </div>
  )
}
