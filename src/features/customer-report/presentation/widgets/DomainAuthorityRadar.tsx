'use client'

import { useMemo } from 'react'
import { Globe } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeAuthorityRadar, type AuthorityRadarPoint } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ReportCardHeader } from '../components/ReportCardHeader'

const chartConfig = buildChartConfig([
  { key: 'current', label: 'ปัจจุบัน', color: 'var(--chart-1)' },
  { key: 'previous', label: 'ก่อนหน้า', color: 'var(--muted-foreground)' },
])

/** ประโยคสรุป: มิติที่โต/ลดมากสุด (หน่วยคะแนน 0–100) */
const summarize = (data: AuthorityRadarPoint[]): string | null => {
  const diffs = data
    .filter((d) => d.previous !== null)
    .map((d) => ({ axis: d.axis, diff: Math.round(d.current - (d.previous ?? 0)) }))
  if (diffs.length === 0) return null
  const ups = diffs.filter((d) => d.diff > 0).sort((a, b) => b.diff - a.diff)
  const downs = diffs.filter((d) => d.diff < 0).sort((a, b) => a.diff - b.diff)
  if (ups.length === 0 && downs.length === 0) return 'ทุกมิติเท่าเดิม'
  const upText = ups
    .slice(0, 2)
    .map((d) => `${d.axis} +${d.diff}`)
    .join(' และ ')
  const downText = downs
    .slice(0, 2)
    .map((d) => `${d.axis} ${d.diff}`)
    .join(' และ ')
  if (downs.length === 0) return `ขยายออกทุกด้านที่เปลี่ยน · โตมากสุดคือ ${upText}`
  if (ups.length === 0) return `หดลง · ลดมากสุดคือ ${downText}`
  return `โตมากสุดคือ ${upText} · ลดลงคือ ${downText}`
}

// Radar 5 axes — Ahrefs-style domain health snapshot.
// แกน current = synthetic current (metricsHistory[0]) จาก context — single source ตาม rule 11
export const DomainAuthorityRadar = ({ className }: { className?: string }) => {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()

  const data = useMemo(() => {
    const current = metricsHistory[0]
    if (!current) return []
    return computeAuthorityRadar(current, metricsHistory, period)
  }, [metricsHistory, period])

  const hasPrevious = data.some((d) => d.previous !== null)
  const summary = useMemo(() => summarize(data), [data])

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Domain Authority"
        icon={<Globe />}
        description={`5 มิติ (0–100) ยิ่งกว้างยิ่งแข็งแรง · เทียบ ${period} วันก่อน`}
      />
      <CardContent className="flex flex-1 flex-col gap-3">
        {data.length === 0 ? (
          <ChartEmptyState message="ยังไม่มีข้อมูล Domain Metrics" height="280px" />
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[340px]"
            >
              <RadarChart data={data} outerRadius="74%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name, item) => {
                        const payload = item.payload as {
                          axis: string
                          rawCurrent: number
                          rawPrevious: number | null
                        }
                        const isCurrent = name === 'current'
                        const raw = isCurrent ? payload.rawCurrent : payload.rawPrevious
                        const label = isCurrent ? 'ปัจจุบัน' : `${period} วันก่อน`
                        return [
                          `${payload.axis}: ${raw ?? '—'} (คะแนน ${Number(value).toFixed(0)}/100)`,
                          label,
                        ]
                      }}
                    />
                  }
                />
                {hasPrevious && (
                  <Radar
                    name="previous"
                    dataKey="previous"
                    stroke="var(--color-previous)"
                    strokeDasharray="5 4"
                    fill="none"
                    strokeWidth={1.5}
                    animationDuration={800}
                  />
                )}
                <Radar
                  name="current"
                  dataKey="current"
                  stroke="var(--color-current)"
                  fill="var(--chart-3)"
                  fillOpacity={0.45}
                  strokeWidth={2}
                  animationDuration={800}
                />
              </RadarChart>
            </ChartContainer>

            <ul className="text-text-secondary flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              <li className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="border-chart-1 bg-chart-3/45 h-2.5 w-3.5 rounded-[3px] border-[1.5px]"
                />
                ปัจจุบัน
              </li>
              {hasPrevious && (
                <li className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="border-muted-foreground w-4 border-t-2 border-dashed"
                  />
                  {period} วันก่อน
                </li>
              )}
            </ul>
            <p className="bg-info-subtle mt-auto rounded-xl px-3 py-2.5 text-[13px]">
              {summary ??
                'ยังไม่มีข้อมูลย้อนหลังให้เทียบ — เส้นเปรียบเทียบจะแสดงเมื่อมีข้อมูลครบช่วง'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
