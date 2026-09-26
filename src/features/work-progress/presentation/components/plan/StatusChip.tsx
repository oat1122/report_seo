import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { tintOf } from './planDisplay'

interface StatusChipProps {
  name: string
  // สีจาก master data ของสถานะ — ไม่มีสีจะใช้โทน neutral
  color: string | null
  className?: string
}

// ชิปสถานะ: พื้นอ่อนของสีสถานะ + จุดสี + ชื่อ (ตัวอักษรสีหลักเสมอ เพื่อ contrast)
export function StatusChip({ name, color, className }: StatusChipProps) {
  return (
    <Badge
      variant="neutral"
      className={cn('text-foreground max-w-full', className)}
      style={color ? { backgroundColor: tintOf(color, 20) } : undefined}
    >
      <span data-dot style={color ? { backgroundColor: color } : undefined} />
      <span className="truncate">{name}</span>
    </Badge>
  )
}
