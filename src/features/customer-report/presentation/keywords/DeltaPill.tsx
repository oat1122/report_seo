import { ArrowDown, ArrowUp, Minus, Sparkles, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { KeywordRankCard } from '../lib/historyCalculations'
import { deltaView, type DeltaKind } from './keyword-view'

const KIND: Record<
  DeltaKind,
  { variant: 'success' | 'danger' | 'neutral' | 'info'; Icon: LucideIcon }
> = {
  up: { variant: 'success', Icon: ArrowUp },
  down: { variant: 'danger', Icon: ArrowDown },
  flat: { variant: 'neutral', Icon: Minus },
  new: { variant: 'info', Icon: Sparkles },
  none: { variant: 'neutral', Icon: Minus },
}

// การเปลี่ยนอันดับเทียบรอบก่อน — สี + ไอคอน + ข้อความ (ไม่ใช้สีเป็นสัญญาณเดียว)
export const DeltaPill = ({
  card,
}: {
  card: Pick<KeywordRankCard, 'currentPosition' | 'isNew' | 'delta'>
}) => {
  const d = deltaView(card)
  const { variant, Icon } = KIND[d.kind]
  return (
    <Badge variant={variant} className="gap-1 px-2 font-semibold tabular-nums">
      <Icon aria-hidden="true" />
      {d.text}
    </Badge>
  )
}
