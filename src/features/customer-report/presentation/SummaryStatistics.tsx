'use client'

import React, { useMemo, type ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AnimatedNumber, Stagger, StaggerItem } from '@/components/motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { useReportFilters } from './contexts/ReportFiltersContext'
import { DeltaChip, deltaMeta } from './components/DeltaChip'
import { MiniBarChart } from './components/MiniBarChart'
import { MiniLineChart } from './components/MiniLineChart'
import { MiniRingChart } from './components/MiniRingChart'
import { SemiGauge } from './components/SemiGauge'
import {
  computeKpiSnapshots,
  computePositionDistribution,
  computePreviousPositionDistribution,
  computeRoiHeadline,
  deduplicateByDay,
  getValueAtOrBefore,
} from './lib/historyCalculations'
import { formatSignedPct } from './lib/formatters'

interface SummaryStatisticsProps {
  className?: string
}

interface KpiCardProps {
  title: string
  hint: string
  value: ReactNode
  delta?: ReactNode
  caption?: string
  chart?: ReactNode
}

const KpiCard = ({ title, hint, value, delta, caption, chart }: KpiCardProps) => (
  <Card className="h-full py-3.5 md:py-[18px]">
    <CardContent className="flex h-full flex-col gap-2.5 px-3.5 md:gap-3 md:px-5">
      <div className="flex flex-col gap-px md:flex-row md:items-center md:justify-between md:gap-2">
        <p className="text-[13px] font-medium md:text-sm">{title}</p>
        <p className="text-text-secondary text-[11px] md:text-xs">{hint}</p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[28px] leading-none font-semibold tabular-nums md:text-[32px]">
            {value}
          </span>
          {delta && (
            <div className="flex flex-wrap items-center gap-1.5">
              {delta}
              {caption && (
                <span className="text-text-secondary hidden text-xs sm:inline">{caption}</span>
              )}
            </div>
          )}
        </div>
        {chart && <div className="shrink-0">{chart}</div>}
      </div>
    </CardContent>
  </Card>
)

const NoCompare = () => <span className="text-text-secondary text-xs">ยังไม่มีข้อมูลให้เทียบ</span>

const oneDecimal = (n: number) => n.toFixed(1)
const absValue = (n: number) => (Number.isInteger(n) ? `${Math.abs(n)}` : oneDecimal(Math.abs(n)))

/** KPI 4 ใบบนสุดของ Overview (Main.dc.html) — ค่าทั้งหมดมาจาก history context ตามช่วงเวลาที่เลือก */
export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ className }) => {
  const { metricsHistory, keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const kpi = useMemo(
    () => computeKpiSnapshots(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )
  const roi = useMemo(
    () => computeRoiHeadline(metricsHistory, keywordHistory, currentKeywords, period),
    [metricsHistory, keywordHistory, currentKeywords, period],
  )
  const dist = useMemo(() => computePositionDistribution(currentKeywords), [currentKeywords])
  const prevDist = useMemo(
    () => computePreviousPositionDistribution(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )
  const trafficBars = useMemo(() => {
    const asc = [...metricsHistory].sort(
      (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
    )
    return deduplicateByDay(asc)
      .slice(-12)
      .map((r) => r.organicTraffic)
  }, [metricsHistory])

  const vsLabel = `vs ${period} วันก่อน`
  const current = metricsHistory[0] ?? null

  // ---- Organic Traffic ----
  const trafficDelta =
    roi.trafficPctChange !== null ? (
      <DeltaChip {...deltaMeta(roi.trafficDirection === 'neutral' ? 0 : roi.trafficPctChange)}>
        {formatSignedPct(roi.trafficPctChange)}
      </DeltaChip>
    ) : (
      <NoCompare />
    )

  // ---- อันดับเฉลี่ย (ยิ่งน้อยยิ่งดี) ----
  const avg = kpi.avgPosition
  const hasAvg = avg.current > 0
  const avgDelta =
    hasAvg && avg.previous !== null ? (
      <DeltaChip {...deltaMeta(avg.delta, true)}>
        {avg.delta === 0
          ? 'เท่าเดิม'
          : `${avg.delta < 0 ? 'ดีขึ้น' : 'แย่ลง'} ${oneDecimal(Math.abs(avg.delta))}`}
      </DeltaChip>
    ) : (
      <NoCompare />
    )

  // ---- ติดหน้าแรก (Top 10) ----
  const top10 = dist.top3 + dist.top10
  const top10Pct = dist.total > 0 ? Math.round((top10 / dist.total) * 100) : null
  const prevTop10 = prevDist ? prevDist.top3 + prevDist.top10 : null
  const top10Delta =
    prevTop10 !== null ? (
      <DeltaChip {...deltaMeta(top10 - prevTop10)}>{Math.abs(top10 - prevTop10)} คำ</DeltaChip>
    ) : (
      <NoCompare />
    )

  // ---- Domain Rating ----
  const prevDr = getValueAtOrBefore(metricsHistory, period, (r) => r.domainRating)
  const drDelta =
    current && prevDr !== null ? (
      <DeltaChip {...deltaMeta(current.domainRating - prevDr)}>
        {absValue(current.domainRating - prevDr)}
      </DeltaChip>
    ) : (
      <NoCompare />
    )

  return (
    <section aria-label="ตัวเลขสำคัญ" className={className}>
      <Stagger className="grid grid-cols-2 gap-3 md:gap-[18px] xl:grid-cols-4">
        <StaggerItem className="hidden md:block">
          <KpiCard
            title="Organic Traffic"
            hint="คน / เดือน"
            value={current ? <AnimatedNumber value={current.organicTraffic} /> : '—'}
            delta={trafficDelta}
            caption={roi.trafficPctChange !== null ? vsLabel : undefined}
            chart={<MiniBarChart values={trafficBars} />}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="อันดับเฉลี่ย"
            hint="ยิ่งน้อยยิ่งดี"
            value={hasAvg ? <AnimatedNumber value={avg.current} format={oneDecimal} /> : '—'}
            delta={avgDelta}
            caption={
              hasAvg && avg.previous !== null ? `จาก ${oneDecimal(avg.previous)}` : undefined
            }
            chart={
              <MiniLineChart
                values={avg.sparkline}
                invert
                className="h-[30px] w-16 md:h-10 md:w-24"
              />
            }
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="ติดหน้าแรก (Top 10)"
            hint={`${top10} / ${dist.total} คำ`}
            value={
              top10Pct !== null ? (
                <AnimatedNumber value={top10Pct} format={(n) => `${Math.round(n)}%`} />
              ) : (
                '—'
              )
            }
            delta={top10Delta}
            caption={prevTop10 !== null ? vsLabel : undefined}
            chart={
              dist.total > 0 ? (
                <MiniRingChart
                  className="size-11 md:size-[60px]"
                  segments={[
                    { value: dist.top3 / dist.total, color: 'var(--chart-4)' },
                    { value: dist.top10 / dist.total, color: 'var(--chart-3)' },
                  ]}
                />
              ) : null
            }
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Domain Rating"
            hint="เต็ม 100"
            value={current ? <AnimatedNumber value={current.domainRating} /> : '—'}
            delta={drDelta}
            caption={current && prevDr !== null ? vsLabel : undefined}
            chart={
              current ? (
                <SemiGauge value={current.domainRating} className="w-[62px] md:w-[84px]" />
              ) : null
            }
          />
        </StaggerItem>

        {/* มือถือ: traffic อยู่การ์ดใหญ่ด้านบนแล้ว → ช่องที่ 4 เป็นจำนวน keyword ที่ขยับ */}
        <StaggerItem className="md:hidden">
          <Card className="h-full py-3.5">
            <CardContent className="flex h-full flex-col gap-2.5 px-3.5">
              <div className="flex flex-col gap-px">
                <p className="text-[13px] font-medium">Keyword ขยับ</p>
                <p className="text-text-secondary text-[11px]">เทียบ {period} วันก่อน</p>
              </div>
              <div className="mt-auto flex flex-col gap-1.5">
                <MoveRow tone="good" count={roi.improvedKeywordCount} label="ขึ้น" />
                <MoveRow tone="bad" count={roi.declinedKeywordCount} label="ลง" />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>
    </section>
  )
}

const MoveRow = ({
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
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          'flex size-6 items-center justify-center rounded-lg',
          tone === 'good'
            ? 'bg-success-subtle text-success'
            : 'bg-danger-subtle text-danger-strong',
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.5} />
      </span>
      <AnimatedNumber
        value={count}
        className="text-[22px] leading-none font-semibold tabular-nums"
      />
      <span className="text-text-secondary text-xs">{label}</span>
    </div>
  )
}
