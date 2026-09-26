import * as React from 'react'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — สูง 44 · มุม 12 · focus ขอบม่วง 2px (inset-ring 1px ทับขอบเดิม ไม่ให้ข้อความขยับ) + ring 3px
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-info focus-visible:inset-ring-info focus-visible:ring-info/25 disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/12 aria-invalid:focus-visible:inset-ring-destructive dark:bg-input/30 dark:disabled:bg-input/80 dark:read-only:not-disabled:bg-input/50 dark:hover:border-muted-foreground/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-11 w-full min-w-0 rounded-[12px] border bg-white px-3 py-1 text-base transition-[color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium read-only:not-disabled:bg-slate-50 hover:border-slate-300 focus-visible:inset-ring-1 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-[3px] md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
