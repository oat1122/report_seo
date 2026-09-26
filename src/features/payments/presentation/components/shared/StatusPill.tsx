import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { StatusTone } from './payment-view'

/** คู่สีสถานะของ UI Kit — จุดสีเป็นแค่ตัวช่วย ป้ายบอกด้วยคำเสมอ */
const TONE_CLASS: Record<StatusTone, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-subtle text-success', dot: 'bg-success' },
  danger: { pill: 'bg-danger-subtle text-danger-strong', dot: 'bg-destructive' },
  warning: { pill: 'bg-warning-subtle text-warning-text', dot: 'bg-warning-accent' },
  info: { pill: 'bg-info-subtle text-foreground', dot: 'bg-info-strong' },
  neutral: { pill: 'bg-muted text-text-secondary', dot: 'bg-muted-foreground' },
}

export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone].pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', TONE_CLASS[tone].dot)} />
      {children}
    </span>
  )
}
