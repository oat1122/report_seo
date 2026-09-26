'use client'

import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  )
}

// UI Kit v1.0 — 22px · เลือกแล้วขอบหนา 7px (เหลือจุดกลาง) · อยู่ใน radio card (FieldLabel) ใช้สี info-strong
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer focus-visible:ring-ring/70 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:border-input dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary dark:data-checked:bg-primary-foreground in-data-[slot=field-label]:data-[state=checked]:border-info-strong relative flex aspect-square size-[22px] shrink-0 rounded-full border-[1.5px] border-slate-300 bg-white transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:ring-3 data-checked:border-[7px]',
        className,
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
