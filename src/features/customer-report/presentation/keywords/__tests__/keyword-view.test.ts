import { describe, expect, it } from 'vitest'
import type { KeywordRankCard } from '../../lib/historyCalculations'
import {
  applyRankView,
  countByFilter,
  coverageTrend,
  deltaView,
  kdSuccessSummary,
  previousBracketCounts,
  summarizeTransitions,
  toKdKey,
} from '../keyword-view'

function card(overrides: Partial<KeywordRankCard> = {}): KeywordRankCard {
  return {
    id: 'kw-1',
    keyword: 'รับทำ seo',
    currentPosition: 5,
    bucket: 'top10',
    delta: 0,
    isNew: false,
    positionSeries: [5, 5],
    hasTrend: true,
    traffic: 100,
    kd: 'EASY',
    images: [],
    ...overrides,
  }
}

const cards: KeywordRankCard[] = [
  card({ id: 'a', keyword: 'seo ราคา', currentPosition: 2, bucket: 'top3', delta: 3, traffic: 50 }),
  card({ id: 'b', keyword: 'รับทำ seo', currentPosition: 8, delta: -2, traffic: 900 }),
  card({
    id: 'c',
    keyword: 'บริษัท SEO',
    currentPosition: 15,
    bucket: 'top20',
    delta: 6,
    traffic: 300,
  }),
  card({
    id: 'd',
    keyword: 'seo คือ',
    currentPosition: null,
    bucket: 'unranked',
    delta: null,
    traffic: 10,
  }),
]

describe('deltaView', () => {
  it('maps rank movement to a signed label', () => {
    expect(deltaView(card({ delta: 3 }))).toEqual({ kind: 'up', text: '+3 อันดับ' })
    expect(deltaView(card({ delta: -4 }))).toEqual({ kind: 'down', text: '-4 อันดับ' })
    expect(deltaView(card({ delta: 0 }))).toEqual({ kind: 'flat', text: 'คงที่' })
    expect(deltaView(card({ isNew: true, delta: null }))).toEqual({ kind: 'new', text: 'ใหม่' })
    expect(deltaView(card({ currentPosition: null }))).toEqual({ kind: 'none', text: '—' })
  })
})

describe('countByFilter / applyRankView', () => {
  it('counts each segment (Top 10 includes Top 3)', () => {
    expect(countByFilter(cards)).toEqual({ all: 4, top3: 1, top10: 2, up: 2, down: 1 })
  })

  it('filters, searches case-insensitively and keeps unranked last when sorting by position', () => {
    expect(
      applyRankView(cards, { filter: 'all', sort: 'position', query: '' }).map((c) => c.id),
    ).toEqual(['a', 'b', 'c', 'd'])
    expect(
      applyRankView(cards, { filter: 'up', sort: 'position', query: '' }).map((c) => c.id),
    ).toEqual(['a', 'c'])
    expect(
      applyRankView(cards, { filter: 'all', sort: 'position', query: '  seo ' }).map((c) => c.id),
    ).toEqual(['a', 'b', 'c', 'd'])
    expect(
      applyRankView(cards, { filter: 'all', sort: 'position', query: 'บริษัท seo' }).map(
        (c) => c.id,
      ),
    ).toEqual(['c'])
  })

  it('sorts by traffic and by movement without mutating the input', () => {
    const before = cards.map((c) => c.id)
    expect(
      applyRankView(cards, { filter: 'all', sort: 'traffic', query: '' }).map((c) => c.id),
    ).toEqual(['b', 'c', 'a', 'd'])
    expect(
      applyRankView(cards, { filter: 'all', sort: 'movement', query: '' }).map((c) => c.id),
    ).toEqual(['c', 'a', 'b', 'd'])
    expect(cards.map((c) => c.id)).toEqual(before)
  })
})

describe('previousBracketCounts', () => {
  it('returns null without history and reads the "from" side otherwise', () => {
    expect(previousBracketCounts({ nodes: [], hasData: false })).toBeNull()
    expect(
      previousBracketCounts({
        hasData: true,
        nodes: [
          { id: 'from-top3', label: 'Top 3', bracket: 'top3', side: 'from', total: 2 },
          { id: 'from-missing', label: 'No data', bracket: 'missing', side: 'from', total: 4 },
          { id: 'to-top3', label: 'Top 3', bracket: 'top3', side: 'to', total: 5 },
        ],
      }),
    ).toEqual({ top3: 2, top10: 0, top20: 0, beyond: 0 })
  })
})

describe('summarizeTransitions', () => {
  it('splits flows into improved / declined / same', () => {
    expect(
      summarizeTransitions([
        { fromBracket: 'top10', toBracket: 'top3', count: 3 },
        { fromBracket: 'missing', toBracket: 'top20', count: 1 },
        { fromBracket: 'top3', toBracket: 'beyond', count: 2 },
        { fromBracket: 'top10', toBracket: 'top10', count: 4 },
      ]),
    ).toEqual({ improved: 4, declined: 2, same: 4 })
  })
})

describe('kdSuccessSummary', () => {
  it('names the best KD level and flags slow hard keywords', () => {
    expect(
      kdSuccessSummary(
        [
          { level: 'EASY', inTopN: 15, total: 18, rate: 15 / 18 },
          { level: 'MEDIUM', inTopN: 13, total: 22, rate: 13 / 22 },
          { level: 'HARD', inTopN: 4, total: 10, rate: 0.4 },
        ],
        10,
      ),
    ).toBe('คำระดับง่ายติด Top 10 มากที่สุด (83%) — คำยากยังต้องใช้เวลาและ backlink เพิ่ม')
    expect(kdSuccessSummary([{ level: 'EASY', inTopN: 0, total: 0, rate: 0 }], 10)).toBeNull()
  })
})

describe('coverageTrend', () => {
  it('compares the latest window with the first window', () => {
    expect(coverageTrend([0, 1, 0, 1, 2, 1, 2, 1, 2, 2, 3, 4])).toEqual({
      thisWeek: 4,
      recent: 11,
      early: 2,
      direction: 'up',
    })
    expect(coverageTrend([]).direction).toBe('flat')
  })
})

describe('toKdKey', () => {
  it('normalises case and falls back to MEDIUM', () => {
    expect(toKdKey('easy')).toBe('EASY')
    expect(toKdKey('HARD')).toBe('HARD')
    expect(toKdKey('unknown')).toBe('MEDIUM')
    expect(toKdKey(null)).toBe('MEDIUM')
  })
})
