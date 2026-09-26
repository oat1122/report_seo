'use client'

import { useReducedMotion } from 'motion/react'
import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'

interface RingSegment {
  /** สัดส่วน 0–1 ของวง */
  value: number
  color: string
}

interface MiniRingChartProps {
  segments: RingSegment[]
  className?: string
}

/** Donut เล็กสำหรับ KPI — ต่อ segment ตามลำดับ เริ่มที่ 12 นาฬิกา ตามเข็ม */
export function MiniRingChart({ segments, className }: MiniRingChartProps) {
  const reduce = useReducedMotion()
  const starts = segments.map((_, i) =>
    segments.slice(0, i).reduce((sum, s) => sum + Math.max(0, s.value), 0),
  )

  return (
    <svg viewBox="0 0 64 64" className={cn('block', className)} aria-hidden>
      <circle cx={32} cy={32} r={26} fill="none" stroke="var(--border)" strokeWidth={9} />
      <g transform="rotate(-90 32 32)">
        {segments.map((segment, i) =>
          segment.value > 0 ? (
            <motion.circle
              key={i}
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke={segment.color}
              strokeWidth={9}
              initial={{ pathLength: reduce ? segment.value : 0, pathOffset: starts[i] }}
              animate={{ pathLength: segment.value, pathOffset: starts[i] }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: reduce ? 0 : i * 0.15 }}
            />
          ) : null,
        )}
      </g>
    </svg>
  )
}
