'use client'

import { Shield, Code2, Users, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface HubStatsRowProps {
  userCounts: { ADMIN: number; SEO_DEV: number; CUSTOMER: number } | undefined
  unreadCount: number | undefined
  isLoading: boolean
}

const stats = [
  { key: 'ADMIN' as const, label: 'Admins', icon: Shield, color: 'text-info bg-info/10' },
  {
    key: 'SEO_DEV' as const,
    label: 'SEO Devs',
    icon: Code2,
    color: 'text-secondary-foreground bg-secondary/10',
  },
  {
    key: 'CUSTOMER' as const,
    label: 'Customers',
    icon: Users,
    color: 'text-primary bg-primary/10',
  },
] as const

export function HubStatsRow({ userCounts, unreadCount, isLoading }: HubStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} size="sm">
          <CardContent className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
              <Icon className="size-5" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="mb-1 h-6 w-8" />
              ) : (
                <p className="text-2xl font-bold">{userCounts?.[key] ?? 0}</p>
              )}
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card size="sm">
        <CardContent className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
            <Bell className="size-5" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="mb-1 h-6 w-8" />
            ) : (
              <p className="text-2xl font-bold">{unreadCount ?? 0}</p>
            )}
            <p className="text-muted-foreground text-xs">แจ้งเตือนยังไม่อ่าน</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
