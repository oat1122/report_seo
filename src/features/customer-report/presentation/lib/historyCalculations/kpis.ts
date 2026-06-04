import { KeywordReportHistory, OverallMetricsHistory } from '@/types/history'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { PeriodOption } from '../chartConfig'
import {
  getValueAtOrBefore,
  isRanked,
  latestRecordByKeywordBeforeCutoff,
} from './_shared'
import { computeTopMovers } from './distribution'

// ============================================================
// Period delta + KPI snapshots
// ============================================================

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

/** Sparkline data — last N points of metric history (ascending) */
export const buildSparkline = <T extends { dateRecorded: string | Date }>(
  history: T[],
  pick: (r: T) => number,
  maxPoints: number = 14,
): number[] => {
  // history desc → reverse to asc, take last maxPoints
  return [...history].reverse().slice(-maxPoints).map(pick)
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
  const currentTotal = currentKeywords.length
  const prevTotal = getValueAtOrBefore(metricsHistory, daysAgo, (r) => r.organicKeywords)
  const totalSparkline = buildSparkline(metricsHistory, (r) => r.organicKeywords)

  // ---- Avg Position ----
  const currentKwSet = new Set(currentKeywords.map((k) => k.keyword))
  const currentAvg = computeAvgPosition(currentKeywords)

  const cutoffMs = Date.now() - daysAgo * 24 * 60 * 60 * 1000
  const historicalByKeyword = latestRecordByKeywordBeforeCutoff(keywordHistory, cutoffMs, currentKwSet)
  const historicalValues = Array.from(historicalByKeyword.values())
  const prevAvg = computeAvgPosition(historicalValues)

  // Sparkline: avg position + top-3 count grouped by day (last 14 days)
  const dayMap = new Map<string, number[]>() // dateKey → positions
  for (const rec of keywordHistory) {
    if (!isRanked(rec.position)) continue
    const dateKey = new Date(rec.dateRecorded).toISOString().split('T')[0]
    const arr = dayMap.get(dateKey) ?? []
    arr.push(rec.position)
    dayMap.set(dateKey, arr)
  }
  const dailyPositions = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([, positions]) => positions)
  const avgSparkline = dailyPositions.map((positions) =>
    positions.length > 0 ? positions.reduce((s, p) => s + p, 0) / positions.length : 0,
  )
  const top3Sparkline = dailyPositions.map((positions) => positions.filter((p) => p <= 3).length)

  // ---- Top 3 Count ----
  const currentTop3 = countTopN(currentKeywords, 3)
  const prevTop3 = countTopN(historicalValues, 3)

  return {
    totalKeywords: { ...computeDelta(currentTotal, prevTotal), sparkline: totalSparkline },
    avgPosition: { ...computeDelta(currentAvg ?? 0, prevAvg), sparkline: avgSparkline },
    top3Count: { ...computeDelta(currentTop3, prevTop3), sparkline: top3Sparkline },
  }
}

// ============================================================
// ROI headline + Coverage stats
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

  const totalRankedKeywords = currentKeywords.filter((k) => isRanked(k.position)).length
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

/** Snapshot การครอบคลุม — Customer เห็นว่า "ดูแลกี่ keyword อัปเดตเมื่อไหร่" */
export const computeCoverageStats = (
  topKeywords: Array<unknown>,
  otherKeywords: Array<unknown>,
  metricsHistory: OverallMetricsHistory[],
): CoverageStats => ({
  trackedKeywords: topKeywords.length + otherKeywords.length,
  topKeywordsCount: topKeywords.length,
  otherKeywordsCount: otherKeywords.length,
  lastUpdated: metricsHistory.length > 0 ? new Date(metricsHistory[0].dateRecorded) : null,
})
