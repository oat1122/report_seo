'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts'
import { AnimatedNumber } from '@/components/motion'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeAiOverviewWeeklyCounts } from '../lib/historyCalculations'
import { ChartTooltipRow, DARK_TOOLTIP_CLASS } from '../keywords/ChartTooltipRow'
import { ReportCard } from '../keywords/ReportCard'
import { SummaryNote } from '../keywords/SummaryNote'
import { coverageTrend } from '../keywords/keyword-view'

interface AiOverviewTimelineBarProps {
  aiOverviews: Array<{ displayDate: string | Date }>
  weeks?: number
}

const chartConfig = buildChartConfig([
  { key: 'count', label: 'AI Overview', color: 'var(--accent)' },
])

const TREND_WINDOW = 4

const fmtWeek = (d: Date) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

// แท่งรายสัปดาห์ · แท่งล่าสุดเข้ม (chart-1) ที่เหลือม่วงอ่อน · ค่าบนหัวแท่ง (UI Kit Data viz 03)
export const AiOverviewTimelineBar = ({ aiOverviews, weeks = 12 }: AiOverviewTimelineBarProps) => {
  const data = useMemo(
    () =>
      computeAiOverviewWeeklyCounts(aiOverviews, weeks).map((w) => ({
        ...w,
        tick: fmtWeek(w.weekStart),
      })),
    [aiOverviews, weeks],
  )

  const totalCount = data.reduce((sum, w) => sum + w.count, 0)
  const hasData = data.filter((w) => w.count > 0).length >= 1
  const trend = coverageTrend(
    data.map((w) => w.count),
    TREND_WINDOW,
  )
  const lastIdx = data.length - 1

  const summary =
    trend.direction === 'up'
      ? 'ถูก AI หยิบบ่อยขึ้น'
      : trend.direction === 'down'
        ? 'ถูก AI หยิบน้อยลง'
        : 'ถูก AI หยิบใกล้เคียงเดิม'

  return (
    <ReportCard
      title="AI Overview Coverage"
      description={`การถูก AI Search หยิบขึ้นมา · ${weeks} สัปดาห์ล่าสุด · รวม ${totalCount} ครั้ง`}
      action={
        hasData ? (
          <dl className="hidden gap-6 sm:flex">
            <div className="flex flex-col items-end gap-0.5">
              <dt className="text-text-secondary text-xs">สัปดาห์นี้</dt>
              <dd className="text-xl font-semibold">
                <AnimatedNumber value={trend.thisWeek} className="tabular-nums" /> ครั้ง
              </dd>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <dt className="text-text-secondary text-xs">{TREND_WINDOW} สัปดาห์ล่าสุด</dt>
              <dd className="text-xl font-semibold">
                <AnimatedNumber value={trend.recent} className="tabular-nums" /> ครั้ง
              </dd>
            </div>
          </dl>
        ) : undefined
      }
    >
      {!hasData ? (
        <ChartEmptyState message="ยังไม่มี AI Overview ที่บันทึก" height="200px" />
      ) : (
        <>
          <ChartContainer config={chartConfig} className="h-[190px] w-full">
            <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="tick"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval={0}
                tickMargin={8}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(value: string, index: number) =>
                  index === lastIdx || index % 4 === 0 ? value : ''
                }
              />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', fillOpacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    className={DARK_TOOLTIP_CLASS}
                    labelFormatter={(_l, payload) => {
                      const d = payload?.[0]?.payload?.weekStart
                      return d instanceof Date ? `สัปดาห์ที่เริ่ม ${fmtWeek(d)}` : ''
                    }}
                    formatter={(v) => (
                      <ChartTooltipRow
                        color="var(--chart-1)"
                        label="AI Overview"
                        value={`${v} ครั้ง`}
                      />
                    )}
                  />
                }
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} minPointSize={2} animationDuration={800}>
                {data.map((w, idx) => (
                  <Cell
                    key={w.weekLabel}
                    fill={idx === lastIdx ? 'var(--chart-1)' : 'var(--accent)'}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={6}
                  fontSize={11}
                  fill="var(--text-secondary)"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <SummaryNote>
            {summary} — <strong className="font-semibold tabular-nums">{trend.recent} ครั้ง</strong>{' '}
            ใน {TREND_WINDOW} สัปดาห์ล่าสุด เทียบกับ{' '}
            <span className="tabular-nums">{trend.early}</span> ครั้งใน {TREND_WINDOW} สัปดาห์แรก
          </SummaryNote>
        </>
      )}
    </ReportCard>
  )
}
