'use client'

import { ReceiptText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListPaymentProofs } from '../../hooks/usePaymentProofs'
import { StatusPill } from '../shared/StatusPill'
import { formatPaymentDateTime, PROOF_STATUS } from '../shared/payment-view'

interface MyPaymentHistoryProps {
  customerId: string
}

export function MyPaymentHistory({ customerId }: MyPaymentHistoryProps) {
  const { data: proofs, isLoading } = useListPaymentProofs(customerId)
  const pendingCount = proofs?.filter((proof) => proof.status === 'PENDING').length ?? 0

  return (
    <Card role="region" aria-labelledby="my-payment-history-title" className="gap-3.5 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="my-payment-history-title" className="text-[17px] font-semibold">
            ประวัติการส่งหลักฐาน
          </h2>
          <p className="text-text-secondary text-[13px]">
            {isLoading
              ? 'กำลังโหลดประวัติ…'
              : proofs?.length
                ? `ส่งแล้ว ${proofs.length} ครั้ง · ทีมตรวจแล้วจะอัปเดตสถานะที่นี่`
                : 'สลิปที่คุณอัปโหลดจะแสดงที่นี่พร้อมผลการตรวจ'}
          </p>
        </div>
        {pendingCount > 0 && (
          <StatusPill tone="warning" className="shrink-0">
            รอตรวจสอบ {pendingCount}
          </StatusPill>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-[12px]" />
          <Skeleton className="h-16 w-full rounded-[12px]" />
        </div>
      ) : !proofs?.length ? (
        <p className="text-text-secondary border-border flex items-center gap-2.5 rounded-[14px] border border-dashed px-4 py-5 text-sm">
          <ReceiptText aria-hidden className="size-4 shrink-0" />
          ยังไม่มีประวัติการชำระเงิน
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {proofs.map((proof) => {
            const status = PROOF_STATUS[proof.status] ?? PROOF_STATUS.PENDING
            const cycleLabel = proof.billingCycle
              ? `งวดที่ ${proof.billingCycle.cycleNumber} — ${proof.billingCycle.plan.description}`
              : 'ไม่ได้ระบุงวด'
            return (
              <li
                key={proof.id}
                className="flex items-center gap-3 rounded-[12px] bg-white/70 px-3 py-2.5 dark:bg-white/5"
              >
                <a
                  href={proof.uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`ดูสลิป ${cycleLabel}`}
                  className="focus-visible:ring-ring/60 shrink-0 rounded-[10px] focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proof.uploadUrl}
                    alt=""
                    className="border-border size-12 rounded-[10px] border bg-white object-cover"
                  />
                </a>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{cycleLabel}</span>
                  <span className="text-text-secondary text-xs">
                    {formatPaymentDateTime(proof.uploadDate)}
                  </span>
                </div>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
