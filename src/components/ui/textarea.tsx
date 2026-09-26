import * as React from 'react'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — หน้าตาเดียวกับ input · สูงขั้นต่ำ 96 (3 แถว) · มุม 12
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-info focus-visible:inset-ring-info focus-visible:ring-info/25 disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/12 aria-invalid:focus-visible:inset-ring-destructive dark:bg-input/30 dark:disabled:bg-input/80 dark:read-only:not-disabled:bg-input/50 dark:hover:border-muted-foreground/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-24 w-full rounded-[12px] border bg-white px-3 py-2.5 text-base leading-relaxed transition-[color,border-color,box-shadow] outline-none read-only:not-disabled:bg-slate-50 hover:border-slate-300 focus-visible:inset-ring-1 focus-visible:ring-[3px] disabled:cursor-not-allowed aria-invalid:ring-[3px] md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
