'use client'

import { useMemo } from 'react'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeKdSuccessRate, type KdLevelString } from '../lib/historyCalculations'

interface KdItem {
  kd: KdLevelString | string
  position: number | null
}

interface KdSuccessRateBarProps {
  keywords: KdItem[]
  topN?: number
}

const KD_COLORS: Record<KdLevelString, string> = {
  HARD: 'var(--destructive)',
  MEDIUM: 'var(--warning)',
  EASY: 'var(--success)',
}
const KD_LABELS: Record<KdLevelString, string> = {
  HARD: 'ยาก (HARD)',
  MEDIUM: 'ปานกลาง (MEDIUM)',
  EASY: 'ง่าย (EASY)',
}

const chartConfig = buildChartConfig([{ key: 'rate', label: 'Top 10 %', color: 'var(--info)' }])

export const KdSuccessRateBar = ({ keywords, topN = 10 }: KdSuccessRateBarProps) => {
  const rows = useMemo(() => {
    const rates = computeKdSuccessRate(keywords, topN)
    return rates.map((r) => ({
      level: r.level,
      label: KD_LABELS[r.level],
      pct: Math.round(r.rate * 100),
      inTopN: r.inTopN,
      total: r.total,
      color: KD_COLORS[r.level],
    }))
  }, [keywords, topN])

  const hasAny = rows.some((r) => r.total > 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">KD Success Rate</CardTitle>
        <p className="text-muted-foreground text-xs">% keyword ที่ติด Top {topN} แยกตามความยาก</p>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-muted-foreground py-8 text-center text-sm">ยังไม่มี keyword</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 64, left: 8, bottom: 4 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="label"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={130}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(_v, _n, item) => {
                      const p = item.payload as {
                        label: string
                        inTopN: number
                        total: number
                        pct: number
                      }
                      return [`${p.inTopN} / ${p.total} (${p.pct}%)`, p.label]
                    }}
                  />
                }
              />
              <Bar
                dataKey="pct"
                radius={[0, 4, 4, 0]}
                barSize={20}
                label={{
                  position: 'right',
                  formatter: (v) => (v == null ? '' : `${v}%`),
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {rows.map((r) => (
                  <Cell key={r.level} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
