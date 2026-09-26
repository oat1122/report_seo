import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// กล่องประโยคสรุปท้ายการ์ด (พื้นม่วงอ่อน) — "อ่านแล้วรู้เลย" ตาม UI Kit Data viz
export const SummaryNote = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <p
    className={cn(
      'bg-info-subtle/80 rounded-xl px-3 py-2.5 text-[13px] leading-relaxed',
      className,
    )}
  >
    {children}
  </p>
)
