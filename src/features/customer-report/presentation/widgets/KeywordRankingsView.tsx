'use client'

import React, { useMemo } from 'react'
import { ArrowDown, ArrowUp, Loader2, Minus, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { PeriodSelector } from '../components/PeriodSelector'
import { MiniSparkline } from '../components/MiniSparkline'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { KeywordEvidenceDialog } from '../components/KeywordEvidenceDialog'
import {
  computeKeywordRankings,
  type KeywordRankCard,
  type PositionBucket,
} from '../lib/historyCalculations'

// bracket → สี (theme token เท่านั้น) + label + สี sparkline (CSS var)
const bracketConfig: Record<
  PositionBucket,
  { label: string; text: string; bg: string; dot: string; spark: string }
> = {
  top3: {
    label: 'Top 3',
    text: 'text-success',
    bg: 'bg-success/10',
    dot: 'bg-success',
    spark: 'var(--success)',
  },
  top10: {
    label: 'Top 10',
    text: 'text-info',
    bg: 'bg-info/10',
    dot: 'bg-info',
    spark: 'var(--info)',
  },
  top20: {
    label: 'Top 20',
    text: 'text-warning',
    bg: 'bg-warning/10',
    dot: 'bg-warning',
    spark: 'var(--warning)',
  },
  beyond: {
    label: '20+',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
    dot: 'bg-destructive',
    spark: 'var(--destructive)',
  },
  unranked: {
    label: 'ไม่มีข้อมูล',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    dot: 'bg-muted-foreground',
    spark: 'var(--muted-foreground)',
  },
}

const kdConfig: Record<string, { label: string; className: string }> = {
  EASY: { label: 'ง่าย', className: 'bg-success/10 text-success' },
  MEDIUM: { label: 'ปานกลาง', className: 'bg-warning/10 text-warning' },
  HARD: { label: 'ยาก', className: 'bg-destructive/10 text-destructive' },
}
const getKd = (kd: string) => kdConfig[String(kd).toUpperCase()] ?? kdConfig.MEDIUM

const fmtTraffic = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return v.toLocaleString()
}

interface DeltaView {
  icon: React.ReactNode
  text: string
  color: string
}

const getDeltaView = (card: KeywordRankCard): DeltaView => {
  if (card.currentPosition === null)
    return { icon: <Minus className="size-3" />, text: '—', color: 'text-muted-foreground' }
  if (card.isNew)
    return { icon: <Sparkles className="size-3" />, text: 'ใหม่', color: 'text-info' }
  if (card.delta === null || card.delta === 0)
    return { icon: <Minus className="size-3" />, text: 'คงที่', color: 'text-muted-foreground' }
  if (card.delta > 0)
    return {
      icon: <ArrowUp className="size-3" />,
      text: `+${card.delta} อันดับ`,
      color: 'text-success',
    }
  return {
    icon: <ArrowDown className="size-3" />,
    text: `${card.delta} อันดับ`,
    color: 'text-destructive',
  }
}

const DeltaIndicator = ({ card }: { card: KeywordRankCard }) => {
  const d = getDeltaView(card)
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', d.color)}>
      {d.icon}
      {d.text}
    </span>
  )
}

const BracketBadge = ({ bucket }: { bucket: PositionBucket }) => {
  const c = bracketConfig[bucket]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5', c.bg)}
    >
      <span className={cn('size-1.5 rounded-full', c.dot)} />
      <span className={cn('text-[11px] font-semibold', c.text)}>{c.label}</span>
    </span>
  )
}

const RankCard = ({ card }: { card: KeywordRankCard }) => {
  const c = bracketConfig[card.bucket]
  const kd = getKd(card.kd)

  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border">
      {/* top: keyword + rank */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold" title={card.keyword}>
            {card.keyword}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BracketBadge bucket={card.bucket} />
            <KeywordEvidenceDialog keyword={card.keyword} images={card.images} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn('flex items-baseline justify-end gap-0.5', c.text)}>
            <span className="text-sm font-semibold">#</span>
            <span className="text-4xl leading-none font-bold tabular-nums">
              {card.currentPosition ?? '—'}
            </span>
          </div>
          <div className="mt-1.5">
            <DeltaIndicator card={card} />
          </div>
        </div>
      </div>

      {/* sparkline */}
      <div className="px-3 pb-2">
        {card.hasTrend ? (
          <MiniSparkline
            data={card.positionSeries}
            color={c.spark}
            invert
            responsive
            width={280}
            height={56}
            className="h-14 w-full"
            ariaLabel={`แนวโน้มอันดับของ ${card.keyword}`}
          />
        ) : (
          <div className="text-muted-foreground flex h-14 items-center gap-2 px-1 text-xs">
            <span className={cn('size-2 rounded-full', c.dot)} />
            {card.positionSeries.length === 0
              ? 'ยังไม่ติดอันดับในช่วงนี้'
              : 'ยังมีข้อมูลรอบเดียว — แสดงเป็น snapshot'}
          </div>
        )}
      </div>

      {/* footer: traffic + KD */}
      <div className="border-border/60 flex border-t">
        <div className="border-border/60 flex-1 border-r p-3">
          <p className="text-muted-foreground text-[11px] font-medium">Traffic / เดือน</p>
          <p className="mt-0.5 text-base font-bold tabular-nums">{fmtTraffic(card.traffic)}</p>
        </div>
        <div className="flex-1 p-3">
          <p className="text-muted-foreground text-[11px] font-medium">ความยาก (KD)</p>
          <Badge className={cn('mt-1 font-semibold', kd.className)}>{kd.label}</Badge>
        </div>
      </div>
    </div>
  )
}

export const KeywordRankingsView = () => {
  const { keywordHistory, currentKeywords, isLoading } = useHistoryContext()
  const { period, setPeriod } = useReportFilters()

  const { cards, brackets, total } = useMemo(
    () => computeKeywordRankings(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Keyword Rankings
          </p>
          <h2 className="mt-1 text-2xl font-bold">ผลอันดับของแต่ละ Keyword</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            ดูได้เลยว่าแต่ละคำติดอันดับที่เท่าไหร่ · Current ranking per keyword
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="border-border flex items-center gap-2 rounded-2xl border p-6">
          <Loader2 className="text-info size-4 animate-spin" />
          <span>กำลังโหลดข้อมูล Keyword...</span>
        </div>
      ) : total === 0 ? (
        <ChartEmptyState message="ยังไม่มี Keyword ในรายงานนี้" height="200px" />
      ) : (
        <>
          {/* Bracket summary strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {brackets.map((b) => {
              const c = bracketConfig[b.bucket]
              return (
                <div
                  key={b.bucket}
                  className="border-border bg-card flex flex-col gap-2.5 rounded-2xl border p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-sm', c.dot)} />
                    <span className="text-muted-foreground text-sm font-semibold">{c.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl leading-none font-bold tabular-nums">{b.count}</span>
                    <span className="text-muted-foreground text-xs">/ {total} คำ</span>
                  </div>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className={cn('h-full rounded-full', c.dot)}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Per-keyword cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">การ์ดราย Keyword</h3>
              <span className="text-muted-foreground text-xs">เส้นขึ้น = อันดับดีขึ้น</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <RankCard key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* Detail table */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="p-4 pb-2">
              <h3 className="text-base font-bold">ตารางสรุปทั้งหมด</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                รายละเอียดทุก keyword · เรียงตามอันดับที่ดีที่สุด
              </p>
            </div>
            <div className="overflow-x-auto p-2">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="px-3.5 py-2.5 text-[11px] font-bold tracking-wider uppercase">
                      Keyword
                    </th>
                    <th className="px-3.5 py-2.5 text-center text-[11px] font-bold tracking-wider uppercase">
                      อันดับ
                    </th>
                    <th className="px-3.5 py-2.5 text-center text-[11px] font-bold tracking-wider uppercase">
                      เปลี่ยนแปลง
                    </th>
                    <th className="px-3.5 py-2.5 text-right text-[11px] font-bold tracking-wider uppercase">
                      Traffic
                    </th>
                    <th className="px-3.5 py-2.5 text-center text-[11px] font-bold tracking-wider uppercase">
                      KD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => {
                    const c = bracketConfig[card.bucket]
                    const kd = getKd(card.kd)
                    return (
                      <tr key={card.id} className="border-border/60 border-t">
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={cn('size-2 rounded-sm', c.dot)} />
                            <span className="font-semibold">{card.keyword}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-bold tabular-nums',
                              c.bg,
                              c.text,
                            )}
                          >
                            {card.currentPosition !== null ? `#${card.currentPosition}` : '—'}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <DeltaIndicator card={card} />
                        </td>
                        <td className="px-3.5 py-3 text-right font-semibold tabular-nums">
                          {fmtTraffic(card.traffic)}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <Badge className={cn('font-semibold', kd.className)}>{kd.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
