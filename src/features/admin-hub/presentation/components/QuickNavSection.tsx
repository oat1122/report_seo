'use client'

import Link from 'next/link'
import {
  Users,
  Settings,
  LayoutTemplate,
  FileBarChart,
  Building2,
  FileText,
  FileStack,
  FilePlus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'จัดการผู้ใช้งาน',
    href: '/admin/users',
    icon: Users,
    disabled: false,
  },
  {
    label: 'ตั้งค่าบริษัท',
    href: '/admin/settings/company',
    icon: Building2,
    disabled: false,
  },
  {
    label: 'ตั้งค่า Work Progress',
    href: '/admin/settings/work-progress',
    icon: Settings,
    disabled: false,
  },
  {
    label: 'Templates',
    href: '/admin/settings/work-progress/templates',
    icon: LayoutTemplate,
    disabled: false,
  },
  {
    label: 'Template เอกสาร',
    href: '/admin/document-templates',
    icon: FileStack,
    disabled: false,
  },
  {
    label: 'จัดการเอกสาร',
    href: '/admin/documents',
    icon: FileText,
    disabled: false,
  },
  {
    label: 'สร้างเอกสารใหม่',
    href: '/admin/create-document',
    icon: FilePlus,
    disabled: false,
  },
  {
    label: 'รายงาน',
    href: '/admin/reports',
    icon: FileBarChart,
    disabled: true,
  },
]

export function QuickNavSection() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">ลัดไป</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return item.disabled ? (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-muted-foreground justify-start"
              disabled
            >
              <Icon className="mr-2 size-4" />
              {item.label}
              <span className="ml-auto text-xs">เร็วๆ นี้</span>
            </Button>
          ) : (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn('justify-start')}
              asChild
            >
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
