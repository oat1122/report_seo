import { Badge } from '@/components/ui/badge'
import type { KdLevel } from '@/types/kd'
import { KD_META } from './kdMeta'

/** ป้ายระดับความยาก (KD) — สีตามความยาก + ข้อความไทยเสมอ (ไม่ใช้สีอย่างเดียว) */
export function KdBadge({ kd }: { kd: KdLevel | null }) {
  if (!kd) return <Badge variant="neutral">ไม่ระบุ</Badge>
  const meta = KD_META[kd]
  return <Badge variant={meta.badge}>{meta.label}</Badge>
}
