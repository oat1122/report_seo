'use client'

import { AnimatedNumber, GrowBar, Stagger, StaggerItem } from '@/components/motion'
import { cn } from '@/lib/utils'
import type { BracketSummaryItem, RankedBucket } from '../lib/historyCalculations'
import { BRACKET_STYLE } from './keyword-view'

interface BracketSummaryCardsProps {
  brackets: BracketSummaryItem[]
  total: number
  /** จำนวนต่อ bracket ณ ต้นช่วงเวลา — null = ยังไม่มีประวัติให้เทียบ */
  previous: Record<RankedBucket, number> | null
  period: number
}

// KPI 4 ใบ: Top 3 / Top 10 / Top 20 / 20+ พร้อมแถบสัดส่วนและค่าเทียบต้นช่วง
export const BracketSummaryCards = ({
  brackets,
  total,
  previous,
  period,
}: BracketSummaryCardsProps) => (
  <section aria-label="สรุปตามช่วงอันดับ">
    <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {brackets.map((b, idx) => {
        const style = BRACKET_STYLE[b.bucket]
        const prev = previous?.[b.bucket]
        return (
          <StaggerItem
            key={b.bucket}
            className="bg-glass-card border-glass-border shadow-card flex min-w-0 flex-col gap-2 rounded-[20px] border p-3.5 backdrop-blur-[14px] md:gap-2.5 md:px-[18px] md:py-4"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span aria-hidden="true" className={cn('size-3 rounded-[4px]', style.fill)} />
                {style.label}
              </span>
              <span className="text-text-secondary hidden truncate text-xs xl:inline">
                {style.range}
              </span>
            </div>
            <p className="flex items-baseline gap-1.5">
              <AnimatedNumber
                value={b.count}
                className="text-[26px] leading-none font-semibold tabular-nums md:text-[30px]"
              />
              <span className="text-text-secondary text-[13px] tabular-nums">/ {total} คำ</span>
            </p>
            <div aria-hidden="true" className="bg-border/80 h-2 overflow-hidden rounded-full">
              <GrowBar
                value={b.pct}
                delay={idx * 0.06}
                className={cn('h-full rounded-full', style.fill)}
              />
            </div>
            {prev !== undefined && (
              <span className="text-text-secondary text-xs tabular-nums">
                {period} วันก่อน {prev} คำ
              </span>
            )}
          </StaggerItem>
        )
      })}
    </Stagger>
  </section>
)
