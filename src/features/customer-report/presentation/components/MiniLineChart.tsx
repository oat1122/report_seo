'use client'

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface MiniLineChartProps {
  /** ค่าเรียงเก่า → ใหม่ */
  values: number[]
  /** ค่าน้อย = ดี (เช่น อันดับ) → กลับแกนให้เส้นขึ้น = ดีขึ้น */
  invert?: boolean
  className?: string
}

/** Sparkline ใน KPI card — เส้น chart-1 + จุดล่าสุดเขียวแบรนด์ */
export function MiniLineChart({ values, invert = false, className }: MiniLineChartProps) {
  if (values.length < 2) return null
  const data = values.map((v, i) => ({ i, v }))
  const last = data.length - 1

  return (
    <div className={cn('h-10 w-24', className)} aria-hidden>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 96, height: 40 }}>
        <LineChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 2 }}>
          <YAxis hide reversed={invert} domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="v"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            strokeLinecap="round"
            activeDot={false}
            animationDuration={800}
            dot={(props: { cx?: number; cy?: number; index?: number }) => {
              const key = `mini-dot-${props.index ?? 0}`
              if (props.index !== last || props.cx == null || props.cy == null) {
                return <g key={key} />
              }
              return (
                <circle
                  key={key}
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill="var(--chart-4)"
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              )
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
