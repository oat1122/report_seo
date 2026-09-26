'use client'

import { Bell, Code2, Shield, Users, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber, Stagger, StaggerItem } from '@/components/motion'
import { cn } from '@/lib/utils'

interface HubStatsRowProps {
  userCounts: { ADMIN: number; SEO_DEV: number; CUSTOMER: number } | undefined
  unreadCount: number | undefined
  isLoading: boolean
  /** ลูกค้าที่สร้างในเดือนปัจจุบัน (คำนวณจาก createdAt ใน hub summary) */
  newCustomersThisMonth?: number
  /** ลูกค้าที่มีผู้ดูแล ÷ จำนวน SEO Dev — null เมื่อยังไม่มี SEO Dev */
  avgCustomersPerSeoDev?: number | null
}

interface StatItem {
  key: string
  label: string
  icon: LucideIcon
  tone: string
  value: number | undefined
  note?: string
}

export function HubStatsRow({
  userCounts,
  unreadCount,
  isLoading,
  newCustomersThisMonth,
  avgCustomersPerSeoDev,
}: HubStatsRowProps) {
  const stats: StatItem[] = [
    {
      key: 'customers',
      label: 'Customers',
      icon: Users,
      tone: 'bg-info-subtle text-info-strong',
      value: userCounts?.CUSTOMER,
      note:
        newCustomersThisMonth && newCustomersThisMonth > 0
          ? `+${newCustomersThisMonth.toLocaleString('th-TH')} เดือนนี้`
          : undefined,
    },
    {
      key: 'seo-devs',
      label: 'SEO Devs',
      icon: Code2,
      tone: 'bg-secondary/20 text-success',
      value: userCounts?.SEO_DEV,
      note:
        avgCustomersPerSeoDev != null
          ? `ดูแลเฉลี่ย ${avgCustomersPerSeoDev.toLocaleString('th-TH', { maximumFractionDigits: 1 })} ราย`
          : undefined,
    },
    {
      key: 'admins',
      label: 'Admins',
      icon: Shield,
      tone: 'bg-info-subtle text-info-strong',
      value: userCounts?.ADMIN,
    },
    {
      key: 'unread',
      label: 'แจ้งเตือนยังไม่อ่าน',
      icon: Bell,
      tone: 'bg-danger-subtle text-danger-strong',
      value: unreadCount,
    },
  ]

  return (
    <section aria-label="สถิติผู้ใช้งาน">
      <Stagger className="grid grid-cols-2 gap-2.5 md:gap-4 xl:grid-cols-4">
        {stats.map(({ key, label, icon: Icon, tone, value, note }) => (
          <StaggerItem
            key={key}
            className="border-glass-border bg-glass-card shadow-card flex items-center gap-2.5 rounded-[18px] border p-3 backdrop-blur-[14px] md:gap-3.5 md:rounded-[20px] md:px-5 md:py-[18px]"
          >
            <span
              aria-hidden
              className={cn(
                'flex size-[38px] shrink-0 items-center justify-center rounded-[12px] md:size-[46px] md:rounded-[14px]',
                tone,
              )}
            >
              <Icon className="size-[18px] md:size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-text-secondary truncate text-xs md:text-[13px]">{label}</span>
              <span className="flex flex-wrap items-baseline gap-x-2">
                {isLoading && value === undefined ? (
                  <Skeleton className="my-1 h-6 w-10" />
                ) : (
                  <AnimatedNumber
                    value={value ?? 0}
                    className="text-2xl leading-[1.1] font-semibold tabular-nums md:text-[28px]"
                  />
                )}
                {note && <span className="text-text-secondary text-xs">{note}</span>}
              </span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
