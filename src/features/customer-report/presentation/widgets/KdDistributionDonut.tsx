'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { AnimatedNumber } from '@/components/motion'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { buildChartConfig } from '../lib/buildChartConfig'
import { groupKeywordsByKd, type KdLevelString } from '../lib/historyCalculations'
import { ChartTooltipRow, DARK_TOOLTIP_CLASS } from '../keywords/ChartTooltipRow'
import { ReportCard } from '../keywords/ReportCard'
import { SummaryNote } from '../keywords/SummaryNote'
import { KD_ORDER, KD_STYLE } from '../keywords/keyword-view'

interface KdItem {
  kd: KdLevelString | string
}

interface KdDistributionDonutProps {
  keywords: KdItem[]
  title?: string
  description?: string
  /** ป้ายใต้ตัวเลขกลาง donut */
  centerLabel?: string
  /** dominant = บอกระดับที่มากที่สุด · quick-wins = % ที่ทำได้เร็ว (ง่าย + ปานกลาง) */
  summary?: 'dominant' | 'quick-wins'
}

const chartConfig = buildChartConfig(
  KD_ORDER.map((level) => ({
    key: level,
    label: KD_STYLE[level].label,
    color: KD_STYLE[level].chart,
  })),
)

const pctOf = (n: number, total: number) => (total === 0 ? 0 : Math.round((n / total) * 100))

export const KdDistributionDonut = ({
  keywords,
  title = 'KD Distribution',
  description = 'ความยากของ keyword ปัจจุบัน',
  centerLabel = 'keywords',
  summary = 'dominant',
}: KdDistributionDonutProps) => {
  const dist = useMemo(() => groupKeywordsByKd(keywords), [keywords])
  const data = useMemo(
    () =>
      KD_ORDER.map((level) => ({
        name: level,
        label: KD_STYLE[level].label,
        value: dist[level],
        color: KD_STYLE[level].chart,
      })).filter((d) => d.value > 0),
    [dist],
  )

  const dominant = KD_ORDER.reduce((a, b) => (dist[b] > dist[a] ? b : a))
  const quickWinPct = pctOf(dist.EASY + dist.MEDIUM, dist.total)

  return (
    <ReportCard title={title} description={description}>
      {dist.total === 0 ? (
        <p className="text-text-secondary py-8 text-center text-sm">ยังไม่มี keyword</p>
      ) : (
        <>
          <div className="flex items-center gap-5">
            <div className="relative size-28 shrink-0">
              <ChartContainer config={chartConfig} className="aspect-square size-28">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        className={DARK_TOOLTIP_CLASS}
                        formatter={(value, _name, item) => {
                          const p = item.payload as { label: string; color: string }
                          return (
                            <ChartTooltipRow
                              color={p.color}
                              label={p.label}
                              value={`${value} คำ (${pctOf(Number(value), dist.total)}%)`}
                            />
                          )
                        }}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={56}
                    paddingAngle={data.length > 1 ? 2 : 0}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    animationDuration={800}
                  >
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-tight">
                <AnimatedNumber
                  value={dist.total}
                  className="text-2xl font-semibold tabular-nums"
                />
                <span className="text-text-secondary text-[11px]">{centerLabel}</span>
              </div>
            </div>

            <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
              {KD_ORDER.map((level) => (
                <li
                  key={level}
                  className="flex items-center justify-between gap-2 text-[13px] tabular-nums"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn('size-2.5 rounded-[3px]', KD_STYLE[level].fill)}
                    />
                    {KD_STYLE[level].label}
                  </span>
                  <span className="whitespace-nowrap">
                    <strong className="font-semibold">{dist[level]} คำ</strong>{' '}
                    <span className="text-text-secondary">({pctOf(dist[level], dist.total)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <SummaryNote className="mt-auto">
            {summary === 'quick-wins' ? (
              <>
                <strong className="font-semibold tabular-nums">{quickWinPct}%</strong> ทำได้เร็ว
                (ง่าย + ปานกลาง)
              </>
            ) : (
              <>
                ส่วนใหญ่เป็นคำระดับ{KD_STYLE[dominant].label} —{' '}
                <strong className="font-semibold tabular-nums">
                  {pctOf(dist[dominant], dist.total)}%
                </strong>{' '}
                ของทั้งหมด
              </>
            )}
          </SummaryNote>
        </>
      )}
    </ReportCard>
  )
}
