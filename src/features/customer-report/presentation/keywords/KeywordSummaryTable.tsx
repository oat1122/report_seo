'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { computeKeywordRankings } from '../lib/historyCalculations'
import { KeywordEvidenceDialog } from '../components/KeywordEvidenceDialog'
import { DeltaPill } from './DeltaPill'
import { KdBadge } from './KdBadge'
import { KeywordRankRow } from './KeywordRankRow'
import { ReportCard } from './ReportCard'
import { BRACKET_STYLE } from './keyword-view'
import { formatNumber } from '../lib/formatters'

// ตารางสรุปทุก keyword — desktop = table-fixed, มือถือ = รายการการ์ด (กฎข้อ 6)
export const KeywordSummaryTable = () => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const { cards } = useMemo(
    () => computeKeywordRankings(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )

  if (cards.length === 0) return null

  const ranked = cards.filter((c) => c.currentPosition !== null).length

  return (
    <ReportCard
      title="ตารางสรุปทั้งหมด"
      description={`รายละเอียดทุก keyword เรียงตามอันดับที่ดีที่สุด · ติดอันดับแล้ว ${ranked} จาก ${cards.length} คำ`}
    >
      <ul className="flex flex-col gap-2.5 md:hidden">
        {cards.map((card) => (
          <li key={card.id}>
            <KeywordRankRow card={card} />
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="w-[96px] text-right">อันดับ</TableHead>
              <TableHead className="w-[148px]">เปลี่ยนแปลง</TableHead>
              <TableHead className="w-[136px] text-right">Traffic / เดือน</TableHead>
              <TableHead className="w-[120px]">ความยาก (KD)</TableHead>
              <TableHead className="w-[96px]">หลักฐาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="whitespace-normal">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-2.5 shrink-0 rounded-[3px]',
                        BRACKET_STYLE[card.bucket].fill,
                      )}
                    />
                    <span className="min-w-0 font-medium break-words">{card.keyword}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {card.currentPosition !== null ? `#${card.currentPosition}` : '—'}
                </TableCell>
                <TableCell>
                  <DeltaPill card={card} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(card.traffic)}
                </TableCell>
                <TableCell>
                  <KdBadge kd={card.kd} />
                </TableCell>
                <TableCell>
                  {card.images.length > 0 ? (
                    <KeywordEvidenceDialog keyword={card.keyword} images={card.images} />
                  ) : (
                    <span className="text-text-secondary">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ReportCard>
  )
}
