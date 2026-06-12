'use client'

import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Activity } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeIntradayTraffic, localDayKey } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'

const chartConfig = buildChartConfig([
  { key: 'actual', label: 'จำนวนจริง', color: 'var(--success)' },
  { key: 'forecast', label: 'คาดการณ์', color: 'var(--info)' },
])

const nf = new Intl.NumberFormat('th-TH')
const fmtHour = (h: number): string => `${String(h).padStart(2, '0')}:00`
/** เวลาจริงรูปแบบไทย เช่น "16.35 น." */
const fmtClock = (ms: number): string => {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} น.`
}
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
        <circle cx={cx} cy={cy} r={4} fill="var(--success)" />
        {animate && (
          <circle cx={cx} cy={cy} r={4} fill="none" stroke="var(--success)" strokeWidth={2}>
            <animate attributeName="r" values="4;12" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    )
  }
  LeadingDot.displayName = 'IntradayLeadingDot'
  return LeadingDot
}

export const IntradayTrafficChart = () => {
  const { metricsHistory } = useHistoryContext()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [reduced, setReduced] = useState(false)

  // เคารพ prefers-reduced-motion — ปิดการขยับทั้งหมดถ้าผู้ใช้ตั้งค่าไว้
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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
  // ค่อย ๆ เพิ่มจาก 0 → เป้าหมายของชั่วโมง เมื่อหมดชั่วโมง ไม่มี random/wobble
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
    <div
      className="border-border rounded-2xl border p-4 md:p-6"
      role="img"
      aria-label={ariaSummary}
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-success size-5" aria-hidden="true" />
            การเข้าชมรายชั่วโมง · วันนี้
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            จำนวนจริงเทียบกับเส้นคาดการณ์ตลอดวัน — อัปเดตชั่วโมงปัจจุบันแบบเรียลไทม์ พีคช่วง{' '}
            {fmtHour(base.peakHour)}
          </p>
        </div>
        {base.hasData && (
          <div className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <span className="relative flex size-2.5" aria-hidden="true">
              {!reduced && (
                <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-75 [animation-duration:2.2s]" />
              )}
              <span className="bg-destructive relative inline-flex size-2.5 rounded-full" />
            </span>
            <span className="text-sm font-bold tracking-wide uppercase">LIVE</span>
          </div>
        )}
      </div>

      {!base.hasData ? (
        <ChartEmptyState
          message="ยังไม่มีค่า Organic Traffic สำหรับจำลองการเข้าชม"
          height="260px"
        />
      ) : (
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={view.points} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="intradayActualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              width={36}
              allowDecimals={false}
              tickFormatter={(v) => nf.format(Number(v))}
            />
            <ReferenceLine
              x={fmtHour(view.nowHour)}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{
                value: fmtClock(nowMs),
                position: view.nowHour >= 12 ? 'insideTopLeft' : 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 10,
              }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
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
              stroke="var(--info)"
              strokeWidth={2}
              strokeDasharray="5 4"
              strokeOpacity={0.8}
              fill="var(--info)"
              fillOpacity={0.05}
              dot={false}
              isAnimationActive={false}
            />
            {/* จำนวนจริง — เส้นทึบ หยุดที่ "ตอนนี้" + จุด pulsing ที่หัวเส้น */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--success)"
              strokeWidth={2}
              fill="url(#intradayActualFill)"
              dot={makeLeadingDot(!reduced)}
              activeDot={{
                r: 4,
                fill: 'var(--success)',
                stroke: 'var(--background)',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </AreaChart>
        </ChartContainer>
      )}

      {base.hasData && (
        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-success h-0.5 w-4" />
            จำนวนจริง
          </span>
          <span className="flex items-center gap-1.5">
            <span className="border-info h-0.5 w-4 border-t-2 border-dashed" />
            คาดการณ์
          </span>
          <span className="ml-auto">หน่วย: ครั้ง/ชั่วโมง</span>
        </div>
      )}
    </div>
  )
}
