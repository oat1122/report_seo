// src/components/Customer/Report/lib/historyCalculations.ts
import { KeywordReportHistory, OverallMetricsHistory } from '@/types/history'
import type { OverallMetricsForm } from '@/types/metrics'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { POSITION_CLIP_THRESHOLD, PeriodOption } from './chartConfig'

// --- Types ---
export type MetricTrend = 'up' | 'down' | 'neutral' | 'new'

export interface TrafficChangeData {
  percentage: number
  trend: MetricTrend
  hasHistory: boolean
  previousValue?: number
  currentValue: number
}

// --- Helper Functions ---

/**
 * Calculate the percentage change between current and previous values
 * @param current - Current metric value
 * @param previous - Previous metric value
 * @returns Percentage change (positive or negative)
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    // If previous was 0 and current is positive, it's infinite growth
    // Return a large number to indicate "new" or massive growth
    return current > 0 ? Infinity : 0
  }
  return ((current - previous) / previous) * 100
}

/**
 * Determine the trend based on percentage change
 * @param percentage - Percentage change value
 * @param hasHistory - Whether historical data exists
 * @returns Trend indicator
 */
export const determineTrend = (percentage: number, hasHistory: boolean): MetricTrend => {
  if (!hasHistory) return 'neutral'
  if (percentage === Infinity) return 'new'
  if (percentage > 0) return 'up'
  if (percentage < 0) return 'down'
  return 'neutral'
}

/**
 * Calculate traffic change for a specific keyword based on history
 * @param currentTraffic - Current traffic value
 * @param keywordHistory - Array of keyword history records
 * @param reportId - ID of the current keyword report
 * @returns Traffic change data
 */
export const calculateTrafficChange = (
  currentTraffic: number,
  keywordHistory: KeywordReportHistory[],
  reportId: string,
): TrafficChangeData => {
  // Filter history for this specific keyword
  const keywordHistoryRecords = keywordHistory
    .filter((h) => h.reportId === reportId)
    .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime())

  // If no history exists, it's a new keyword
  if (keywordHistoryRecords.length === 0) {
    return {
      percentage: 0,
      trend: 'new',
      hasHistory: false,
      currentValue: currentTraffic,
    }
  }

  // Get the most recent historical record
  const previousRecord = keywordHistoryRecords[0]
  const previousTraffic = previousRecord.traffic

  // Calculate percentage change
  const percentage = calculatePercentageChange(currentTraffic, previousTraffic)
  const trend = determineTrend(percentage, true)

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend,
    hasHistory: true,
    previousValue: previousTraffic,
    currentValue: currentTraffic,
  }
}

/**
 * Calculate metric change for overall metrics
 * @param currentValue - Current metric value
 * @param metricsHistory - Array of overall metrics history
 * @param metricKey - Key of the metric to track (e.g., 'organicTraffic')
 * @returns Traffic change data
 */
export const calculateMetricChange = (
  currentValue: number,
  metricsHistory: OverallMetricsHistory[],
  metricKey: keyof Omit<OverallMetricsHistory, 'id' | 'dateRecorded' | 'customerId'>,
): TrafficChangeData => {
  // Sort history by date (most recent first)
  const sortedHistory = [...metricsHistory].sort(
    (a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime(),
  )

  // If no history exists
  if (sortedHistory.length === 0) {
    return {
      percentage: 0,
      trend: 'new',
      hasHistory: false,
      currentValue,
    }
  }

  // Get the most recent historical value
  const previousValue = sortedHistory[0][metricKey] as number

  // Calculate percentage change
  const percentage = calculatePercentageChange(currentValue, previousValue)
  const trend = determineTrend(percentage, true)

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend,
    hasHistory: true,
    previousValue,
    currentValue,
  }
}

/**
 * Format percentage for display
 * @param percentage - Raw percentage value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (percentage: number, decimals: number = 0): string => {
  const absPercentage = Math.abs(percentage)
  if (absPercentage >= 1000) {
    return `${(percentage / 1000).toFixed(1)}k`
  }
  return absPercentage.toFixed(decimals)
}

// ============================================================
// Chart Data Transformation Functions
// ============================================================

/**
 * Data point format for Recharts
 */
export interface MetricsChartDataPoint {
  date: string // ISO date string for X-axis
  dateLabel: string // Formatted label for display
  domainRating: number
  healthScore: number
  organicTraffic: number
  organicKeywords: number
  backlinks: number
  refDomains: number
  spamScore: number
}

export interface KeywordChartDataPoint {
  date: string
  dateLabel: string
  position: number | null
  traffic: number
  keyword: string
}

/**
 * Filter history records by period (number of days)
 * @param history - Array of history records
 * @param days - Number of days to include (7, 30, or 90)
 * @returns Filtered array sorted by date ascending
 */
export const filterHistoryByPeriod = <T extends { dateRecorded: Date | string }>(
  history: T[],
  days: number,
): T[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return history
    .filter((record) => new Date(record.dateRecorded) >= cutoffDate)
    .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())
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

/**
 * Format date for chart display (Thai locale)
 * @param date - Date to format
 * @returns Formatted string like "26 พ.ย."
 */
export const formatChartDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })
}

/**
 * Transform OverallMetricsHistory array to Recharts-compatible format
 * @param history - Array of metrics history records
 * @param days - Period filter (default: 30)
 * @returns Array of chart data points sorted by date ascending
 */
export const transformMetricsForRecharts = (
  history: OverallMetricsHistory[],
  days: number = 30,
): MetricsChartDataPoint[] => {
  // Filter and sort by period
  const filteredHistory = filterHistoryByPeriod(history, days)

  // Transform to chart format
  return filteredHistory.map((record) => ({
    date: new Date(record.dateRecorded).toISOString(),
    dateLabel: formatChartDate(record.dateRecorded),
    domainRating: record.domainRating,
    healthScore: record.healthScore,
    organicTraffic: record.organicTraffic,
    organicKeywords: record.organicKeywords,
    backlinks: record.backlinks,
    refDomains: record.refDomains,
    spamScore: record.spamScore,
  }))
}

/**
 * Group keyword history by keyword name
 * @param history - Array of keyword history records
 * @returns Map of keyword name to array of history records
 */
export const groupKeywordHistory = (
  history: KeywordReportHistory[],
): Map<string, KeywordReportHistory[]> => {
  const grouped = new Map<string, KeywordReportHistory[]>()

  history.forEach((record) => {
    const existing = grouped.get(record.keyword) || []
    existing.push(record)
    grouped.set(record.keyword, existing)
  })

  // Sort each group by date ascending
  grouped.forEach((records, keyword) => {
    grouped.set(
      keyword,
      records.sort(
        (a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime(),
      ),
    )
  })

  return grouped
}

/**
 * Transform KeywordReportHistory for a specific keyword to chart format
 * @param history - Array of keyword history records
 * @param keyword - Keyword name to filter
 * @param days - Period filter (default: 30)
 * @returns Array of chart data points
 */
export const transformKeywordForRecharts = (
  history: KeywordReportHistory[],
  keyword: string,
  days: number = 30,
): KeywordChartDataPoint[] => {
  // Filter by keyword and period
  const keywordHistory = history.filter((h) => h.keyword === keyword)
  const filteredHistory = filterHistoryByPeriod(keywordHistory, days)

  // Transform to chart format
  return filteredHistory.map((record) => ({
    date: new Date(record.dateRecorded).toISOString(),
    dateLabel: formatChartDate(record.dateRecorded),
    position: record.position,
    traffic: record.traffic,
    keyword: record.keyword,
  }))
}

/**
 * Get unique keyword names from history
 * @param history - Array of keyword history records
 * @returns Array of unique keyword names
 */
export const getUniqueKeywords = (history: KeywordReportHistory[]): string[] => {
  return [...new Set(history.map((h) => h.keyword))]
}

/**
 * Check if there's enough data to display a chart
 * @param dataPoints - Number of data points
 * @returns true if >= 2 points (minimum for a line)
 */
export const hasEnoughDataForChart = (dataPoints: number): boolean => {
  return dataPoints >= 2
}

// ============================================================
// Multi-Keyword Chart Functions
// ============================================================

/**
 * Data point format for multi-keyword Recharts
 * Contains dynamic keys: `{keyword}_position` and `{keyword}_traffic`
 */
export interface MultiKeywordChartDataPoint {
  date: string
  dateLabel: string
  [key: string]: string | number | null // Dynamic keys for each keyword
}

/**
 * Sort keywords by their average traffic (highest first)
 * @param history - Array of keyword history records
 * @param keywords - Array of keyword names to sort
 * @returns Sorted array of keyword names
 */
export const sortKeywordsByTraffic = (
  history: KeywordReportHistory[],
  keywords: string[],
): string[] => {
  // Calculate average traffic for each keyword
  const trafficMap = new Map<string, number>()

  keywords.forEach((keyword) => {
    const keywordRecords = history.filter((h) => h.keyword === keyword)
    if (keywordRecords.length > 0) {
      const avgTraffic =
        keywordRecords.reduce((sum, r) => sum + r.traffic, 0) / keywordRecords.length
      trafficMap.set(keyword, avgTraffic)
    } else {
      trafficMap.set(keyword, 0)
    }
  })

  // Sort by traffic descending
  return [...keywords].sort((a, b) => {
    const trafficA = trafficMap.get(a) || 0
    const trafficB = trafficMap.get(b) || 0
    return trafficB - trafficA
  })
}

/**
 * Transform KeywordReportHistory for multiple keywords to chart format
 * Merges data by date, creating columns for each keyword's position and traffic
 * Also includes current keyword data as the latest data point
 *
 * For position data, creates two fields per keyword:
 * - `{keyword}_position`: Display value (clamped to POSITION_CLIP_THRESHOLD for charting)
 * - `{keyword}_position_real`: Actual value (for tooltip/label display)
 *
 * @param history - Array of keyword history records
 * @param keywords - Array of keyword names to include
 * @param days - Period filter (default: 30)
 * @param currentKeywords - Optional array of current keyword data
 * @returns Array of chart data points with dynamic keys
 */
export const transformMultiKeywordForRecharts = (
  history: KeywordReportHistory[],
  keywords: string[],
  days: number = 30,
  currentKeywords?: Array<{
    keyword: string
    position: number | null
    traffic: number
    dateRecorded: string | Date
  }>,
): MultiKeywordChartDataPoint[] => {
  // Filter by period first
  const filteredHistory = filterHistoryByPeriod(history, days)

  // Group by date
  const dateMap = new Map<string, MultiKeywordChartDataPoint>()

  // Helper function to clamp position for display
  const clampPosition = (position: number | null): number | null => {
    if (position === null) return null
    return Math.min(position, POSITION_CLIP_THRESHOLD)
  }

  // Add history records
  filteredHistory.forEach((record) => {
    if (!keywords.includes(record.keyword)) return

    const dateKey = new Date(record.dateRecorded).toISOString().split('T')[0] // YYYY-MM-DD

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: new Date(record.dateRecorded).toISOString(),
        dateLabel: formatChartDate(record.dateRecorded),
      })
    }

    const dataPoint = dateMap.get(dateKey)!
    // Create sanitized key (replace spaces with underscores)
    const safeKeyword = record.keyword.replace(/\s+/g, '_')
    // Store clamped position for charting (won't go below threshold line)
    dataPoint[`${safeKeyword}_position`] = clampPosition(record.position)
    // Store real position for tooltip display
    dataPoint[`${safeKeyword}_position_real`] = record.position
    dataPoint[`${safeKeyword}_traffic`] = record.traffic
  })

  // Add current keyword data as the latest data point (if provided)
  if (currentKeywords && currentKeywords.length > 0) {
    currentKeywords.forEach((kw) => {
      if (!keywords.includes(kw.keyword)) return

      const dateKey = new Date(kw.dateRecorded).toISOString().split('T')[0]

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: new Date(kw.dateRecorded).toISOString(),
          dateLabel: formatChartDate(kw.dateRecorded),
        })
      }

      const dataPoint = dateMap.get(dateKey)!
      const safeKeyword = kw.keyword.replace(/\s+/g, '_')
      // Only set if not already set (history takes priority for same date)
      if (dataPoint[`${safeKeyword}_position`] === undefined) {
        dataPoint[`${safeKeyword}_position`] = clampPosition(kw.position)
        dataPoint[`${safeKeyword}_position_real`] = kw.position
        dataPoint[`${safeKeyword}_traffic`] = kw.traffic
      }
    })
  }

  // Convert to array and sort by date ascending
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
}

/**
 * Create a safe dataKey from keyword name
 * @param keyword - Original keyword name
 * @param suffix - Suffix to append (e.g., "position", "traffic")
 * @returns Safe dataKey string
 */
export const createKeywordDataKey = (keyword: string, suffix: 'position' | 'traffic'): string => {
  return `${keyword.replace(/\s+/g, '_')}_${suffix}`
}

// ============================================================
// Period delta + KPI snapshots (Phase B)
// ============================================================

/**
 * คืนค่า metric จาก history record ที่ใกล้เคียง daysAgo มากที่สุด (ก่อนหรือเท่ากับ)
 * @param history sorted desc (recent first) — รูปแบบของ useGetCombinedHistory
 */
export const getValueAtOrBefore = <T extends { dateRecorded: string | Date }>(
  history: T[],
  daysAgo: number,
  pick: (r: T) => number,
): number | null => {
  if (history.length === 0) return null
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysAgo)
  const cutoffMs = cutoff.getTime()
  // history desc — หา record แรกที่ dateRecorded <= cutoff
  for (const record of history) {
    if (new Date(record.dateRecorded).getTime() <= cutoffMs) {
      return pick(record)
    }
  }
  return null
}

export interface DeltaResult {
  current: number
  previous: number | null
  delta: number
  pct: number | null
  direction: 'up' | 'down' | 'neutral'
}

export const computeDelta = (current: number, previous: number | null): DeltaResult => {
  if (previous === null) {
    return { current, previous: null, delta: 0, pct: null, direction: 'neutral' }
  }
  const delta = current - previous
  const pct = previous === 0 ? null : (delta / previous) * 100
  const direction: 'up' | 'down' | 'neutral' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
  return { current, previous, delta, pct, direction }
}

/**
 * Sparkline data — last N points of metric history (ascending)
 */
export const buildSparkline = <T extends { dateRecorded: string | Date }>(
  history: T[],
  pick: (r: T) => number,
  maxPoints: number = 14,
): number[] => {
  // history desc → reverse to asc, take last maxPoints
  const asc = [...history].reverse()
  const sliced = asc.slice(-maxPoints)
  return sliced.map(pick)
}

/** Count keywords ที่ position อยู่ใน top N */
const countTopN = (keywords: Array<{ position: number | null }>, n: number): number =>
  keywords.filter((k) => k.position !== null && k.position <= n).length

/** Average position (เฉพาะ ranked keywords) */
const computeAvgPosition = (keywords: Array<{ position: number | null }>): number | null => {
  const ranked = keywords.filter(
    (k): k is { position: number } => k.position !== null && k.position > 0,
  )
  if (ranked.length === 0) return null
  return ranked.reduce((sum, k) => sum + k.position, 0) / ranked.length
}

export interface KpiSnapshot extends DeltaResult {
  sparkline: number[]
}

/**
 * KPI deltas + sparklines (WoW default)
 * - totalKeywords: นับจาก currentKeywords vs N-day-ago snapshot
 * - avgPosition: lower = better — direction "down" คือดีขึ้น
 * - top3Count: นับจำนวน position 1-3
 */
export const computeKpiSnapshots = (
  metricsHistory: OverallMetricsHistory[],
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  daysAgo: number = 7,
): {
  totalKeywords: KpiSnapshot
  avgPosition: KpiSnapshot
  top3Count: KpiSnapshot
} => {
  // ---- Total Keywords ----
  // ใช้ organicKeywords จาก metrics history เป็น sparkline + current count
  const currentTotal = currentKeywords.length
  const prevTotal = getValueAtOrBefore(metricsHistory, daysAgo, (r) => r.organicKeywords)
  const totalSparkline = buildSparkline(metricsHistory, (r) => r.organicKeywords)

  // ---- Avg Position ----
  // จาก currentKeywords vs keyword history ที่ daysAgo (เลือก keyword set ของ current)
  const currentKwSet = new Set(currentKeywords.map((k) => k.keyword))
  const currentAvg = computeAvgPosition(currentKeywords)

  // History snapshot ที่ ~daysAgo ago — group keyword ล่าสุดที่บันทึก ≤ cutoff
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysAgo)
  const cutoffMs = cutoff.getTime()
  const historicalByKeyword = new Map<string, KeywordReportHistory>()
  // keywordHistory sorted desc
  for (const rec of keywordHistory) {
    if (new Date(rec.dateRecorded).getTime() > cutoffMs) continue
    if (!currentKwSet.has(rec.keyword)) continue
    if (!historicalByKeyword.has(rec.keyword)) {
      historicalByKeyword.set(rec.keyword, rec)
    }
  }
  const prevAvg = computeAvgPosition(Array.from(historicalByKeyword.values()))

  // Sparkline: avg position grouped by day จาก keywordHistory (last 14 days)
  const dayMap = new Map<string, number[]>() // dateKey → positions
  for (const rec of keywordHistory) {
    if (rec.position === null || rec.position <= 0) continue
    const dateKey = new Date(rec.dateRecorded).toISOString().split('T')[0]
    const arr = dayMap.get(dateKey) ?? []
    arr.push(rec.position)
    dayMap.set(dateKey, arr)
  }
  const avgSparkline = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([, positions]) =>
      positions.length > 0 ? positions.reduce((s, p) => s + p, 0) / positions.length : 0,
    )

  // ---- Top 3 Count ----
  const currentTop3 = countTopN(currentKeywords, 3)
  const prevTop3 = Array.from(historicalByKeyword.values())
    ? countTopN(Array.from(historicalByKeyword.values()), 3)
    : 0
  // Sparkline: count top-3 per day
  const top3Sparkline = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([, positions]) => positions.filter((p) => p <= 3).length)

  return {
    totalKeywords: {
      ...computeDelta(currentTotal, prevTotal),
      sparkline: totalSparkline,
    },
    avgPosition: {
      ...computeDelta(currentAvg ?? 0, prevAvg),
      sparkline: avgSparkline,
    },
    top3Count: {
      ...computeDelta(currentTop3, prevTop3),
      sparkline: top3Sparkline,
    },
  }
}

// ============================================================
// Position distribution
// ============================================================

export type PositionBucket = 'top3' | 'top10' | 'top20' | 'beyond' | 'unranked'

export interface PositionDistributionResult {
  top3: number
  top10: number
  top20: number
  beyond: number
  unranked: number
  total: number
}

export const bucketForPosition = (pos: number | null): PositionBucket => {
  if (pos === null || pos <= 0) return 'unranked'
  if (pos <= 3) return 'top3'
  if (pos <= 10) return 'top10'
  if (pos <= 20) return 'top20'
  return 'beyond'
}

export const computePositionDistribution = (
  keywords: Array<{ position: number | null }>,
): PositionDistributionResult => {
  const result: PositionDistributionResult = {
    top3: 0,
    top10: 0,
    top20: 0,
    beyond: 0,
    unranked: 0,
    total: keywords.length,
  }
  for (const k of keywords) {
    const bucket = bucketForPosition(k.position)
    result[bucket] += 1
  }
  return result
}

// ============================================================
// Top movers / losers
// ============================================================

export interface KeywordMovement {
  keyword: string
  previousPosition: number | null
  currentPosition: number | null
  delta: number | null // negative = improved (lower position is better)
  trafficCurrent: number
}

/**
 * เปรียบเทียบ position ปัจจุบันของ keyword vs history ณ period N-days-ago
 * คืน top N gainers (improved most = delta < 0) + top N losers (worsened most = delta > 0)
 */
export const computeTopMovers = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  period: PeriodOption,
  limit: number = 3,
): { gainers: KeywordMovement[]; losers: KeywordMovement[] } => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - period)
  const cutoffMs = cutoff.getTime()

  // หา historical record ที่ใกล้สุดก่อน cutoff สำหรับแต่ละ keyword
  const historicalByKw = new Map<string, KeywordReportHistory>()
  for (const rec of keywordHistory) {
    if (new Date(rec.dateRecorded).getTime() > cutoffMs) continue
    if (!historicalByKw.has(rec.keyword)) {
      historicalByKw.set(rec.keyword, rec)
    }
  }

  const movements: KeywordMovement[] = currentKeywords.map((curr) => {
    const prev = historicalByKw.get(curr.keyword)
    const prevPos = prev?.position ?? null
    const currPos = curr.position
    let delta: number | null = null
    if (prevPos !== null && currPos !== null) {
      delta = currPos - prevPos
    }
    return {
      keyword: curr.keyword,
      previousPosition: prevPos,
      currentPosition: currPos,
      delta,
      trafficCurrent: curr.traffic,
    }
  })

  const withDelta = movements.filter((m) => m.delta !== null && m.delta !== 0)
  const gainers = withDelta
    .filter((m) => (m.delta as number) < 0)
    .sort((a, b) => (a.delta as number) - (b.delta as number))
    .slice(0, limit)
  const losers = withDelta
    .filter((m) => (m.delta as number) > 0)
    .sort((a, b) => (b.delta as number) - (a.delta as number))
    .slice(0, limit)

  return { gainers, losers }
}

// ============================================================
// Anomaly detection (z-score)
// ============================================================

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
// Downsampling — simple stride (กัน chart อืดเมื่อ history ยาว)
// ============================================================

interface DownsamplableDatum {
  date: Date
  value: number
}

/**
 * Stride downsampling — เก็บจุดแรก + จุดสุดท้าย + ตัวอย่างใน between
 * เหมาะกับ time series ที่ data dense + visual fidelity ไม่ critical
 */
export const downsampleTimeseries = <T extends DownsamplableDatum>(
  data: T[],
  maxPoints: number = 60,
): T[] => {
  if (data.length <= maxPoints) return data
  const stride = Math.ceil(data.length / maxPoints)
  const result: T[] = []
  for (let i = 0; i < data.length; i += stride) {
    result.push(data[i])
  }
  // ensure last point included
  const last = data[data.length - 1]
  if (result[result.length - 1] !== last) result.push(last)
  return result
}

/**
 * Stride downsampling สำหรับ wide-format rows (recharts) — ไม่ผูกกับ shape ของ datum
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

// ============================================================
// Phase B helpers — ROI headline + Coverage stats
// ============================================================

export interface RoiHeadline {
  /** % traffic change vs N-day-ago snapshot — null ถ้าไม่มี baseline */
  trafficPctChange: number | null
  trafficDirection: 'up' | 'down' | 'neutral'
  /** จำนวน keyword ที่ position ดีขึ้น (delta < 0) */
  improvedKeywordCount: number
  /** จำนวน keyword ที่หล่นลง (delta > 0) */
  declinedKeywordCount: number
  /** จำนวน keyword ที่ tracked (ranked) ในปัจจุบัน */
  totalRankedKeywords: number
  /** true ถ้ามี baseline ให้เทียบ (history ≥ 2 จุด หรือมี keyword movement) */
  hasData: boolean
}

/**
 * ROI summary ที่ Customer ตอบ "จ่ายไปคุ้มไหม?" ใน 5 วินาที
 * - Traffic %: เทียบ organicTraffic ปัจจุบัน vs N-day-ago metrics snapshot
 * - Improved/Declined: นับ keyword ที่ position เปลี่ยน (reuse computeTopMovers แบบไม่จำกัด limit)
 */
export const computeRoiHeadline = (
  metricsHistory: OverallMetricsHistory[],
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  period: PeriodOption,
): RoiHeadline => {
  const currentTraffic = metricsHistory.length > 0 ? metricsHistory[0].organicTraffic : null
  const previousTraffic = getValueAtOrBefore(metricsHistory, period, (r) => r.organicTraffic)

  let trafficPctChange: number | null = null
  let trafficDirection: 'up' | 'down' | 'neutral' = 'neutral'
  if (currentTraffic !== null && previousTraffic !== null && previousTraffic > 0) {
    trafficPctChange = ((currentTraffic - previousTraffic) / previousTraffic) * 100
    if (trafficPctChange > 0.5) trafficDirection = 'up'
    else if (trafficPctChange < -0.5) trafficDirection = 'down'
  }

  // จำนวน improved/declined — ใช้ computeTopMovers limit ใหญ่พอ
  const { gainers, losers } = computeTopMovers(keywordHistory, currentKeywords, period, 1000)

  const totalRankedKeywords = currentKeywords.filter(
    (k) => k.position !== null && k.position > 0,
  ).length

  const hasData = trafficPctChange !== null || gainers.length > 0 || losers.length > 0

  return {
    trafficPctChange,
    trafficDirection,
    improvedKeywordCount: gainers.length,
    declinedKeywordCount: losers.length,
    totalRankedKeywords,
    hasData,
  }
}

export interface CoverageStats {
  trackedKeywords: number
  topKeywordsCount: number
  otherKeywordsCount: number
  lastUpdated: Date | null
}

/**
 * Snapshot การครอบคลุม — Customer เห็นว่า "ดูแลกี่ keyword อัปเดตเมื่อไหร่"
 */
export const computeCoverageStats = (
  topKeywords: Array<unknown>,
  otherKeywords: Array<unknown>,
  metricsHistory: OverallMetricsHistory[],
): CoverageStats => {
  const lastUpdated = metricsHistory.length > 0 ? new Date(metricsHistory[0].dateRecorded) : null
  return {
    trackedKeywords: topKeywords.length + otherKeywords.length,
    topKeywordsCount: topKeywords.length,
    otherKeywordsCount: otherKeywords.length,
    lastUpdated,
  }
}

// ============================================================
// Phase C helpers — Authority Radar + Domain Lifecycle + Backlinks ratio
// ============================================================

/** Normalize raw value → 0-100 score */
export const normalizeToScore100 = (
  value: number,
  fullScale: number,
  mode: 'linear' | 'log10',
): number => {
  if (value <= 0 || fullScale <= 0) return 0
  if (mode === 'log10') {
    const score = (Math.log10(value + 1) / Math.log10(fullScale + 1)) * 100
    return Math.max(0, Math.min(100, score))
  }
  return Math.max(0, Math.min(100, (value / fullScale) * 100))
}

// Reference scales — tuned for typical SEO ranges
const BACKLINKS_FULL_SCALE = 100_000
const TRAFFIC_FULL_SCALE = 50_000

export type AuthorityAxis = 'DR' | 'Health' | 'Trust' | 'Backlinks' | 'Traffic'

export interface AuthorityRadarPoint {
  axis: AuthorityAxis
  /** 0-100 normalized for chart rendering */
  current: number
  previous: number | null
  /** raw value for tooltip display */
  rawCurrent: number
  rawPrevious: number | null
}

/**
 * Radar 5 axes: DR / Health / Trust(100-spam×10) / Backlinks(log10) / Traffic(log10)
 * - current: ค่าปัจจุบันจาก OverallMetrics
 * - previous: snapshot ใน metricsHistory ที่ N-day-ago (จาก period)
 */
export const computeAuthorityRadar = (
  current: OverallMetricsForm,
  metricsHistory: OverallMetricsHistory[],
  period: PeriodOption,
): AuthorityRadarPoint[] => {
  const prevDr = getValueAtOrBefore(metricsHistory, period, (r) => r.domainRating)
  const prevHealth = getValueAtOrBefore(metricsHistory, period, (r) => r.healthScore)
  const prevSpam = getValueAtOrBefore(metricsHistory, period, (r) => r.spamScore)
  const prevBacklinks = getValueAtOrBefore(metricsHistory, period, (r) => r.backlinks)
  const prevTraffic = getValueAtOrBefore(metricsHistory, period, (r) => r.organicTraffic)

  const trustFromSpam = (spam: number) => Math.max(0, Math.min(100, 100 - spam * 10))

  return [
    {
      axis: 'DR',
      current: Math.max(0, Math.min(100, current.domainRating)),
      previous: prevDr,
      rawCurrent: current.domainRating,
      rawPrevious: prevDr,
    },
    {
      axis: 'Health',
      current: Math.max(0, Math.min(100, current.healthScore)),
      previous: prevHealth,
      rawCurrent: current.healthScore,
      rawPrevious: prevHealth,
    },
    {
      axis: 'Trust',
      current: trustFromSpam(current.spamScore),
      previous: prevSpam !== null ? trustFromSpam(prevSpam) : null,
      rawCurrent: current.spamScore,
      rawPrevious: prevSpam,
    },
    {
      axis: 'Backlinks',
      current: normalizeToScore100(current.backlinks, BACKLINKS_FULL_SCALE, 'log10'),
      previous:
        prevBacklinks !== null
          ? normalizeToScore100(prevBacklinks, BACKLINKS_FULL_SCALE, 'log10')
          : null,
      rawCurrent: current.backlinks,
      rawPrevious: prevBacklinks,
    },
    {
      axis: 'Traffic',
      current: normalizeToScore100(current.organicTraffic, TRAFFIC_FULL_SCALE, 'log10'),
      previous:
        prevTraffic !== null ? normalizeToScore100(prevTraffic, TRAFFIC_FULL_SCALE, 'log10') : null,
      rawCurrent: current.organicTraffic,
      rawPrevious: prevTraffic,
    },
  ]
}

export type DomainPhase = 'establishing' | 'growing' | 'mature'

export interface DomainPhaseInfo {
  phase: DomainPhase
  label: string
  description: string
  progressWithinPhase: number // 0-100
}

/**
 * Domain lifecycle phase based on age (years + months)
 * - establishing: < 1 year (focus on backlinks foundation)
 * - growing: 1-3 years (focus on content + authority)
 * - mature: 3+ years (focus on retention + new keywords)
 */
export const computeDomainPhase = (years: number, months: number): DomainPhaseInfo => {
  const totalMonths = Math.max(0, years * 12 + months)
  if (totalMonths < 12) {
    return {
      phase: 'establishing',
      label: 'Establishing',
      description: 'ช่วงสร้างฐาน — เน้น backlinks + technical SEO',
      progressWithinPhase: (totalMonths / 12) * 100,
    }
  }
  if (totalMonths < 36) {
    return {
      phase: 'growing',
      label: 'Growing',
      description: 'ช่วงเติบโต — เน้น content + ขยาย keyword',
      progressWithinPhase: ((totalMonths - 12) / 24) * 100,
    }
  }
  return {
    phase: 'mature',
    label: 'Mature',
    description: 'ช่วงคงตำแหน่ง — เน้น retention + niche expansion',
    // Mature has no upper cap — show progress within 3-10 yr range, cap 100
    progressWithinPhase: Math.min(100, ((totalMonths - 36) / 84) * 100),
  }
}

/** Backlinks per referring domain (null if refDomains = 0) */
export const computeBacklinkRatio = (backlinks: number, refDomains: number): number | null => {
  if (refDomains <= 0) return null
  return backlinks / refDomains
}

// ============================================================
// Phase D helpers — Keyword Performance
// ============================================================

export type KdLevelString = 'HARD' | 'MEDIUM' | 'EASY'

export interface KdDistributionResult {
  HARD: number
  MEDIUM: number
  EASY: number
  total: number
}

/** Group keywords by KD level — รับทั้ง enum + string */
export const groupKeywordsByKd = (
  keywords: Array<{ kd: KdLevelString | string }>,
): KdDistributionResult => {
  const result: KdDistributionResult = {
    HARD: 0,
    MEDIUM: 0,
    EASY: 0,
    total: keywords.length,
  }
  for (const kw of keywords) {
    const kd = String(kw.kd).toUpperCase()
    if (kd === 'HARD' || kd === 'MEDIUM' || kd === 'EASY') {
      result[kd] += 1
    }
  }
  return result
}

export interface KdSuccessRateRow {
  level: KdLevelString
  inTopN: number
  total: number
  rate: number // 0..1
}

/** % keyword ที่ติด top N แยกตาม KD */
export const computeKdSuccessRate = (
  keywords: Array<{ kd: KdLevelString | string; position: number | null }>,
  topN: number = 10,
): KdSuccessRateRow[] => {
  const levels: KdLevelString[] = ['EASY', 'MEDIUM', 'HARD']
  return levels.map((level) => {
    const inLevel = keywords.filter((k) => String(k.kd).toUpperCase() === level)
    const inTopN = inLevel.filter(
      (k) => k.position !== null && k.position > 0 && k.position <= topN,
    ).length
    return {
      level,
      inTopN,
      total: inLevel.length,
      rate: inLevel.length === 0 ? 0 : inTopN / inLevel.length,
    }
  })
}

export interface TrafficContributionItem {
  keyword: string
  traffic: number
  pct: number // 0..100
  isOther: boolean
}

/** Top N keywords by traffic + "Other" rollup */
export const computeTrafficContribution = (
  keywords: Array<{ keyword: string; traffic: number }>,
  topN: number = 5,
): TrafficContributionItem[] => {
  const sorted = [...keywords].sort((a, b) => b.traffic - a.traffic)
  const total = sorted.reduce((sum, k) => sum + k.traffic, 0)
  if (total === 0) return []

  if (sorted.length <= topN) {
    return sorted.map((k) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      pct: (k.traffic / total) * 100,
      isOther: false,
    }))
  }
  const top = sorted.slice(0, topN)
  const otherTraffic = sorted.slice(topN).reduce((sum, k) => sum + k.traffic, 0)
  return [
    ...top.map((k) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      pct: (k.traffic / total) * 100,
      isOther: false,
    })),
    {
      keyword: `Other (${sorted.length - topN} keywords)`,
      traffic: otherTraffic,
      pct: (otherTraffic / total) * 100,
      isOther: true,
    },
  ]
}

export type VelocityQuadrant =
  | 'rising' // pos↓ (improved) + traffic↑
  | 'hidden' // pos↑ (worsened) + traffic↑
  | 'cooling' // pos↓ (improved) + traffic↓
  | 'falling' // pos↑ (worsened) + traffic↓
  | 'stagnant'

export interface KeywordVelocityPoint {
  keyword: string
  positionDelta: number
  trafficDelta: number
  currentPosition: number
  currentTraffic: number
  quadrant: VelocityQuadrant
}

const classifyQuadrant = (posDelta: number, trafficDelta: number): VelocityQuadrant => {
  if (posDelta === 0 && trafficDelta === 0) return 'stagnant'
  if (posDelta < 0 && trafficDelta > 0) return 'rising'
  if (posDelta > 0 && trafficDelta > 0) return 'hidden'
  if (posDelta < 0 && trafficDelta < 0) return 'cooling'
  return 'falling'
}

/** Velocity scatter — position+traffic ปัจจุบัน vs N-day-ago snapshot */
export const computeKeywordVelocity = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  period: PeriodOption,
): KeywordVelocityPoint[] => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - period)
  const cutoffMs = cutoff.getTime()

  const historicalByKw = new Map<string, KeywordReportHistory>()
  for (const rec of keywordHistory) {
    if (new Date(rec.dateRecorded).getTime() > cutoffMs) continue
    if (!historicalByKw.has(rec.keyword)) {
      historicalByKw.set(rec.keyword, rec)
    }
  }

  const points: KeywordVelocityPoint[] = []
  for (const curr of currentKeywords) {
    const prev = historicalByKw.get(curr.keyword)
    if (!prev) continue
    if (curr.position === null || prev.position === null) continue

    const posDelta = curr.position - prev.position
    const trafficDelta = curr.traffic - prev.traffic
    if (posDelta === 0 && trafficDelta === 0) continue

    points.push({
      keyword: curr.keyword,
      positionDelta: posDelta,
      trafficDelta,
      currentPosition: curr.position,
      currentTraffic: curr.traffic,
      quadrant: classifyQuadrant(posDelta, trafficDelta),
    })
  }
  return points
}

// ============================================================
// Phase E helpers — AI overview weekly counts
// ============================================================

export interface WeeklyCount {
  weekStart: Date
  weekLabel: string
  count: number
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Reset to Monday 00:00 (ISO week) */
const toWeekStart = (d: Date): Date => {
  const result = new Date(d)
  result.setHours(0, 0, 0, 0)
  const day = result.getDay() // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  result.setDate(result.getDate() + diff)
  return result
}

/** Count AI Overview entries grouped by week (latest N weeks) */
export const computeAiOverviewWeeklyCounts = (
  aiOverviews: Array<{ displayDate: string | Date }>,
  weeks: number = 12,
): WeeklyCount[] => {
  const now = new Date()
  const latestWeekStart = toWeekStart(now)
  const earliestWeekStart = new Date(latestWeekStart.getTime() - (weeks - 1) * WEEK_MS)

  // Initialize buckets — weeks weeks worth of empty buckets
  const buckets: WeeklyCount[] = []
  for (let i = 0; i < weeks; i += 1) {
    const start = new Date(earliestWeekStart.getTime() + i * WEEK_MS)
    buckets.push({
      weekStart: start,
      weekLabel: start.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
      }),
      count: 0,
    })
  }

  // Tally
  for (const ai of aiOverviews) {
    const date = new Date(ai.displayDate)
    if (date < earliestWeekStart || date > now) continue
    const weekStart = toWeekStart(date)
    const idx = Math.floor((weekStart.getTime() - earliestWeekStart.getTime()) / WEEK_MS)
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count += 1
    }
  }
  return buckets
}

// ============================================================================
// Traffic Forecast Cone — linear regression + std error confidence band
// ============================================================================

export interface ForecastPoint {
  /** Day offset from "now": 0 = today, negative = past, positive = forecast */
  dayOffset: number
  /** ms epoch */
  time: number
  label: string
  /** Actual traffic (null for forecast) */
  actual: number | null
  /** Predicted traffic (null for actual) */
  predicted: number | null
  /** Lower bound of confidence interval (null for actual) */
  lower: number | null
  /** Upper bound of confidence interval (null for actual) */
  upper: number | null
}

export interface TrafficForecastResult {
  points: ForecastPoint[]
  /** Predicted traffic at +daysAhead */
  forecastEnd: number | null
  /** % change predicted vs current */
  changePct: number | null
  /** R² of fit (0..1) — quality indicator */
  rSquared: number
  hasData: boolean
}

/**
 * Forecast traffic for N days ahead using linear regression on history.
 * Confidence band = ±1.96 × residual std (~95% CI).
 */
export const computeTrafficForecast = (
  metricsHistory: OverallMetricsHistory[],
  currentTraffic: number | null | undefined,
  daysAhead: number = 30,
): TrafficForecastResult => {
  const historyPoints: { t: number; y: number }[] = metricsHistory
    .filter((h) => h.organicTraffic != null)
    .map((h) => ({
      t: new Date(h.dateRecorded).getTime(),
      y: Number(h.organicTraffic ?? 0),
    }))
    .sort((a, b) => a.t - b.t)

  // Include "now" point if currentTraffic is available
  if (currentTraffic != null) {
    historyPoints.push({ t: Date.now(), y: currentTraffic })
  }

  if (historyPoints.length < 2) {
    return {
      points: [],
      forecastEnd: null,
      changePct: null,
      rSquared: 0,
      hasData: false,
    }
  }

  // Normalize time to days from first point
  const t0 = historyPoints[0].t
  const xs = historyPoints.map((p) => (p.t - t0) / (1000 * 60 * 60 * 24))
  const ys = historyPoints.map((p) => p.y)
  const n = xs.length

  const meanX = xs.reduce((s, v) => s + v, 0) / n
  const meanY = ys.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - meanX) * (ys[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX

  // Residual std
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i += 1) {
    const pred = slope * xs[i] + intercept
    ssRes += (ys[i] - pred) ** 2
    ssTot += (ys[i] - meanY) ** 2
  }
  const residualStd = Math.sqrt(ssRes / Math.max(n - 2, 1))
  const ci = 1.96 * residualStd
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot)

  // Build series: keep last 30 history points (or all if fewer) + forecast
  const fmt = (d: Date) => d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })

  const historyTail = historyPoints.slice(-30)
  const nowMs = Date.now()
  const points: ForecastPoint[] = historyTail.map((p) => {
    const offset = Math.round((p.t - nowMs) / (1000 * 60 * 60 * 24))
    return {
      dayOffset: offset,
      time: p.t,
      label: fmt(new Date(p.t)),
      actual: p.y,
      predicted: null,
      lower: null,
      upper: null,
    }
  })

  // Anchor: forecast starts from the "today" prediction (continuous with history end)
  for (let d = 1; d <= daysAhead; d += 1) {
    const future = nowMs + d * 1000 * 60 * 60 * 24
    const x = (future - t0) / (1000 * 60 * 60 * 24)
    const pred = Math.max(0, slope * x + intercept)
    points.push({
      dayOffset: d,
      time: future,
      label: fmt(new Date(future)),
      actual: null,
      predicted: pred,
      lower: Math.max(0, pred - ci),
      upper: pred + ci,
    })
  }

  // Bridge: add a "now" predicted point so forecast line is continuous from last actual
  if (points.length > 0) {
    const lastActualIdx = points.findIndex((p) => p.predicted !== null)
    if (lastActualIdx > 0) {
      const lastActual = points[lastActualIdx - 1]
      if (lastActual.actual !== null) {
        lastActual.predicted = lastActual.actual
        lastActual.lower = lastActual.actual
        lastActual.upper = lastActual.actual
      }
    }
  }

  const forecastEnd = points[points.length - 1]?.predicted ?? null
  const changePct =
    forecastEnd != null && currentTraffic && currentTraffic > 0
      ? ((forecastEnd - currentTraffic) / currentTraffic) * 100
      : null

  return { points, forecastEnd, changePct, rSquared, hasData: true }
}

// ============================================================================
// Sparkline grid — top N keywords with mini trend + current + delta
// ============================================================================

export interface SparklineKeywordRow {
  keyword: string
  reportId: string
  current: number
  delta: number
  deltaPct: number | null
  /** Position over time (recent → past does not matter; ordered chronologically) */
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
      .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())

    const positionSpark = records.map((r) => ({
      t: new Date(r.dateRecorded).getTime(),
      v: Number(r.position ?? POSITION_CLIP_THRESHOLD),
    }))

    const prevTraffic = records.length > 0 ? Number(records[0].traffic ?? 0) : 0
    const currentTraffic = kw.traffic ?? 0
    const delta = currentTraffic - prevTraffic
    const deltaPct = prevTraffic > 0 ? ((currentTraffic - prevTraffic) / prevTraffic) * 100 : null

    return {
      keyword: kw.keyword,
      reportId: kw.id,
      current: currentTraffic,
      delta,
      deltaPct,
      positionSpark,
      currentPosition: kw.position ?? null,
    }
  })
}

// ============================================================================
// Position Heatmap — keyword × week matrix
// ============================================================================

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
  // Build week buckets
  const now = new Date()
  const latestWeek = toWeekStart(now)
  const earliest = new Date(latestWeek.getTime() - (weeks - 1) * WEEK_MS)
  const weekList: Array<{ start: number; label: string }> = []
  for (let i = 0; i < weeks; i += 1) {
    const start = new Date(earliest.getTime() + i * WEEK_MS)
    weekList.push({
      start: start.getTime(),
      label: start.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
      }),
    })
  }

  // Top N by current traffic
  const sorted = [...currentKeywords]
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
    .slice(0, topN)

  const rows: HeatmapRow[] = sorted.map((kw) => {
    // Last seen position per week (latest record in week wins)
    const cells: HeatmapCell[] = weekList.map((w) => ({
      position: null,
      weekStart: w.start,
    }))

    const records = keywordHistory
      .filter((h) => h.reportId === kw.id)
      .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())

    for (const r of records) {
      // position 0 / negative = "unranked" — ข้าม ไม่ให้ขึ้น cell สีเขียว #0
      if (r.position == null || r.position <= 0) continue
      const t = new Date(r.dateRecorded).getTime()
      if (t < earliest.getTime() || t > now.getTime() + WEEK_MS) continue
      const idx = Math.floor((toWeekStart(new Date(t)).getTime() - earliest.getTime()) / WEEK_MS)
      if (idx >= 0 && idx < cells.length) {
        cells[idx].position = Number(r.position)
      }
    }

    // Fill latest week with current position if no history
    const lastIdx = cells.length - 1
    if (cells[lastIdx].position == null && kw.position != null && kw.position > 0) {
      cells[lastIdx].position = kw.position
    }

    return {
      keyword: kw.keyword,
      reportId: kw.id,
      cells,
      currentPosition: kw.position != null && kw.position > 0 ? kw.position : null,
    }
  })

  return { rows, weeks: weekList }
}

// ============================================================================
// Bracket Transitions Sankey — keywords flowing between rank brackets
// ============================================================================

export type Bracket = 'top3' | 'top10' | 'top20' | 'beyond' | 'missing'

const BRACKET_LABELS: Record<Bracket, string> = {
  top3: 'Top 3',
  top10: 'Top 4-10',
  top20: 'Top 11-20',
  beyond: '20+',
  missing: 'No data',
}

const bracketForPos = (pos: number | null | undefined): Bracket => {
  // position 0 / negative = "unranked" sentinel — ไม่ใช่อันดับจริง (อย่า bucket เป็น Top 3)
  if (pos == null || pos <= 0) return 'missing'
  if (pos <= 3) return 'top3'
  if (pos <= 10) return 'top10'
  if (pos <= 20) return 'top20'
  return 'beyond'
}

export interface SankeyNode {
  id: string
  label: string
  bracket: Bracket
  /** "from" or "to" side */
  side: 'from' | 'to'
  /** Total count flowing through this node */
  total: number
}

export interface SankeyLink {
  source: string
  target: string
  fromBracket: Bracket
  toBracket: Bracket
  count: number
}

export interface BracketTransitionsResult {
  nodes: SankeyNode[]
  links: SankeyLink[]
  total: number
  hasData: boolean
}

/**
 * Compare bracket distribution between earliest and latest snapshot.
 * Returns Sankey-ready nodes + links.
 */
export const computeBracketTransitions = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  period: PeriodOption,
): BracketTransitionsResult => {
  const days = period
  const fromTime = Date.now() - days * 24 * 60 * 60 * 1000

  // For each current keyword: find the position at/before `fromTime` (earliest snapshot)
  // and current position (latest snapshot)
  const transitionCounts = new Map<string, number>()
  let total = 0

  for (const kw of currentKeywords) {
    const records = keywordHistory
      .filter((h) => h.reportId === kw.id)
      .sort((a, b) => new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime())

    // Position at the start of the period (closest record at/before fromTime)
    let fromPos: number | null = null
    for (const r of records) {
      const t = new Date(r.dateRecorded).getTime()
      if (t <= fromTime) {
        fromPos = r.position ?? null
      } else {
        break
      }
    }
    // If no records before fromTime, use the earliest record
    if (fromPos == null && records.length > 0) {
      fromPos = records[0].position ?? null
    }

    const toPos = kw.position ?? null

    // Skip if both sides have no data
    if (fromPos == null && toPos == null) continue

    const fromBracket = bracketForPos(fromPos)
    const toBracket = bracketForPos(toPos)
    const key = `${fromBracket}__${toBracket}`
    transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1)
    total += 1
  }

  const usedBrackets = new Set<Bracket>()
  const links: SankeyLink[] = []
  for (const [key, count] of transitionCounts.entries()) {
    const [from, to] = key.split('__') as [Bracket, Bracket]
    usedBrackets.add(from)
    usedBrackets.add(to)
    links.push({
      source: `from-${from}`,
      target: `to-${to}`,
      fromBracket: from,
      toBracket: to,
      count,
    })
  }

  // Build nodes in canonical order
  const order: Bracket[] = ['top3', 'top10', 'top20', 'beyond', 'missing']
  const nodes: SankeyNode[] = []
  for (const b of order) {
    const fromTotal = links.filter((l) => l.fromBracket === b).reduce((s, l) => s + l.count, 0)
    if (fromTotal > 0) {
      nodes.push({
        id: `from-${b}`,
        label: BRACKET_LABELS[b],
        bracket: b,
        side: 'from',
        total: fromTotal,
      })
    }
  }
  for (const b of order) {
    const toTotal = links.filter((l) => l.toBracket === b).reduce((s, l) => s + l.count, 0)
    if (toTotal > 0) {
      nodes.push({
        id: `to-${b}`,
        label: BRACKET_LABELS[b],
        bracket: b,
        side: 'to',
        total: toTotal,
      })
    }
  }

  return { nodes, links, total, hasData: total > 0 }
}
