import { KeywordReportHistory } from '@/types/history'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { POSITION_CLIP_THRESHOLD } from '../chartConfig'
import { buildWeekStarts, isRanked, sortByDateAsc, toWeekStart, WEEK_MS } from './_shared'

// ============================================================
// Chart data prep — period filter / dedup / downsample / anomaly
// ============================================================

/**
 * Filter history records by period (number of days)
 * @returns Filtered array sorted by date ascending
 */
export const filterHistoryByPeriod = <T extends { dateRecorded: Date | string }>(
  history: T[],
  days: number,
): T[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  return history.filter((record) => new Date(record.dateRecorded) >= cutoffDate).sort(sortByDateAsc)
}

/**
 * Deduplicate history records — keep only the latest record per calendar day.
 * Prevents clustering of multiple edits on the same day in the chart.
 * Input must be sorted ascending by dateRecorded.
 */
export const deduplicateByDay = <T extends { dateRecorded: Date | string }>(sorted: T[]): T[] => {
  if (sorted.length <= 1) return sorted
  const result: T[] = []
  let lastKey = ''
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i].dateRecorded)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (key !== lastKey) {
      result.push(sorted[i])
      lastKey = key
    }
  }
  result.reverse()
  return result
}

/** Check if there's enough data to display a chart (>= 2 points for a line) */
export const hasEnoughDataForChart = (dataPoints: number): boolean => dataPoints >= 2

/**
 * Stride downsampling สำหรับ wide-format rows (recharts) — เก็บจุดแรก + จุดสุดท้าย + ตัวอย่าง between
 * เหมาะกับ time series ที่ data dense + visual fidelity ไม่ critical (กัน chart อืดเมื่อ history ยาว)
 */
export const downsampleWide = <T extends Record<string, unknown>>(
  rows: T[],
  maxPoints: number = 60,
): T[] => {
  if (rows.length <= maxPoints) return rows
  const stride = Math.ceil(rows.length / maxPoints)
  const result: T[] = []
  for (let i = 0; i < rows.length; i += stride) {
    result.push(rows[i])
  }
  const last = rows[rows.length - 1]
  if (result[result.length - 1] !== last) result.push(last)
  return result
}

/**
 * คืน array ของ boolean ที่ตำแหน่งเดียวกับ values
 * — true = z-score เกิน threshold (outlier)
 */
export const computeAnomalies = (values: number[], zThreshold: number = 2.5): boolean[] => {
  if (values.length < 3) return values.map(() => false)
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance)
  if (std === 0) return values.map(() => false)
  return values.map((v) => Math.abs((v - mean) / std) > zThreshold)
}

// ============================================================
// AI overview weekly counts
// ============================================================

export interface WeeklyCount {
  weekStart: Date
  weekLabel: string
  count: number
}

/** Count AI Overview entries grouped by week (latest N weeks) */
export const computeAiOverviewWeeklyCounts = (
  aiOverviews: Array<{ displayDate: string | Date }>,
  weeks: number = 12,
): WeeklyCount[] => {
  const now = new Date()
  const weekStarts = buildWeekStarts(weeks, now)
  const earliestMs = weekStarts[0].start.getTime()

  const buckets: WeeklyCount[] = weekStarts.map((w) => ({
    weekStart: w.start,
    weekLabel: w.label,
    count: 0,
  }))

  for (const ai of aiOverviews) {
    const date = new Date(ai.displayDate)
    if (date < weekStarts[0].start || date > now) continue
    const idx = Math.floor((toWeekStart(date).getTime() - earliestMs) / WEEK_MS)
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count += 1
    }
  }
  return buckets
}

// ============================================================
// Sparkline grid — top N keywords with mini trend + current + delta
// ============================================================

export interface SparklineKeywordRow {
  keyword: string
  reportId: string
  current: number
  delta: number
  deltaPct: number | null
  /** Position over time (ordered chronologically) */
  positionSpark: Array<{ t: number; v: number }>
  /** Current position */
  currentPosition: number | null
}

/** Top N keywords by current traffic with sparkline of position history */
export const computeSparklineTopN = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  topN: number = 8,
): SparklineKeywordRow[] => {
  const sorted = [...currentKeywords]
    .filter((k) => (k.traffic ?? 0) > 0)
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
    .slice(0, topN)

  return sorted.map((kw) => {
    const records = keywordHistory
      .filter((h) => h.reportId === kw.id && h.position != null)
      .sort(sortByDateAsc)

    const positionSpark = records.map((r) => ({
      t: new Date(r.dateRecorded).getTime(),
      v: Number(r.position ?? POSITION_CLIP_THRESHOLD),
    }))

    const prevTraffic = records.length > 0 ? Number(records[0].traffic ?? 0) : 0
    const currentTraffic = kw.traffic ?? 0
    const deltaPct = prevTraffic > 0 ? ((currentTraffic - prevTraffic) / prevTraffic) * 100 : null

    return {
      keyword: kw.keyword,
      reportId: kw.id,
      current: currentTraffic,
      delta: currentTraffic - prevTraffic,
      deltaPct,
      positionSpark,
      currentPosition: kw.position ?? null,
    }
  })
}

// ============================================================
// Position Heatmap — keyword × week matrix
// ============================================================

export interface HeatmapCell {
  /** null = no data that week */
  position: number | null
  /** ms epoch */
  weekStart: number
}

export interface HeatmapRow {
  keyword: string
  reportId: string
  /** Cells in chronological order (oldest → newest) */
  cells: HeatmapCell[]
  /** Current (latest) position */
  currentPosition: number | null
}

export interface HeatmapResult {
  rows: HeatmapRow[]
  /** Week start dates in chronological order */
  weeks: Array<{ start: number; label: string }>
}

/** Build keyword × week heatmap of position. Top N keywords by current traffic. */
export const computeKeywordHeatmap = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  topN: number = 10,
  weeks: number = 12,
): HeatmapResult => {
  const now = new Date()
  const weekList = buildWeekStarts(weeks, now).map((w) => ({ start: w.start.getTime(), label: w.label }))
  const earliestMs = weekList[0].start

  const sorted = [...currentKeywords]
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
    .slice(0, topN)

  const rows: HeatmapRow[] = sorted.map((kw) => {
    // Last seen position per week (latest record in week wins)
    const cells: HeatmapCell[] = weekList.map((w) => ({ position: null, weekStart: w.start }))

    const records = keywordHistory.filter((h) => h.reportId === kw.id).sort(sortByDateAsc)

    for (const r of records) {
      // position 0 / negative = "unranked" — ข้าม ไม่ให้ขึ้น cell สีเขียว #0
      if (!isRanked(r.position)) continue
      const t = new Date(r.dateRecorded).getTime()
      if (t < earliestMs || t > now.getTime() + WEEK_MS) continue
      const idx = Math.floor((toWeekStart(new Date(t)).getTime() - earliestMs) / WEEK_MS)
      if (idx >= 0 && idx < cells.length) {
        cells[idx].position = Number(r.position)
      }
    }

    // Fill latest week with current position if no history
    const lastIdx = cells.length - 1
    if (cells[lastIdx].position == null && isRanked(kw.position)) {
      cells[lastIdx].position = kw.position
    }

    return {
      keyword: kw.keyword,
      reportId: kw.id,
      cells,
      currentPosition: isRanked(kw.position) ? kw.position : null,
    }
  })

  return { rows, weeks: weekList }
}
