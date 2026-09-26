'use client'

import Link from 'next/link'
import { BarChart3, ChevronRight, ClipboardList, CreditCard, PenLine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from '@/components/motion'
import { cn } from '@/lib/utils'

interface CustomerQuickNavProps {
  userId: string
}

export function CustomerQuickNav({ userId }: CustomerQuickNavProps) {
  const navItems = [
    {
      label: 'รายงาน SEO',
      desc: 'อันดับ Keyword · Backlinks · Traffic',
      href: '/customer/report',
      icon: BarChart3,
      tile: 'bg-info-subtle text-info-strong',
    },
    {
      label: 'Work Progress',
      desc: 'ติดตามงานทุกแผน',
      href: `/customer/${userId}/work-progress`,
      icon: ClipboardList,
      tile: 'bg-success-subtle text-success',
    },
    {
      label: 'แผนบทความ',
      desc: 'ตรวจ · ให้ความเห็น · โหลดไฟล์',
      href: `/customer/${userId}/blog-plan`,
      icon: PenLine,
      tile: 'bg-secondary text-secondary-foreground',
    },
    {
      label: 'การชำระเงิน',
      desc: 'ดูรอบบิลและสถานะ',
      href: `/customer/${userId}/payments`,
      icon: CreditCard,
      tile: 'bg-warning-subtle text-warning-text',
    },
  ]

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <h2 className="text-text-secondary text-[11px] font-medium tracking-[0.14em] uppercase">
          ทางลัด
        </h2>
        <nav aria-label="ทางลัด" className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.href} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link
                  href={item.href}
                  className="bg-glass-tile border-glass-border hover:bg-background/80 focus-visible:ring-ring/60 flex min-h-14 items-center gap-3 rounded-2xl border p-3 transition-colors outline-none focus-visible:ring-3"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      item.tile,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="text-text-secondary block truncate text-xs">{item.desc}</span>
                  </span>
                  <ChevronRight aria-hidden className="text-text-secondary size-4 shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
