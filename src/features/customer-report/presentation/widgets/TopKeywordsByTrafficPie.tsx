'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeTrafficContribution } from '../lib/historyCalculations'
import { ChartTooltipRow, DARK_TOOLTIP_CLASS } from '../keywords/ChartTooltipRow'
import { ReportCard } from '../keywords/ReportCard'
import { SummaryNote } from '../keywords/SummaryNote'
import { formatNumber } from '../lib/formatters'

interface TopKeywordsByTrafficPieProps {
  keywords: Array<{ keyword: string; traffic: number }>
  topN?: number
}

// ลำดับสี series ตาม UI Kit (chart-4 เขียวแบรนด์ใช้เป็น fill ได้) · "อื่น ๆ" = เทา
const SLICE_COLORS = [
  'var(--chart-1)',
  'var(--chart-3)',
  'var(--chart-2)',
  'var(--chart-5)',
  'var(--chart-4)',
] as const
const OTHER_COLOR = 'var(--border)'

const formatTraffic = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toString()
}

export const TopKeywordsByTrafficPie = ({ keywords, topN = 5 }: TopKeywordsByTrafficPieProps) => {
  const data = useMemo(() => {
    const items = computeTrafficContribution(keywords, topN)
    return items.map((item, idx) => ({
      keyword: item.keyword,
      label: item.isOther ? item.keyword.replace(/^Other/, 'อื่น ๆ') : item.keyword,
      traffic: item.traffic,
      pct: item.pct,
      isOther: item.isOther,
      color: item.isOther ? OTHER_COLOR : SLICE_COLORS[idx % SLICE_COLORS.length],
    }))
  }, [keywords, topN])

  const total = data.reduce((sum, d) => sum + d.traffic, 0)
  const topShare = data.filter((d) => !d.isOther).reduce((sum, d) => sum + d.pct, 0)
  const topCount = data.filter((d) => !d.isOther).length

  const chartConfig = useMemo(
    () => buildChartConfig(data.map((d) => ({ key: d.keyword, label: d.label, color: d.color }))),
    [data],
  )

  return (
    <ReportCard
      title={`Top ${topN} by Traffic`}
      description="สัดส่วน traffic ที่มาจาก top keywords + อื่น ๆ"
    >
      {data.length === 0 ? (
        <p className="text-text-secondary py-8 text-center text-sm">ยังไม่มี traffic</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative size-[140px] shrink-0">
              <ChartContainer config={chartConfig} className="aspect-square size-[140px]">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        className={DARK_TOOLTIP_CLASS}
                        formatter={(value, _n, item) => {
                          const p = item.payload as { label: string; pct: number; color: string }
                          return (
                            <ChartTooltipRow
                              color={p.color}
                              label={p.label}
                              value={`${formatTraffic(Number(value))} (${p.pct.toFixed(1)}%)`}
                            />
                          )
                        }}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="traffic"
                    nameKey="keyword"
                    innerRadius={52}
                    outerRadius={68}
                    paddingAngle={data.length > 1 ? 2 : 0}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    animationDuration={800}
                  >
                    {data.map((d) => (
                      <Cell key={d.keyword} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-tight">
                <span className="text-xl font-semibold tabular-nums">{formatTraffic(total)}</span>
                <span className="text-text-secondary text-[11px]">traffic รวม</span>
              </div>
            </div>

            <ul className="flex w-full min-w-0 flex-1 flex-col gap-2">
              {data.map((d) => (
                <li
                  key={d.keyword}
                  className="flex items-center justify-between gap-2 text-[13px] tabular-nums"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-[3px]"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate" title={d.label}>
                      {d.label}
                    </span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap">
                    <strong className="font-semibold">{formatNumber(d.traffic)}</strong>{' '}
                    <span className="text-text-secondary">({d.pct.toFixed(0)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <SummaryNote className="mt-auto">
            Top {topCount} คำสร้าง{' '}
            <strong className="font-semibold tabular-nums">{topShare.toFixed(0)}%</strong> ของ
            traffic ทั้งหมด
          </SummaryNote>
        </>
      )}
    </ReportCard>
  )
}
