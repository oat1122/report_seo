'use client'

import { useId, useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { AnomalyDot } from '../components/AnomalyDot'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ChartFallbackNote } from '../components/ChartFallbackNote'
import { DeltaChip } from '../components/DeltaChip'
import { ReportCardHeader } from '../components/ReportCardHeader'
import { buildChartConfig } from '../lib/buildChartConfig'
import { SPAM_DANGER_THRESHOLD } from '../lib/chartConfig'
import { formatDateCE } from '../lib/formatters'
import {
  computeAnomalies,
  deduplicateByDay,
  downsampleWide,
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

const chartConfig = buildChartConfig([
  { key: 'spamScore', label: 'Spam Score', color: 'var(--chart-1)' },
])

const fmtDateTick = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

/** Spam Score ตามเวลา + โซนอันตราย (> 2) — ยิ่งน้อยยิ่งดี */
export const SpamScoreTimeline = ({ className }: { className?: string }) => {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()
  const gradientId = `spam-fill-${useId().replace(/:/g, '')}`

  const { chartData, maxValue, hasData, isAllTimeFallback, overCount, latest } = useMemo(() => {
    let filtered = deduplicateByDay(filterHistoryByPeriod(metricsHistory, period))
    const isAllTimeFallback = filtered.length < 3 && metricsHistory.length >= 3
    if (isAllTimeFallback) {
      const all = [...metricsHistory].sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      )
      filtered = deduplicateByDay(all)
    }
    if (!hasEnoughDataForChart(filtered.length)) {
      return {
        chartData: [],
        maxValue: SPAM_DANGER_THRESHOLD + 1,
        hasData: false,
        isAllTimeFallback,
        overCount: 0,
        latest: null,
      }
    }
    const values = filtered.map((r) => r.spamScore)
    const anomalies = computeAnomalies(values)
    const rows = filtered.map((r, idx) => ({
      dateMs: new Date(r.dateRecorded).getTime(),
      spamScore: r.spamScore,
      spamScore__anomaly: anomalies[idx],
    }))
    return {
      chartData: downsampleWide(rows, 60),
      maxValue: Math.ceil(Math.max(SPAM_DANGER_THRESHOLD * 2, ...values)),
      hasData: true,
      isAllTimeFallback,
      overCount: values.filter((v) => v > SPAM_DANGER_THRESHOLD).length,
      latest: values[values.length - 1],
    }
  }, [metricsHistory, period])

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Spam Score Timeline"
        description={
          hasData && latest !== null
            ? `แถบสีแดง = พื้นที่อันตราย (Spam > ${SPAM_DANGER_THRESHOLD}) · ล่าสุด ${latest}%`
            : `แถบสีแดง = พื้นที่อันตราย (Spam > ${SPAM_DANGER_THRESHOLD})`
        }
        action={
          hasData ? (
            overCount === 0 ? (
              <DeltaChip direction="flat" tone="good">
                ปลอดภัยตลอดช่วงนี้
              </DeltaChip>
            ) : (
              <DeltaChip direction="up" tone="bad">
                เกินเกณฑ์ {overCount} ครั้ง
              </DeltaChip>
            )
          ) : null
        }
      />
      <CardContent className="flex flex-col gap-2">
        {!hasData ? (
          <ChartEmptyState height="220px" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full md:h-[220px]"
          >
            <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="dateMs"
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
                tickFormatter={fmtDateTick}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                minTickGap={24}
              />
              <YAxis
                domain={[0, maxValue]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={30}
                allowDecimals={false}
              />
              {/* Danger zone shading */}
              <ReferenceArea
                y1={SPAM_DANGER_THRESHOLD}
                y2={maxValue}
                fill="var(--destructive)"
                fillOpacity={0.09}
              />
              <ReferenceLine
                y={SPAM_DANGER_THRESHOLD}
                stroke="var(--destructive)"
                strokeDasharray="4 4"
                label={{
                  value: `Danger > ${SPAM_DANGER_THRESHOLD}`,
                  position: 'insideTopRight',
                  fill: 'var(--danger-strong)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <ChartTooltip
                cursor={{ stroke: 'var(--chart-3)', strokeDasharray: '3 4' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_l, p) => {
                      const ms = p?.[0]?.payload?.dateMs
                      return typeof ms === 'number' ? formatDateCE(ms) : ''
                    }}
                    formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Spam Score']}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="spamScore"
                stroke="var(--color-spamScore)"
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={<AnomalyDot dataKey="spamScore" />}
                activeDot={{
                  r: 6,
                  fill: 'var(--color-spamScore)',
                  stroke: 'var(--background)',
                  strokeWidth: 2,
                }}
                animationDuration={800}
              />
            </ComposedChart>
          </ChartContainer>
        )}
        {hasData && isAllTimeFallback && <ChartFallbackNote />}
      </CardContent>
    </Card>
  )
}
