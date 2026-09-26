'use client'

import { useMemo } from 'react'
import { ArrowDown, ArrowUp, Minus, Rocket } from 'lucide-react'
import { AnimatedNumber } from '@/components/motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { computeRoiHeadline } from '../lib/historyCalculations'

const formatPct = (n: number): string => `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(1)}%`

/** สรุป ROI: traffic % เทียบช่วงก่อน + keyword ขยับขึ้น/ลง (ใช้ใน hub ผ่าน ReportRoiHighlight) */
export const HeroStatusCard = () => {
  const { metricsHistory, keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const roi = useMemo(
    () => computeRoiHeadline(metricsHistory, keywordHistory, currentKeywords, period),
    [metricsHistory, keywordHistory, currentKeywords, period],
  )

  // Empty state — ไม่มี baseline ให้เทียบ
  if (!roi.hasData) {
    return (
      <Card role="status" aria-live="polite">
        <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-12 items-center justify-center rounded-2xl"
          >
            <Rocket className="size-6" />
          </span>
          <p className="text-text-secondary max-w-md text-sm">
            ยังไม่มีข้อมูลเปรียบเทียบ — สรุปผลจะแสดงเมื่อมีการบันทึกข้อมูลอย่างน้อย 2 รอบ
          </p>
        </CardContent>
      </Card>
    )
  }

  const trafficUp = roi.trafficDirection === 'up'
  const trafficNeutral = roi.trafficDirection === 'neutral'
  const TrafficIcon = trafficUp ? ArrowUp : trafficNeutral ? Minus : ArrowDown
  const trafficTone = trafficUp
    ? 'bg-success-subtle text-success'
    : trafficNeutral
      ? 'bg-muted text-text-secondary'
      : 'bg-danger-subtle text-danger-strong'

  // a11y label เต็มประโยค
  const ariaSummary = (() => {
    const parts: string[] = []
    if (roi.trafficPctChange !== null) {
      const verb = trafficUp ? 'เพิ่มขึ้น' : trafficNeutral ? 'คงที่' : 'ลดลง'
      parts.push(
        `Organic traffic ${verb} ${Math.abs(roi.trafficPctChange).toFixed(1)} เปอร์เซ็นต์ ในช่วง ${period} วัน`,
      )
    }
    if (roi.improvedKeywordCount > 0) parts.push(`${roi.improvedKeywordCount} keyword ขยับขึ้น`)
    if (roi.declinedKeywordCount > 0) parts.push(`${roi.declinedKeywordCount} keyword หล่นลง`)
    return parts.join(', ')
  })()

  return (
    <Card role="status" aria-live="polite" aria-label={ariaSummary}>
      <CardContent className="grid gap-5 md:grid-cols-2 md:gap-6">
        {/* Left: Traffic growth */}
        <div className="flex flex-col gap-2.5">
          <p className="text-text-secondary text-[13px]">Organic Traffic เทียบ {period} วันก่อน</p>
          {roi.trafficPctChange !== null ? (
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn('flex size-11 items-center justify-center rounded-2xl', trafficTone)}
              >
                <TrafficIcon className="size-6" strokeWidth={2.5} />
              </span>
              <AnimatedNumber
                value={roi.trafficPctChange}
                format={formatPct}
                className="text-[32px] leading-none font-semibold tabular-nums md:text-[40px]"
              />
            </div>
          ) : (
            <span className="text-text-secondary text-[32px] leading-none font-semibold">—</span>
          )}
        </div>

        {/* Right: Keyword movement summary */}
        <div className="border-border flex flex-col gap-2 md:border-l md:pl-6">
          <p className="text-text-secondary text-[13px]">Keyword ที่อันดับเปลี่ยน</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {roi.improvedKeywordCount > 0 && (
              <MoveStat tone="good" count={roi.improvedKeywordCount} label="ขยับขึ้น" />
            )}
            {roi.declinedKeywordCount > 0 && (
              <MoveStat tone="bad" count={roi.declinedKeywordCount} label="หล่นลง" />
            )}
            {roi.improvedKeywordCount === 0 && roi.declinedKeywordCount === 0 && (
              <span className="text-text-secondary text-sm">ไม่มีการเปลี่ยนแปลงในช่วงนี้</span>
            )}
          </div>
          <span className="text-text-secondary text-xs">
            จาก {roi.totalRankedKeywords} Keyword ที่ติดอันดับ
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

const MoveStat = ({
  tone,
  count,
  label,
}: {
  tone: 'good' | 'bad'
  count: number
  label: string
}) => {
  const Icon = tone === 'good' ? ArrowUp : ArrowDown
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          'flex size-7 items-center justify-center rounded-lg',
          tone === 'good'
            ? 'bg-success-subtle text-success'
            : 'bg-danger-subtle text-danger-strong',
        )}
      >
        <Icon className="size-4" strokeWidth={2.5} />
      </span>
      <AnimatedNumber
        value={count}
        className="text-[22px] leading-none font-semibold tabular-nums"
      />
      <span className="text-sm">{label}</span>
    </span>
  )
}
