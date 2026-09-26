'use client'

import React, { useState } from 'react'
import { ChevronDown, Star } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { KeywordRecommend } from '@/types/metrics'
import { KdBadge } from './keywords/KdBadge'
import { ReportCard } from './keywords/ReportCard'

interface RecommendKeywordTableProps {
  keywords: KeywordRecommend[]
  title?: string
}

const INITIAL_VISIBLE = 8

const PriorityStar = ({ isTop }: { isTop: boolean }) => (
  <>
    <Star
      aria-hidden="true"
      className={cn(
        'size-4 shrink-0',
        isTop ? 'fill-warning-accent text-warning-accent' : 'text-muted-foreground/50',
      )}
    />
    <span className="sr-only">{isTop ? 'Top Pick' : 'คำแนะนำทั่วไป'}</span>
  </>
)

const KeywordCard: React.FC<{ kw: KeywordRecommend }> = ({ kw }) => {
  const isTop = kw.isTopReport

  return (
    <article
      className={cn(
        'border-glass-border flex flex-col gap-2.5 rounded-2xl border p-3.5',
        isTop ? 'bg-warning-subtle/50' : 'bg-glass-tile',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <PriorityStar isTop={isTop} />
          <h3 className="text-[15px] font-medium break-words">{kw.keyword}</h3>
        </div>
        {kw.kd && <KdBadge kd={kw.kd} />}
      </div>
      {isTop && <Badge variant="warning">Top Pick</Badge>}
      {kw.note && (
        <p className="bg-info-subtle rounded-xl px-3 py-2.5 text-[13px] leading-relaxed">
          {kw.note}
        </p>
      )}
    </article>
  )
}

export const RecommendKeywordTable: React.FC<RecommendKeywordTableProps> = ({
  keywords,
  title,
}) => {
  const [showAll, setShowAll] = useState(false)

  if (keywords.length === 0) return null

  const topCount = keywords.filter((k) => k.isTopReport).length
  const visible = showAll ? keywords : keywords.slice(0, INITIAL_VISIBLE)
  const hasMore = keywords.length > INITIAL_VISIBLE

  return (
    <ReportCard
      title={title ?? 'Recommended Keywords'}
      description={
        <>
          keyword ที่แนะนำให้ทำต่อ · <span aria-hidden="true">★</span>
          <span className="sr-only">ดาว</span> = Top Pick
        </>
      }
    >
      {/* Mobile: card layout */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {visible.map((kw) => (
          <li key={kw.id}>
            <KeywordCard kw={kw} />
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-11">
                <span className="sr-only">ความสำคัญ</span>
              </TableHead>
              <TableHead className="w-[34%] lg:w-[260px]">Keyword</TableHead>
              <TableHead className="w-[120px]">ความยาก (KD)</TableHead>
              <TableHead>เหตุผลที่แนะนำ</TableHead>
              <TableHead className="w-[110px]">
                <span className="sr-only">สถานะ</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((kw) => {
              const isTop = kw.isTopReport
              return (
                <TableRow
                  key={kw.id}
                  className={cn(isTop && 'bg-warning-subtle/45 hover:bg-warning-subtle/70')}
                >
                  <TableCell>
                    <PriorityStar isTop={isTop} />
                  </TableCell>
                  <TableCell className="font-medium break-words whitespace-normal">
                    {kw.keyword}
                  </TableCell>
                  <TableCell>{kw.kd ? <KdBadge kd={kw.kd} /> : '—'}</TableCell>
                  <TableCell className="text-text-secondary text-[13px] leading-relaxed whitespace-normal">
                    {kw.note || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {isTop && <Badge variant="warning">Top Pick</Badge>}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-text-secondary flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between">
        <span className="tabular-nums">
          {keywords.length} recommendations • {topCount} top priorities
        </span>
        {hasMore && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            className="text-foreground hover:bg-foreground/6 focus-visible:ring-ring/70 max-sm:bg-info-subtle inline-flex min-h-11 items-center justify-center gap-1 rounded-xl px-3 font-medium outline-none focus-visible:ring-[3px] sm:min-h-10"
          >
            {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด ${keywords.length} คำ`}
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', showAll && 'rotate-180')}
            />
          </button>
        )}
      </div>
    </ReportCard>
  )
}
