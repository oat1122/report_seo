import React from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutGrid, type LucideIcon } from 'lucide-react'
import { Role } from '@/types/auth'
import { getRoleLabel } from '@/lib/role-display'
import { cn } from '@/lib/utils'

type CardColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'

interface DashboardCard {
  title: string
  description: string
  href: string
  color: CardColor
  disabled?: boolean
  /** ไอคอนในกล่องสีหัวการ์ด (ไม่ส่ง = ไอคอนกริด) */
  icon?: LucideIcon
}

interface DashboardPageLayoutProps {
  user: {
    name?: string | null
    email?: string | null
    role?: Role
  }
  title: string
  cards: DashboardCard[]
}

// สีกล่องไอคอนตาม color เดิมของการ์ด — token เท่านั้น
const iconTone: Record<CardColor, string> = {
  primary: 'bg-muted text-foreground',
  secondary: 'bg-secondary/20 text-success',
  info: 'bg-info-subtle text-info-strong',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning-text',
  error: 'bg-danger-subtle text-danger-strong',
}

const cardBase =
  'border-glass-border bg-glass-card shadow-card flex h-full flex-col gap-3.5 rounded-[20px] border p-5 backdrop-blur-[14px]'

export const DashboardPageLayout: React.FC<DashboardPageLayoutProps> = ({ user, title, cards }) => {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">{title}</h1>
        <p className="text-text-secondary text-[13px] md:text-sm">
          ยินดีต้อนรับ, <span className="text-foreground font-medium">{user.name}</span>
          {user.role && ` · ${getRoleLabel(user.role)}`}
          {user.email && ` · ${user.email}`}
        </p>
      </header>

      <nav aria-label="เมนูลัด">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon ?? LayoutGrid
            const content = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-[46px] shrink-0 items-center justify-center rounded-[14px]',
                    card.disabled ? 'bg-muted text-muted-foreground' : iconTone[card.color],
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <h2 className="text-[17px] font-semibold">{card.title}</h2>
                  <p className="text-text-secondary text-[13px] leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <span
                  className={cn(
                    'flex items-center gap-1 text-[13px] font-medium',
                    card.disabled ? 'text-text-secondary' : 'group-hover:text-info-strong',
                  )}
                >
                  {card.disabled ? (
                    'เร็ว ๆ นี้'
                  ) : (
                    <>
                      เปิด
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </span>
              </>
            )

            return (
              <li key={card.href}>
                {card.disabled ? (
                  <div aria-disabled className={cn(cardBase, 'cursor-not-allowed opacity-60')}>
                    {content}
                  </div>
                ) : (
                  <Link
                    href={card.href}
                    className={cn(
                      cardBase,
                      'group focus-visible:ring-ring/70 transition-[transform,box-shadow] duration-200 outline-none focus-visible:ring-[3px] motion-safe:hover:-translate-y-0.5',
                    )}
                  >
                    {content}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
