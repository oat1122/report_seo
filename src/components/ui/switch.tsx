'use client'

import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — 42×24 (sm 34×20) · เปิด = เขียวแบรนด์ · thumb ขาวเงาเบา ห่างขอบ 3px
function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch focus-visible:ring-ring/70 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-secondary dark:data-unchecked:bg-input relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-slate-300 px-0.5 transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-[3px] focus-visible:ring-offset-2 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-45 data-[size=default]:h-6 data-[size=default]:w-[42px] data-[size=sm]:h-5 data-[size=sm]:w-[34px]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3.5 data-checked:translate-x-full data-unchecked:translate-x-0 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
