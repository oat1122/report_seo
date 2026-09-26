'use client'

import { CheckCircle, ExternalLink, Loader2, ReceiptText, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListPaymentProofs, useApproveRejectProof } from '../../hooks/usePaymentProofs'
import { StatusPill } from '../shared/StatusPill'
import { formatPaymentDateTime, PROOF_SECTION_ID, PROOF_STATUS } from '../shared/payment-view'

interface ProofReviewListProps {
  customerId: string
}

export function ProofReviewList({ customerId }: ProofReviewListProps) {
  const { data: proofs, isLoading } = useListPaymentProofs(customerId)
  const mutation = useApproveRejectProof()

  const pending = proofs?.filter((proof) => proof.status === 'PENDING') ?? []
  const reviewed = proofs?.filter((proof) => proof.status !== 'PENDING') ?? []

  return (
    <Card
      id={PROOF_SECTION_ID}
      role="region"
      aria-labelledby="proof-review-title"
      className="scroll-mt-6 gap-3.5 px-5 py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="proof-review-title" className="text-[17px] font-semibold">
            หลักฐานการโอน
          </h2>
          <p className="text-text-secondary text-[13px]">
            {isLoading
              ? 'กำลังโหลดหลักฐาน…'
              : proofs?.length
                ? `ลูกค้าส่งมา ${proofs.length} รายการ · ตรวจแล้ว ${reviewed.length} รายการ`
                : 'สลิปที่ลูกค้าอัปโหลดจะมารอตรวจที่นี่'}
          </p>
        </div>
        {pending.length > 0 && (
          <StatusPill tone="warning" className="shrink-0">
            รอตรวจสอบ {pending.length}
          </StatusPill>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-3.5" aria-busy="true">
          <Skeleton className="h-36 w-28 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : !proofs?.length ? (
        <p className="text-text-secondary border-border flex items-center gap-2.5 rounded-[14px] border border-dashed px-4 py-5 text-sm">
          <ReceiptText aria-hidden className="size-4 shrink-0" />
          ยังไม่มีหลักฐานการโอนเงิน
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {pending.map((proof) => {
                const mutatingStatus =
                  mutation.isPending && mutation.variables?.proofId === proof.id
                    ? mutation.variables.status
                    : null
                return (
                  <motion.li
                    key={proof.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-glass-tile border-glass-border flex flex-col gap-3 rounded-2xl border p-3"
                  >
                    <div className="flex gap-3.5">
                      <a
                        href={proof.uploadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:ring-ring/60 shrink-0 rounded-xl focus-visible:ring-[3px] focus-visible:outline-none"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proof.uploadUrl}
                          alt={`สลิปงวดที่ ${proof.billingCycle?.cycleNumber ?? '—'}`}
                          className="border-border h-36 w-28 rounded-xl border bg-white object-cover"
                        />
                      </a>
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[15px] leading-snug font-semibold">
                          {proof.billingCycle
                            ? `งวดที่ ${proof.billingCycle.cycleNumber} — ${proof.billingCycle.plan.description}`
                            : 'ไม่ได้ระบุงวด'}
                        </span>
                        <span className="text-text-secondary text-xs">
                          ส่งเมื่อ {formatPaymentDateTime(proof.uploadDate)}
                        </span>
                        <a
                          href={proof.uploadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground inline-flex items-center gap-1 text-[13px] underline underline-offset-2"
                        >
                          ดูรูปเต็ม
                          <ExternalLink aria-hidden className="size-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <Button
                        variant="outline"
                        className="border-danger-subtle text-danger-strong hover:bg-danger-subtle hover:text-danger-strong h-11 rounded-[12px]"
                        onClick={() =>
                          mutation.mutate({ customerId, proofId: proof.id, status: 'REJECTED' })
                        }
                        disabled={mutation.isPending}
                      >
                        {mutatingStatus === 'REJECTED' ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <XCircle className="size-4" />
                        )}
                        ปฏิเสธ
                      </Button>
                      <Button
                        className="h-11 rounded-[12px]"
                        onClick={() =>
                          mutation.mutate({ customerId, proofId: proof.id, status: 'APPROVED' })
                        }
                        disabled={mutation.isPending}
                      >
                        {mutatingStatus === 'APPROVED' ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )}
                        อนุมัติ
                      </Button>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>

          {reviewed.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-text-secondary text-xs font-medium">ตรวจแล้ว</span>
              <ul className="flex flex-col gap-2">
                {reviewed.map((proof) => {
                  const status = PROOF_STATUS[proof.status] ?? PROOF_STATUS.PENDING
                  return (
                    <li
                      key={proof.id}
                      className="flex items-center gap-3 rounded-[12px] bg-white/70 px-3 py-2.5 dark:bg-white/5"
                    >
                      <a
                        href={proof.uploadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:ring-ring/60 shrink-0 rounded-[10px] focus-visible:ring-[3px] focus-visible:outline-none"
                        aria-label={`ดูสลิปงวดที่ ${proof.billingCycle?.cycleNumber ?? '—'}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proof.uploadUrl}
                          alt=""
                          className="border-border size-11 rounded-[10px] border bg-white object-cover"
                        />
                      </a>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">
                          {proof.billingCycle
                            ? `งวดที่ ${proof.billingCycle.cycleNumber} — ${proof.billingCycle.plan.description}`
                            : 'ไม่ได้ระบุงวด'}
                        </span>
                        <span className="text-text-secondary text-xs">
                          {formatPaymentDateTime(proof.uploadDate)}
                        </span>
                      </div>
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
