import { KeywordReportHistory } from '@/types/history'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { PeriodOption } from '../chartConfig'
import { latestRecordByKeywordBeforeCutoff, sortByDateAsc } from './_shared'

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
    result[bucketForPosition(k.position)] += 1
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
  const cutoffMs = Date.now() - period * 24 * 60 * 60 * 1000
  const historicalByKw = latestRecordByKeywordBeforeCutoff(keywordHistory, cutoffMs)

  const movements: KeywordMovement[] = currentKeywords.map((curr) => {
    const prevPos = historicalByKw.get(curr.keyword)?.position ?? null
    const currPos = curr.position
    const delta = prevPos !== null && currPos !== null ? currPos - prevPos : null
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
// Bracket Transitions Sankey — keywords flowing between rank brackets
// ============================================================

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
  const fromTime = Date.now() - period * 24 * 60 * 60 * 1000

  // For each current keyword: find the position at/before `fromTime` (earliest snapshot)
  // and current position (latest snapshot)
  const transitionCounts = new Map<string, number>()
  let total = 0

  for (const kw of currentKeywords) {
    const records = keywordHistory.filter((h) => h.reportId === kw.id).sort(sortByDateAsc)

    // Position at the start of the period (closest record at/before fromTime)
    let fromPos: number | null = null
    for (const r of records) {
      if (new Date(r.dateRecorded).getTime() <= fromTime) {
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

    const key = `${bracketForPos(fromPos)}__${bracketForPos(toPos)}`
    transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1)
    total += 1
  }

  const links: SankeyLink[] = []
  for (const [key, count] of transitionCounts.entries()) {
    const [from, to] = key.split('__') as [Bracket, Bracket]
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
      nodes.push({ id: `from-${b}`, label: BRACKET_LABELS[b], bracket: b, side: 'from', total: fromTotal })
    }
  }
  for (const b of order) {
    const toTotal = links.filter((l) => l.toBracket === b).reduce((s, l) => s + l.count, 0)
    if (toTotal > 0) {
      nodes.push({ id: `to-${b}`, label: BRACKET_LABELS[b], bracket: b, side: 'to', total: toTotal })
    }
  }

  return { nodes, links, total, hasData: total > 0 }
}
