'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Globe, Menu } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Role } from '@/types'
import { useMobileDrawer } from '@/hooks/ui/useMobileDrawer'
import { UserMenu } from './UserMenu'
import { MobileMenuContent } from './MobileMenuContent'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from '@/features/notifications/presentation/components/NotificationBell'

export const DashboardHeader = () => {
  const { data: session, status } = useSession()
  const { mobileOpen, handleDrawerToggle, handleDrawerClose } = useMobileDrawer()

  const isLoading = status === 'loading'
  const userName = session?.user?.name || 'Guest'
  const userRole = session?.user?.role

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div className="flex min-h-12 items-center justify-between py-1">
          <div className="flex items-center">
            <Image
              src="/img/LOGO_SEO_PRIME4_0-removebg.png"
              alt="SEO Prime Logo"
              width={70}
              height={24}
              priority
            />
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu userName={userName} isLoading={isLoading} />
          </div>

          {/* Mobile hamburger → Sheet */}
          <Sheet
            open={mobileOpen}
            onOpenChange={(o) => (o ? handleDrawerToggle() : handleDrawerClose())}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="เปิดเมนู"
                className="group md:hidden"
              >
                <AnimatedIcon
                  name="menu"
                  trigger="hover"
                  size={20}
                  fallback={<Menu className="size-5" />}
                />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>เมนู</SheetTitle>
                <SheetDescription className="sr-only">เมนูสำหรับผู้ใช้</SheetDescription>
              </SheetHeader>
              <MobileMenuContent
                userName={userName}
                userRole={userRole}
                isLoading={isLoading}
                onAction={handleDrawerClose}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="border-border flex items-center gap-2 border-t px-2 py-1">
          <Globe className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-xs">
            {isLoading ? (
              <Skeleton className="inline-block h-3 w-32" />
            ) : userRole === Role.CUSTOMER ? (
              'Customer Report Panel'
            ) : (
              `${userRole || 'USER'} Dashboard`
            )}
          </span>
        </div>
      </div>
    </header>
  )
}
