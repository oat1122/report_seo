'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { AnimatedNumber } from '@/components/motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ChartFallbackNote } from '../components/ChartFallbackNote'
import { DeltaChip, deltaMeta } from '../components/DeltaChip'
import { ReportCardHeader } from '../components/ReportCardHeader'
import { buildChartConfig } from '../lib/buildChartConfig'
import { formatCompact, formatDateCE, formatSignedPct } from '../lib/formatters'
import {
  computeBacklinkRatio,
  deduplicateByDay,
  downsampleWide,
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

const chartConfig = buildChartConfig([
  { key: 'backlinks', label: 'Backlinks', color: 'var(--chart-1)' },
  { key: 'refDomains', label: 'Ref. Domains', color: 'var(--chart-4)' },
])

// แถบเกณฑ์ ratio: ดี ≤ 10 · ปานกลาง 10–50 · สูง > 50 (แต่ละโซนกว้าง 1/3)
const RATIO_ZONES = [
  { label: 'ดี · ≤ 10', fill: 'bg-chart-4' },
  { label: 'ปานกลาง · 10–50', fill: 'bg-warning-accent' },
  { label: 'สูง · > 50', fill: 'bg-destructive' },
] as const

const ratioZone = (ratio: number): 0 | 1 | 2 => (ratio > 50 ? 2 : ratio > 10 ? 1 : 0)

const ratioPosition = (ratio: number): number => {
  if (ratio <= 10) return (ratio / 10) * 33.3
  if (ratio <= 50) return 33.3 + ((ratio - 10) / 40) * 33.3
  return Math.min(100, 66.7 + ((ratio - 50) / 50) * 33.3)
}

const interpretRatio = (ratio: number | null): string => {
  if (ratio === null) return 'ยังไม่มี referring domain'
  if (ratio > 50) return 'Ratio สูง — link อาจมาจากเว็บที่ไม่หลากหลาย ควรหาเว็บใหม่เพิ่ม'
  if (ratio > 10) return 'Ratio ปานกลาง — ควรเพิ่มจำนวนเว็บที่ link มา'
  return 'Ratio ดี — link มาจากเว็บที่หลากหลาย'
}

const ZONE_BADGE = ['success', 'warning', 'danger'] as const
const ZONE_WORD = ['ดี', 'ปานกลาง', 'สูง'] as const

// type (ไม่ใช่ interface) → assign เข้า Record<string, unknown> ของ downsampleWide ได้
type Row = {
  dateMs: number
  backlinks: number
  refDomains: number
  ratio: number | null
}

const fmtMonth = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

/** กราฟแท่งเล็ก 1 series — แท่งล่าสุดเข้มสุด + ค่าบนหัวแท่ง */
const SeriesBars = ({
  rows,
  dataKey,
  label,
  swatch,
  dim,
  strong,
}: {
  rows: Row[]
  dataKey: 'backlinks' | 'refDomains'
  label: string
  swatch: string
  dim: { fill: string; opacity: number }
  strong: string
}) => {
  const first = rows[0][dataKey]
  const last = rows[rows.length - 1][dataKey]
  const pct = first > 0 ? ((last - first) / first) * 100 : null
  const lastIndex = rows.length - 1
  const meta = pct !== null ? deltaMeta(Math.abs(pct) < 0.05 ? 0 : pct) : null

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-text-secondary flex items-center gap-1.5 text-xs">
          <span aria-hidden className={cn('size-2.5 rounded-[3px]', swatch)} />
          {label}
        </span>
        <span className="flex items-center gap-2">
          <AnimatedNumber
            value={last}
            className="text-[22px] leading-none font-semibold tabular-nums"
          />
          {meta && pct !== null && (
            <DeltaChip direction={meta.direction} tone={meta.tone}>
              {formatSignedPct(pct)}
            </DeltaChip>
          )}
        </span>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[150px] w-full">
        <BarChart data={rows} margin={{ top: 18, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="var(--border)" />
          <XAxis
            dataKey="dateMs"
            tickFormatter={fmtMonth}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={8}
          />
          <YAxis hide domain={[0, 'dataMax']} />
          <ChartTooltip
            cursor={{ fill: 'var(--info-subtle)', opacity: 0.6 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_l, p) => {
                  const ms = p?.[0]?.payload?.dateMs
                  return typeof ms === 'number' ? formatDateCE(ms) : ''
                }}
                formatter={(v, _name, item) => {
                  const ratio = (item.payload as Row).ratio
                  return [
                    `${Number(v).toLocaleString()}${ratio !== null ? ` · ratio ${ratio.toFixed(1)}` : ''}`,
                    label,
                  ]
                }}
              />
            }
          />
          <Bar dataKey={dataKey} radius={[6, 6, 2, 2]} animationDuration={800} maxBarSize={40}>
            {rows.map((r, i) => (
              <Cell
                key={r.dateMs}
                fill={i === lastIndex ? strong : dim.fill}
                fillOpacity={i === lastIndex ? 1 : dim.opacity}
              />
            ))}
            <LabelList
              dataKey={dataKey}
              position="top"
              formatter={(v: unknown) => formatCompact(Number(v))}
              style={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export const BacklinksVsRefDomains = ({ className }: { className?: string }) => {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()

  const { rows, hasData, currentRatio, isAllTimeFallback } = useMemo(() => {
    let filtered = deduplicateByDay(filterHistoryByPeriod(metricsHistory, period))
    const isAllTimeFallback = filtered.length < 3 && metricsHistory.length >= 3
    if (isAllTimeFallback) {
      const all = [...metricsHistory].sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      )
      filtered = deduplicateByDay(all)
    }
    if (!hasEnoughDataForChart(filtered.length)) {
      return { rows: [] as Row[], hasData: false, currentRatio: null, isAllTimeFallback }
    }
    // ratio = null เมื่อ refDomains = 0 → ไม่แสดงแทนการจุ่มลง 0 (ดูเหมือน diversity ดีมาก)
    const all: Row[] = filtered.map((r) => ({
      dateMs: new Date(r.dateRecorded).getTime(),
      backlinks: r.backlinks,
      refDomains: r.refDomains,
      ratio: computeBacklinkRatio(r.backlinks, r.refDomains),
    }))
    const latest = all[all.length - 1]
    return {
      // แท่งอ่านง่ายสุดที่ ≤ 8 แท่ง — จุดแรก/ล่าสุดคงไว้เสมอ
      rows: downsampleWide(all, 8),
      hasData: true,
      currentRatio: computeBacklinkRatio(latest.backlinks, latest.refDomains),
      isAllTimeFallback,
    }
  }, [metricsHistory, period])

  const zone = currentRatio !== null ? ratioZone(currentRatio) : null

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Backlinks vs Referring Domains"
        description="จำนวน link เทียบกับจำนวนเว็บที่ link มา (link diversity)"
      />
      <CardContent className="flex flex-col gap-4">
        {!hasData ? (
          <ChartEmptyState height="220px" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SeriesBars
                rows={rows}
                dataKey="backlinks"
                label="Backlinks"
                swatch="bg-chart-1"
                dim={{ fill: 'var(--accent)', opacity: 1 }}
                strong="var(--chart-1)"
              />
              <SeriesBars
                rows={rows}
                dataKey="refDomains"
                label="Ref. Domains"
                swatch="bg-chart-4"
                dim={{ fill: 'var(--chart-4)', opacity: 0.35 }}
                strong="var(--chart-4)"
              />
            </div>

            <div className="bg-glass-tile flex flex-col gap-2.5 rounded-[14px] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-sm">
                  <strong className="text-xl font-semibold tabular-nums">
                    {currentRatio !== null ? currentRatio.toFixed(1) : '—'}
                  </strong>{' '}
                  backlinks ต่อ 1 referring domain
                </span>
                {zone !== null && (
                  <Badge variant={ZONE_BADGE[zone]}>
                    <span data-dot aria-hidden />
                    Ratio {ZONE_WORD[zone]}
                  </Badge>
                )}
              </div>
              {currentRatio !== null && zone !== null && (
                <>
                  <div
                    role="img"
                    aria-label={`Ratio ${currentRatio.toFixed(1)} อยู่ในโซน${ZONE_WORD[zone]}`}
                    className="relative"
                  >
                    <div className="flex h-2 gap-[3px]">
                      {RATIO_ZONES.map((z, i) => (
                        <div
                          key={z.label}
                          className={cn(
                            'flex-1',
                            z.fill,
                            i === 0
                              ? 'rounded-l-full rounded-r-[2px]'
                              : i === 2
                                ? 'rounded-l-[2px] rounded-r-full'
                                : 'rounded-[2px]',
                          )}
                        />
                      ))}
                    </div>
                    <span
                      aria-hidden
                      className="bg-foreground border-background absolute -top-[5px] -ml-[9px] size-[18px] rounded-full border-4 shadow-sm"
                      style={{ left: `${ratioPosition(currentRatio)}%` }}
                    />
                  </div>
                  <div aria-hidden className="text-text-secondary flex text-[11px]">
                    {RATIO_ZONES.map((z, i) => (
                      <span
                        key={z.label}
                        className={cn(
                          'flex-1',
                          i === 1 && 'text-center',
                          i === 2 && 'text-right',
                          i === zone && 'text-foreground font-medium',
                        )}
                      >
                        {z.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <p className="text-text-secondary text-xs">{interpretRatio(currentRatio)}</p>
            </div>
            {isAllTimeFallback && <ChartFallbackNote />}
          </>
        )}
      </CardContent>
    </Card>
  )
}
