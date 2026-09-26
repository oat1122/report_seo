import type { ReactNode } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReportCardProps {
  title: ReactNode
  /** ประโยคสรุปผลใต้หัวการ์ด (กฎ Handoff 04 ข้อ 4) */
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

// การ์ด glass ของแท็บ Keyword / AI — padding 18 บนมือถือ, 22/24 บน desktop ตาม mockup
export const ReportCard = ({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: ReportCardProps) => (
  <Card className={cn('min-w-0 gap-4 py-[18px] md:py-[22px]', className)}>
    <CardHeader className="px-[18px] md:px-6">
      <CardTitle>
        <h2 className="text-base leading-snug font-semibold md:text-[17px]">{title}</h2>
      </CardTitle>
      {description && <CardDescription className="leading-relaxed">{description}</CardDescription>}
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent className={cn('flex flex-1 flex-col gap-4 px-[18px] md:px-6', contentClassName)}>
      {children}
    </CardContent>
  </Card>
)
