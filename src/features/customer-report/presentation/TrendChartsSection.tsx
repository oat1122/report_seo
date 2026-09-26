'use client'

import React, { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Shimmer } from '@/components/skeletons'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { useReportFilters } from './contexts/ReportFiltersContext'
import { ChartEmptyState } from './components/ChartEmptyState'
import { ChartFallbackNote } from './components/ChartFallbackNote'
import { AnomalyDot } from './components/AnomalyDot'
import { ReportCardHeader } from './components/ReportCardHeader'
import { DOMAIN_METRICS_SERIES, MetricSeriesConfig } from './lib/chartConfig'
import { buildChartConfig } from './lib/buildChartConfig'
import { formatDateCE } from './lib/formatters'
import {
  computeAnomalies,
  deduplicateByDay,
  downsampleWide,
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from './lib/historyCalculations'
import type { OverallMetricsHistory } from '@/types/history'

interface TrendChartsSectionProps {
  title?: string
  className?: string
}

const formatVolumeValue = (val: number | null | undefined): string => {
  if (val == null) return ''
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toString()
}

const fmtDateTick = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

const pickMetricValue = (record: OverallMetricsHistory, key: string): number =>
  Number(record[key as keyof OverallMetricsHistory] ?? 0)

interface WideRow {
  dateMs: number
  [key: string]: number | boolean
}

/** แนวโน้ม Domain Metrics — เลือก series ได้ (chip), คะแนนแกนซ้าย · ปริมาณแกนขวา */
export const TrendChartsSection: React.FC<TrendChartsSectionProps> = ({
  title = 'แนวโน้ม Domain Metrics',
  className,
}) => {
  const { metricsHistory, isLoading } = useHistoryContext()
  const { period } = useReportFilters()

  const [visibleSeries, setVisibleSeries] = React.useState<Set<string>>(() => {
    const defaults = new Set<string>()
    DOMAIN_METRICS_SERIES.forEach((s) => {
      if (s.defaultVisible) defaults.add(s.dataKey)
    })
    return defaults
  })

  const { filteredHistory, isAllTimeFallback } = useMemo(() => {
    const byPeriod = filterHistoryByPeriod(metricsHistory, period)
    const deduped = deduplicateByDay(byPeriod)
    if (deduped.length < 3 && metricsHistory.length >= 3) {
      const all = [...metricsHistory].sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      )
      return { filteredHistory: deduplicateByDay(all), isAllTimeFallback: true }
    }
    return { filteredHistory: deduped, isAllTimeFallback: false }
  }, [metricsHistory, period])

  const hasData = hasEnoughDataForChart(filteredHistory.length)

  // Wide-format rows: 1 row ต่อ timestamp + column per series + anomaly flag
  const chartData = useMemo<WideRow[]>(() => {
    const visible = DOMAIN_METRICS_SERIES.filter((s) => visibleSeries.has(s.dataKey))
    const valuesByKey: Record<string, number[]> = {}
    visible.forEach((s) => {
      valuesByKey[s.dataKey] = filteredHistory.map((r) => pickMetricValue(r, s.dataKey))
    })
    const anomalyByKey: Record<string, boolean[]> = {}
    visible.forEach((s) => {
      anomalyByKey[s.dataKey] = computeAnomalies(valuesByKey[s.dataKey])
    })

    const rows: WideRow[] = filteredHistory.map((r, idx) => {
      const row: WideRow = { dateMs: new Date(r.dateRecorded).getTime() }
      visible.forEach((s) => {
        row[s.dataKey] = valuesByKey[s.dataKey][idx]
        row[`${s.dataKey}__anomaly`] = anomalyByKey[s.dataKey][idx]
      })
      return row
    })
    return downsampleWide(rows, 60)
  }, [filteredHistory, visibleSeries])

  const visibleConfigs = useMemo(
    () => DOMAIN_METRICS_SERIES.filter((s) => visibleSeries.has(s.dataKey)),
    [visibleSeries],
  )

  const chartConfig = useMemo(
    () =>
      buildChartConfig(
        visibleConfigs.map((s) => ({
          key: s.dataKey,
          label: s.name,
          color: s.color,
        })),
      ),
    [visibleConfigs],
  )

  const { hasScoreAxis, hasVolumeAxis } = useMemo(() => {
    let hasScore = false
    let hasVolume = false
    visibleConfigs.forEach((s) => {
      if (s.axisType === 'score') hasScore = true
      if (s.axisType === 'volume') hasVolume = true
    })
    return { hasScoreAxis: hasScore, hasVolumeAxis: hasVolume }
  }, [visibleConfigs])

  // metrics ที่ยังไม่อยู่บนกราฟ — chip "เพิ่มในกราฟ" พร้อมค่าล่าสุด
  const offSeries = useMemo(() => {
    return DOMAIN_METRICS_SERIES.filter((s) => !visibleSeries.has(s.dataKey)).map((s) => {
      const values = filteredHistory.map((r) => pickMetricValue(r, s.dataKey))
      const latest = values.length > 0 ? values[values.length - 1] : 0
      return { config: s, latest }
    })
  }, [filteredHistory, visibleSeries])

  const flatLineMessage = useMemo(() => {
    if (filteredHistory.length < 2 || visibleConfigs.length === 0) return null
    const allFlat = visibleConfigs.every((s) => {
      const values = filteredHistory.map((r) => pickMetricValue(r, s.dataKey))
      const first = values[0]
      return values.every((v) => v === first)
    })
    return allFlat ? `ไม่มีการเปลี่ยนแปลงในช่วง ${period} วันที่ผ่านมา` : null
  }, [filteredHistory, visibleConfigs, period])

  const toggleSeries = (dataKey: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev)
      if (next.has(dataKey)) {
        if (next.size > 1) next.delete(dataKey)
      } else {
        next.add(dataKey)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <Card className={className} role="status" aria-label="กำลังโหลดข้อมูลแนวโน้ม">
        <CardContent className="flex flex-col gap-4">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-[260px] w-full rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  const axisNote =
    hasScoreAxis && hasVolumeAxis
      ? 'คะแนน 0–100 แกนซ้าย · ปริมาณแกนขวา'
      : hasVolumeAxis
        ? 'ปริมาณ (แกนขวา)'
        : 'คะแนน 0–100'

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title={title}
        description={`${axisNote} · ${period} วันล่าสุด${flatLineMessage && hasData ? ` · ${flatLineMessage}` : ''}`}
      />
      <CardContent className="flex flex-col gap-4">
        {/* chips: series บนกราฟ (กดเพื่อซ่อน) + เพิ่มในกราฟ */}
        <div className="flex flex-wrap items-center gap-2">
          {visibleConfigs.map((series: MetricSeriesConfig) => {
            const onlyOne = visibleConfigs.length === 1
            return (
              <button
                key={series.dataKey}
                type="button"
                onClick={() => toggleSeries(series.dataKey)}
                disabled={onlyOne}
                aria-pressed
                aria-label={
                  onlyOne ? `${series.name} (ต้องมีอย่างน้อย 1 เส้น)` : `ซ่อน ${series.name}`
                }
                className="bg-background shadow-card focus-visible:ring-ring/60 inline-flex min-h-11 items-center gap-1.5 rounded-full pr-2.5 pl-3 text-[13px] outline-none focus-visible:ring-3 disabled:cursor-not-allowed md:min-h-[34px]"
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                {series.name}
                {!onlyOne && <X aria-hidden className="text-text-secondary size-3.5" />}
              </button>
            )
          })}
          {offSeries.length > 0 && hasData && (
            <>
              <span className="text-text-secondary ml-1 text-xs">เพิ่มในกราฟ:</span>
              {offSeries.map(({ config, latest }) => (
                <button
                  key={config.dataKey}
                  type="button"
                  onClick={() => toggleSeries(config.dataKey)}
                  aria-pressed={false}
                  aria-label={`เพิ่ม ${config.name} ในกราฟ (ล่าสุด ${latest}${config.unit ?? ''})`}
                  className="border-border text-text-secondary hover:text-foreground hover:bg-background/60 focus-visible:ring-ring/60 inline-flex min-h-11 items-center gap-1 rounded-full border border-dashed px-3 text-[13px] outline-none focus-visible:ring-3 md:min-h-[34px]"
                >
                  <Plus aria-hidden className="size-3.5" />
                  {config.name}
                  <span className="text-foreground font-medium tabular-nums">
                    {config.axisType === 'volume' ? formatVolumeValue(latest) : latest}
                    {config.unit ?? ''}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {!hasData ? (
          <ChartEmptyState height="280px" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full md:h-[320px]"
          >
            <LineChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
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
              {hasScoreAxis && (
                <YAxis
                  yAxisId="score"
                  orientation="left"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={32}
                  allowDecimals={false}
                />
              )}
              {hasVolumeAxis && (
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, 'auto']}
                  tickFormatter={formatVolumeValue}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
              )}
              <ChartTooltip
                cursor={{ stroke: 'var(--chart-3)', strokeDasharray: '3 4' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => {
                      const ms = payload?.[0]?.payload?.dateMs
                      return typeof ms === 'number' ? formatDateCE(ms) : ''
                    }}
                    formatter={(value, name) => {
                      const config = visibleConfigs.find((s) => s.dataKey === name)
                      const formatted =
                        config?.axisType === 'volume'
                          ? formatVolumeValue(Number(value))
                          : Number(value).toLocaleString()
                      return [`${formatted}${config?.unit ?? ''}`, config?.name]
                    }}
                  />
                }
              />
              {visibleConfigs.map((s) => (
                <Line
                  key={s.dataKey}
                  yAxisId={s.axisType}
                  type="monotone"
                  dataKey={s.dataKey}
                  stroke={`var(--color-${s.dataKey})`}
                  strokeWidth={2.5}
                  dot={<AnomalyDot dataKey={s.dataKey} />}
                  activeDot={{ r: 6, stroke: 'var(--background)', strokeWidth: 2 }}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}

        {hasData && isAllTimeFallback && <ChartFallbackNote />}

        <p className="text-text-secondary text-right text-xs">
          จาก {filteredHistory.length} รายการที่บันทึกไว้
        </p>
      </CardContent>
    </Card>
  )
}

export default TrendChartsSection
