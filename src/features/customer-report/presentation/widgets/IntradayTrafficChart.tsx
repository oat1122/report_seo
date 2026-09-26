'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ReportCardHeader } from '../components/ReportCardHeader'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeIntradayTraffic, localDayKey } from '../lib/historyCalculations'
import { formatTimeTH } from '../lib/formatters'
import { useHistoryContext } from '../contexts/HistoryContext'

const chartConfig = buildChartConfig([
  { key: 'actual', label: 'จำนวนจริง', color: 'var(--chart-1)' },
  { key: 'forecast', label: 'คาดการณ์', color: 'var(--chart-2)' },
])

const nf = new Intl.NumberFormat('th-TH')
const fmtHour = (h: number): string => `${String(h).padStart(2, '0')}:00`
const TICK_MS = 5000

interface IntradayChartPoint {
  label: string
  actual: number | null
  forecast: number
  isLeading: boolean
}

/** จุด pulsing ที่หัวเส้น "ตอนนี้" — วาดเฉพาะจุด leading (ชั่วโมงปัจจุบัน) */
const makeLeadingDot = (animate: boolean) => {
  const LeadingDot = (props: unknown): React.ReactElement => {
    const { cx, cy, index, payload } = props as {
      cx?: number
      cy?: number
      index?: number
      payload?: IntradayChartPoint
    }
    const key = `lead-${index ?? 0}`
    if (cx == null || cy == null || !payload?.isLeading) return <g key={key} />
    return (
      <g key={key}>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="var(--chart-1)"
          stroke="var(--background)"
          strokeWidth={2}
        />
        {animate && (
          <circle cx={cx} cy={cy} r={5} fill="none" stroke="var(--chart-1)" strokeWidth={2}>
            <animate attributeName="r" values="5;13" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    )
  }
  LeadingDot.displayName = 'IntradayLeadingDot'
  return LeadingDot
}

export const IntradayTrafficChart = ({ className }: { className?: string }) => {
  const { metricsHistory } = useHistoryContext()
  const [nowMs, setNowMs] = useState(() => Date.now())
  // เคารพ prefers-reduced-motion — หยุด ticker + pulse ทั้งหมด
  const reduced = useReducedMotion() ?? false
  const gradientId = `intraday-fill-${useId().replace(/:/g, '')}`

  // live ticker — timer ตัวเดียว, cleanup เสมอ, หยุดเมื่อ reduced-motion
  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setNowMs(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [reduced])

  // เป้าหมายของวัน (seed ต่อวัน) — คงที่ทั้งวัน ไม่ recompute ทุก tick
  const dayKey = localDayKey(new Date(nowMs))
  const base = useMemo(
    () => computeIntradayTraffic(metricsHistory, dayKey),
    [metricsHistory, dayKey],
  )

  // ชั่วโมงปัจจุบัน "ไต่ขึ้นแบบสะสม" ตามนาทีจริง — monotonic ไม่ลดลง (traffic ทยอยเข้า)
  const view = useMemo(() => {
    const nowHour = new Date(nowMs).getHours()
    if (!base.hasData) return { points: [] as IntradayChartPoint[], nowHour }
    const now = new Date(nowMs)
    const minuteFrac = (now.getMinutes() * 60 + now.getSeconds()) / 3600
    const points: IntradayChartPoint[] = base.actualByHour.map((target, h) => {
      let actual: number | null = null
      let isLeading = false
      if (h < nowHour) {
        actual = target
      } else if (h === nowHour) {
        actual = target * minuteFrac
        isLeading = true
      }
      return { label: fmtHour(h), actual, forecast: base.forecastByHour[h], isLeading }
    })
    return { points, nowHour }
  }, [base, nowMs])

  const ariaSummary = base.hasData
    ? `กราฟการเข้าชมรายชั่วโมงวันนี้แบบเรียลไทม์ จำนวนจริงรวมทั้งวัน ${nf.format(
        base.total,
      )} ครั้ง พีคช่วง ${fmtHour(base.peakHour)} เทียบกับเส้นคาดการณ์`
    : 'กราฟการเข้าชมรายชั่วโมงวันนี้ — ยังไม่มีข้อมูล'

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="การเข้าชมรายชั่วโมง · วันนี้"
        description={
          base.hasData
            ? `จำนวนจริงเทียบเส้นคาดการณ์ตลอดวัน · ช่วงที่คนเข้าเยอะสุดคือ ${fmtHour(base.peakHour)} น.`
            : 'จะแสดงเมื่อมีค่า Organic Traffic ในรายงาน'
        }
        action={
          base.hasData ? (
            <span className="border-glass-border inline-flex h-8 items-center gap-2 rounded-full border bg-white/70 px-3 dark:bg-white/5">
              <span className="relative flex size-2.5" aria-hidden="true">
                {!reduced && (
                  <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-75 [animation-duration:2.2s]" />
                )}
                <span className="bg-destructive relative inline-flex size-2.5 rounded-full" />
              </span>
              <span className="text-xs font-semibold tracking-[0.14em] uppercase">Live</span>
            </span>
          ) : null
        }
      />
      <CardContent className="flex flex-col gap-3">
        {!base.hasData ? (
          <ChartEmptyState
            message="ยังไม่มีค่า Organic Traffic สำหรับจำลองการเข้าชม"
            height="240px"
          />
        ) : (
          <>
            <div role="img" aria-label={ariaSummary}>
              <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                <AreaChart data={view.points} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
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
                    interval={3}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={36}
                    allowDecimals={false}
                    tickFormatter={(v) => nf.format(Number(v))}
                  />
                  <ReferenceLine
                    x={fmtHour(view.nowHour)}
                    stroke="var(--neon-pink)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value: formatTimeTH(nowMs),
                      position: view.nowHour >= 12 ? 'insideTopLeft' : 'insideTopRight',
                      fill: 'var(--text-secondary)',
                      fontSize: 11,
                    }}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 4', stroke: 'var(--chart-3)' }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          if (value == null) return []
                          const label = name === 'actual' ? 'จำนวนจริง' : 'คาดการณ์'
                          return [`${nf.format(Math.round(Number(value)))} ครั้ง`, label]
                        }}
                      />
                    }
                  />
                  {/* คาดการณ์ — เส้นประ ทอดทั้งวัน (วาดก่อนเพื่อให้จำนวนจริงอยู่ด้านบน) */}
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke="var(--color-forecast)"
                    strokeWidth={2.5}
                    strokeDasharray="6 5"
                    fill="none"
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* จำนวนจริง — เส้นทึบ หยุดที่ "ตอนนี้" + จุด pulsing ที่หัวเส้น */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--color-actual)"
                    strokeWidth={3}
                    fill={`url(#${gradientId})`}
                    dot={makeLeadingDot(!reduced)}
                    activeDot={{
                      r: 5,
                      fill: 'var(--color-actual)',
                      stroke: 'var(--background)',
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="text-text-secondary flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="bg-chart-1 h-[3px] w-4 rounded-full" />
                จำนวนจริง
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="border-chart-2 w-4 border-t-2 border-dashed" />
                คาดการณ์
              </span>
              <span className="ml-auto">หน่วย: ครั้ง/ชั่วโมง</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
