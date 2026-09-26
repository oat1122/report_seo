import type { ReactNode } from 'react'
import { CardAction, CardDescription, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReportCardHeaderProps {
  title: ReactNode
  /** ประโยคสรุปผลของการ์ด (Handoff rule 4) */
  description?: ReactNode
  /** ปุ่ม/ป้ายชิดขวา */
  action?: ReactNode
  /** ไอคอนในกรอบ 40px หน้าชื่อการ์ด */
  icon?: ReactNode
  id?: string
  className?: string
}

/** หัวการ์ดมาตรฐานของรายงาน: h2 17px + คำอธิบาย + action */
export function ReportCardHeader({
  title,
  description,
  action,
  icon,
  id,
  className,
}: ReportCardHeaderProps) {
  return (
    <CardHeader className={className}>
      <div className={cn('flex min-w-0 gap-3', icon ? 'items-center' : 'items-start')}>
        {icon && (
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5"
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={id} className="text-[17px] leading-snug font-semibold">
            {title}
          </h2>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </div>
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
  )
}
