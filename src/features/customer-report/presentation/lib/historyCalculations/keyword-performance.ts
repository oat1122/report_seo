import { KeywordReportHistory } from '@/types/history'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { PeriodOption } from '../chartConfig'
import { latestRecordByKeywordBeforeCutoff } from './_shared'

// ============================================================
// Keyword Performance — KD distribution / success rate / traffic share
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
  const result: KdDistributionResult = { HARD: 0, MEDIUM: 0, EASY: 0, total: keywords.length }
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

  const toItem = (k: { keyword: string; traffic: number }): TrafficContributionItem => ({
    keyword: k.keyword,
    traffic: k.traffic,
    pct: (k.traffic / total) * 100,
    isOther: false,
  })

  if (sorted.length <= topN) {
    return sorted.map(toItem)
  }

  const otherTraffic = sorted.slice(topN).reduce((sum, k) => sum + k.traffic, 0)
  return [
    ...sorted.slice(0, topN).map(toItem),
    {
      keyword: `Other (${sorted.length - topN} keywords)`,
      traffic: otherTraffic,
      pct: (otherTraffic / total) * 100,
      isOther: true,
    },
  ]
}

// ============================================================
// Keyword Velocity — position×traffic delta quadrants
// ============================================================

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
  const cutoffMs = Date.now() - period * 24 * 60 * 60 * 1000
  const historicalByKw = latestRecordByKeywordBeforeCutoff(keywordHistory, cutoffMs)

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
