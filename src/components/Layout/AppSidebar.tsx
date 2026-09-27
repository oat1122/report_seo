'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { findActiveHref, type ShellConfig } from './nav-config'
import { getRoleLabel } from '@/lib/role-display'
import type { Role } from '@/types/auth'

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/img/brand/logo-mark.png"
        alt=""
        width={compact ? 34 : 46}
        height={compact ? 33 : 45}
        priority
      />
      <Image
        src="/img/brand/logo-wordmark.png"
        alt="SEO PRIME"
        width={compact ? 108 : 142}
        height={compact ? 14 : 18}
        priority
      />
    </span>
  )
}

export function initialsOf(name: string) {
  const clean = name.trim()
  if (!clean) return '?'
  const parts = clean.split(/\s+/)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2)).toUpperCase()
}

/** รายการเมนู — ใช้ทั้ง sidebar (desktop) และ sheet (มือถือ) */
export function ShellNav({
  config,
  layoutId,
  onNavigate,
}: {
  config: ShellConfig
  layoutId: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = findActiveHref(config.groups, pathname, searchParams.get('tab'))

  return (
    <nav aria-label="เมนูหลัก" className="flex flex-col gap-4">
      {config.groups.map((group, gi) => (
        <div key={group.label ?? gi} className="flex flex-col gap-1">
          {group.label && (
            <span className="text-muted-foreground px-3 pb-1 text-[11px] tracking-[0.12em]">
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const isActive = item.href === active
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-11 items-center gap-3 rounded-[12px] px-3 text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-text-secondary hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-[12px] bg-white/92 shadow-[0_8px_20px_-12px_rgba(108,104,232,0.55)] dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  aria-hidden
                  className={cn('relative size-[18px] shrink-0', isActive && 'text-info-strong')}
                />
                <span className="relative flex-1 truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function UserCard({
  name,
  role,
  dark = false,
}: {
  name: string
  role: string | undefined
  dark?: boolean
}) {
  return (
    <div className="border-glass-border flex items-center gap-2.5 rounded-2xl border bg-white/65 p-3 dark:bg-white/5">
      <span
        aria-hidden
        className={cn(
          'flex size-[38px] shrink-0 items-center justify-center rounded-full border-2 border-white text-sm font-semibold dark:border-white/20',
          dark ? 'bg-primary text-chart-4 dark:bg-zinc-800' : 'bg-info-subtle text-foreground',
        )}
      >
        {name ? initialsOf(name) : ''}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {name ? (
          <>
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="text-text-secondary text-xs">
              {role ? getRoleLabel(role as Role) : 'ผู้ใช้งาน'}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </>
        )}
      </span>
      <button
        type="button"
        aria-label="ออกจากระบบ"
        title="ออกจากระบบ"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-text-secondary hover:bg-danger-subtle hover:text-danger-strong focus-visible:ring-ring/70 flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors outline-none focus-visible:ring-[3px]"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}

export function AppSidebar({
  config,
  userName,
  userRole,
}: {
  config: ShellConfig
  userName: string
  userRole: string | undefined
}) {
  return (
    <aside className="relative z-[1] hidden border-r border-white/85 bg-[var(--sidebar-glass)] md:block dark:border-white/5">
      {/* sticky ภายใน aside: เมนูค้างอยู่เมื่อเลื่อนหน้า (กรอบใช้ overflow-clip จึง sticky ได้) */}
      <div className="sticky top-0 flex max-h-dvh flex-col gap-7 px-[18px] py-7 md:h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5.5rem)]">
        <div className="flex flex-col gap-2 px-1.5">
          <Link href="/" aria-label="หน้าแรก SEO PRIME" className="w-fit">
            <BrandLogo />
          </Link>
          <span className="text-text-secondary pl-0.5 text-[11px] tracking-[0.14em]">
            {config.eyebrow}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
          <ShellNav config={config} layoutId="sidebar-active" />
        </div>
        <UserCard name={userName} role={userRole} dark={config.variant === 'admin'} />
      </div>
    </aside>
  )
}
