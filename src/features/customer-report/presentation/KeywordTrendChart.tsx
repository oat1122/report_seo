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
import { ChevronDown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
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
import { MAX_SELECTED_KEYWORDS, POSITION_CLIP_THRESHOLD } from './lib/chartConfig'
import { buildChartConfig } from './lib/buildChartConfig'
import {
  computeAnomalies,
  downsampleWide,
  filterHistoryByPeriod,
  localDayKey,
} from './lib/historyCalculations'
import { ReportCard } from './keywords/ReportCard'
import { ChartTooltipRow, DARK_TOOLTIP_CLASS } from './keywords/ChartTooltipRow'
import { cn } from '@/lib/utils'

// สีเส้นราย keyword — เรียงตาม --chart-* (ไม่ใช้ chart-4 เขียวแบรนด์เป็นเส้นบางบนพื้นขาว)
const TREND_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-5)',
  'var(--destructive)',
  'var(--chart-3)',
  'var(--warning)',
  'var(--foreground)',
  'var(--success)',
] as const
const FALLBACK_COLOR = TREND_COLORS[0]
const getKeywordColor = (index: number): string => TREND_COLORS[index % TREND_COLORS.length]

const AXIS_TICK = { fontSize: 11, fill: 'var(--muted-foreground)' }

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
          <span className="text-text-secondary truncate">
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
                    <span className="text-text-secondary text-xs tabular-nums">
                      {opt.traffic.toLocaleString('th-TH')}
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
        const dayKey = localDayKey(currentDate)
        records = historyRecords.filter((r) => localDayKey(r.date) !== dayKey)
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

    // Anomaly per keyword on traffic — คิดจากเฉพาะแถวที่ keyword นี้มี record จริง
    // (rows = union ของทุก keyword ที่เลือก — แถวที่ keyword นี้ไม่มีค่าจะเป็น undefined
    //  ห้ามแทนด้วย 0 แล้วโยนเข้า mean/std → จะบิดสถิติ + flag แถวผีเป็น outlier)
    selectedKeywords.forEach((keyword) => {
      const trafficKey = `traffic_${keyword}`
      const realIdx = rows.flatMap((r, i) => (r[trafficKey] != null ? [i] : []))
      const flags = computeAnomalies(realIdx.map((i) => Number(rows[i][trafficKey])))
      realIdx.forEach((rowIdx, j) => {
        rows[rowIdx][`traffic_${keyword}__anomaly`] = flags[j]
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
          color: keywordColorMap.get(k) || FALLBACK_COLOR,
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
          color: keywordColorMap.get(k) || FALLBACK_COLOR,
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
      const color = keywordColorMap.get(keyword) || FALLBACK_COLOR
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

  // shadcn ChartTooltipContent ปล่อย return ของ formatter ลงแถวตรง ๆ ไม่จัด layout ให้
  // → ต้อง return row ที่มี dot + keyword (truncate) + value แยกกันชัด ไม่ให้เลขติดกับคำ
  const renderTooltipRow = (keyword: string, valueNode: React.ReactNode) => (
    <ChartTooltipRow
      color={keywordColorMap.get(keyword) || FALLBACK_COLOR}
      label={keyword}
      value={valueNode}
    />
  )

  // ประโยคสรุปบนหัวการ์ด: keyword ที่อันดับดีขึ้นมากที่สุดในช่วงที่เลือก (จาก records ชุดเดียวกับกราฟ)
  const bestMover = useMemo(() => {
    let best: { keyword: string; from: number; to: number } | null = null
    selectedKeywords.forEach((keyword) => {
      const ranked = (recordsByKeyword.get(keyword) ?? []).filter(
        (r): r is KeywordRecord & { position: number } => r.position != null && r.position > 0,
      )
      if (ranked.length < 2) return
      const from = ranked[0].position
      const to = ranked[ranked.length - 1].position
      if (from - to > 0 && (!best || from - to > best.from - best.to)) {
        best = { keyword, from, to }
      }
    })
    return best as { keyword: string; from: number; to: number } | null
  }, [recordsByKeyword, selectedKeywords])

  const description = bestMover
    ? `ขยับดีขึ้นมากที่สุด: “${bestMover.keyword}” จาก #${bestMover.from} → #${bestMover.to} ในช่วง ${period} วัน`
    : `เปรียบเทียบอันดับและ traffic ของ keyword ที่เลือก (สูงสุด ${MAX_SELECTED_KEYWORDS} คำ) · ช่วง ${period} วัน`

  const positionTooltipFormatter = (
    value: unknown,
    name: unknown,
    item: { payload?: Record<string, unknown> },
  ) => {
    const k = String(name).replace(/^pos_/, '')
    const real = item.payload?.[`posReal_${k}`] as number | null | undefined
    const display = real ?? Number(value)
    const formatted = typeof display === 'number' && display > 0 ? `#${display}` : '-'
    return renderTooltipRow(k, formatted)
  }

  const trafficTooltipFormatter = (value: unknown, name: unknown) => {
    const k = String(name).replace(/^traffic_/, '')
    return renderTooltipRow(k, Number(value).toLocaleString('th-TH'))
  }

  if (isLoading) {
    return (
      <ReportCard title={title}>
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">กำลังโหลดข้อมูล Keyword...</span>
          <Skeleton className="h-11 w-full max-w-md rounded-xl" />
          <Skeleton className="h-[260px] w-full rounded-2xl" />
        </div>
      </ReportCard>
    )
  }

  if (keywordOptions.length === 0) {
    return (
      <ReportCard title={title} description="อันดับและ traffic ราย keyword ตามช่วงเวลา">
        <ChartEmptyState message="ยังไม่มีประวัติ Keyword" height="240px" />
      </ReportCard>
    )
  }

  return (
    <ReportCard title={title} description={description}>
      <div className="w-full md:max-w-md">
        <KeywordSelector
          options={keywordOptions}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
      </div>

      {/* Selected keyword chips (legend) — แตะเพื่อไฮไลต์เส้น */}
      <ul className="flex flex-wrap gap-2" aria-label="keyword ที่แสดงในกราฟ">
        {selectedKeywords.map((keyword) => {
          const color = keywordColorMap.get(keyword) || FALLBACK_COLOR
          const isFocused = focusedKeyword === keyword
          return (
            <li
              key={keyword}
              className={cn(
                'border-border flex h-11 max-w-full items-center rounded-full border bg-white/85 text-[13px] transition-[opacity,box-shadow] md:h-9 dark:bg-white/5',
                isFocused && 'border-foreground/40 shadow-[0_0_0_2px_var(--info-subtle)]',
                focusedKeyword && !isFocused && 'opacity-50',
              )}
            >
              <button
                type="button"
                onClick={() => setFocusedKeyword(isFocused ? null : keyword)}
                className="focus-visible:ring-ring/70 flex h-full min-w-0 items-center gap-2 rounded-full pr-2 pl-3 outline-none focus-visible:ring-[3px]"
                aria-pressed={isFocused}
                aria-label={`${isFocused ? 'ยกเลิก ' : ''}highlight ${keyword}`}
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className={cn('truncate', isFocused && 'font-medium')}>{keyword}</span>
              </button>
              {selectedKeywords.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (focusedKeyword === keyword) setFocusedKeyword(null)
                    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword))
                  }}
                  className="text-text-secondary hover:text-foreground hover:bg-foreground/6 focus-visible:ring-ring/70 mr-1 flex size-9 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:size-7"
                  aria-label={`ลบ ${keyword}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {isSinglePoint ? (
        <SnapshotView
          entries={snapshotEntries}
          note="ยังมีข้อมูลแค่ 1 รอบ — แสดงเป็น snapshot (chart ต้องการ ≥ 2 จุด)"
        />
      ) : !hasPositionData && !hasTrafficData ? (
        <ChartEmptyState message="ยังไม่มีข้อมูลเพียงพอสำหรับ Keywords ที่เลือก" height="240px" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* 2 stacked charts (synced) */}
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
            <div className="bg-glass-tile border-glass-border rounded-2xl border p-3 md:p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                <span className="text-foreground text-[13px] font-medium">Position Trend</span>
                <span className="text-text-secondary">เส้นประ = เป้าหมาย (Top 3 / Top 10)</span>
              </div>
              {hasPositionData ? (
                <ChartContainer config={positionConfig} className="h-[220px] w-full">
                  <LineChart
                    data={wideRows}
                    syncId="kw-trend"
                    margin={{ top: 8, right: 36, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="dateMs"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                      tickFormatter={fmtDateTick}
                      tickLine={false}
                      axisLine={false}
                      tick={AXIS_TICK}
                      tickMargin={8}
                    />
                    <YAxis
                      reversed
                      domain={[1, POSITION_CLIP_THRESHOLD]}
                      tickFormatter={(v) => `#${v}`}
                      tickLine={false}
                      axisLine={false}
                      tick={AXIS_TICK}
                      width={40}
                    />
                    <ReferenceLine
                      y={10}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="6 5"
                      strokeOpacity={0.6}
                      label={{
                        value: 'Top 10',
                        position: 'right',
                        fill: 'var(--muted-foreground)',
                        fontSize: 11,
                      }}
                    />
                    <ReferenceLine
                      y={3}
                      stroke="var(--chart-2)"
                      strokeDasharray="6 5"
                      strokeOpacity={0.8}
                      label={{
                        value: 'Top 3',
                        position: 'right',
                        fill: 'var(--muted-foreground)',
                        fontSize: 11,
                      }}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: 'var(--muted-foreground)',
                        strokeDasharray: '3 5',
                      }}
                      content={
                        <ChartTooltipContent
                          className={DARK_TOOLTIP_CLASS}
                          labelFormatter={(_label, payload) => {
                            const ms = payload?.[0]?.payload?.dateMs
                            return typeof ms === 'number' ? fmtDateLabel(ms) : ''
                          }}
                          formatter={positionTooltipFormatter}
                        />
                      }
                    />
                    {selectedKeywords.map((k) => {
                      const baseColor = keywordColorMap.get(k) || FALLBACK_COLOR
                      const isDim = focusedKeyword !== null && focusedKeyword !== k
                      return (
                        <Line
                          key={k}
                          type="monotone"
                          dataKey={`pos_${k}`}
                          connectNulls
                          stroke={isDim ? 'var(--muted-foreground)' : baseColor}
                          strokeWidth={focusedKeyword === k ? 3.5 : 2.5}
                          strokeLinecap="round"
                          opacity={isDim ? 0.25 : 1}
                          dot={<ClippedDot keyword={k} />}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)' }}
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

            <div className="bg-glass-tile border-glass-border rounded-2xl border p-3 md:p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                <span className="text-foreground text-[13px] font-medium">Traffic Trend</span>
                <span className="text-text-secondary">จุดวงแหวน = Outlier (z &gt; 2.5)</span>
              </div>
              {hasTrafficData ? (
                <ChartContainer config={trafficConfig} className="h-[220px] w-full">
                  <LineChart
                    data={wideRows}
                    syncId="kw-trend"
                    margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="dateMs"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      scale="time"
                      tickFormatter={fmtDateTick}
                      tickLine={false}
                      axisLine={false}
                      tick={AXIS_TICK}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={[0, 'auto']}
                      tickFormatter={formatTrafficValue}
                      tickLine={false}
                      axisLine={false}
                      tick={AXIS_TICK}
                      width={44}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: 'var(--muted-foreground)',
                        strokeDasharray: '3 5',
                      }}
                      content={
                        <ChartTooltipContent
                          className={DARK_TOOLTIP_CLASS}
                          labelFormatter={(_label, payload) => {
                            const ms = payload?.[0]?.payload?.dateMs
                            return typeof ms === 'number' ? fmtDateLabel(ms) : ''
                          }}
                          formatter={trafficTooltipFormatter}
                        />
                      }
                    />
                    {selectedKeywords.map((k) => {
                      const baseColor = keywordColorMap.get(k) || FALLBACK_COLOR
                      const isDim = focusedKeyword !== null && focusedKeyword !== k
                      return (
                        <Line
                          key={k}
                          type="monotone"
                          dataKey={`traffic_${k}`}
                          connectNulls
                          stroke={isDim ? 'var(--muted-foreground)' : baseColor}
                          strokeWidth={focusedKeyword === k ? 3.5 : 2.5}
                          strokeLinecap="round"
                          opacity={isDim ? 0.25 : 1}
                          dot={<AnomalyDot dataKey={`traffic_${k}`} />}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)' }}
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
          <div className="bg-glass-tile border-glass-border flex min-w-0 flex-col rounded-2xl border p-3 md:p-4">
            <div className="mb-2 flex min-h-9 items-center justify-between gap-2">
              <p className="text-foreground text-[13px] font-medium">สัดส่วน Traffic</p>
              {focusedKeyword && (
                <Button variant="ghost" size="sm" onClick={() => setFocusedKeyword(null)}>
                  เคลียร์ไฮไลต์
                </Button>
              )}
            </div>
            <ChartContainer config={donutConfig} className="mx-auto aspect-square w-[200px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className={DARK_TOOLTIP_CLASS}
                      formatter={(value, name) =>
                        renderTooltipRow(String(name), Number(value).toLocaleString('th-TH'))
                      }
                    />
                  }
                />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={64}
                  outerRadius={80}
                  paddingAngle={donutData.length > 1 ? 2 : 0}
                  stroke="none"
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
                      opacity={focusedKeyword && focusedKeyword !== d.label ? 0.3 : 1}
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
                        ? active.value.toLocaleString('th-TH')
                        : totalTraffic >= 1000
                          ? `${(totalTraffic / 1000).toFixed(1)}K`
                          : totalTraffic.toLocaleString('th-TH')
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            dy="-0.5em"
                            className="fill-muted-foreground text-[11px]"
                          >
                            {centerLabel.length > 16 ? `${centerLabel.slice(0, 15)}…` : centerLabel}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            dy="1.5em"
                            className="fill-foreground text-xl font-semibold tabular-nums"
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
            <ul className="border-border/70 mt-3 flex flex-col gap-0.5 border-t pt-2">
              {donutData.map((item) => {
                const pct = totalTraffic > 0 ? (item.value / totalTraffic) * 100 : 0
                const isFocused = focusedKeyword === item.label
                return (
                  <li
                    key={item.label}
                    className={cn(
                      'flex items-center justify-between gap-2 text-[13px] transition-opacity',
                      focusedKeyword && !isFocused && 'opacity-50',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setFocusedKeyword(isFocused ? null : item.label)}
                      className="hover:bg-foreground/6 focus-visible:ring-ring/70 flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 text-left outline-none focus-visible:ring-[3px] md:min-h-9"
                      aria-pressed={isFocused}
                    >
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className={cn('truncate', isFocused && 'font-medium')}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-2 tabular-nums">
                      <span className="text-text-secondary">
                        {item.value.toLocaleString('th-TH')}
                      </span>
                      <span className="min-w-12 text-right font-semibold">{pct.toFixed(1)}%</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <p className="text-text-secondary text-right text-xs">ข้อมูลจาก Database</p>
    </ReportCard>
  )
}

export default KeywordTrendChart
