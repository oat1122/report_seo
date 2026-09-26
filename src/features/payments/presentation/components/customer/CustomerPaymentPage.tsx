'use client'

import { Reveal } from '@/components/motion'
import { CustomerPaymentSummary } from './CustomerPaymentSummary'
import { MyBillingCycles } from './MyBillingCycles'
import { MyContractFiles } from './MyContractFiles'
import { MyPaymentHistory } from './MyPaymentHistory'

interface CustomerPaymentPageProps {
  customerId: string
}

/** หน้าการชำระเงินของลูกค้า — สรุปยอด → รอบจ่ายเงิน (2fr) + ประวัติ/สัญญา (1fr) */
export function CustomerPaymentPage({ customerId }: CustomerPaymentPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <CustomerPaymentSummary customerId={customerId} />

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Reveal className="min-w-0">
          <MyBillingCycles customerId={customerId} />
        </Reveal>

        <Reveal delay={0.08} className="flex min-w-0 flex-col gap-[18px]">
          <MyPaymentHistory customerId={customerId} />
          <MyContractFiles customerId={customerId} />
        </Reveal>
      </div>
    </div>
  )
}
