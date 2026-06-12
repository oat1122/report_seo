'use client'

import { useMemo } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ChartFallbackNote } from '../components/ChartFallbackNote'
import { ReportIcon } from '../components/ReportIcon'
import { buildChartConfig } from '../lib/buildChartConfig'
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
  { key: 'backlinks', label: 'Backlinks', color: 'var(--chart-2)' },
  { key: 'refDomains', label: 'Ref. Domains', color: 'var(--chart-1)' },
  { key: 'ratio', label: 'Ratio', color: 'var(--info)' },
])

const fmtNum = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toString()
}

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

const interpretRatio = (ratio: number | null): string => {
  if (ratio === null) return 'ยังไม่มี referring domain'
  if (ratio > 50) return 'Ratio สูง — อาจมี link จากเว็บไม่หลากหลาย'
  if (ratio > 10) return 'Ratio ปานกลาง'
  return 'Ratio ดี — link หลากหลาย'
}

export const BacklinksVsRefDomains = () => {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()

  const { chartData, hasData, currentRatio, isAllTimeFallback } = useMemo(() => {
    let filtered = deduplicateByDay(filterHistoryByPeriod(metricsHistory, period))
    const isAllTimeFallback = filtered.length < 3 && metricsHistory.length >= 3
    if (isAllTimeFallback) {
      const all = [...metricsHistory].sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      )
      filtered = deduplicateByDay(all)
    }
    if (!hasEnoughDataForChart(filtered.length)) {
      return { chartData: [], hasData: false, currentRatio: null, isAllTimeFallback }
    }
    // ratio = null เมื่อ refDomains = 0 → เว้น gap แทนจุ่มลง 0 (ดูเหมือน diversity ดีมาก)
    const rows = filtered.map((r) => ({
      dateMs: new Date(r.dateRecorded).getTime(),
      backlinks: r.backlinks,
      refDomains: r.refDomains,
      ratio: computeBacklinkRatio(r.backlinks, r.refDomains),
    }))
    const latest = rows[rows.length - 1]
    return {
      chartData: downsampleWide(rows, 60),
      hasData: true,
      currentRatio: computeBacklinkRatio(latest.backlinks, latest.refDomains),
      isAllTimeFallback,
    }
  }, [metricsHistory, period])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReportIcon name="globe" trigger="hover" color="bg-info" size={18} />
          Backlinks vs Referring Domains
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          เปรียบเทียบจำนวน link กับจำนวนเว็บที่ link มา (link diversity)
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <ChartEmptyState height="240px" />
        ) : (
          <>
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
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  yAxisId="count"
                  orientation="left"
                  tickFormatter={fmtNum}
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="ratio"
                  orientation="right"
                  tickFormatter={(v) => v.toFixed(1)}
                  stroke="var(--info)"
                  tick={{ fontSize: 11 }}
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
                      formatter={(v, name) => {
                        if (v == null) return []
                        const label =
                          name === 'backlinks'
                            ? 'Backlinks'
                            : name === 'refDomains'
                              ? 'Ref. Domains'
                              : 'Ratio'
                        const formatted =
                          name === 'ratio' ? Number(v).toFixed(1) : Number(v).toLocaleString()
                        return [formatted, label]
                      }}
                    />
                  }
                />
                <Bar
                  yAxisId="count"
                  dataKey="backlinks"
                  fill="var(--color-backlinks)"
                  barSize={12}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  yAxisId="count"
                  dataKey="refDomains"
                  fill="var(--color-refDomains)"
                  barSize={12}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="ratio"
                  type="monotone"
                  dataKey="ratio"
                  stroke="var(--color-ratio)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ChartContainer>
            <p className="text-muted-foreground mt-3 text-center text-xs">
              <span className="text-foreground font-semibold">
                {currentRatio !== null ? currentRatio.toFixed(1) : '—'}
              </span>{' '}
              backlinks ต่อ 1 referring domain — {interpretRatio(currentRatio)}
            </p>
            {isAllTimeFallback && <ChartFallbackNote />}
          </>
        )}
      </CardContent>
    </Card>
  )
}
