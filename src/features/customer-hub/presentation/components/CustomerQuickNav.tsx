'use client'

import Link from 'next/link'
import { BarChart3, ClipboardList, CreditCard } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CustomerQuickNavProps {
  userId: string
}

export function CustomerQuickNav({ userId }: CustomerQuickNavProps) {
  const navItems = [
    {
      label: 'รายงาน SEO',
      href: '/customer/report',
      icon: BarChart3,
    },
    {
      label: 'Work Progress',
      href: `/customer/${userId}/work-progress`,
      icon: ClipboardList,
    },
    {
      label: 'การชำระเงิน',
      href: `/customer/${userId}/payments`,
      icon: CreditCard,
    },
  ]

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">ลัดไป</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button key={item.href} variant="ghost" size="sm" className="justify-start" asChild>
              <Link href={item.href}>
                <Icon className="mr-2 size-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
