'use client'

import * as React from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — หนา 8 · ราง info-subtle · แถบ info-strong · ครบ 100% (data-state=complete) เปลี่ยนเป็นเขียวแบรนด์
function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // ส่ง value ให้ Root ด้วย (เดิมไม่ได้ส่ง) เพื่อให้มี aria-valuenow และ data-state=complete
  // clamp ไว้ในช่วง 0..max กัน Radix เตือนค่าเกินช่วง
  const clamped = value == null ? value : Math.min(Math.max(value, 0), max)
  const percent = ((clamped ?? 0) / max) * 100

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-info-subtle relative flex h-2 w-full items-center overflow-hidden rounded-full',
        className,
      )}
      value={clamped}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-info-strong data-[state=complete]:bg-secondary size-full flex-1 rounded-full transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
