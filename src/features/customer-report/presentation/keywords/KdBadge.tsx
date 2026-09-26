import { Badge } from '@/components/ui/badge'
import { KD_STYLE, toKdKey } from './keyword-view'

// ป้ายความยาก KD — คู่สีสถานะ success / warning / danger ตาม UI Kit
export const KdBadge = ({ kd, className }: { kd: string; className?: string }) => {
  const style = KD_STYLE[toKdKey(kd)]
  return (
    <Badge variant={style.badge} className={className}>
      {style.label}
    </Badge>
  )
}
