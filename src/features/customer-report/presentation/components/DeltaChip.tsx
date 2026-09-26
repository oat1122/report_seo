import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type DeltaTone = 'good' | 'bad' | 'neutral'
export type DeltaDirection = 'up' | 'down' | 'flat'

const TONE_VARIANT = { good: 'success', bad: 'danger', neutral: 'neutral' } as const

const ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const

/** ทิศ + โทนจากค่า delta (lowerIsBetter = อันดับ/spam: ค่าลด = ดีขึ้น) */
export const deltaMeta = (
  delta: number,
  lowerIsBetter = false,
): { direction: DeltaDirection; tone: DeltaTone } => {
  if (delta === 0) return { direction: 'flat', tone: 'neutral' }
  const direction: DeltaDirection = delta > 0 ? 'up' : 'down'
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  return { direction, tone: improved ? 'good' : 'bad' }
}

interface DeltaChipProps {
  direction: DeltaDirection
  tone: DeltaTone
  children: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

/** ป้ายการเปลี่ยนแปลง (Badge สถานะ) — สี + ลูกศร + ข้อความ ไม่ใช้สีอย่างเดียวสื่อความหมาย */
export function DeltaChip({ direction, tone, children, size = 'sm', className }: DeltaChipProps) {
  const Icon = ICON[direction]
  return (
    <Badge
      variant={TONE_VARIANT[tone]}
      className={cn(
        'gap-0.5 font-semibold tabular-nums',
        size === 'md' ? 'h-[26px] px-2.5 text-[13px]' : 'h-[22px] px-2',
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.5} />
      {children}
    </Badge>
  )
}
