'use client'

import Link from 'next/link'
import { Download, FilePlus2, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListDocuments } from '@/features/billing-documents/presentation/hooks/useDocuments'
import { DOCUMENT_TYPE_LABELS } from '@/features/billing-documents/domain/DocumentType'
import { formatMoney, formatPaymentDate } from '../shared/payment-view'

const PREVIEW_COUNT = 3

/** เอกสารล่าสุดของลูกค้า — ตัวจัดการเต็มอยู่หน้า "เอกสาร" (สลับจากแถบด้านบน) */
export function RecentDocumentsCard({ customerId }: { customerId: string }) {
  const { data: documents, isLoading, isError } = useListDocuments(customerId)
  const documentsHref = `/admin/customers/${customerId}/documents`

  const latest = [...(documents ?? [])]
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, PREVIEW_COUNT)

  return (
    <Card role="region" aria-labelledby="recent-documents-title" className="gap-3.5 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="recent-documents-title" className="text-[17px] font-semibold">
            เอกสารของลูกค้านี้
          </h2>
          <p className="text-text-secondary text-[13px]">
            ใบแจ้งหนี้ · ใบเสร็จ · ใบกำกับภาษี ล่าสุด
          </p>
        </div>
        {documents && documents.length > 0 && (
          <Link
            href={documentsHref}
            className="text-foreground inline-flex min-h-11 shrink-0 items-center text-[13px] font-medium underline underline-offset-2 sm:min-h-0"
          >
            ทั้งหมด {documents.length}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-[12px]" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </div>
      ) : isError ? (
        <p className="text-text-secondary border-border rounded-[14px] border border-dashed px-4 py-5 text-center text-sm">
          โหลดรายการเอกสารไม่สำเร็จ — เปิดหน้า “เอกสาร” เพื่อดูทั้งหมด
        </p>
      ) : latest.length === 0 ? (
        <p className="text-text-secondary border-border rounded-[14px] border border-dashed px-4 py-5 text-center text-sm">
          ยังไม่มีเอกสาร สร้างใบแจ้งหนี้หรือใบเสร็จได้จากหน้า “เอกสาร”
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {latest.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 rounded-[12px] bg-white/70 px-3 py-2.5 dark:bg-white/5"
            >
              <span
                aria-hidden
                className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[10px]"
              >
                <Receipt className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">
                  {document.documentNumber} · {DOCUMENT_TYPE_LABELS[document.type]}
                </span>
                <span className="text-text-secondary text-xs tabular-nums">
                  {formatPaymentDate(document.generatedAt)} · {formatMoney(document.totalAmount)}
                </span>
              </div>
              <Button
                variant="ghost"
                className="size-11 shrink-0 rounded-[10px] p-0 sm:size-9"
                asChild
              >
                <a
                  href={document.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`ดาวน์โหลด ${document.documentNumber}`}
                  title="ดาวน์โหลด"
                >
                  <Download className="size-4" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        asChild
        variant="secondary"
        className="bg-info-subtle text-foreground hover:bg-info-subtle/80 h-11 w-full rounded-[12px]"
      >
        <Link href={documentsHref}>
          <FilePlus2 className="size-4" />
          สร้างเอกสาร
        </Link>
      </Button>
    </Card>
  )
}
