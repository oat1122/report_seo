import type {
  BracketTransitionsResult,
  KeywordRankCard,
  PositionBucket,
  RankedBucket,
  SankeyLink,
} from '../lib/historyCalculations'

// ============================================================
// View helpers ของหน้า Keyword Performance / AI & Recommendations
// pure (ไม่มี JSX) — แยกไว้เพื่อเทสต์ได้ และให้ทุก widget ใช้สี/ป้ายชุดเดียวกัน
// ============================================================

// ---------- KD ----------

export type KdKey = 'EASY' | 'MEDIUM' | 'HARD'

/** badge = variant ของ <Badge> · fill = class สีทึบสำหรับ donut/legend */
export const KD_STYLE: Record<
  KdKey,
  { label: string; badge: 'success' | 'warning' | 'danger'; fill: string; chart: string }
> = {
  EASY: { label: 'ง่าย', badge: 'success', fill: 'bg-chart-4', chart: 'var(--chart-4)' },
  MEDIUM: { label: 'ปานกลาง', badge: 'warning', fill: 'bg-chart-5', chart: 'var(--chart-5)' },
  HARD: { label: 'ยาก', badge: 'danger', fill: 'bg-destructive', chart: 'var(--destructive)' },
}

export const KD_ORDER: KdKey[] = ['EASY', 'MEDIUM', 'HARD']

/** kd ไม่รู้จัก → MEDIUM (พฤติกรรมเดิมของทุกตาราง) */
export const toKdKey = (kd: string | null | undefined): KdKey => {
  const v = String(kd ?? '').toUpperCase()
  return v === 'EASY' || v === 'HARD' ? v : 'MEDIUM'
}

// ---------- Rank brackets ----------

export const BRACKET_STYLE: Record<PositionBucket, { label: string; range: string; fill: string }> =
  {
    top3: { label: 'Top 3', range: 'อันดับ 1–3', fill: 'bg-secondary' },
    top10: { label: 'Top 10', range: 'อันดับ 4–10', fill: 'bg-info' },
    top20: { label: 'Top 20', range: 'อันดับ 11–20', fill: 'bg-accent' },
    beyond: { label: '20+', range: 'อันดับ 21 ขึ้นไป', fill: 'bg-muted-foreground/40' },
    unranked: {
      label: 'ยังไม่ติดอันดับ',
      range: 'ยังไม่ติดอันดับ',
      fill: 'bg-muted ring-1 ring-inset ring-border',
    },
  }

// ---------- Delta ----------

export type DeltaKind = 'up' | 'down' | 'flat' | 'new' | 'none'

export const deltaView = (
  card: Pick<KeywordRankCard, 'currentPosition' | 'isNew' | 'delta'>,
): { kind: DeltaKind; text: string } => {
  if (card.currentPosition === null) return { kind: 'none', text: '—' }
  if (card.isNew) return { kind: 'new', text: 'ใหม่' }
  if (card.delta === null || card.delta === 0) return { kind: 'flat', text: 'คงที่' }
  if (card.delta > 0) return { kind: 'up', text: `+${card.delta} อันดับ` }
  return { kind: 'down', text: `${card.delta} อันดับ` }
}

// ---------- Filter / sort ของการ์ดราย keyword ----------

export type RankFilter = 'all' | 'top3' | 'top10' | 'up' | 'down'
export type RankSort = 'position' | 'traffic' | 'movement'

export const RANK_SORTS: { value: RankSort; label: string }[] = [
  { value: 'position', label: 'อันดับดีที่สุด' },
  { value: 'traffic', label: 'Traffic สูงสุด' },
  { value: 'movement', label: 'ขยับขึ้นมากที่สุด' },
]

const matchesFilter = (card: KeywordRankCard, filter: RankFilter): boolean => {
  switch (filter) {
    case 'top3':
      return card.currentPosition !== null && card.currentPosition <= 3
    case 'top10':
      return card.currentPosition !== null && card.currentPosition <= 10
    case 'up':
      return card.delta !== null && card.delta > 0
    case 'down':
      return card.delta !== null && card.delta < 0
    default:
      return true
  }
}

export const countByFilter = (cards: KeywordRankCard[]): Record<RankFilter, number> => ({
  all: cards.length,
  top3: cards.filter((c) => matchesFilter(c, 'top3')).length,
  top10: cards.filter((c) => matchesFilter(c, 'top10')).length,
  up: cards.filter((c) => matchesFilter(c, 'up')).length,
  down: cards.filter((c) => matchesFilter(c, 'down')).length,
})

const byPosition = (a: KeywordRankCard, b: KeywordRankCard) =>
  (a.currentPosition ?? Number.POSITIVE_INFINITY) - (b.currentPosition ?? Number.POSITIVE_INFINITY)

export const applyRankView = (
  cards: KeywordRankCard[],
  opts: { filter: RankFilter; sort: RankSort; query: string },
): KeywordRankCard[] => {
  const q = opts.query.trim().toLowerCase()
  const result = cards.filter(
    (c) => matchesFilter(c, opts.filter) && (q === '' || c.keyword.toLowerCase().includes(q)),
  )
  if (opts.sort === 'traffic') return result.sort((a, b) => b.traffic - a.traffic)
  if (opts.sort === 'movement')
    return result.sort(
      (a, b) =>
        (b.delta ?? Number.NEGATIVE_INFINITY) - (a.delta ?? Number.NEGATIVE_INFINITY) ||
        byPosition(a, b),
    )
  return result.sort(byPosition)
}

// ---------- จำนวน keyword ต่อ bracket ณ ต้นช่วงเวลา (ฝั่ง "ก่อนหน้า" ของ Sankey) ----------

export const previousBracketCounts = (
  transitions: Pick<BracketTransitionsResult, 'nodes' | 'hasData'>,
): Record<RankedBucket, number> | null => {
  if (!transitions.hasData) return null
  const counts: Record<RankedBucket, number> = { top3: 0, top10: 0, top20: 0, beyond: 0 }
  for (const node of transitions.nodes) {
    if (node.side === 'from' && node.bracket !== 'missing') counts[node.bracket] = node.total
  }
  return counts
}

const BRACKET_RANK = { top3: 0, top10: 1, top20: 2, beyond: 3, missing: 4 } as const

export const summarizeTransitions = (
  links: Pick<SankeyLink, 'fromBracket' | 'toBracket' | 'count'>[],
): { improved: number; declined: number; same: number } => {
  let improved = 0
  let declined = 0
  let same = 0
  for (const l of links) {
    const diff = BRACKET_RANK[l.toBracket] - BRACKET_RANK[l.fromBracket]
    if (diff < 0) improved += l.count
    else if (diff > 0) declined += l.count
    else same += l.count
  }
  return { improved, declined, same }
}

// ---------- KD success rate ----------

export const kdSuccessSummary = (
  rows: { level: KdKey; inTopN: number; total: number; rate: number }[],
  topN: number,
): string | null => {
  const present = rows.filter((r) => r.total > 0)
  if (present.length === 0) return null
  const best = present.reduce((a, b) => (b.rate > a.rate ? b : a))
  const hard = rows.find((r) => r.level === 'HARD')
  const lead = `คำระดับ${KD_STYLE[best.level].label}ติด Top ${topN} มากที่สุด (${Math.round(best.rate * 100)}%)`
  if (hard && hard.total > 0 && best.level !== 'HARD' && hard.rate < 0.5) {
    return `${lead} — คำยากยังต้องใช้เวลาและ backlink เพิ่ม`
  }
  return lead
}

// ---------- AI Overview coverage ----------

export const coverageTrend = (
  counts: number[],
  windowWeeks = 4,
): { thisWeek: number; recent: number; early: number; direction: 'up' | 'down' | 'flat' } => {
  const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0)
  const recent = sum(counts.slice(-windowWeeks))
  const early = sum(counts.slice(0, windowWeeks))
  const thisWeek = counts.length > 0 ? counts[counts.length - 1] : 0
  const direction = recent > early ? 'up' : recent < early ? 'down' : 'flat'
  return { thisWeek, recent, early, direction }
}
