'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 (Forms 05) — สูง 40 มุม 12 · กดแล้วพื้น info-subtle + ขอบใน 1.5px สี info
const toggleVariants = cva(
  "group/toggle hover:bg-muted hover:text-foreground focus-visible:ring-ring/70 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-info-subtle aria-pressed:inset-ring-info data-[state=on]:bg-info-subtle data-[state=on]:inset-ring-info dark:aria-invalid:ring-destructive/40 inline-flex items-center justify-center gap-2 rounded-[12px] text-[13px] whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 aria-pressed:font-medium aria-pressed:inset-ring-[1.5px] data-[state=on]:font-medium data-[state=on]:inset-ring-[1.5px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border-input dark:bg-input/30 border bg-white data-[state=on]:border-transparent',
      },
      size: {
        default:
          'h-10 min-w-10 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        sm: "h-9 min-w-9 rounded-[10px] px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 min-w-11 px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
