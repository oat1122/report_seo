import type { ReactNode } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// เนื้อหา toast (UI Kit Toast): วงกลมไอคอน 28px + ข้อความ 14px
const ToastContent = ({
  icon,
  tone,
  message,
}: {
  icon: ReactNode
  tone: string
  message: string
}) => (
  <div className="flex items-center gap-3">
    <span
      aria-hidden
      className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', tone)}
    >
      {icon}
    </span>
    <p className="text-sm leading-snug">{message}</p>
  </div>
)

export const PendingToast = ({ message }: { message: string }) => (
  <ToastContent
    tone="bg-info-subtle text-info-strong"
    icon={<Loader2 className="size-4 animate-spin" />}
    message={message}
  />
)

export const SuccessToast = ({ message }: { message: string }) => (
  <ToastContent
    tone="bg-secondary text-secondary-foreground"
    icon={<Check className="size-4" strokeWidth={2.5} />}
    message={message}
  />
)

export const ErrorToast = ({ message }: { message: string }) => (
  <ToastContent
    tone="bg-danger-subtle text-danger-strong"
    icon={<X className="size-4" strokeWidth={2.5} />}
    message={message}
  />
)
