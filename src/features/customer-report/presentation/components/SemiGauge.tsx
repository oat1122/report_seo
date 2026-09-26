'use client'

import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'

// ครึ่งวงกลม r=34 ศูนย์กลาง (42,42) ใน viewBox 84×48 — ขยายตาม width ของ className
const ARC = 'M8 42 A34 34 0 0 1 76 42'

interface SemiGaugeProps {
  value: number
  max?: number
  /** สี arc — CSS color / var() */
  color?: string
  strokeWidth?: number
  className?: string
  /** เนื้อหากลาง gauge (เช่น ตัวเลข) วางชิดขอบล่าง */
  children?: ReactNode
}

/** Gauge 180° — track var(--border) + arc ที่วาดจาก 0 → ค่า ตอน mount */
export function SemiGauge({
  value,
  max = 100,
  color = 'var(--chart-1)',
  strokeWidth = 9,
  className,
  children,
}: SemiGaugeProps) {
  const reduce = useReducedMotion()
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0

  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 84 48" className="block h-auto w-full" aria-hidden>
        <path
          d={ARC}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {ratio > 0 && (
          <motion.path
            d={ARC}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? ratio : 0 }}
            animate={{ pathLength: ratio }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          />
        )}
      </svg>
      {children && (
        <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-0.5 leading-none">
          {children}
        </div>
      )}
    </div>
  )
}
