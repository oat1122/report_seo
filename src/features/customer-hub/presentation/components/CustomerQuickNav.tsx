'use client'

import Link from 'next/link'
import { BarChart3, ChevronRight, ClipboardList, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CustomerQuickNavProps {
  userId: string
}

export function CustomerQuickNav({ userId }: CustomerQuickNavProps) {
  const navItems = [
    {
      label: 'รายงาน SEO',
      desc: 'อันดับคีย์เวิร์ด · backlink · traffic',
      href: '/customer/report',
      icon: BarChart3,
      tile: 'bg-info/10 text-info',
    },
    {
      label: 'Work Progress',
      desc: 'ติดตามงานทุกแผน',
      href: `/customer/${userId}/work-progress`,
      icon: ClipboardList,
      tile: 'bg-success/10 text-success',
    },
    {
      label: 'การชำระเงิน',
      desc: 'ดูรอบบิลและสถานะ',
      href: `/customer/${userId}/payments`,
      icon: CreditCard,
      tile: 'bg-warning/10 text-warning',
    },
  ]

  return (
    <Card className="rounded-2xl" size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          ทางลัด
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-3 transition-colors"
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
                  item.tile,
                )}
              >
                <Icon className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-muted-foreground truncate text-xs">{item.desc}</div>
              </div>
              <ChevronRight className="text-muted-foreground/50 size-4 shrink-0" />
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
