'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronDown, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useHistoryContext } from './contexts/HistoryContext'
import { useReportFilters } from './contexts/ReportFiltersContext'
import { ChartEmptyState } from './components/ChartEmptyState'
import { AnomalyDot } from './components/AnomalyDot'
import { ClippedDot } from './components/ClippedDot'
import { SnapshotView, type SnapshotEntry } from './components/SnapshotView'
import {
  MAX_SELECTED_KEYWORDS,
  POSITION_CLIP_THRESHOLD,
  CHART_COLORS,
  getKeywordColor,
} from './lib/chartConfig'
import { buildChartConfig } from './lib/buildChartConfig'
import { computeAnomalies, downsampleWide, filterHistoryByPeriod } from './lib/historyCalculations'
import { cn } from '@/lib/utils'

interface KeywordOption {
  keyword: string
  traffic: number
  color: string
}

interface KeywordTrendChartProps {
  title?: string
}

const formatTrafficValue = (val: number | null | undefined): string => {
  if (val == null) return ''
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toString()
}

const fmtDateTick = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
  })

const fmtDateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const clampPosition = (position: number | null): number | null => {
  // position 0 / negative = "unranked" — เป็น gap ในเส้น ไม่ใช่อันดับ #0 (top)
  if (position === null || position <= 0) return null
  return Math.min(position, POSITION_CLIP_THRESHOLD)
}

const KeywordSelector = ({
  options,
  selected,
  onChange,
}: {
  options: KeywordOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}) => {
  const [open, setOpen] = useState(false)
  const selectedSet = new Set(selected)

  const toggle = (keyword: string) => {
    if (selectedSet.has(keyword)) {
      if (selected.length > 1) {
        onChange(selected.filter((k) => k !== keyword))
      }
    } else {
      if (selected.length >= MAX_SELECTED_KEYWORDS) return
      onChange([...selected, keyword])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="text-muted-foreground truncate">
            {selected.length === 0
              ? 'เลือก Keyword...'
              : `เลือก ${selected.length}/${MAX_SELECTED_KEYWORDS} คำ`}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหา keyword..." />
          <CommandList>
            <CommandEmpty>ไม่พบ keyword</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedSet.has(opt.keyword)
                const disabled = !isSelected && selected.length >= MAX_SELECTED_KEYWORDS
                return (
                  <CommandItem
                    key={opt.keyword}
                    value={opt.keyword}
                    disabled={disabled}
                    onSelect={() => toggle(opt.keyword)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={isSelected} aria-hidden="true" />
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span className={cn('flex-1 truncate', isSelected && 'font-semibold')}>
                      {opt.keyword}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {opt.traffic.toLocaleString()}
                    </span>
                    {isSelected && <Check className="text-success size-3" />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface KeywordRecord {
  date: Date
  position: number | null
  traffic: number
}

interface WideRow {
  dateMs: number
  [key: string]: number | null | boolean
}

export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
  title = 'แนวโน้ม Keyword',
}) => {
  const { keywordHistory, currentKeywords, isLoading } = useHistoryContext()
  const { period } = useReportFilters()
  const [focusedKeyword, setFocusedKeyword] = useState<string | null>(null)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const keywordOptions: KeywordOption[] = useMemo(() => {
    return currentKeywords.map((k, index) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      color: getKeywordColor(index),
    }))
  }, [currentKeywords])

  const keywordColorMap = useMemo(() => {
    const map = new Map<string, string>()
    keywordOptions.forEach((opt) => map.set(opt.keyword, opt.color))
    return map
  }, [keywordOptions])

  useEffect(() => {
    if (keywordOptions.length > 0 && selectedKeywords.length === 0) {
      setSelectedKeywords(keywordOptions.slice(0, 3).map((k) => k.keyword))
    }
  }, [keywordOptions, selectedKeywords.length])

  const recordsByKeyword = useMemo(() => {
    const map = new Map<string, KeywordRecord[]>()
    if (selectedKeywords.length === 0) return map
    const filtered = filterHistoryByPeriod(keywordHistory, period)

    selectedKeywords.forEach((keyword) => {
      const historyRecords: KeywordRecord[] = filtered
        .filter((r) => r.keyword === keyword)
        .map((r) => ({
          date: new Date(r.dateRecorded),
          position: r.position,
          traffic: r.traffic,
        }))

      // currentKeywords = ค่าปัจจุบัน (authoritative, ล่าสุดเสมอ) — ใช้ "now" เป็น timestamp
      // เพราะ keyword.dateRecorded คือเวลา "สร้าง" ซึ่งเก่ากว่า history snapshot
      // (dateRecorded = เวลาตอน update) ถ้าใช้ค่าเดิมจะเรียงผิด + ถูก dedup ทิ้งค่าจริง
      const current = currentKeywords.find((c) => c.keyword === keyword)
      let records = historyRecords
      if (current) {
        const currentDate = new Date()
        const dayKey = currentDate.toISOString().split('T')[0]
        records = historyRecords.filter((r) => r.date.toISOString().split('T')[0] !== dayKey)
        records.push({
          date: currentDate,
          position: current.position,
          traffic: current.traffic,
        })
      }
      records.sort((a, b) => a.date.getTime() - b.date.getTime())
      map.set(keyword, records)
    })
    return map
  }, [keywordHistory, currentKeywords, selectedKeywords, period])

  // Wide-format: merge ทุก keyword ลงแถวเดียวกันตาม dateMs
  const wideRows = useMemo<WideRow[]>(() => {
    if (selectedKeywords.length === 0) return []
    const dateMap = new Map<number, WideRow>()

    selectedKeywords.forEach((keyword) => {
      const recs = recordsByKeyword.get(keyword) ?? []
      recs.forEach((r) => {
        const t = r.date.getTime()
        const row = dateMap.get(t) ?? ({ dateMs: t } as WideRow)
        row[`pos_${keyword}`] = r.position == null ? null : clampPosition(r.position)
        row[`posReal_${keyword}`] = r.position
        row[`traffic_${keyword}`] = r.traffic
        dateMap.set(t, row)
      })
    })

    const rows = Array.from(dateMap.values()).sort((a, b) => a.dateMs - b.dateMs)

    // Anomaly per keyword on traffic
    selectedKeywords.forEach((keyword) => {
      const trafficKey = `traffic_${keyword}`
      const trafficVals = rows.map((r) => Number(r[trafficKey] ?? 0))
      const flags = computeAnomalies(trafficVals)
      rows.forEach((r, i) => {
        r[`traffic_${keyword}__anomaly`] = flags[i]
      })
    })

    return downsampleWide(rows, 60)
  }, [recordsByKeyword, selectedKeywords])

  const positionConfig = useMemo(
    () =>
      buildChartConfig(
        selectedKeywords.map((k) => ({
          key: `pos_${k}`,
          label: k,
          color: keywordColorMap.get(k) || CHART_COLORS.primary,
        })),
      ),
    [selectedKeywords, keywordColorMap],
  )

  const trafficConfig = useMemo(
    () =>
      buildChartConfig(
        selectedKeywords.map((k) => ({
          key: `traffic_${k}`,
          label: k,
          color: keywordColorMap.get(k) || CHART_COLORS.primary,
        })),
      ),
    [selectedKeywords, keywordColorMap],
  )

  const donutData = useMemo(
    () =>
      keywordOptions
        .filter((opt) => selectedKeywords.includes(opt.keyword))
        .map((opt) => ({
          label: opt.keyword,
          value: opt.traffic,
          color: opt.color,
        })),
    [keywordOptions, selectedKeywords],
  )

  const donutConfig = useMemo(
    () =>
      buildChartConfig(donutData.map((d) => ({ key: d.label, label: d.label, color: d.color }))),
    [donutData],
  )

  const totalTraffic = useMemo(() => donutData.reduce((sum, d) => sum + d.value, 0), [donutData])

  // Single-point edge case
  const isSinglePoint = useMemo(() => {
    if (selectedKeywords.length === 0) return false
    const maxLen = Math.max(0, ...Array.from(recordsByKeyword.values()).map((r) => r.length))
    return maxLen > 0 && maxLen < 2
  }, [recordsByKeyword, selectedKeywords])

  const snapshotEntries = useMemo<SnapshotEntry[]>(() => {
    return selectedKeywords.map((keyword) => {
      const records = recordsByKeyword.get(keyword) ?? []
      const latest = records[records.length - 1]
      const color = keywordColorMap.get(keyword) || CHART_COLORS.primary
      const pos = latest?.position ?? null
      return {
        keyword,
        position: pos != null && pos > 0 ? pos : null,
        traffic: latest?.traffic ?? 0,
        color,
      }
    })
  }, [selectedKeywords, recordsByKeyword, keywordColorMap])

  const hasPositionData = wideRows.some((row) =>
    selectedKeywords.some((k) => row[`pos_${k}`] != null),
  )
  const hasTrafficData = wideRows.some((row) =>
    selectedKeywords.some((k) => row[`traffic_${k}`] != null),
  )

  const positionTooltipFormatter = (
    value: unknown,
    name: unknown,
    item: { payload?: Record<string, unknown> },
  ) => {
    const k = String(name).replace(/^pos_/, '')
    const real = item.payload?.[`posReal_${k}`] as number | null | undefined
    const display = real ?? Number(value)
    const formatted = typeof display === 'number' && display > 0 ? `#${display}` : '-'
    return [formatted, k]
  }

  const trafficTooltipFormatter = (value: unknown, name: unknown) => {
    const k = String(name).replace(/^traffic_/, '')
    return [Number(value).toLocaleString(), k]
  }

  if (isLoading) {
    return (
      <div className="border-border flex items-center gap-2 rounded-2xl border p-6">
        <Loader2 className="text-info size-4 animate-spin" />
        <span>กำลังโหลดข้อมูล Keyword...</span>
      </div>
    )
  }

  if (keywordOptions.length === 0) {
    return (
      <div className="border-border rounded-2xl border p-4 md:p-6">
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <ChartEmptyState message="ยังไม่มีประวัติ Keyword" height="240px" />
      </div>
    )
  }

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      <div className="mb-4 max-w-md">
        <KeywordSelector
          options={keywordOptions}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
      </div>

      {/* Selected keyword chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedKeywords.map((keyword) => {
          const color = keywordColorMap.get(keyword) || CHART_COLORS.primary
          const isFocused = focusedKeyword === keyword
          return (
            <Badge
              key={keyword}
              variant="outline"
              className={cn(
                'gap-1.5 border-2 font-semibold transition-opacity',
                focusedKeyword && !isFocused && 'opacity-50',
              )}
              style={{ borderColor: color, color }}
            >
              <button
                type="button"
                onClick={() => setFocusedKeyword(isFocused ? null : keyword)}
                className="flex items-center gap-1.5"
                aria-pressed={isFocused}
                aria-label={`${isFocused ? 'ยกเลิก ' : ''}highlight ${keyword}`}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {keyword}
              </button>
              {selectedKeywords.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (focusedKeyword === keyword) setFocusedKeyword(null)
                    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword))
                  }}
                  className="ml-1 hover:opacity-70"
                  aria-label={`ลบ ${keyword}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          )
        })}
      </div>

      {isSinglePoint ? (
        <SnapshotView
          entries={snapshotEntries}
          note="ยังมีข้อมูลแค่ 1 รอบ — แสดงเป็น snapshot (chart ต้องการ ≥ 2 จุด)"
        />
      ) : !hasPositionData && !hasTrafficData ? (
        <ChartEmptyState message="ยังไม่มีข้อมูลเพียงพอสำหรับ Keywords ที่เลือก" height="240px" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {/* 2 stacked charts (synced) */}
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="border-border bg-background rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Position Trend</span>
                <span className="text-muted-foreground">เส้นประ = เป้าหมาย (Top 3 / Top 10)</span>
              </div>
              {hasPositionData ? (
                <ChartContainer config={positionConfig} className="h-[220px] w-full">
                  <LineChart
                    data={wideRows}
                    syncId="kw-trend"
                    margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="dateMs"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                      tickFormatter={fmtDateTick}
                      stroke="var(--muted-foreground)"
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      reversed
                      domain={[1, POSITION_CLIP_THRESHOLD]}
                      tickFormatter={(v) => `#${v}`}
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                      width={44}
                    />
                    <ReferenceLine
                      y={10}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="6 4"
                      strokeOpacity={0.6}
                      label={{
                        value: 'Top 10',
                        position: 'right',
                        fill: 'var(--muted-foreground)',
                        fontSize: 10,
                      }}
                    />
                    <ReferenceLine
                      y={3}
                      stroke="var(--success)"
                      strokeDasharray="6 4"
                      strokeOpacity={0.6}
                      label={{
                        value: 'Top 3',
                        position: 'right',
                        fill: 'var(--success)',
                        fontSize: 10,
                      }}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: 'var(--muted-foreground)',
                        strokeDasharray: '3 3',
                      }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_label, payload) => {
                            const ms = payload?.[0]?.payload?.dateMs
                            return typeof ms === 'number' ? fmtDateLabel(ms) : ''
                          }}
                          formatter={positionTooltipFormatter}
                        />
                      }
                    />
                    {selectedKeywords.map((k) => {
                      const baseColor = keywordColorMap.get(k) || CHART_COLORS.primary
                      const isDim = focusedKeyword !== null && focusedKeyword !== k
                      return (
                        <Line
                          key={k}
                          type="monotone"
                          dataKey={`pos_${k}`}
                          connectNulls
                          stroke={isDim ? 'var(--muted)' : baseColor}
                          strokeWidth={focusedKeyword === k ? 3 : 2}
                          opacity={isDim ? 0.35 : 1}
                          dot={<ClippedDot keyword={k} />}
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      )
                    })}
                  </LineChart>
                </ChartContainer>
              ) : (
                <ChartEmptyState message="ยังไม่มีข้อมูล Position" height="220px" />
              )}
            </div>

            <div className="border-border bg-background rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Traffic Trend</span>
                <span className="text-muted-foreground">จุดวงแหวน = Outlier (z &gt; 2.5)</span>
              </div>
              {hasTrafficData ? (
                <ChartContainer config={trafficConfig} className="h-[220px] w-full">
                  <LineChart
                    data={wideRows}
                    syncId="kw-trend"
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="dateMs"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                      tickFormatter={fmtDateTick}
                      stroke="var(--muted-foreground)"
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 'auto']}
                      tickFormatter={formatTrafficValue}
                      stroke="var(--muted-foreground)"
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: 'var(--muted-foreground)',
                        strokeDasharray: '3 3',
                      }}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_label, payload) => {
                            const ms = payload?.[0]?.payload?.dateMs
                            return typeof ms === 'number' ? fmtDateLabel(ms) : ''
                          }}
                          formatter={trafficTooltipFormatter}
                        />
                      }
                    />
                    {selectedKeywords.map((k) => {
                      const baseColor = keywordColorMap.get(k) || CHART_COLORS.primary
                      const isDim = focusedKeyword !== null && focusedKeyword !== k
                      return (
                        <Line
                          key={k}
                          type="monotone"
                          dataKey={`traffic_${k}`}
                          connectNulls
                          stroke={isDim ? 'var(--muted)' : baseColor}
                          strokeWidth={focusedKeyword === k ? 3 : 2}
                          opacity={isDim ? 0.35 : 1}
                          dot={<AnomalyDot dataKey={`traffic_${k}`} />}
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      )
                    })}
                  </LineChart>
                </ChartContainer>
              ) : (
                <ChartEmptyState message="ยังไม่มีข้อมูล Traffic" height="220px" />
              )}
            </div>
          </div>

          {/* Donut sidebar */}
          <div className="border-border bg-background rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-semibold">สัดส่วน Traffic</p>
              {focusedKeyword && (
                <button
                  type="button"
                  onClick={() => setFocusedKeyword(null)}
                  className="text-info text-xs hover:underline"
                >
                  เคลียร์
                </button>
              )}
            </div>
            <ChartContainer config={donutConfig} className="mx-auto aspect-square w-[200px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
                    />
                  }
                />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={86}
                  strokeWidth={2}
                  onClick={(d) => {
                    const label =
                      (d as { label?: string; payload?: { label?: string } }).label ??
                      (d as { payload?: { label?: string } }).payload?.label
                    if (!label) return
                    setFocusedKeyword(focusedKeyword === label ? null : label)
                  }}
                >
                  {donutData.map((d) => (
                    <Cell
                      key={d.label}
                      fill={d.color}
                      opacity={focusedKeyword && focusedKeyword !== d.label ? 0.35 : 1}
                      style={{ cursor: 'pointer', outline: 'none' }}
                    />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        !('cx' in viewBox) ||
                        viewBox.cx == null ||
                        viewBox.cy == null
                      )
                        return null
                      const active = focusedKeyword
                        ? donutData.find((d) => d.label === focusedKeyword)
                        : null
                      const centerLabel = active ? active.label : 'Total'
                      const centerValue = active
                        ? active.value.toLocaleString()
                        : totalTraffic >= 1000
                          ? `${(totalTraffic / 1000).toFixed(1)}K`
                          : totalTraffic.toLocaleString()
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            dy="-0.4em"
                            className="fill-muted-foreground text-xs"
                          >
                            {centerLabel}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            dy="1.4em"
                            className="fill-foreground text-lg font-bold"
                          >
                            {centerValue}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="border-border mt-3 space-y-1 border-t pt-2">
              {donutData.map((item) => {
                const pct = totalTraffic > 0 ? (item.value / totalTraffic) * 100 : 0
                const isFocused = focusedKeyword === item.label
                return (
                  <li
                    key={item.label}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded px-1 text-xs transition-opacity',
                      focusedKeyword && !isFocused && 'opacity-50',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setFocusedKeyword(isFocused ? null : item.label)}
                      className="flex min-w-0 items-center gap-2 hover:opacity-80"
                      aria-pressed={isFocused}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate font-medium" title={item.label}>
                        {item.label}
                      </span>
                    </button>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <span>{item.value.toLocaleString()}</span>
                      <span
                        className="min-w-10 text-right font-semibold"
                        style={{ color: item.color }}
                      >
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <p className="text-muted-foreground mt-3 text-right text-xs">ข้อมูลจาก Database</p>
    </div>
  )
}

export default KeywordTrendChart
