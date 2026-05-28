'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeAiOverviewWeeklyCounts } from '../lib/historyCalculations'

interface AiOverviewTimelineBarProps {
  aiOverviews: Array<{ displayDate: string | Date }>
  weeks?: number
}

const chartConfig = buildChartConfig([
  { key: 'count', label: 'AI Overview', color: 'var(--accent)' },
])

export const AiOverviewTimelineBar = ({ aiOverviews, weeks = 12 }: AiOverviewTimelineBarProps) => {
  const data = useMemo(
    () => computeAiOverviewWeeklyCounts(aiOverviews, weeks),
    [aiOverviews, weeks],
  )

  const totalCount = data.reduce((sum, w) => sum + w.count, 0)
  const hasData = data.filter((w) => w.count > 0).length >= 1

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">AI Overview Coverage</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          การถูก AI Search หยิบขึ้นมา · {weeks} สัปดาห์ล่าสุด · รวม{' '}
          <span className="text-foreground font-semibold">{totalCount}</span> ครั้ง
        </p>
      </div>
      <div>
        {!hasData ? (
          <ChartEmptyState message="ยังไม่มี AI Overview ที่บันทึก" height="200px" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 10 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                width={30}
              />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', fillOpacity: 0.3 }}
                content={<ChartTooltipContent formatter={(v) => [`${v} ครั้ง`, 'AI Overview']} />}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
