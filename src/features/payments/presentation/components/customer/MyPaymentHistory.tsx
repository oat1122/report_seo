'use client'

import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListPaymentProofs } from '../../hooks/usePaymentProofs'

interface MyPaymentHistoryProps {
  customerId: string
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    icon: typeof Clock
  }
> = {
  PENDING: { label: 'รอตรวจสอบ', variant: 'outline', icon: Clock },
  APPROVED: { label: 'อนุมัติ', variant: 'secondary', icon: CheckCircle },
  REJECTED: { label: 'ปฏิเสธ', variant: 'destructive', icon: XCircle },
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MyPaymentHistory({ customerId }: MyPaymentHistoryProps) {
  const { data: proofs, isLoading } = useListPaymentProofs(customerId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (!proofs?.length) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center">
          ยังไม่มีประวัติการชำระเงิน
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proofs.map((proof) => {
        const config = STATUS_CONFIG[proof.status] ?? STATUS_CONFIG.PENDING
        const Icon = config.icon
        return (
          <Card key={proof.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{formatDate(proof.uploadDate)}</p>
                <Badge variant={config.variant} className="gap-1">
                  <Icon className="size-3" />
                  {config.label}
                </Badge>
              </div>

              {proof.billingCycle && (
                <p className="text-muted-foreground text-xs">
                  งวดที่ {proof.billingCycle.cycleNumber} — {proof.billingCycle.plan.description}
                </p>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proof.uploadUrl}
                alt="หลักฐานการโอนเงิน"
                className="h-40 w-full rounded-md border object-contain"
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
