'use client'

import * as React from 'react'
import { Label as LabelPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — 13/500 · ช่องบังคับกรอกใส่ data-required แล้วจะมี * สีแดงต่อท้าย
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "data-required:after:text-danger-strong flex items-center gap-2 text-[13px] leading-snug font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-required:after:-ml-1 data-required:after:content-['*']",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
