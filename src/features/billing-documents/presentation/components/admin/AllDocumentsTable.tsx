'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileX,
  Loader2,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableSkeleton } from '@/components/skeletons'
import { cn } from '@/lib/utils'
import { useAllDocuments, useDeleteDocumentAdmin } from '../../hooks/useAllDocuments'
import { EditDocumentDialog } from './EditDocumentDialog'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { AdminBillingDocument } from '../../../domain/BillingDocument'
import {
  DOCUMENT_TYPE_BADGE,
  DOCUMENT_TYPE_SWATCH,
  formatDocDate,
  formatMoney,
} from './document-display'

const PAGE_SIZE = 10
const ALL_TYPES = 'ALL' as const
type TypeFilter = typeof ALL_TYPES | BillingDocumentType

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS) as BillingDocumentType[]

function typeLabel(type: string) {
  return DOCUMENT_TYPE_LABELS[type as BillingDocumentType] ?? type
}

export function AllDocumentsTable() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL_TYPES)
  const [page, setPage] = useState(1)
  const deferredSearch = useDeferredValue(search)
  const [editingDoc, setEditingDoc] = useState<AdminBillingDocument | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    userId: string
    documentId: string
    docNumber: string
    customerName: string
  } | null>(null)

  // ค้นหาฝั่ง server · กรองประเภทฝั่ง client เพื่อให้การ์ดตัวกรองแสดงจำนวนของทุกประเภทได้
  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAllDocuments(deferredSearch ? { search: deferredSearch } : {})
  const deleteMutation = useDeleteDocumentAdmin()

  const typeCounts = useMemo(() => {
    const counts = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t, 0])) as Record<
      BillingDocumentType,
      number
    >
    for (const doc of documents) {
      if (doc.type in counts) counts[doc.type as BillingDocumentType]++
    }
    return counts
  }, [documents])

  const filtered = useMemo(
    () =>
      typeFilter === ALL_TYPES ? documents : documents.filter((doc) => doc.type === typeFilter),
    [documents, typeFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  const changeType = (value: TypeFilter) => {
    setTypeFilter(value)
    setPage(1)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const { userId, documentId, docNumber } = deleteTarget
    deleteMutation.mutate(
      { userId, documentId },
      {
        onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
      },
    )
    setDeleteTarget(null)
  }

  const customerNameOf = (doc: AdminBillingDocument) =>
    doc.customer?.name ?? doc.customerName ?? null

  const requestDelete = (doc: AdminBillingDocument) =>
    setDeleteTarget({
      userId: doc.customer?.userId ?? '',
      documentId: doc.id,
      docNumber: doc.documentNumber,
      customerName: customerNameOf(doc) ?? 'ลูกค้าภายนอก',
    })

  const renderActions = (doc: AdminBillingDocument, large = false) => (
    <div className="flex justify-end gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        className={cn(large && 'size-11')}
        aria-label={`ดาวน์โหลด PDF ${doc.documentNumber}`}
        title="ดาวน์โหลด PDF"
        asChild
      >
        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" download>
          <Download aria-hidden />
        </a>
      </Button>
      {doc.customer && (
        <Button
          variant="outline"
          size="icon-sm"
          className={cn(large && 'size-11')}
          aria-label={`แก้ไขเอกสาร ${doc.documentNumber}`}
          title="แก้ไขเอกสาร"
          onClick={() => setEditingDoc(doc)}
        >
          <Pencil aria-hidden />
        </Button>
      )}
      <Button
        variant="outline"
        size="icon-sm"
        className={cn(
          'text-danger-strong hover:bg-danger-subtle hover:text-danger-strong',
          large && 'size-11',
        )}
        aria-label={`ลบเอกสาร ${doc.documentNumber}`}
        title="ลบเอกสาร"
        onClick={() => requestDelete(doc)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  )

  const renderCycle = (doc: AdminBillingDocument) =>
    doc.billingCycle ? (
      <div className="flex flex-col gap-1">
        <span className="text-text-secondary truncate text-xs">
          {doc.billingCycle.plan.description}
        </span>
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex h-6 items-center rounded-full bg-white/90 px-2.5 text-xs font-medium dark:bg-white/10">
            งวดที่ {doc.billingCycle.cycleNumber}
          </span>
          <span className="text-text-secondary inline-flex h-6 items-center rounded-full bg-white/90 px-2.5 text-xs font-medium tabular-nums dark:bg-white/10">
            {formatMoney(doc.billingCycle.amount)} บาท
          </span>
        </div>
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    )

  const renderTypeBadge = (doc: AdminBillingDocument) => (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
        DOCUMENT_TYPE_BADGE[doc.type as BillingDocumentType] ?? 'bg-muted text-foreground',
      )}
    >
      {typeLabel(doc.type)}
    </span>
  )

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="กรองตามประเภทเอกสาร"
        className="grid grid-cols-2 gap-2.5 md:grid-cols-5 md:gap-3"
      >
        {([ALL_TYPES, ...DOCUMENT_TYPES] as TypeFilter[]).map((value) => {
          const active = typeFilter === value
          const count = value === ALL_TYPES ? documents.length : typeCounts[value]
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => changeType(value)}
              className={cn(
                'focus-visible:ring-ring/70 flex flex-col items-start gap-1.5 rounded-[16px] border px-4 py-3.5 text-left transition-colors outline-none focus-visible:ring-[3px]',
                value === ALL_TYPES && 'col-span-2 md:col-span-1',
                active
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'border-glass-border bg-white/65 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10',
              )}
            >
              <span className="flex items-center gap-2 text-[13px]">
                {value !== ALL_TYPES && (
                  <span
                    aria-hidden
                    className={cn(
                      'size-2.5 rounded-[3px] ring-1 ring-black/10 ring-inset',
                      DOCUMENT_TYPE_SWATCH[value],
                    )}
                  />
                )}
                {value === ALL_TYPES ? 'ทุกประเภท' : DOCUMENT_TYPE_LABELS[value]}
              </span>
              <span className="text-[26px] leading-none font-semibold tabular-nums">
                {isLoading ? '–' : count.toLocaleString('th-TH')}
              </span>
            </button>
          )
        })}
      </div>

      <section
        aria-label="รายการเอกสาร"
        className="border-glass-border bg-glass-card shadow-card flex flex-col gap-1 rounded-[20px] border p-2 backdrop-blur-[14px] sm:px-2 sm:pt-3.5 sm:pb-2.5"
      >
        <div className="flex flex-col gap-2 px-1.5 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:w-[360px]">
            <span className="sr-only">ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า</span>
            <Search
              aria-hidden
              className="text-text-secondary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              type="search"
              placeholder="ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="border-glass-border rounded-[14px] bg-white/75 pl-10 dark:bg-white/5"
            />
          </label>
          <span className="text-text-secondary px-1 text-xs">เรียงตามวันที่สร้างล่าสุด</span>
        </div>

        {isLoading ? (
          <DataTableSkeleton rows={8} cols={7} className="border-0 bg-transparent" />
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm"
          >
            <AlertCircle aria-hidden className="text-danger-strong size-6" />
            <p className="text-text-secondary">
              โหลดรายการเอกสารไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching && <Loader2 aria-hidden className="animate-spin" />}
              ลองอีกครั้ง
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <FileX aria-hidden className="text-text-secondary size-6" />
            <p className="text-[15px] font-medium">ไม่พบเอกสาร</p>
            <p className="text-text-secondary text-[13px]">
              {search || typeFilter !== ALL_TYPES
                ? 'ลองเปลี่ยนคำค้นหรือเลือก “ทุกประเภท”'
                : 'กด “สร้างเอกสารใหม่” เพื่อออกเอกสารฉบับแรก'}
            </p>
          </div>
        ) : (
          <>
            {/* xl+: ตาราง */}
            <div className="hidden xl:block">
              <Table className="min-w-[900px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">เลขที่เอกสาร</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead className="w-[190px]">แผนชำระ</TableHead>
                    <TableHead className="w-[130px]">ประเภท</TableHead>
                    <TableHead className="w-[130px] text-right">จำนวนเงิน (บาท)</TableHead>
                    <TableHead className="w-[116px]">วันที่สร้าง</TableHead>
                    <TableHead className="w-[150px]">
                      <span className="sr-only">จัดการ</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((doc) => {
                    const name = customerNameOf(doc)
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium tabular-nums">
                          {doc.documentNumber}
                        </TableCell>
                        <TableCell>
                          {name ? (
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{name}</span>
                              {doc.customer?.domain && (
                                <span className="text-text-secondary truncate text-xs">
                                  {doc.customer.domain}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-secondary text-[13px]">ลูกค้าภายนอก</span>
                          )}
                        </TableCell>
                        <TableCell>{renderCycle(doc)}</TableCell>
                        <TableCell>{renderTypeBadge(doc)}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatMoney(doc.totalAmount)}
                        </TableCell>
                        <TableCell className="text-text-secondary text-[13px] tabular-nums">
                          {formatDocDate(doc.generatedAt)}
                        </TableCell>
                        <TableCell>{renderActions(doc)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* ต่ำกว่า xl: การ์ด */}
            <ul className="grid gap-2 md:grid-cols-2 xl:hidden">
              {pageRows.map((doc) => {
                const name = customerNameOf(doc)
                return (
                  <li
                    key={doc.id}
                    className="bg-glass-tile flex flex-col gap-3 rounded-[16px] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-medium tabular-nums">{doc.documentNumber}</span>
                        <span className="text-text-secondary truncate text-[13px]">
                          {name ?? 'ลูกค้าภายนอก'}
                        </span>
                      </div>
                      {renderTypeBadge(doc)}
                    </div>
                    <dl className="text-text-secondary grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
                      <dt>จำนวนเงิน</dt>
                      <dd className="text-foreground text-right font-semibold tabular-nums">
                        {formatMoney(doc.totalAmount)} บาท
                      </dd>
                      <dt>วันที่สร้าง</dt>
                      <dd className="text-foreground text-right tabular-nums">
                        {formatDocDate(doc.generatedAt)}
                      </dd>
                      {doc.billingCycle && (
                        <>
                          <dt>แผนชำระ</dt>
                          <dd className="text-foreground truncate text-right">
                            งวดที่ {doc.billingCycle.cycleNumber} ·{' '}
                            {doc.billingCycle.plan.description}
                          </dd>
                        </>
                      )}
                    </dl>
                    {renderActions(doc, true)}
                  </li>
                )
              })}
            </ul>

            <nav
              aria-label="แบ่งหน้า"
              className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-1"
            >
              <span className="text-text-secondary text-xs tabular-nums">
                แสดง {(start + 1).toLocaleString('th-TH')}–
                {Math.min(start + PAGE_SIZE, filtered.length).toLocaleString('th-TH')} จาก{' '}
                {filtered.length.toLocaleString('th-TH')} เอกสาร
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="หน้าก่อน"
                  className="max-md:size-11"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <span className="text-text-secondary min-w-14 text-center text-xs tabular-nums">
                  {currentPage} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="หน้าถัดไป"
                  className="max-md:size-11"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </nav>
          </>
        )}
      </section>

      {editingDoc && editingDoc.customer && (
        <EditDocumentDialog
          document={editingDoc}
          customerId={editingDoc.customer.userId}
          cycleAmount={editingDoc.billingCycle?.amount ?? null}
          open={!!editingDoc}
          onOpenChange={(open) => {
            if (!open) setEditingDoc(null)
          }}
        />
      )}

      <ConfirmAlert
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`ลบเอกสาร ${deleteTarget?.docNumber ?? ''}?`}
        message={deleteTarget ? `ของ ${deleteTarget.customerName}` : ''}
        confirmLabel="ลบเอกสาร"
        consequences={[
          { tone: 'danger', text: 'ลบถาวร — ไฟล์ PDF ถูกลบและกู้คืนไม่ได้' },
          { tone: 'danger', text: 'หากผูกกับงวดชำระ งวดนั้นจะไม่มีเอกสารนี้แนบอยู่อีก' },
          { tone: 'safe', text: 'แผนชำระและงวดอื่น ๆ ของลูกค้าไม่ได้รับผลกระทบ' },
        ]}
      />
    </div>
  )
}
