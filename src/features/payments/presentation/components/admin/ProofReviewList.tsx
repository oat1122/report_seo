'use client'

import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListPaymentProofs, useApproveRejectProof } from '../../hooks/usePaymentProofs'

interface ProofReviewListProps {
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

export function ProofReviewList({ customerId }: ProofReviewListProps) {
  const { data: proofs, isLoading } = useListPaymentProofs(customerId)
  const mutation = useApproveRejectProof()

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
          ยังไม่มีหลักฐานการโอนเงิน
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">หลักฐานการโอนเงิน</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proofs.map((proof) => {
          const config = STATUS_CONFIG[proof.status] ?? STATUS_CONFIG.PENDING
          const Icon = config.icon
          return (
            <Card key={proof.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{proof.customer.name}</p>
                    <p className="text-muted-foreground">{formatDate(proof.uploadDate)}</p>
                  </div>
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

                {proof.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        mutation.mutate({
                          customerId,
                          proofId: proof.id,
                          status: 'APPROVED',
                        })
                      }
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-1 size-3" />
                      )}
                      อนุมัติ
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() =>
                        mutation.mutate({
                          customerId,
                          proofId: proof.id,
                          status: 'REJECTED',
                        })
                      }
                      disabled={mutation.isPending}
                    >
                      <XCircle className="mr-1 size-3" />
                      ปฏิเสธ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
