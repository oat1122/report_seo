'use client'

import { useMemo } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ReportIcon } from '../components/ReportIcon'
import { buildChartConfig } from '../lib/buildChartConfig'
import { computeTrafficForecast } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'

interface TrafficForecastConeProps {
  daysAhead?: number
}

const chartConfig = buildChartConfig([
  { key: 'actual', label: 'Actual', color: 'var(--info)' },
  { key: 'predicted', label: 'Forecast', color: 'var(--success)' },
  { key: 'band', label: 'Confidence', color: 'var(--success)' },
])

const fmtTraffic = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toFixed(0)
}

export const TrafficForecastCone = ({ daysAhead = 30 }: TrafficForecastConeProps) => {
  const { metricsHistory } = useHistoryContext()

  const forecast = useMemo(
    () => computeTrafficForecast(metricsHistory, daysAhead),
    [metricsHistory, daysAhead],
  )

  // Recharts wants a single dataset with all fields per row; add `bandLow/bandHeight` for stacked Area trick.
  const data = useMemo(
    () =>
      forecast.points.map((p) => ({
        label: p.label,
        time: p.time,
        actual: p.actual,
        predicted: p.predicted,
        lower: p.lower,
        upper: p.upper,
        bandLow: p.lower ?? 0,
        bandHeight: p.lower != null && p.upper != null ? p.upper - p.lower : 0,
      })),
    [forecast.points],
  )

  const TrendIcon =
    forecast.changePct == null
      ? Minus
      : forecast.changePct > 0
        ? TrendingUp
        : forecast.changePct < 0
          ? TrendingDown
          : Minus
  const trendClass =
    forecast.changePct == null
      ? 'text-muted-foreground'
      : forecast.changePct > 0
        ? 'text-success'
        : forecast.changePct < 0
          ? 'text-destructive'
          : 'text-muted-foreground'

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <ReportIcon name="trending-up" trigger="hover" color="bg-success" />
            Traffic Forecast
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            พยากรณ์ traffic ของ {daysAhead} วันข้างหน้า · ช่วงความเชื่อมั่น ~95%
          </p>
        </div>
        {forecast.hasData && forecast.forecastEnd != null && (
          <div className="border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-2">
            <div>
              <p className="text-muted-foreground text-xs">คาดการณ์ +{daysAhead}d</p>
              <p className="text-lg font-bold tabular-nums">{fmtTraffic(forecast.forecastEnd)}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendClass}`}>
              <TrendIcon className="size-4" />
              {forecast.changePct != null
                ? `${forecast.changePct > 0 ? '+' : ''}${forecast.changePct.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        )}
      </div>

      {!forecast.hasData ? (
        <ChartEmptyState message="ต้องมีประวัติ traffic อย่างน้อย 2 รอบ" height="280px" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              width={50}
              tickFormatter={(v) => fmtTraffic(Number(v))}
            />
            <ReferenceLine
              x={[...data].reverse().find((d) => d.actual != null)?.label}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: 'วันนี้',
                position: 'top',
                fill: 'var(--muted-foreground)',
                fontSize: 10,
              }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (value == null) return ['', '']
                    const label =
                      name === 'actual' ? 'Actual' : name === 'predicted' ? 'Forecast' : ''
                    if (!label) return []
                    return [fmtTraffic(Number(value)), label]
                  }}
                />
              }
            />
            {/* Invisible base for the confidence band */}
            <Area
              type="monotone"
              dataKey="bandLow"
              stackId="band"
              stroke="transparent"
              fill="transparent"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="bandHeight"
              stackId="band"
              stroke="transparent"
              fill="var(--success)"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--info)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--success)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ChartContainer>
      )}

      {forecast.hasData && (
        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-info h-0.5 w-4" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="border-success h-0.5 w-4 border-t-2 border-dashed" />
            Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-success/15 size-2 rounded" />
            ช่วงความเชื่อมั่น
          </span>
          {forecast.rSquared != null ? (
            <span className="ml-auto">
              R²:{' '}
              <span className="text-foreground font-semibold">{forecast.rSquared.toFixed(2)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground ml-auto">แนวโน้มยังไม่ชัด · ข้อมูลน้อย</span>
          )}
        </div>
      )}
    </div>
  )
}
