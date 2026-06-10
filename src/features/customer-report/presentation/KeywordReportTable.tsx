'use client'

import React from 'react'
import { Trophy, Medal, Award, Search, Flame } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import { useHistoryContext } from './contexts/HistoryContext'
import { calculateTrafficChange } from './lib/historyCalculations'
import { TrafficProgressBar } from './components/TrafficProgressBar'

interface KeywordReportTableProps {
  keywords: CurrentKeyword[]
  title?: string
}

const positionBadgeConfig = [
  { Icon: Trophy, opacity: '' },
  { Icon: Medal, opacity: '/70' },
  { Icon: Award, opacity: '/50' },
] as const

const getPositionBadge = (position: number | null, rank: number) => {
  if (!position || rank > 2 || position > 3) return null
  return positionBadgeConfig[rank]
}

const kdConfig: Record<string, { label: string; className: string }> = {
  EASY: { label: 'Easy', className: 'bg-success/10 text-success' },
  MEDIUM: { label: 'Medium', className: 'bg-warning/10 text-warning' },
  HARD: { label: 'Hard', className: 'bg-destructive/10 text-destructive' },
}

const getKdConfig = (kd: string) => kdConfig[kd] || kdConfig.MEDIUM

const PositionBadge: React.FC<{
  position: number | null
  rank: number
}> = ({ position, rank }) => {
  const config = getPositionBadge(position, rank)
  if (!config) {
    return (
      <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-sm font-semibold">
        {position || '-'}
      </span>
    )
  }
  const { Icon, opacity } = config
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border-2 px-2 py-0.5 font-bold',
        `border-warning${opacity} bg-warning${opacity}/20 text-warning`,
      )}
    >
      <Icon className="size-4" />#{position}
    </span>
  )
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="from-info to-info/70 relative overflow-hidden bg-gradient-to-br p-4 md:p-5">
    <div className="absolute -top-12 -right-12 hidden size-48 rounded-full bg-white/10 md:block" />
    <div className="relative flex items-center gap-3">
      <Flame className="text-info-foreground size-7" />
      <h3 className="text-info-foreground text-lg font-bold md:text-2xl">{title}</h3>
    </div>
  </div>
)

const KeywordCard: React.FC<{
  kw: CurrentKeyword
  index: number
  trafficChangeData: ReturnType<typeof calculateTrafficChange>
}> = ({ kw, index, trafficChangeData }) => {
  const kd = getKdConfig(kw.kd)

  return (
    <div className="border-border bg-background active:border-info rounded-2xl border p-4 transition-colors">
      <div className="mb-3 flex items-start gap-3">
        <div className="bg-accent/40 text-info flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-semibold break-words">{kw.keyword}</p>
          {kw.isTopReport && <Badge className="bg-warning/15 text-warning">Top Report</Badge>}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PositionBadge position={kw.position} rank={index} />
        <Badge className={cn('min-w-14 justify-center font-semibold', kd.className)}>
          {kd.label}
        </Badge>
      </div>

      <TrafficProgressBar changeData={trafficChangeData} />
    </div>
  )
}

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({ keywords, title }) => {
  const { keywordHistory } = useHistoryContext()

  if (keywords.length === 0) return null

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden">
        {title && (
          <div className="mb-3 overflow-hidden rounded-2xl">
            <SectionHeader title={title} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {keywords.map((kw, index) => {
            const trafficChangeData = calculateTrafficChange(kw.traffic, keywordHistory, kw.id)
            return (
              <KeywordCard
                key={kw.id}
                kw={kw}
                index={index}
                trafficChangeData={trafficChangeData}
              />
            )
          })}
        </div>
      </div>

      {/* Desktop: table */}
      <div className="border-border from-background to-card hidden overflow-hidden rounded-2xl border bg-gradient-to-b md:block">
        {title && <SectionHeader title={title} />}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground w-12 text-xs font-bold tracking-wider uppercase">
                #
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Keywords
              </TableHead>
              <TableHead className="text-muted-foreground w-32 text-center text-xs font-bold tracking-wider uppercase">
                Position
              </TableHead>
              <TableHead className="text-muted-foreground w-72 text-xs font-bold tracking-wider uppercase">
                Traffic
              </TableHead>
              <TableHead className="text-muted-foreground w-24 text-center text-xs font-bold tracking-wider uppercase">
                KD
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, index) => {
              const kd = getKdConfig(kw.kd)
              const trafficChangeData = calculateTrafficChange(kw.traffic, keywordHistory, kw.id)
              const positionBadge = getPositionBadge(kw.position, index)

              return (
                <TableRow
                  key={kw.id}
                  className="hover:bg-muted/50 cursor-pointer transition-all hover:shadow-[inset_4px_0_0_var(--info)]"
                >
                  <TableCell>
                    <span className="text-muted-foreground text-sm font-semibold">{index + 1}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/40 text-info flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Search className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 font-semibold break-words">{kw.keyword}</p>
                        {kw.isTopReport && (
                          <Badge className="bg-warning/15 text-warning">Top Report</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {positionBadge ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <PositionBadge position={kw.position} rank={index} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Top {kw.position} Position!</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground font-semibold">
                        {kw.position || '-'}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <TrafficProgressBar changeData={trafficChangeData} />
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge className={cn('min-w-16 justify-center font-semibold', kd.className)}>
                      {kd.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
