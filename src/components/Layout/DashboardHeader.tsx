'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useMobileDrawer } from '@/hooks/ui/useMobileDrawer'
import { NotificationBell } from '@/features/notifications/presentation/components/NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { BrandLogo, ShellNav, UserCard } from './AppSidebar'
import type { ShellConfig } from './nav-config'

export const GLASS_ICON_BTN =
  'size-11 rounded-[14px] border border-glass-border bg-white/60 backdrop-blur-md hover:bg-white/85 dark:bg-white/5 dark:hover:bg-white/10'

interface DashboardHeaderProps {
  config: ShellConfig
  userName: string
  userRole: string | undefined
}

/** แถบบน: desktop = ปุ่มชิดขวา · มือถือ = โลโก้ + กระดิ่ง + เมนู (sheet ขวา) */
export const DashboardHeader = ({ config, userName, userRole }: DashboardHeaderProps) => {
  const { mobileOpen, handleDrawerToggle, handleDrawerClose } = useMobileDrawer()

  return (
    <header className="flex h-14 items-center justify-between gap-2.5 md:h-11 md:justify-end">
      <Link href="/" aria-label="หน้าแรก SEO PRIME" className="md:hidden">
        <BrandLogo compact />
      </Link>

      <div className="flex items-center gap-2 md:gap-2.5">
        <ThemeToggle className={`hidden md:inline-flex ${GLASS_ICON_BTN}`} />
        <NotificationBell />

        <Sheet
          open={mobileOpen}
          onOpenChange={(o) => (o ? handleDrawerToggle() : handleDrawerClose())}
        >
          <SheetTrigger asChild>
            <Button size="icon" aria-label="เปิดเมนู" className="rounded-[14px] md:hidden">
              <Menu className="size-[18px]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[330px] max-w-[88vw] flex-col gap-5 p-4">
            <SheetHeader className="border-0 p-0">
              <SheetTitle className="text-lg">เมนู</SheetTitle>
              <SheetDescription className="sr-only">เมนูนำทางและบัญชีผู้ใช้</SheetDescription>
            </SheetHeader>
            <UserCard name={userName} role={userRole} dark={config.variant === 'admin'} />
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
              <Suspense fallback={null}>
                <ShellNav config={config} layoutId="sheet-active" onNavigate={handleDrawerClose} />
              </Suspense>
            </div>
            <div className="border-border flex min-h-11 items-center justify-between border-t pt-3 text-sm">
              <span>โหมดสี</span>
              <ThemeToggle className={GLASS_ICON_BTN} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
