'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { motion } from '@/components/motion'
import { cn } from '@/lib/utils'

interface SegmentedRadioProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: { value: T; label: string }[]
  /** id ของข้อความ label ของกลุ่ม */
  labelledBy: string
  /** layoutId ของ pill ที่เลื่อน — ต้องไม่ซ้ำกับกลุ่มอื่นที่แสดงพร้อมกัน */
  pillId: string
  className?: string
}

/** ตัวเลือกแบบ segmented (role="radiogroup", ลูกศรเลื่อนได้) — pill สีขาวเลื่อนตามตัวที่เลือก */
export function SegmentedRadio<T extends string>({
  value,
  onValueChange,
  options,
  labelledBy,
  pillId,
  className,
}: SegmentedRadioProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      aria-labelledby={labelledBy}
      className={cn('bg-muted grid gap-1 rounded-[14px] p-1 dark:bg-white/5', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <RadioGroupPrimitive.Item
            key={opt.value}
            value={opt.value}
            className={cn(
              'focus-visible:ring-ring/70 relative h-11 rounded-[10px] px-2 text-[13px] whitespace-nowrap outline-none focus-visible:ring-[3px] sm:h-[38px]',
              active ? 'text-foreground font-medium' : 'text-text-secondary hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 rounded-[10px] bg-white shadow-[0_4px_12px_-6px_rgba(108,104,232,0.6)] dark:bg-white/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}
