'use client'

import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { PERIOD_OPTIONS } from '../lib/chartConfig'

interface PeriodSegmentedProps {
  className?: string
}

/** ตัวเลือกช่วงเวลา 7/30/90 วัน — มือถือเป็น grid เต็มความกว้าง (Handoff rule 7) */
export function PeriodSegmented({ className }: PeriodSegmentedProps) {
  const { period, setPeriod } = useReportFilters()

  return (
    <div
      role="group"
      aria-label="ช่วงเวลาของรายงาน"
      className={cn(
        'border-glass-border grid grid-cols-3 gap-1 rounded-2xl border bg-white/60 p-1 backdrop-blur-md md:inline-flex md:rounded-[14px] dark:bg-white/5',
        className,
      )}
    >
      {PERIOD_OPTIONS.map((option) => {
        const active = option.value === period
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setPeriod(option.value)}
            className={cn(
              'focus-visible:ring-ring/60 relative h-11 rounded-xl px-3.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 md:h-9 md:rounded-[10px] md:text-[13px]',
              active ? 'text-foreground font-medium' : 'text-text-secondary hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="report-period-pill"
                aria-hidden
                className="bg-background shadow-card absolute inset-0 rounded-[inherit]"
                transition={{ duration: 0.3, ease: EASE_OUT }}
              />
            )}
            <span className="relative">{option.value} วัน</span>
          </button>
        )
      })}
    </div>
  )
}
