'use client'

import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'
import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import type { RankFilter } from './keyword-view'

const ITEMS: { value: RankFilter; label: string; Icon?: LucideIcon; span: string }[] = [
  { value: 'all', label: 'ทั้งหมด', span: 'col-span-2' },
  { value: 'top3', label: 'Top 3', span: 'col-span-2' },
  { value: 'top10', label: 'Top 10', span: 'col-span-2' },
  { value: 'up', label: 'ขยับขึ้น', Icon: ArrowUp, span: 'col-span-3' },
  { value: 'down', label: 'หล่นลง', Icon: ArrowDown, span: 'col-span-3' },
]

interface RankFilterSegmentProps {
  value: RankFilter
  counts: Record<RankFilter, number>
  onChange: (value: RankFilter) => void
}

// ตัวกรอง keyword — มือถือเป็น grid 6 คอลัมน์ (กฎข้อ 7: ไม่ใช่ scroller แนวนอน), desktop เป็น chip
// พื้นเข้มของตัวที่เลือกเลื่อนตามด้วย layoutId
export const RankFilterSegment = ({ value, counts, onChange }: RankFilterSegmentProps) => (
  <div
    role="group"
    aria-label="กรอง keyword"
    className="bg-glass-card border-glass-border grid grid-cols-6 gap-1 rounded-2xl border p-1 md:flex md:flex-wrap md:gap-2 md:rounded-none md:border-0 md:bg-transparent md:p-0"
  >
    {ITEMS.map(({ value: itemValue, label, Icon, span }) => {
      const active = value === itemValue
      return (
        <button
          key={itemValue}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(itemValue)}
          className={cn(
            'focus-visible:ring-ring/70 relative flex h-11 items-center justify-center rounded-xl px-1.5 text-sm transition-colors outline-none focus-visible:ring-[3px] md:col-auto md:h-10 md:rounded-full md:border md:px-3.5 md:text-[13px]',
            span,
            active
              ? 'text-background font-medium md:border-transparent'
              : 'text-foreground md:border-glass-border hover:bg-white/60 md:bg-white/70 dark:hover:bg-white/10 md:dark:bg-white/5',
          )}
        >
          {active && (
            <motion.span
              layoutId="kw-rank-filter-pill"
              aria-hidden="true"
              className="bg-foreground absolute inset-0 rounded-xl md:rounded-full"
              transition={{ duration: 0.3, ease: EASE_OUT }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {label}
            <span
              className={cn(
                'text-xs tabular-nums',
                active ? 'text-background/75' : 'text-text-secondary',
              )}
            >
              {counts[itemValue]}
            </span>
          </span>
        </button>
      )
    })}
  </div>
)
