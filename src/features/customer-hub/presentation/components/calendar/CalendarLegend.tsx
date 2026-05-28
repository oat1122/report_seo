'use client'

import { colors } from '@/theme/theme'

const LEGEND_ITEMS = [
  { label: 'Work Progress', color: colors.info.main },
  { label: 'ชำระแล้ว', color: colors.success.main },
  { label: 'เกินกำหนด', color: colors.error.main },
  { label: 'รอชำระ', color: colors.warning.main },
  { label: 'กำลังตรวจสอบ', color: colors.slate[500] },
] as const

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4 px-1 pt-3">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <span
            className="inline-block size-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}
