import type { ReactNode } from 'react'

/** className สำหรับ <ChartTooltipContent> — tooltip พื้นเข้ม (bg-toast) ตาม UI Kit Data viz */
export const DARK_TOOLTIP_CLASS =
  'bg-toast rounded-xl border-0 px-3 py-2 text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/70'

// แถวใน tooltip: จุดสี + ชื่อ (ตัดคำ) + ค่า แยกกันชัด — ChartTooltipContent วาง return ของ formatter ตรง ๆ
export const ChartTooltipRow = ({
  color,
  label,
  value,
}: {
  color?: string
  label: ReactNode
  value: ReactNode
}) => (
  <div className="flex w-full items-center gap-2">
    {color && (
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-[3px]"
        style={{ backgroundColor: color }}
      />
    )}
    <span className="max-w-[220px] min-w-0 flex-1 truncate text-white/70">{label}</span>
    <span className="shrink-0 font-semibold text-white tabular-nums">{value}</span>
  </div>
)
