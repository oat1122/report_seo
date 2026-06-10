'use client'

import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AnomalyDot } from '../components/AnomalyDot'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ChartFallbackNote } from '../components/ChartFallbackNote'
import { buildChartConfig } from '../lib/buildChartConfig'
import {
  computeAnomalies,
  deduplicateByDay,
  downsampleWide,
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

const DANGER_THRESHOLD = 2 // spam score > 2 = risky

const chartConfig = buildChartConfig([
  { key: 'spamScore', label: 'Spam Score', color: 'var(--destructive)' },
])

const fmtDateTick = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
  })

const fmtDateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const SpamScoreTimeline = () => {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()

  const { chartData, maxValue, hasData, isAllTimeFallback } = useMemo(() => {
    let filtered = deduplicateByDay(filterHistoryByPeriod(metricsHistory, period))
    const isAllTimeFallback = filtered.length < 3 && metricsHistory.length >= 3
    if (isAllTimeFallback) {
      const all = [...metricsHistory].sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      )
      filtered = deduplicateByDay(all)
    }
    if (!hasEnoughDataForChart(filtered.length)) {
      return { chartData: [], maxValue: DANGER_THRESHOLD + 1, hasData: false, isAllTimeFallback }
    }
    const values = filtered.map((r) => r.spamScore)
    const anomalies = computeAnomalies(values)
    const rows = filtered.map((r, idx) => ({
      dateMs: new Date(r.dateRecorded).getTime(),
      spamScore: r.spamScore,
      spamScore__anomaly: anomalies[idx],
    }))
    const max = Math.max(DANGER_THRESHOLD + 1, ...values)
    return {
      chartData: downsampleWide(rows, 60),
      maxValue: max,
      hasData: true,
      isAllTimeFallback,
    }
  }, [metricsHistory, period])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spam Score Timeline</CardTitle>
        <p className="text-muted-foreground text-xs">
          แถบสีแดง = พื้นที่อันตราย (Spam &gt; {DANGER_THRESHOLD})
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <ChartEmptyState height="240px" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="dateMs"
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
                tickFormatter={fmtDateTick}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, maxValue]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
              />
              {/* Danger zone shading */}
              <ReferenceArea
                y1={DANGER_THRESHOLD}
                y2={maxValue}
                fill="var(--destructive)"
                fillOpacity={0.06}
              />
              <ReferenceLine
                y={DANGER_THRESHOLD}
                stroke="var(--warning)"
                strokeDasharray="6 4"
                label={{
                  value: `Danger > ${DANGER_THRESHOLD}`,
                  position: 'right',
                  fill: 'var(--warning)',
                  fontSize: 10,
                }}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'var(--muted-foreground)',
                  strokeDasharray: '3 3',
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_l, p) => {
                      const ms = p?.[0]?.payload?.dateMs
                      return typeof ms === 'number' ? fmtDateLabel(ms) : ''
                    }}
                    formatter={(v) => [Number(v).toFixed(2), 'Spam Score']}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="spamScore"
                stroke="var(--color-spamScore)"
                fill="var(--color-spamScore)"
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spamScore"
                stroke="var(--color-spamScore)"
                strokeWidth={2}
                dot={<AnomalyDot dataKey="spamScore" />}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
        {hasData && isAllTimeFallback && <ChartFallbackNote />}
      </CardContent>
    </Card>
  )
}
