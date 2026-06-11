'use client'

import { signOut } from 'next-auth/react'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface UserMenuProps {
  userName: string
  isLoading: boolean
}

export const UserMenu = ({ userName, isLoading }: UserMenuProps) => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="group min-w-32 rounded-full">
          <AnimatedIcon
            name="user"
            trigger="hover"
            size={16}
            fallback={<User className="size-4" />}
          />
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="truncate">{userName}</span>
          )}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="size-4" />
          <span>ออกจากระบบ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
