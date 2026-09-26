'use client'

import { useId, useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { AnimatedNumber } from '@/components/motion'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeTrafficForecast } from '../lib/historyCalculations'
import { formatCompact, formatDateCE, formatNumber, formatSignedPct } from '../lib/formatters'
import { useHistoryContext } from '../contexts/HistoryContext'

interface TrafficForecastConeProps {
  daysAhead?: number
  className?: string
}

const chartConfig = buildChartConfig([
  { key: 'actual', label: 'Traffic จริง', color: 'var(--chart-1)' },
  { key: 'predicted', label: 'คาดการณ์', color: 'var(--chart-2)' },
  { key: 'bandHeight', label: 'ช่วงที่น่าจะเป็น', color: 'var(--chart-4)' },
])

interface Row {
  label: string
  time: number
  actual: number | null
  predicted: number | null
  lower: number | null
  upper: number | null
  bandLow: number
  bandHeight: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload?: Row }>
  latestTime: number | null
  latestChangePct: number | null
}

/** tooltip เข้ม — จุดจริงแสดงค่า, จุดคาดการณ์แสดงช่วงที่น่าจะเป็น */
const TrafficTooltip = ({ active, payload, latestTime, latestChangePct }: TooltipProps) => {
  const row = payload?.[0]?.payload
  if (!active || !row) return null
  const isActual = row.actual != null
  return (
    <div className="bg-primary text-primary-foreground shadow-popover flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-xs whitespace-nowrap">
      <span>{formatDateCE(row.time)}</span>
      {isActual && row.actual != null ? (
        <>
          <span className="font-semibold tabular-nums">{formatNumber(row.actual)} คน</span>
          {row.time === latestTime && latestChangePct != null && (
            <span className="font-medium tabular-nums opacity-80">
              {formatSignedPct(latestChangePct)}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="font-semibold tabular-nums">~{formatNumber(row.predicted ?? 0)} คน</span>
          {row.lower != null && row.upper != null && (
            <span className="tabular-nums opacity-80">
              ({formatCompact(row.lower)}–{formatCompact(row.upper)})
            </span>
          )}
        </>
      )}
    </div>
  )
}

const describe = (growthPct: number | null, forecastPct: number | null, since: string) => {
  if (growthPct === null) return 'คนเข้าเว็บจาก Google ตามข้อมูลที่บันทึกไว้ พร้อมเส้นคาดการณ์'
  const trendNote =
    forecastPct == null
      ? ''
      : forecastPct > 0.5
        ? ' และมีแนวโน้มโตต่อ'
        : forecastPct < -0.5
          ? ' แต่แนวโน้มช่วงถัดไปชะลอลง'
          : ' และแนวโน้มทรงตัว'
  if (growthPct > 0.5)
    return `คนเข้าเว็บจาก Google เพิ่มขึ้น ${growthPct.toFixed(0)}% ตั้งแต่ ${since}${trendNote}`
  if (growthPct < -0.5)
    return `คนเข้าเว็บจาก Google ลดลง ${Math.abs(growthPct).toFixed(0)}% ตั้งแต่ ${since}${trendNote}`
  return `คนเข้าเว็บจาก Google ทรงตัวตั้งแต่ ${since}${trendNote}`
}

/** การ์ดกราฟหลักของ Overview: traffic จริง + เส้นคาดการณ์ + ช่วงที่น่าจะเป็น (Main.dc.html) */
export const TrafficForecastCone = ({ daysAhead = 30, className }: TrafficForecastConeProps) => {
  const { metricsHistory } = useHistoryContext()
  const gradientId = `traffic-fill-${useId().replace(/:/g, '')}`

  const forecast = useMemo(
    () => computeTrafficForecast(metricsHistory, daysAhead),
    [metricsHistory, daysAhead],
  )

  // Recharts ต้องการ dataset เดียว — band ใช้ stacked Area (ฐานโปร่ง + ความสูง)
  const data = useMemo<Row[]>(
    () =>
      forecast.points.map((p) => ({
        label: p.label,
        time: p.time,
        actual: p.actual,
        predicted: p.predicted,
        lower: p.lower,
        upper: p.upper,
        bandLow: p.lower ?? 0,
        bandHeight: p.lower != null && p.upper != null ? p.upper - p.lower : 0,
      })),
    [forecast.points],
  )

  const actualRows = data.filter((d) => d.actual != null)
  const first = actualRows[0] ?? null
  const latest = actualRows[actualRows.length - 1] ?? null
  const latestIndex = latest ? data.indexOf(latest) : -1
  const lastLabel = data[data.length - 1]?.label
  const prevRow = actualRows.length > 1 ? actualRows[actualRows.length - 2] : null

  const growthPct =
    first && latest && first !== latest && (first.actual ?? 0) > 0
      ? (((latest.actual ?? 0) - (first.actual ?? 0)) / (first.actual ?? 1)) * 100
      : null
  const latestChangePct =
    prevRow && latest && (prevRow.actual ?? 0) > 0
      ? (((latest.actual ?? 0) - (prevRow.actual ?? 0)) / (prevRow.actual ?? 1)) * 100
      : null
  const sinceLabel = first ? formatDateCE(first.time) : ''
  const showDots = actualRows.length <= 12

  return (
    <Card className={cn('min-w-0', className)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-[17px] leading-snug font-semibold">Organic Traffic รายเดือน</h2>
            <p className="text-text-secondary text-[13px]">
              {forecast.hasData
                ? describe(growthPct, forecast.changePct, sinceLabel)
                : 'ต้องมีประวัติ traffic อย่างน้อย 2 รอบจึงจะแสดงแนวโน้มและคาดการณ์ได้'}
            </p>
          </div>
          {latest && (
            <dl className="flex shrink-0 gap-7">
              <div className="flex flex-col gap-0.5">
                <dt className="text-text-secondary text-xs">ล่าสุด</dt>
                <dd className="text-[22px] leading-tight font-semibold tabular-nums">
                  <AnimatedNumber value={latest.actual ?? 0} />
                </dd>
              </div>
              {growthPct !== null && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-text-secondary text-xs">ตั้งแต่ {first?.label}</dt>
                  <dd
                    className={cn(
                      'text-[22px] leading-tight font-semibold tabular-nums',
                      growthPct < -0.5 && 'text-danger-strong',
                    )}
                  >
                    {formatSignedPct(growthPct, 0)}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {!forecast.hasData ? (
          <ChartEmptyState message="ต้องมีประวัติ traffic อย่างน้อย 2 รอบ" height="240px" />
        ) : (
          <>
            <ul className="text-text-secondary flex flex-wrap gap-x-[18px] gap-y-1.5 text-xs">
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden className="bg-chart-1 h-[3px] w-4 rounded-full" />
                Traffic จริง
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden className="border-chart-2 w-4 border-t-2 border-dashed" />
                คาดการณ์ {daysAhead} วัน
                {forecast.forecastEnd != null && (
                  <span className="text-foreground font-medium tabular-nums">
                    ~{formatNumber(forecast.forecastEnd)}
                    {forecast.changePct != null && ` (${formatSignedPct(forecast.changePct)})`}
                  </span>
                )}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden className="bg-chart-4/30 size-3 rounded-[3px]" />
                ช่วงที่น่าจะเป็น
              </li>
            </ul>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[200px] w-full md:h-[240px]"
            >
              <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                  tickFormatter={(v) => formatCompact(Number(v))}
                />
                {latest && lastLabel && (
                  <ReferenceArea
                    x1={latest.label}
                    x2={lastLabel}
                    fill="var(--chart-4)"
                    fillOpacity={0.06}
                    label={{
                      value: 'คาดการณ์',
                      position: 'insideTop',
                      fill: 'var(--text-secondary)',
                      fontSize: 11,
                    }}
                  />
                )}
                {latest && (
                  <ReferenceLine x={latest.label} stroke="var(--chart-3)" strokeDasharray="3 4" />
                )}
                <ChartTooltip
                  defaultIndex={latestIndex >= 0 ? latestIndex : undefined}
                  cursor={{ stroke: 'var(--chart-3)', strokeDasharray: '3 4' }}
                  content={
                    <TrafficTooltip
                      latestTime={latest?.time ?? null}
                      latestChangePct={latestChangePct}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="bandLow"
                  stackId="band"
                  stroke="none"
                  fill="transparent"
                  isAnimationActive={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="bandHeight"
                  stackId="band"
                  stroke="none"
                  fill="var(--color-bandHeight)"
                  fillOpacity={0.28}
                  isAnimationActive={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={3}
                  fill={`url(#${gradientId})`}
                  connectNulls={false}
                  animationDuration={800}
                  dot={
                    showDots
                      ? {
                          r: 4,
                          fill: 'var(--background)',
                          stroke: 'var(--color-actual)',
                          strokeWidth: 2,
                        }
                      : false
                  }
                  activeDot={{
                    r: 7,
                    fill: 'var(--color-actual)',
                    stroke: 'var(--background)',
                    strokeWidth: 3,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--color-predicted)"
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--background)', stroke: 'var(--color-predicted)' }}
                  connectNulls={false}
                  animationDuration={800}
                />
                {latest?.actual != null && (
                  <ReferenceDot
                    x={latest.label}
                    y={latest.actual}
                    r={8}
                    fill="var(--color-actual)"
                    stroke="var(--background)"
                    strokeWidth={3}
                  />
                )}
              </ComposedChart>
            </ChartContainer>

            <p className="text-text-secondary text-xs">
              {forecast.rSquared != null
                ? `ความแม่นของเส้นแนวโน้ม (R²) ${forecast.rSquared.toFixed(2)} · ช่วงความเชื่อมั่นประมาณ 95%`
                : 'แนวโน้มยังไม่ชัด เพราะข้อมูลยังน้อย · ช่วงความเชื่อมั่นประมาณ 95%'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
