'use client'

import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  computeBracketTransitions,
  type Bracket,
  type SankeyNode,
} from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { ReportCard } from '../keywords/ReportCard'
import { summarizeTransitions } from '../keywords/keyword-view'

// สีเดียวกับ bracket ทั้งหน้า (Top 3 เขียวแบรนด์ = fill เท่านั้น)
const BRACKET_COLOR: Record<Bracket, string> = {
  top3: 'var(--chart-4)',
  top10: 'var(--chart-3)',
  top20: 'var(--accent)',
  beyond: 'var(--muted-foreground)',
  missing: 'var(--border)',
}

const BRACKET_ORDER: Bracket[] = ['top3', 'top10', 'top20', 'beyond', 'missing']

const WIDTH = 720
const HEIGHT = 320
const PAD_TOP = 12
const PAD_BOTTOM = 12
const NODE_WIDTH = 14
const NODE_GAP = 8
const SIDE_INSET = 80

/**
 * Custom SVG Sankey — 2 sides (from / to) with bezier links.
 * Width of each link path = count proportional to total.
 */
export const BracketTransitionsSankey = () => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const data = useMemo(
    () => computeBracketTransitions(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )

  // Layout: compute y-coordinates for each node
  const layout = useMemo(() => {
    const fromNodes = data.nodes.filter((n) => n.side === 'from')
    const toNodes = data.nodes.filter((n) => n.side === 'to')

    const availHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
    const totalFromCount = fromNodes.reduce((s, n) => s + n.total, 0)
    const totalToCount = toNodes.reduce((s, n) => s + n.total, 0)

    const gapTotal = (side: SankeyNode[]) => (side.length > 1 ? NODE_GAP * (side.length - 1) : 0)

    const sidePixels = (total: number, count: number, side: SankeyNode[]) => {
      if (total === 0) return 0
      return ((availHeight - gapTotal(side)) * count) / total
    }

    type Placed = SankeyNode & {
      y: number
      h: number
      /** running offset for links from this node */
      cursor: number
    }

    const placeSide = (side: SankeyNode[], total: number): Placed[] => {
      let cursorY = PAD_TOP
      return side.map((node) => {
        const h = Math.max(sidePixels(total, node.total, side), 2)
        const placed: Placed = { ...node, y: cursorY, h, cursor: 0 }
        cursorY += h + NODE_GAP
        return placed
      })
    }

    return {
      from: placeSide(fromNodes, totalFromCount),
      to: placeSide(toNodes, totalToCount),
    }
  }, [data.nodes])

  // Build link paths
  const linkPaths = useMemo(() => {
    const fromMap = new Map(layout.from.map((n) => [n.id, n]))
    const toMap = new Map(layout.to.map((n) => [n.id, n]))

    // Sort links so each node's links stack consistently
    const sorted = [...data.links].sort((a, b) => {
      const aFromIdx = layout.from.findIndex((n) => n.id === a.source)
      const bFromIdx = layout.from.findIndex((n) => n.id === b.source)
      if (aFromIdx !== bFromIdx) return aFromIdx - bFromIdx
      const aToIdx = layout.to.findIndex((n) => n.id === a.target)
      const bToIdx = layout.to.findIndex((n) => n.id === b.target)
      return aToIdx - bToIdx
    })

    const totalCount = data.total || 1
    const availHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
    // Use the smaller side's pixel-per-count to keep link widths consistent
    const pxPerCount =
      Math.min(
        layout.from.reduce((s, n) => s + n.h, 0) /
          Math.max(
            layout.from.reduce((s, n) => s + n.total, 0),
            1,
          ),
        layout.to.reduce((s, n) => s + n.h, 0) /
          Math.max(
            layout.to.reduce((s, n) => s + n.total, 0),
            1,
          ),
      ) || availHeight / totalCount

    return sorted.map((link, idx) => {
      const from = fromMap.get(link.source)
      const to = toMap.get(link.target)
      if (!from || !to) return null
      const linkH = Math.max(link.count * pxPerCount, 1)
      const fromY = from.y + from.cursor + linkH / 2
      const toY = to.y + to.cursor + linkH / 2
      from.cursor += linkH
      to.cursor += linkH

      const x1 = SIDE_INSET + NODE_WIDTH
      const x2 = WIDTH - SIDE_INSET - NODE_WIDTH
      const mid = (x1 + x2) / 2
      const d = `M ${x1},${fromY} C ${mid},${fromY} ${mid},${toY} ${x2},${toY}`

      // Color the link by the "to" bracket — emphasizes outcome
      const color = BRACKET_COLOR[link.toBracket]
      // Improved vs degraded
      const improved =
        BRACKET_ORDER.indexOf(link.toBracket) < BRACKET_ORDER.indexOf(link.fromBracket)
      const degraded =
        BRACKET_ORDER.indexOf(link.toBracket) > BRACKET_ORDER.indexOf(link.fromBracket)

      return {
        key: `${link.source}-${link.target}-${idx}`,
        d,
        strokeWidth: linkH,
        color,
        link,
        improved,
        degraded,
      }
    })
  }, [data.links, data.total, layout])

  const summary = useMemo(() => summarizeTransitions(data.links), [data.links])

  // มือถือ: รายการการเปลี่ยน bracket เรียงจากจำนวนมาก → น้อย (sankey อ่านไม่ออกที่ 390px)
  const movedLinks = useMemo(
    () =>
      [...data.links]
        .filter((l) => l.fromBracket !== l.toBracket)
        .sort((a, b) => b.count - a.count),
    [data.links],
  )

  const description = data.hasData ? (
    <>
      การไหลของ keyword ระหว่างช่วงอันดับ · ระยะ {period} วัน — ดีขึ้น{' '}
      <strong className="text-foreground font-semibold tabular-nums">{summary.improved}</strong> คำ
      · แย่ลง{' '}
      <strong className="text-foreground font-semibold tabular-nums">{summary.declined}</strong> คำ
      · คงเดิม <span className="tabular-nums">{summary.same}</span> คำ
    </>
  ) : (
    `การไหลของ keyword ระหว่างช่วงอันดับ · ระยะ ${period} วัน`
  )

  return (
    <ReportCard title="Bracket Transitions" description={description}>
      {!data.hasData ? (
        <p className="text-text-secondary py-12 text-center text-sm">
          ยังไม่มีข้อมูลตำแหน่ง keyword สำหรับแสดงการเปลี่ยนแปลง
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {movedLinks.length === 0 ? (
              <li className="text-text-secondary text-sm">
                ทุก keyword ยังอยู่ช่วงอันดับเดิมตลอดช่วงนี้
              </li>
            ) : (
              movedLinks.map((l) => {
                const improved =
                  BRACKET_ORDER.indexOf(l.toBracket) < BRACKET_ORDER.indexOf(l.fromBracket)
                return (
                  <li
                    key={`${l.source}-${l.target}`}
                    className="bg-glass-tile flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-sm"
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                      {bracketLabel(l.fromBracket)}
                      <ArrowRight className="text-muted-foreground size-3.5" aria-hidden="true" />
                      <span className="sr-only">ไปเป็น</span>
                      <span className="font-medium">{bracketLabel(l.toBracket)}</span>
                    </span>
                    <Badge variant={improved ? 'success' : 'danger'} className="tabular-nums">
                      {l.count} คำ
                    </Badge>
                  </li>
                )
              })
            )}
          </ul>

          <div className="hidden md:block">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full"
              role="img"
              aria-label={`การเปลี่ยนช่วงอันดับของ keyword: ดีขึ้น ${summary.improved} คำ แย่ลง ${summary.declined} คำ คงเดิม ${summary.same} คำ`}
            >
              {/* Side labels */}
              <text
                x={SIDE_INSET / 2}
                y={PAD_TOP - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-medium"
              >
                ก่อนหน้า
              </text>
              <text
                x={WIDTH - SIDE_INSET / 2}
                y={PAD_TOP - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-medium"
              >
                ปัจจุบัน
              </text>

              {/* Links — render before nodes so nodes overlay */}
              {linkPaths.map(
                (lp) =>
                  lp && (
                    <path
                      key={lp.key}
                      d={lp.d}
                      stroke={lp.color}
                      strokeWidth={lp.strokeWidth}
                      strokeOpacity={lp.improved ? 0.55 : lp.degraded ? 0.35 : 0.25}
                      fill="none"
                    >
                      <title>
                        {lp.link.count} keywords: {bracketLabel(lp.link.fromBracket)} →{' '}
                        {bracketLabel(lp.link.toBracket)}
                      </title>
                    </path>
                  ),
              )}

              {/* From nodes */}
              {layout.from.map((n) => (
                <g key={n.id}>
                  <rect
                    x={SIDE_INSET}
                    y={n.y}
                    width={NODE_WIDTH}
                    height={n.h}
                    fill={BRACKET_COLOR[n.bracket]}
                    rx={4}
                  />
                  <text
                    x={SIDE_INSET - 8}
                    y={n.y + n.h / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-foreground text-[12px] font-medium"
                  >
                    {n.label}
                  </text>
                  <text
                    x={SIDE_INSET - 8}
                    y={n.y + n.h / 2 + 14}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[11px] tabular-nums"
                  >
                    {n.total}
                  </text>
                </g>
              ))}

              {/* To nodes */}
              {layout.to.map((n) => (
                <g key={n.id}>
                  <rect
                    x={WIDTH - SIDE_INSET - NODE_WIDTH}
                    y={n.y}
                    width={NODE_WIDTH}
                    height={n.h}
                    fill={BRACKET_COLOR[n.bracket]}
                    rx={4}
                  />
                  <text
                    x={WIDTH - SIDE_INSET + 8}
                    y={n.y + n.h / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-foreground text-[12px] font-medium"
                  >
                    {n.label}
                  </text>
                  <text
                    x={WIDTH - SIDE_INSET + 8}
                    y={n.y + n.h / 2 + 14}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[11px] tabular-nums"
                  >
                    {n.total}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <ul className="text-text-secondary hidden flex-wrap items-center gap-x-4 gap-y-1 text-xs md:flex">
            {(['top3', 'top10', 'top20', 'beyond'] as Bracket[]).map((b) => (
              <li key={b} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: BRACKET_COLOR[b] }}
                />
                {bracketLabel(b)}
              </li>
            ))}
            <li className="ml-auto">เส้นเข้ม = อันดับดีขึ้น</li>
          </ul>
        </>
      )}
    </ReportCard>
  )
}

const BRACKET_LABEL_TH: Record<Bracket, string> = {
  top3: 'Top 3',
  top10: 'Top 4-10',
  top20: 'Top 11-20',
  beyond: '20+',
  missing: 'ไม่มีข้อมูล',
}
const bracketLabel = (b: Bracket) => BRACKET_LABEL_TH[b]
