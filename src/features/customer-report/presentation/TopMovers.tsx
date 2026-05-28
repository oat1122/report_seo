'use client'

import { ArrowDown, ArrowUp, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { computeTopMovers, type KeywordMovement } from './lib/historyCalculations'
import { DEFAULT_PERIOD, type PeriodOption } from './lib/chartConfig'

interface TopMoversProps {
  /** ดูย้อนหลังกี่วัน (default ใช้ DEFAULT_PERIOD) */
  period?: PeriodOption
  /** จำนวน gainers/losers สูงสุด */
  limit?: number
  className?: string
}

const PositionDisplay = ({ pos }: { pos: number | null }) => (
  <span className="font-semibold tabular-nums">{pos == null ? '-' : `#${pos}`}</span>
)

const MovementRow = ({
  movement,
  type,
}: {
  movement: KeywordMovement
  type: 'gainer' | 'loser'
}) => {
  const isGain = type === 'gainer'
  const absDelta = movement.delta != null ? Math.abs(movement.delta) : 0
  const tone = isGain ? 'text-success' : 'text-destructive'
  const bgTone = isGain ? 'bg-success/10' : 'bg-destructive/10'
  const Arrow = isGain ? ArrowUp : ArrowDown
  const ariaLabel = isGain
    ? `${movement.keyword} ขยับขึ้น ${absDelta} อันดับ จาก ${movement.previousPosition} เป็น ${movement.currentPosition}`
    : `${movement.keyword} หล่นลง ${absDelta} อันดับ จาก ${movement.previousPosition} เป็น ${movement.currentPosition}`

  return (
    <li className="flex items-center gap-2 rounded-md py-1.5" aria-label={ariaLabel}>
      <span
        className={cn('size-1.5 shrink-0 rounded-full', isGain ? 'bg-success' : 'bg-destructive')}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium" title={movement.keyword}>
        {movement.keyword}
      </span>
      <span className="text-muted-foreground text-xs tabular-nums">
        <PositionDisplay pos={movement.previousPosition} />
        <span className="mx-1">→</span>
        <PositionDisplay pos={movement.currentPosition} />
      </span>
      <Badge className={cn('gap-0.5 font-semibold', bgTone, tone, 'hover:opacity-100')}>
        <Arrow className="size-3" />
        {absDelta}
      </Badge>
    </li>
  )
}

const EmptyColumn = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground py-3 text-center text-xs">{children}</p>
)

export const TopMovers = ({ period = DEFAULT_PERIOD, limit = 3, className }: TopMoversProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { gainers, losers } = computeTopMovers(keywordHistory, currentKeywords, period, limit)

  const hasData = gainers.length > 0 || losers.length > 0

  return (
    <div className={cn('border-border bg-card rounded-2xl border p-4 md:p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Top Movers</h3>
        <span className="text-muted-foreground text-xs">ย้อนหลัง {period} วัน</span>
      </div>

      {!hasData ? (
        <div className="border-border rounded-md border border-dashed p-4 text-center">
          <p className="text-muted-foreground text-sm">ต้องมีข้อมูล 2 รอบขึ้นไปเพื่อดู Movers</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="text-success size-4" />
              <h4 className="text-success text-sm font-semibold">ขยับขึ้น</h4>
            </div>
            {gainers.length === 0 ? (
              <EmptyColumn>ยังไม่มี keyword ที่ขยับขึ้น</EmptyColumn>
            ) : (
              <ul className="flex flex-col">
                {gainers.map((m) => (
                  <MovementRow key={m.keyword} movement={m} type="gainer" />
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingDown className="text-destructive size-4" />
              <h4 className="text-destructive text-sm font-semibold">หล่นลง</h4>
            </div>
            {losers.length === 0 ? (
              <EmptyColumn>ยังไม่มี keyword ที่หล่นลง</EmptyColumn>
            ) : (
              <ul className="flex flex-col">
                {losers.map((m) => (
                  <MovementRow key={m.keyword} movement={m} type="loser" />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
