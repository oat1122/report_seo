'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeKeywordVelocity, type VelocityQuadrant } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { ChartTooltipRow, DARK_TOOLTIP_CLASS } from '../keywords/ChartTooltipRow'
import { ReportCard } from '../keywords/ReportCard'

const QUADRANT_COLOR: Record<VelocityQuadrant, string> = {
  rising: 'var(--chart-2)',
  hidden: 'var(--chart-1)',
  cooling: 'var(--chart-5)',
  falling: 'var(--destructive)',
  stagnant: 'var(--muted-foreground)',
}

const QUADRANT_LABEL: Record<VelocityQuadrant, string> = {
  rising: 'Rising Star',
  hidden: 'Hidden Gem',
  cooling: 'Cooling',
  falling: 'Falling',
  stagnant: 'Stagnant',
}

const LEGEND_ORDER: VelocityQuadrant[] = ['rising', 'hidden', 'cooling', 'falling']

const AXIS_TICK = { fontSize: 11, fill: 'var(--muted-foreground)' }
const QUADRANT_TEXT = { fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }

const chartConfig = buildChartConfig([
  { key: 'points', label: 'Keywords', color: 'var(--chart-1)' },
])

export const KeywordVelocityScatter = () => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const allPoints = useMemo(
    () => computeKeywordVelocity(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )

  // Cap top 30 by combined absolute delta
  const points = useMemo(() => {
    if (allPoints.length <= 30) return allPoints
    return [...allPoints]
      .sort(
        (a, b) =>
          Math.abs(b.positionDelta) +
          Math.abs(b.trafficDelta) -
          (Math.abs(a.positionDelta) + Math.abs(a.trafficDelta)),
      )
      .slice(0, 30)
  }, [allPoints])

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    if (points.length === 0) return { xMin: -10, xMax: 10, yMin: -100, yMax: 100 }
    const xs = points.map((p) => p.positionDelta)
    const ys = points.map((p) => p.trafficDelta)
    const xMaxAbs = Math.max(...xs.map(Math.abs), 1)
    const yMaxAbs = Math.max(...ys.map(Math.abs), 1)
    return {
      xMin: -xMaxAbs * 1.1,
      xMax: xMaxAbs * 1.1,
      yMin: -yMaxAbs * 1.1,
      yMax: yMaxAbs * 1.1,
    }
  }, [points])

  const quadrantCounts = useMemo(() => {
    const counts: Record<VelocityQuadrant, number> = {
      rising: 0,
      hidden: 0,
      cooling: 0,
      falling: 0,
      stagnant: 0,
    }
    points.forEach((p) => (counts[p.quadrant] += 1))
    return counts
  }, [points])

  const description =
    points.length === 0
      ? 'X = อันดับที่เปลี่ยน (← ดีขึ้น) · Y = traffic ที่เปลี่ยน (↑ ดีขึ้น)'
      : `Rising Star (อันดับและ traffic ดีขึ้นพร้อมกัน) ${quadrantCounts.rising} คำ · Falling ${quadrantCounts.falling} คำ · ระยะ ${period} วัน`

  return (
    <ReportCard title="Keyword Velocity" description={description}>
      {points.length === 0 ? (
        <ChartEmptyState
          message="ยังไม่มี keyword ที่ขยับมากพอ — ต้องมี history ≥ 2 รอบ"
          height="320px"
        />
      ) : (
        <>
          <ChartContainer config={chartConfig} className="h-[300px] w-full md:h-[340px]">
            <ScatterChart margin={{ top: 12, right: 12, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" />

              {/* Quadrant tints — rendered before scatter so points sit on top */}
              <ReferenceArea
                x1={xMin}
                x2={0}
                y1={0}
                y2={yMax}
                fill={QUADRANT_COLOR.rising}
                fillOpacity={0.07}
                label={{
                  value: QUADRANT_LABEL.rising,
                  position: 'insideTopLeft',
                  ...QUADRANT_TEXT,
                }}
              />
              <ReferenceArea
                x1={0}
                x2={xMax}
                y1={0}
                y2={yMax}
                fill={QUADRANT_COLOR.hidden}
                fillOpacity={0.06}
                label={{
                  value: QUADRANT_LABEL.hidden,
                  position: 'insideTopRight',
                  ...QUADRANT_TEXT,
                }}
              />
              <ReferenceArea
                x1={xMin}
                x2={0}
                y1={yMin}
                y2={0}
                fill={QUADRANT_COLOR.cooling}
                fillOpacity={0.06}
                label={{
                  value: QUADRANT_LABEL.cooling,
                  position: 'insideBottomLeft',
                  ...QUADRANT_TEXT,
                }}
              />
              <ReferenceArea
                x1={0}
                x2={xMax}
                y1={yMin}
                y2={0}
                fill={QUADRANT_COLOR.falling}
                fillOpacity={0.06}
                label={{
                  value: QUADRANT_LABEL.falling,
                  position: 'insideBottomRight',
                  ...QUADRANT_TEXT,
                }}
              />

              <ReferenceLine x={0} stroke="var(--muted-foreground)" strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.5} />

              <XAxis
                type="number"
                dataKey="positionDelta"
                domain={[xMin, xMax]}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickFormatter={(v: number) => Math.round(v).toString()}
                label={{
                  value: 'Δ Position',
                  position: 'insideBottom',
                  offset: -12,
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="trafficDelta"
                domain={[yMin, yMax]}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                width={48}
                tickFormatter={(v: number) => Math.round(v).toLocaleString('th-TH')}
              />
              <ZAxis range={[90, 90]} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 5' }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className={DARK_TOOLTIP_CLASS}
                    formatter={(_v, _n, item) => {
                      const p = item.payload as {
                        keyword: string
                        positionDelta: number
                        trafficDelta: number
                        quadrant: VelocityQuadrant
                      }
                      const posLabel =
                        p.positionDelta < 0
                          ? `↑ ${Math.abs(p.positionDelta)}`
                          : p.positionDelta > 0
                            ? `↓ ${p.positionDelta}`
                            : '—'
                      const trafLabel =
                        p.trafficDelta > 0
                          ? `+${p.trafficDelta.toLocaleString('th-TH')}`
                          : p.trafficDelta.toLocaleString('th-TH')
                      return (
                        <div className="flex w-full flex-col gap-1">
                          <span className="font-medium text-white">{p.keyword}</span>
                          <ChartTooltipRow
                            color={QUADRANT_COLOR[p.quadrant]}
                            label={QUADRANT_LABEL[p.quadrant]}
                            value={`อันดับ ${posLabel} · traffic ${trafLabel}`}
                          />
                        </div>
                      )
                    }}
                  />
                }
              />
              <Scatter data={points} fill="var(--chart-1)" animationDuration={800}>
                {points.map((p) => (
                  <Cell key={p.keyword} fill={QUADRANT_COLOR[p.quadrant]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>

          <ul className="text-text-secondary flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {LEGEND_ORDER.map((q) => (
              <li key={q} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: QUADRANT_COLOR[q] }}
                />
                {QUADRANT_LABEL[q]}
                <span className="text-foreground font-semibold tabular-nums">
                  {quadrantCounts[q]}
                </span>
              </li>
            ))}
            <li className="w-full sm:ml-auto sm:w-auto">
              X = Δ อันดับ (← ดีขึ้น) · Y = Δ traffic (↑ ดีขึ้น)
            </li>
          </ul>
        </>
      )}
    </ReportCard>
  )
}
