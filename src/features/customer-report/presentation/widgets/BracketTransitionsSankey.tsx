'use client'

import { useMemo } from 'react'
import {
  computeBracketTransitions,
  type Bracket,
  type SankeyNode,
} from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

const BRACKET_COLOR: Record<Bracket, string> = {
  top3: 'var(--success)',
  top10: 'var(--info)',
  top20: 'var(--warning)',
  beyond: 'var(--destructive)',
  missing: 'var(--muted-foreground)',
}

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
      const order: Bracket[] = ['top3', 'top10', 'top20', 'beyond', 'missing']
      const improved = order.indexOf(link.toBracket) < order.indexOf(link.fromBracket)
      const degraded = order.indexOf(link.toBracket) > order.indexOf(link.fromBracket)

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

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Bracket Transitions</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          การไหลของ keyword ระหว่าง bracket · ระยะ {period} วัน · รวม{' '}
          <span className="text-foreground font-semibold">{data.total}</span> keywords
        </p>
      </div>

      {!data.hasData ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          ยังไม่มีประวัติเพียงพอ — ต้องมี history ≥ 2 รอบ
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full min-w-[640px]"
              role="img"
              aria-label="Position bracket transitions"
            >
              {/* Side labels */}
              <text
                x={SIDE_INSET / 2}
                y={PAD_TOP - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-semibold"
              >
                ก่อนหน้า
              </text>
              <text
                x={WIDTH - SIDE_INSET / 2}
                y={PAD_TOP - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-semibold"
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
                      strokeOpacity={lp.improved ? 0.5 : lp.degraded ? 0.35 : 0.25}
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
                    rx={2}
                  />
                  <text
                    x={SIDE_INSET - 6}
                    y={n.y + n.h / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-foreground text-[11px] font-semibold"
                  >
                    {n.label}
                  </text>
                  <text
                    x={SIDE_INSET - 6}
                    y={n.y + n.h / 2 + 12}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[10px] tabular-nums"
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
                    rx={2}
                  />
                  <text
                    x={WIDTH - SIDE_INSET + 6}
                    y={n.y + n.h / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-foreground text-[11px] font-semibold"
                  >
                    {n.label}
                  </text>
                  <text
                    x={WIDTH - SIDE_INSET + 6}
                    y={n.y + n.h / 2 + 12}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[10px] tabular-nums"
                  >
                    {n.total}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend / summary */}
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-success size-2 rounded-full" />
              Top 3
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-info size-2 rounded-full" />
              Top 10
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-warning size-2 rounded-full" />
              Top 20
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-destructive size-2 rounded-full" />
              20+
            </span>
          </div>
        </>
      )}
    </div>
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
