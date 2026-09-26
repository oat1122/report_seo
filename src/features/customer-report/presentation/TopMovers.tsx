'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { useReportFilters } from './contexts/ReportFiltersContext'
import { DeltaChip } from './components/DeltaChip'
import { ReportCardHeader } from './components/ReportCardHeader'
import { useReportTabHref } from './hooks/useReportTabHref'
import { computeTopMovers, type KeywordMovement } from './lib/historyCalculations'
import type { PeriodOption } from './lib/chartConfig'

interface TopMoversProps {
  /** ดูย้อนหลังกี่วัน — ไม่ส่ง = ใช้ช่วงเวลาที่เลือกบนหัวรายงาน */
  period?: PeriodOption
  /** จำนวน gainers/losers สูงสุด (ต่อฝั่ง) */
  limit?: number
  className?: string
}

/** ป้ายบอกว่าข้ามเส้นสำคัญ (Top 3 / หน้าแรก) หรือไม่ */
const milestone = (m: KeywordMovement): string => {
  const prev = m.previousPosition
  const curr = m.currentPosition
  if (prev == null || curr == null) return ''
  if (curr <= 3 && prev > 3) return ' · ติด Top 3 แล้ว'
  if (curr <= 10 && prev > 10) return ' · ขึ้นหน้าแรกแล้ว'
  if (curr > 10 && prev <= 10) return ' · หลุดหน้าแรก'
  return ''
}

const MovementRow = ({ movement, gain }: { movement: KeywordMovement; gain: boolean }) => {
  const absDelta = movement.delta != null ? Math.abs(movement.delta) : 0
  const isTop3 = movement.currentPosition != null && movement.currentPosition <= 3
  const ariaLabel = `${movement.keyword} ${gain ? 'ขยับขึ้น' : 'หล่นลง'} ${absDelta} อันดับ จาก ${movement.previousPosition} เป็น ${movement.currentPosition}`

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      aria-label={ariaLabel}
      className="bg-glass-tile grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] py-2 pr-3 pl-2 md:grid-cols-[38px_minmax(0,1fr)_auto]"
    >
      <span
        aria-hidden
        className={cn(
          'flex size-10 flex-col items-center justify-center rounded-xl leading-none md:size-[38px] md:rounded-[11px]',
          isTop3 ? 'bg-chart-4 text-secondary-foreground' : 'bg-info-subtle',
        )}
      >
        <span className={cn('text-[10px]', !isTop3 && 'text-text-secondary')}>อันดับ</span>
        <span className="text-[15px] font-semibold tabular-nums">
          {movement.currentPosition ?? '-'}
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="truncate text-sm font-medium" title={movement.keyword}>
          {movement.keyword}
        </span>
        <span className="text-text-secondary truncate text-xs">
          เดิมอันดับ {movement.previousPosition ?? '-'}
          {milestone(movement)}
        </span>
      </span>
      <DeltaChip direction={gain ? 'up' : 'down'} tone={gain ? 'good' : 'bad'} size="md">
        {absDelta}
      </DeltaChip>
    </motion.li>
  )
}

/** "Keyword ที่ขยับมากสุด" — ขึ้นมากสุดก่อน ตามด้วยที่หล่นลง */
export const TopMovers = ({ period: periodProp, limit = 3, className }: TopMoversProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period: filterPeriod } = useReportFilters()
  const period = periodProp ?? filterPeriod
  const tabHref = useReportTabHref()

  // คำนวณครั้งเดียวแบบไม่จำกัด → ได้ทั้งจำนวนรวม (หัวการ์ด) และรายการที่โชว์
  const { gainers, losers } = useMemo(
    () => computeTopMovers(keywordHistory, currentKeywords, period, 1000),
    [keywordHistory, currentKeywords, period],
  )
  const rows = [
    ...gainers.slice(0, limit).map((m) => ({ m, gain: true })),
    ...losers.slice(0, limit).map((m) => ({ m, gain: false })),
  ]
  const hasData = rows.length > 0

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Keyword ที่ขยับมากสุด"
        description={
          hasData
            ? `เทียบกับ ${period} วันก่อน · ขึ้น ${gainers.length} คำ ลง ${losers.length} คำ`
            : `เทียบกับ ${period} วันก่อน`
        }
      />
      <CardContent className="flex flex-1 flex-col gap-3.5 px-3.5 md:px-5">
        {!hasData ? (
          <p className="bg-glass-tile text-text-secondary rounded-[14px] px-4 py-6 text-center text-sm">
            ยังไม่มี Keyword ที่อันดับเปลี่ยนในช่วงนี้ — ต้องมีข้อมูลอย่างน้อย 2 รอบจึงจะเทียบได้
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map(({ m, gain }) => (
                <MovementRow key={`${gain ? 'g' : 'l'}-${m.keyword}`} movement={m} gain={gain} />
              ))}
            </AnimatePresence>
          </ul>
        )}
        <Button
          asChild
          variant="soft"
          className="mt-auto w-full self-center rounded-[14px] md:h-10 md:w-auto md:rounded-full md:px-[18px] md:text-[13px]"
        >
          <Link href={tabHref('keywords')} replace>
            ดูอันดับทั้งหมด
            <ChevronRight aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
