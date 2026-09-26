'use client'

import { Reveal } from '@/components/motion'
import { PaymentPlanList } from './PaymentPlanList'
import { BillingCycleTable } from './BillingCycleTable'
import { ContractFileUpload } from './ContractFileUpload'
import { ProofReviewList } from './ProofReviewList'
import { RecentDocumentsCard } from './RecentDocumentsCard'

interface PaymentDashboardProps {
  customerId: string
}

/**
 * Workspace — การชำระเงิน: แผน → ตารางรอบจ่ายเงิน (2fr) + หลักฐาน/สัญญา/เอกสาร (1fr)
 * ตัวจัดการเอกสารเต็มอยู่หน้า /documents (สลับด้วย PaymentSectionSwitch)
 */
export function PaymentDashboard({ customerId }: PaymentDashboardProps) {
  return (
    <div className="flex flex-col gap-5">
      <PaymentPlanList customerId={customerId} />

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Reveal className="min-w-0">
          <BillingCycleTable customerId={customerId} />
        </Reveal>

        <Reveal delay={0.08} className="flex min-w-0 flex-col gap-[18px]">
          <ProofReviewList customerId={customerId} />
          <ContractFileUpload customerId={customerId} />
          <RecentDocumentsCard customerId={customerId} />
        </Reveal>
      </div>
    </div>
  )
}
