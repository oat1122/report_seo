'use client'

import {
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber, Stagger, StaggerItem, motion } from '@/components/motion'
import type { OverallMetricsForm } from '@/types'
import type { DomainSection } from './DomainSectionNav'

type KpiKey =
  | 'domainRating'
  | 'healthScore'
  | 'organicTraffic'
  | 'organicKeywords'
  | 'backlinks'
  | 'refDomains'

const KPIS: { key: KpiKey; label: string; sub: string }[] = [
  { key: 'domainRating', label: 'Domain Rating', sub: 'ความแข็งแรงของโดเมน' },
  { key: 'healthScore', label: 'Health Score', sub: 'คะแนนสุขภาพเว็บไซต์' },
  { key: 'organicTraffic', label: 'Organic Traffic', sub: 'ทราฟฟิกจากการค้นหา' },
  { key: 'organicKeywords', label: 'Organic Keywords', sub: 'คีย์เวิร์ดที่ติดอันดับ' },
  { key: 'backlinks', label: 'Backlinks', sub: 'ลิงก์ย้อนกลับทั้งหมด' },
  { key: 'refDomains', label: 'Referring Domains', sub: 'โดเมนที่ลิงก์กลับมา' },
]

const formatKpi = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 })

interface KeywordCounts {
  keywords: number
  top: number
  recommend: number
  ai: number
}

interface DomainOverviewSectionProps {
  metrics: OverallMetricsForm | null
  isLoading: boolean
  counts: KeywordCounts
  isSyncing: boolean
  syncFailed: boolean
  onSync: () => void
  onNavigate: (section: DomainSection) => void
}

export function DomainOverviewSection({
  metrics,
  isLoading,
  counts,
  isSyncing,
  syncFailed,
  onSync,
  onNavigate,
}: DomainOverviewSectionProps) {
  const summaryTiles: {
    label: string
    value: number
    section: DomainSection
    Icon: LucideIcon
  }[] = [
    { label: 'Keyword Report', value: counts.keywords, section: 'keywords', Icon: Search },
    { label: 'ติด Top Report', value: counts.top, section: 'keywords', Icon: Star },
    { label: 'Keyword แนะนำ', value: counts.recommend, section: 'recommend', Icon: Lightbulb },
    { label: 'AI Overview', value: counts.ai, section: 'ai', Icon: Sparkles },
  ]

  return (
    <>
      {/* ค่าโดเมน 6 ตัว — ชุดเดียวกับที่ลูกค้าเห็นในรายงาน */}
      <Stagger className="grid grid-cols-2 gap-3.5 @2xl:grid-cols-3">
        {KPIS.map(({ key, label, sub }) => {
          const raw = metrics?.[key]
          const value = raw === null || raw === undefined ? null : Number(raw)
          return (
            <StaggerItem
              key={key}
              className="bg-glass-card border-glass-border shadow-card flex min-w-0 flex-col gap-2.5 rounded-[20px] border px-[18px] py-4 backdrop-blur-[14px]"
            >
              <span className="text-text-secondary truncate text-[13px]">{label}</span>
              {isLoading ? (
                <Skeleton className="h-[26px] w-20 rounded-md" />
              ) : value === null || Number.isNaN(value) ? (
                <span className="text-[26px] leading-none font-semibold">—</span>
              ) : (
                <AnimatedNumber
                  value={value}
                  format={formatKpi}
                  className="text-[26px] leading-none font-semibold tabular-nums"
                />
              )}
              <span className="text-text-secondary text-xs">{sub}</span>
            </StaggerItem>
          )
        })}
      </Stagger>

      {/* ซิงก์ Ahrefs */}
      <div className="border-glass-border from-secondary/20 to-info-subtle flex flex-col gap-4 rounded-[20px] border bg-linear-to-r px-5 py-[18px] @xl:flex-row @xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span
            aria-hidden
            className="bg-primary text-secondary dark:bg-background flex size-[46px] shrink-0 items-center justify-center rounded-[14px]"
          >
            <RefreshCw className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="text-base font-semibold">ดึงข้อมูลอัตโนมัติจาก Ahrefs</h3>
            <p className="text-text-secondary text-[13px]">
              ระบบจะดึงค่าล่าสุด (DR, Health, Traffic, Keywords, Backlinks, Ref Domains)
              มาให้เปรียบเทียบกับค่าเดิมก่อนบันทึก
            </p>
            {syncFailed && !isSyncing && (
              <p role="alert" className="text-danger-strong text-[13px]">
                ดึงข้อมูลจาก Ahrefs ไม่สำเร็จ — ตรวจว่าโดเมนของลูกค้าถูกต้อง แล้วกดซิงก์อีกครั้ง
              </p>
            )}
          </div>
        </div>
        <Button onClick={onSync} disabled={isSyncing} className="@xl:self-center">
          {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {isSyncing ? 'กำลังดึงข้อมูล...' : 'ซิงก์เลย'}
        </Button>
      </div>

      {/* สรุปคีย์เวิร์ด — แตะเพื่อไปหมวดนั้น */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3>สรุปคีย์เวิร์ด</h3>
          </CardTitle>
          <CardDescription>
            ติดตาม {counts.keywords.toLocaleString('en-US')} Keyword · ขึ้น Top Report{' '}
            {counts.top.toLocaleString('en-US')} รายการ · แตะเพื่อไปจัดการแต่ละหมวด
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
            {summaryTiles.map(({ label, value, section, Icon }) => (
              <motion.button
                key={label}
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => onNavigate(section)}
                aria-label={`${label} ${value.toLocaleString('en-US')} รายการ — ไปที่หมวดนี้`}
                className="bg-glass-tile border-glass-border focus-visible:ring-ring/70 flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 text-left outline-none focus-visible:ring-[3px]"
              >
                <span
                  aria-hidden
                  className="bg-info-subtle text-info-strong flex size-[38px] shrink-0 items-center justify-center rounded-xl"
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <AnimatedNumber
                    value={value}
                    className="text-[22px] leading-none font-semibold tabular-nums"
                  />
                  <span className="text-text-secondary truncate text-[13px]">{label}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
