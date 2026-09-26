'use client'

import React from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { useHistoryContext } from './contexts/HistoryContext'
import { calculateTrafficChange } from './lib/historyCalculations'
import { TrafficProgressBar } from './components/TrafficProgressBar'
import { KdBadge } from './keywords/KdBadge'
import { ReportCard } from './keywords/ReportCard'

interface KeywordReportTableProps {
  keywords: CurrentKeyword[]
  title?: string
}

// เหรียญเฉพาะ 3 แถวแรกที่ติด Top 3 จริง
const positionBadgeConfig = [Trophy, Medal, Award] as const

const getPositionBadge = (position: number | null, rank: number) => {
  if (!position || rank > 2 || position > 3) return null
  return positionBadgeConfig[rank]
}

const PositionBadge: React.FC<{
  position: number | null
  rank: number
}> = ({ position, rank }) => {
  const Icon = getPositionBadge(position, rank)
  if (!Icon) {
    return <span className="font-semibold tabular-nums">{position ? `#${position}` : '—'}</span>
  }
  return (
    <Badge variant="warning" className="gap-1 font-semibold tabular-nums">
      <Icon aria-hidden="true" />#{position}
    </Badge>
  )
}

const KeywordCard: React.FC<{
  kw: CurrentKeyword
  index: number
  trafficChangeData: ReturnType<typeof calculateTrafficChange>
}> = ({ kw, index, trafficChangeData }) => (
  <article className="bg-glass-tile border-glass-border flex flex-col gap-3 rounded-2xl border p-3.5">
    <div className="flex items-start gap-3">
      <span className="bg-info-subtle flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
        {index + 1}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-[15px] font-medium break-words">{kw.keyword}</h3>
        {kw.isTopReport && <Badge variant="warning">Top Report</Badge>}
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <PositionBadge position={kw.position} rank={index} />
      <KdBadge kd={kw.kd} />
    </div>

    <TrafficProgressBar changeData={trafficChangeData} />
  </article>
)

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({ keywords, title }) => {
  const { keywordHistory } = useHistoryContext()

  if (keywords.length === 0) return null

  return (
    <ReportCard
      title={title ?? 'Keywords Report'}
      description={`${keywords.length} คำ · traffic ปัจจุบันและการเปลี่ยนแปลงเทียบรอบก่อน`}
    >
      {/* Mobile: card list */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {keywords.map((kw, index) => (
          <li key={kw.id}>
            <KeywordCard
              kw={kw}
              index={index}
              trafficChangeData={calculateTrafficChange(kw.traffic, keywordHistory, kw.id)}
            />
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-right">#</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead className="w-[112px] text-right">อันดับ</TableHead>
              <TableHead className="w-[240px] lg:w-[280px]">Traffic</TableHead>
              <TableHead className="w-[120px]">ความยาก (KD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, index) => {
              const trafficChangeData = calculateTrafficChange(kw.traffic, keywordHistory, kw.id)
              const positionBadge = getPositionBadge(kw.position, index)

              return (
                <TableRow key={kw.id}>
                  <TableCell className="text-text-secondary text-right tabular-nums">
                    {index + 1}
                  </TableCell>

                  <TableCell className="whitespace-normal">
                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <span className="font-medium break-words">{kw.keyword}</span>
                      {kw.isTopReport && <Badge variant="warning">Top Report</Badge>}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {positionBadge ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            className="focus-visible:ring-ring/70 inline-flex rounded-full outline-none focus-visible:ring-[3px]"
                          >
                            <PositionBadge position={kw.position} rank={index} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Top {kw.position} Position!</TooltipContent>
                      </Tooltip>
                    ) : (
                      <PositionBadge position={kw.position} rank={index} />
                    )}
                  </TableCell>

                  <TableCell className="whitespace-normal">
                    <TrafficProgressBar changeData={trafficChangeData} />
                  </TableCell>

                  <TableCell>
                    <KdBadge kd={kw.kd} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </ReportCard>
  )
}
