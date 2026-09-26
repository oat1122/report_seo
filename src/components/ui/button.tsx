import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 (Handoff 02) — สูง 44 เป็นค่าเริ่มต้น · focus ring ม่วง 3px + offset 2px
// hex สองตัวใน brand/soft/destructive-subtle คือ hover ที่ spec กำหนดไว้ตรง ๆ (ไม่มี token)
const buttonVariants = cva(
  "group/button focus-visible:ring-ring/70 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[12px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] outline-none select-none focus-visible:ring-[3px] focus-visible:ring-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/85',
        // ใหม่ — ปุ่มเขียวแบรนด์
        brand:
          'bg-secondary text-secondary-foreground hover:bg-[#1ce03b] aria-expanded:bg-[#1ce03b]',
        outline:
          'border-border text-foreground hover:border-slate-300 aria-expanded:border-slate-300 dark:border-input dark:bg-input/30 dark:hover:border-input dark:hover:bg-input/50 dark:aria-expanded:bg-input/50 bg-white/85 hover:bg-white aria-expanded:bg-white',
        // คงไว้ให้ call site เดิม — หน้าตาเท่ากับ brand
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#1ce03b] aria-expanded:bg-[#1ce03b]',
        // ใหม่ — พื้นม่วงอ่อน ใช้กับ action รอง / CardAction
        soft: 'bg-info-subtle text-foreground hover:bg-[#e1e0ff] aria-expanded:bg-[#e1e0ff] dark:hover:bg-info/30 dark:aria-expanded:bg-info/30',
        ghost:
          'hover:bg-foreground/6 hover:text-foreground aria-expanded:bg-foreground/6 aria-expanded:text-foreground',
        // ทึบ ใช้ยืนยันลบ · dark ใช้ตัวอักษรเข้มเพราะขาวบน #ef4444 ได้แค่ 3.8:1
        destructive:
          'bg-destructive hover:bg-danger-strong focus-visible:ring-destructive/40 dark:text-primary-foreground text-white',
        // = destructive แบบเดิม (พื้นแดงอ่อน)
        'destructive-subtle':
          'bg-danger-subtle text-danger-strong focus-visible:ring-destructive/40 hover:bg-[#ffdfe3] dark:hover:bg-destructive/25',
        link: 'text-foreground hover:decoration-info-strong underline underline-offset-4',
      },
      size: {
        default:
          'h-11 gap-1.5 rounded-[12px] px-4 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        xs: "h-7 gap-1 rounded-[8px] px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'h-9 gap-1.5 rounded-[10px] px-3 text-[13px] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        lg: 'h-13 gap-2 rounded-[14px] px-5 text-[15px] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-11 rounded-[12px]',
        'icon-xs': "size-7 rounded-[8px] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': 'size-9 rounded-[10px]',
        'icon-lg': 'size-13 rounded-[14px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
