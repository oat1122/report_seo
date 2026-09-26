'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface WorkspaceTab {
  label: string
  href: string
  /** path อื่นที่นับว่าอยู่แท็บนี้ด้วย (เช่น เอกสาร อยู่ใต้แท็บการชำระเงิน) */
  also?: string[]
}

/** แท็บ segmented ของ workspace ลูกค้า — active ตาม prefix ของ path */
export function WorkspaceTabs({ tabs }: { tabs: WorkspaceTab[] }) {
  const pathname = usePathname()
  const isActive = (t: WorkspaceTab) =>
    [t.href, ...(t.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`))

  return (
    <nav
      aria-label="ส่วนงานของลูกค้า"
      className="border-glass-border grid grid-cols-2 gap-1 self-stretch rounded-[14px] border bg-white/60 p-1 sm:flex sm:self-start dark:bg-white/5"
    >
      {tabs.map((t) => {
        const active = isActive(t)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-11 items-center justify-center rounded-[10px] px-3.5 text-sm whitespace-nowrap transition-colors sm:h-10',
              active ? 'text-foreground font-medium' : 'text-text-secondary hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="workspace-tab"
                className="absolute inset-0 rounded-[10px] bg-white shadow-[0_4px_12px_-6px_rgba(108,104,232,0.6)] dark:bg-white/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
