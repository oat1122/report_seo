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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ReportIcon } from '../components/ReportIcon'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeKeywordVelocity, type VelocityQuadrant } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

const QUADRANT_COLOR: Record<VelocityQuadrant, string> = {
  rising: 'var(--success)',
  hidden: 'var(--info)',
  cooling: 'var(--warning)',
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

const chartConfig = buildChartConfig([{ key: 'points', label: 'Keywords', color: 'var(--info)' }])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReportIcon name="trending-up" trigger="hover" color="bg-info" size={18} />
          Keyword Velocity
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          X = position change (← ดีขึ้น) · Y = traffic change (↑ ดีขึ้น)
        </p>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <ChartEmptyState
            message="ยังไม่มี keyword ที่ขยับมากพอ — ต้องมี history ≥ 2 รอบ"
            height="320px"
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 16 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

              {/* Quadrant tints — rendered before scatter so points sit on top */}
              <ReferenceArea
                x1={xMin}
                x2={0}
                y1={0}
                y2={yMax}
                fill={QUADRANT_COLOR.rising}
                fillOpacity={0.06}
                label={{
                  value: QUADRANT_LABEL.rising,
                  position: 'insideTopLeft',
                  fill: QUADRANT_COLOR.rising,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceArea
                x1={0}
                x2={xMax}
                y1={0}
                y2={yMax}
                fill={QUADRANT_COLOR.hidden}
                fillOpacity={0.05}
                label={{
                  value: QUADRANT_LABEL.hidden,
                  position: 'insideTopRight',
                  fill: QUADRANT_COLOR.hidden,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceArea
                x1={xMin}
                x2={0}
                y1={yMin}
                y2={0}
                fill={QUADRANT_COLOR.cooling}
                fillOpacity={0.05}
                label={{
                  value: QUADRANT_LABEL.cooling,
                  position: 'insideBottomLeft',
                  fill: QUADRANT_COLOR.cooling,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceArea
                x1={0}
                x2={xMax}
                y1={yMin}
                y2={0}
                fill={QUADRANT_COLOR.falling}
                fillOpacity={0.05}
                label={{
                  value: QUADRANT_LABEL.falling,
                  position: 'insideBottomRight',
                  fill: QUADRANT_COLOR.falling,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              <ReferenceLine x={0} stroke="var(--muted-foreground)" strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.5} />

              <XAxis
                type="number"
                dataKey="positionDelta"
                domain={[xMin, xMax]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                label={{
                  value: 'Δ Position',
                  position: 'insideBottom',
                  offset: -8,
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="trafficDelta"
                domain={[yMin, yMax]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                label={{
                  value: 'Δ Traffic',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
              <ZAxis range={[80, 80]} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={
                  <ChartTooltipContent
                    hideLabel
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
                          ? `+${p.trafficDelta.toLocaleString()}`
                          : p.trafficDelta.toLocaleString()
                      return [
                        `pos ${posLabel} · traffic ${trafLabel} · ${QUADRANT_LABEL[p.quadrant]}`,
                        p.keyword,
                      ]
                    }}
                  />
                }
              />
              <Scatter data={points} fill="var(--info)">
                {points.map((p) => (
                  <Cell key={p.keyword} fill={QUADRANT_COLOR[p.quadrant]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
