'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Role } from '@/types'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from '@/features/notifications/presentation/components/NotificationBell'

interface MobileMenuContentProps {
  userName: string
  userRole: Role | undefined
  isLoading: boolean
  onAction: () => void
}

export const MobileMenuContent = ({
  userName,
  userRole,
  isLoading,
  onAction,
}: MobileMenuContentProps) => {
  const handleLogout = async () => {
    onAction()
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex flex-col gap-1 px-4">
      <div className="flex items-center gap-2 py-3">
        <div className="bg-muted flex size-9 items-center justify-center rounded-full">
          <User className="text-muted-foreground size-4" />
        </div>
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-muted-foreground text-xs">{userRole ?? 'USER'}</p>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between py-1">
        <span className="text-muted-foreground text-sm">โหมดสี</span>
        <ThemeToggle />
      </div>

      <Separator />

      <div className="flex items-center justify-between py-1">
        <span className="text-muted-foreground text-sm">การแจ้งเตือน</span>
        <NotificationBell />
      </div>

      <Separator />

      <Button
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive group justify-start"
        onClick={handleLogout}
      >
        <AnimatedIcon
          name="log-out"
          trigger="hover"
          size={16}
          color="bg-destructive"
          fallback={<LogOut className="size-4" />}
        />
        ออกจากระบบ
      </Button>
    </div>
  )
}
