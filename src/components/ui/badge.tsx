import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// UI Kit v1.0 — pill สูง 24 · ตัวอักษร 12/500
// จุดสี: ใส่ลูก <span data-dot /> ไว้หน้าข้อความ · สีจุดตาม variant หรือส่ง className="bg-…" ให้จุดเอง
const badgeVariants = cva(
  "group/badge focus-visible:ring-ring/70 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3! [&>[data-dot]]:size-2 [&>[data-dot]]:shrink-0 [&>[data-dot]]:rounded-full [&>[data-dot]:not([class*='bg-'])]:bg-current",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/85',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-danger-subtle text-danger-strong focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline:
          'border-border text-foreground dark:bg-input/30 [a]:hover:bg-muted bg-white',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // ความหมาย (UI Kit Display 01)
        success: 'bg-success-subtle text-success',
        warning:
          "bg-warning-subtle text-warning-text [&>[data-dot]:not([class*='bg-'])]:bg-warning-accent",
        danger:
          "bg-danger-subtle text-danger-strong [&>[data-dot]:not([class*='bg-'])]:bg-destructive",
        info: "bg-info-subtle text-foreground [&>[data-dot]:not([class*='bg-'])]:bg-info",
        neutral:
          "bg-muted text-text-secondary [&>[data-dot]:not([class*='bg-'])]:bg-muted-foreground",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
