import { KdLevel } from '@/types/kd'

/** ลำดับตัวเลือก KD ในฟอร์ม — ง่าย → ยาก */
export const KD_OPTIONS: readonly KdLevel[] = [KdLevel.EASY, KdLevel.MEDIUM, KdLevel.HARD]

export const KD_META: Record<KdLevel, { label: string; badge: 'success' | 'warning' | 'danger' }> =
  {
    EASY: { label: 'ง่าย', badge: 'success' },
    MEDIUM: { label: 'ปานกลาง', badge: 'warning' },
    HARD: { label: 'ยาก', badge: 'danger' },
  }
