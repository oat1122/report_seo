'use client'

import { Globe, HeartPulse, KeyRound, TrendingUp } from 'lucide-react'
import { AnimatedNumber, Stagger, StaggerItem } from '@/components/motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CustomerHubSummary } from '../../domain/CustomerHubSummary'

interface CustomerStatsRowProps {
  metrics: CustomerHubSummary['metrics'] | undefined
  isLoading: boolean
}

type MetricKey = keyof NonNullable<CustomerHubSummary['metrics']>

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(Math.round(value))
}

interface StatConfig {
  key: MetricKey
  label: string
  hint: string
  icon: typeof Globe
  format?: (value: number) => string
  suffix?: string
}

const stats: StatConfig[] = [
  { key: 'domainRating', label: 'Domain Rating', hint: 'เต็ม 100', icon: Globe },
  { key: 'healthScore', label: 'Health Score', hint: 'เต็ม 100', icon: HeartPulse, suffix: '/100' },
  {
    key: 'organicTraffic',
    label: 'Organic Traffic',
    hint: 'คน / เดือน',
    icon: TrendingUp,
    format: compact,
  },
  {
    key: 'organicKeywords',
    label: 'Organic Keywords',
    hint: 'คำที่ติดอันดับ',
    icon: KeyRound,
    format: (v) => Math.round(v).toLocaleString('en-US'),
  },
]

/** KPI 4 ใบของ hub — glass card + ตัวเลขนับขึ้น */
export function CustomerStatsRow({ metrics, isLoading }: CustomerStatsRowProps) {
  return (
    <section aria-labelledby="hub-stats-title" className="flex flex-col gap-3">
      <h2
        id="hub-stats-title"
        className="text-text-secondary text-[11px] font-medium tracking-[0.14em] uppercase"
      >
        ภาพรวมผลลัพธ์ SEO
      </h2>
      <Stagger className="grid grid-cols-2 gap-3 md:gap-[18px] xl:grid-cols-4">
        {stats.map(({ key, label, hint, icon: Icon, format, suffix }) => (
          <StaggerItem key={key}>
            <Card className="h-full py-3.5 md:py-[18px]">
              <CardContent className="flex h-full flex-col gap-3 px-3.5 md:px-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-px">
                    <p className="text-[13px] font-medium md:text-sm">{label}</p>
                    <p className="text-text-secondary text-[11px] md:text-xs">{hint}</p>
                  </div>
                  <span
                    aria-hidden
                    className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-xl md:size-10"
                  >
                    <Icon className="size-[18px] md:size-5" />
                  </span>
                </div>
                <div className="mt-auto">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : metrics ? (
                    <span className="flex items-baseline gap-1">
                      <AnimatedNumber
                        value={metrics[key]}
                        format={format}
                        className="text-[28px] leading-none font-semibold tabular-nums md:text-[32px]"
                      />
                      {suffix && <span className="text-text-secondary text-sm">{suffix}</span>}
                    </span>
                  ) : (
                    <span className="text-text-secondary text-[28px] leading-none font-semibold">
                      —
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
      {!isLoading && !metrics && (
        <p className="text-text-secondary text-[13px]">
          ยังไม่มีข้อมูล Domain — ตัวเลขจะแสดงหลังทีมดึงข้อมูลจาก Ahrefs รอบแรก
        </p>
      )}
    </section>
  )
}
