'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface MiniBarChartProps {
  /** ค่าเรียงเก่า → ใหม่ */
  values: number[]
  className?: string
}

/** แท่งเล็กใน KPI card — แกนเริ่มที่ 0, ครึ่งหลังเข้มขึ้น, แท่งล่าสุดเข้มสุด */
export function MiniBarChart({ values, className }: MiniBarChartProps) {
  if (values.length === 0) return null
  const data = values.map((v, i) => ({ i, v }))
  const last = data.length - 1

  return (
    <div className={cn('h-11 w-24', className)} aria-hidden>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 96, height: 44 }}>
        <BarChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <YAxis hide domain={[0, 'dataMax']} />
          <Bar dataKey="v" radius={[2, 2, 0, 0]} animationDuration={800}>
            {data.map((d) => (
              <Cell
                key={d.i}
                fill={
                  d.i === last
                    ? 'var(--chart-1)'
                    : d.i >= data.length / 2
                      ? 'var(--chart-3)'
                      : 'var(--accent)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
