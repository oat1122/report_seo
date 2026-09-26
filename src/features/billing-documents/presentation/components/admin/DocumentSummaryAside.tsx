import type { ReactNode } from 'react'
import Image from 'next/image'
import { computeVatBreakdown } from '../../../domain/vat'
import { formatMoney } from './document-display'

interface Props {
  /** ยอดรวมรายการก่อนภาษี */
  subtotal: number
  /** คิด VAT 7% หรือไม่ (เฉพาะใบแจ้งหนี้ที่เปิด "รวม VAT") */
  withVat: boolean
  typeLabel: string
  customerName: string
  /** ข้อความสถานะเพิ่มเติม เช่น เทียบกับยอดตามแผน */
  children?: ReactNode
}

/** กล่องสรุปยอด + ตัวอย่างหัวเอกสาร (ขวามือของ dialog สร้าง/แก้ไขเอกสาร) */
export function DocumentSummaryAside({
  subtotal,
  withVat,
  typeLabel,
  customerName,
  children,
}: Props) {
  const { vat, grandTotal } = computeVatBreakdown(subtotal)
  const total = withVat ? grandTotal : subtotal

  return (
    <aside
      aria-label="สรุปยอด"
      className="border-info-subtle flex flex-col gap-3.5 rounded-[18px] border bg-white/70 p-[18px] lg:sticky lg:top-0 dark:bg-white/5"
    >
      <h3 className="text-[15px] font-semibold">สรุปยอด</h3>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="text-text-secondary flex justify-between gap-3">
          <dt>รวมก่อนภาษี</dt>
          <dd className="text-foreground tabular-nums">{formatMoney(subtotal)}</dd>
        </div>
        {withVat && (
          <div className="text-text-secondary flex justify-between gap-3">
            <dt>VAT 7%</dt>
            <dd className="text-foreground tabular-nums">{formatMoney(vat)}</dd>
          </div>
        )}
        <div className="bg-border my-1 h-px" aria-hidden />
        <div className="flex justify-between gap-3 text-base font-semibold">
          <dt>รวมทั้งสิ้น</dt>
          <dd className="tabular-nums">{formatMoney(total)} บาท</dd>
        </div>
      </dl>

      {children}

      <div
        aria-hidden
        className="border-border mt-1 flex flex-col gap-2 rounded-[12px] border bg-white p-3.5 dark:bg-white/5"
      >
        <div className="flex items-center justify-between gap-2">
          <Image src="/img/brand/logo-mark.png" alt="" width={28} height={27} />
          <span className="text-xs font-semibold">{typeLabel}</span>
        </div>
        <span className="truncate text-[11px] font-medium">{customerName || 'ชื่อลูกค้า'}</span>
        <span className="bg-border h-[5px] w-[90%] rounded-[3px]" />
        <span className="bg-border h-[5px] w-1/2 rounded-[3px]" />
        <span className="bg-muted mt-1.5 h-[18px] rounded-[4px]" />
        <span className="self-end text-[11px] font-semibold tabular-nums">
          {formatMoney(total)}
        </span>
      </div>
      <span className="text-text-secondary text-xs">ตัวอย่างหัวเอกสาร อัปเดตตามข้อมูลที่กรอก</span>
    </aside>
  )
}
