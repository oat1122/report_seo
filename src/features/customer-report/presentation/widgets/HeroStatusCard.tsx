'use client'

import { useMemo } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportIcon } from '../components/ReportIcon'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { computeRoiHeadline } from '../lib/historyCalculations'

const formatPct = (n: number): string => {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${abs.toFixed(1)}%`
}

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
      <div
        role="status"
        aria-live="polite"
        className="border-border from-info/5 to-success/5 rounded-2xl border border-dashed bg-gradient-to-br p-6 text-center md:p-8"
      >
        <ReportIcon name="rocket" trigger="loop" color="bg-info" size={32} className="mb-2" />
        <p className="text-muted-foreground text-sm font-medium">
          ยังไม่มีข้อมูลเปรียบเทียบ — จะแสดงสรุป ROI เมื่อมี history อย่างน้อย 2 รอบ
        </p>
      </div>
    )
  }

  const trafficUp = roi.trafficDirection === 'up'
  const trafficNeutral = roi.trafficDirection === 'neutral'
  const TrafficIcon = trafficUp ? ArrowUp : trafficNeutral ? Minus : ArrowDown
  const trafficTone = trafficUp
    ? 'text-success'
    : trafficNeutral
      ? 'text-muted-foreground'
      : 'text-destructive'

  // a11y label เต็มประโยค
  const ariaSummary = (() => {
    const parts: string[] = []
    if (roi.trafficPctChange !== null) {
      const verb = trafficUp ? 'เพิ่มขึ้น' : trafficNeutral ? 'คงที่' : 'ลดลง'
      parts.push(
        `Organic traffic ${verb} ${Math.abs(roi.trafficPctChange).toFixed(1)} เปอร์เซ็นต์ ในช่วง ${period} วัน`,
      )
    }
    if (roi.improvedKeywordCount > 0) {
      parts.push(`${roi.improvedKeywordCount} keyword ขยับขึ้น`)
    }
    if (roi.declinedKeywordCount > 0) {
      parts.push(`${roi.declinedKeywordCount} keyword หล่นลง`)
    }
    return parts.join(', ')
  })()

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaSummary}
      className="border-border from-info/5 to-success/5 rounded-2xl border bg-gradient-to-br p-6 md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Traffic growth */}
        <div>
          <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-sm font-medium">
            Organic Traffic vs {period} วันก่อน
            {trafficUp && <ReportIcon name="rocket" trigger="loop" color="bg-success" size={16} />}
          </p>
          <div className={cn('flex items-baseline gap-2', trafficTone)}>
            {roi.trafficPctChange !== null ? (
              <>
                <TrafficIcon className="size-8 shrink-0 md:size-10" aria-hidden="true" />
                <span className="text-4xl font-extrabold tabular-nums md:text-5xl">
                  {formatPct(roi.trafficPctChange)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-4xl font-extrabold md:text-5xl">—</span>
            )}
          </div>
        </div>

        {/* Right: Keyword movement summary */}
        <div className="md:border-border md:border-l md:pl-6">
          <p className="text-muted-foreground mb-2 text-sm font-medium">Keyword movement</p>
          <div className="flex flex-col gap-1.5">
            {roi.improvedKeywordCount > 0 && (
              <div className="text-success flex items-center gap-2">
                <ArrowUp className="size-5" aria-hidden="true" />
                <span className="text-lg font-bold md:text-xl">{roi.improvedKeywordCount}</span>
                <span className="text-foreground text-sm">ขยับขึ้น</span>
              </div>
            )}
            {roi.declinedKeywordCount > 0 && (
              <div className="text-destructive flex items-center gap-2">
                <ArrowDown className="size-5" aria-hidden="true" />
                <span className="text-lg font-bold md:text-xl">{roi.declinedKeywordCount}</span>
                <span className="text-foreground text-sm">หล่นลง</span>
              </div>
            )}
            {roi.improvedKeywordCount === 0 && roi.declinedKeywordCount === 0 && (
              <span className="text-muted-foreground text-sm">ไม่มีการเปลี่ยนแปลงในช่วงนี้</span>
            )}
            <span className="text-muted-foreground mt-1 text-xs">
              จาก {roi.totalRankedKeywords} keyword ที่ติดอันดับ
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
