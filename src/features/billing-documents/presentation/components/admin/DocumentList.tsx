'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Download,
  FileText,
  FileUp,
  Import,
  Loader2,
  Pencil,
  Trash2,
  Unlink,
  Upload,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useListDocuments,
  useDeleteDocument,
  useUploadCustomerDocument,
  useAssignDocumentCycle,
} from '../../hooks/useDocuments'
// ดึงงวดของลูกค้าจาก feature payments (type-only barrel import — ไม่ดึง prisma เข้า client bundle)
import { useListBillingCycles } from '@/features/payments/presentation/hooks/useBillingCycles'
import { EditDocumentDialog } from './EditDocumentDialog'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument } from '../../../domain/BillingDocument'
import { DOCUMENT_TYPE_BADGE, formatDocDate, formatMoney } from './document-display'

// งวด (billing cycle) ที่ผูกเอกสารได้
interface DocumentCycleOption {
  id: string
  cycleNumber: number
  dueDate: string | Date
  amount: number
  planDescription: string
}

interface Props {
  customerId: string
}

function typeLabel(type: string) {
  return DOCUMENT_TYPE_LABELS[type as BillingDocumentType] ?? type
}

export function DocumentList({ customerId }: Props) {
  const { data: documents = [], isLoading } = useListDocuments(customerId)
  const { data: rawCycles } = useListBillingCycles(customerId)
  const deleteMutation = useDeleteDocument(customerId)
  const assignMutation = useAssignDocumentCycle(customerId)

  const cycles = useMemo<DocumentCycleOption[]>(
    () =>
      (rawCycles ?? []).map((cycle) => ({
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        dueDate: cycle.dueDate,
        amount: cycle.amount,
        planDescription: cycle.plan.description,
      })),
    [rawCycles],
  )

  const [editingDoc, setEditingDoc] = useState<BillingDocument | null>(null)
  const [uploadCycle, setUploadCycle] = useState<DocumentCycleOption | null>(null)
  const [importCycle, setImportCycle] = useState<DocumentCycleOption | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; docNumber: string } | null>(null)

  const docsByCycle = useMemo(() => {
    const map = new Map<string, BillingDocument[]>()
    for (const doc of documents) {
      if (!doc.billingCycleId) continue
      const list = map.get(doc.billingCycleId) ?? []
      list.push(doc)
      map.set(doc.billingCycleId, list)
    }
    return map
  }, [documents])

  const unlinkedDocs = useMemo(() => documents.filter((doc) => !doc.billingCycleId), [documents])

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const { id, docNumber } = deleteTarget
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
    })
    setDeleteTarget(null)
  }

  const handleUnlink = (doc: BillingDocument) => {
    assignMutation.mutate(
      { documentId: doc.id, billingCycleId: null },
      { onSuccess: () => toast.success(`ถอดเอกสาร ${doc.documentNumber} ออกจากงวดแล้ว`) },
    )
  }

  const renderRows = (docs: BillingDocument[], inCycle: boolean) => (
    <ul className="flex flex-col gap-2">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="bg-glass-tile flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] px-3 py-2.5"
        >
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-[34px] shrink-0 items-center justify-center rounded-[10px]"
          >
            <FileText className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[13px] font-medium tabular-nums">
                {doc.documentNumber}
              </span>
              <span
                className={cn(
                  'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
                  DOCUMENT_TYPE_BADGE[doc.type as BillingDocumentType] ??
                    'bg-muted text-foreground',
                )}
              >
                {typeLabel(doc.type)}
              </span>
            </span>
            <span className="text-text-secondary text-xs tabular-nums">
              {formatMoney(doc.totalAmount)} บาท · สร้าง {formatDocDate(doc.generatedAt)}
            </span>
          </div>
          <div className="flex shrink-0 gap-1.5 max-sm:w-full max-sm:justify-end">
            <Button
              variant="outline"
              size="icon-sm"
              className="max-sm:size-11"
              aria-label={`ดาวน์โหลด ${doc.documentNumber}`}
              title="ดาวน์โหลด"
              asChild
            >
              <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Download aria-hidden />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="max-sm:size-11"
              aria-label={`แก้ไข ${doc.documentNumber}`}
              title="แก้ไข"
              onClick={() => setEditingDoc(doc)}
            >
              <Pencil aria-hidden />
            </Button>
            {inCycle && (
              <Button
                variant="outline"
                size="icon-sm"
                className="max-sm:size-11"
                onClick={() => handleUnlink(doc)}
                disabled={assignMutation.isPending}
                aria-label={`ถอด ${doc.documentNumber} ออกจากงวด`}
                title="ถอดออกจากงวด"
              >
                <Unlink aria-hidden />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong max-sm:size-11"
              onClick={() => setDeleteTarget({ id: doc.id, docNumber: doc.documentNumber })}
              disabled={deleteMutation.isPending}
              aria-label={`ลบ ${doc.documentNumber}`}
              title="ลบ"
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="กำลังโหลดเอกสาร">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-14 w-full rounded-[12px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {cycles.length === 0 ? (
        <Card>
          <CardContent className="text-text-secondary py-4 text-center text-sm">
            ยังไม่มีงวด — สร้างแผนชำระเงินก่อนจึงจะจัดการเอกสารแต่ละงวดได้
          </CardContent>
        </Card>
      ) : (
        cycles.map((cycle) => {
          const cycleDocs = docsByCycle.get(cycle.id) ?? []
          return (
            <Card key={cycle.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">
                  <Badge variant="info">งวดที่ {cycle.cycleNumber}</Badge>
                  <span className="min-w-0">{cycle.planDescription}</span>
                </CardTitle>
                <CardDescription className="tabular-nums">
                  ครบกำหนด {formatDocDate(cycle.dueDate)} · ยอด {formatMoney(cycle.amount)} บาท ·{' '}
                  {cycleDocs.length > 0 ? `มีเอกสาร ${cycleDocs.length} ฉบับ` : 'ยังไม่มีเอกสาร'}
                </CardDescription>
                <CardAction className="flex gap-2 max-sm:col-span-full max-sm:col-start-1 max-sm:row-start-3 max-sm:mt-2 max-sm:w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImportCycle(cycle)}
                    className="max-sm:h-11 max-sm:flex-1"
                  >
                    <Import aria-hidden />
                    นำเข้าเอกสาร
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setUploadCycle(cycle)}
                    className="max-sm:h-11 max-sm:flex-1"
                  >
                    <Upload aria-hidden />
                    อัปโหลด
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                {cycleDocs.length === 0 ? (
                  <p className="text-text-secondary border-border rounded-[12px] border border-dashed py-4 text-center text-sm">
                    ยังไม่มีเอกสารในงวดนี้ — อัปโหลดไฟล์ หรือนำเข้าเอกสารที่ยังไม่ผูกงวด
                  </p>
                ) : (
                  renderRows(cycleDocs, true)
                )}
              </CardContent>
            </Card>
          )
        })
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-[17px] font-semibold">ยังไม่ผูกงวด</CardTitle>
          <CardDescription>
            เอกสารของลูกค้าที่ยังไม่ได้ผูกกับงวด — ใช้ปุ่ม “นำเข้าเอกสาร”
            ในแต่ละงวดเพื่อผูกเอกสารเหล่านี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unlinkedDocs.length === 0 ? (
            <p className="text-text-secondary py-2 text-center text-sm">
              ไม่มีเอกสารที่ยังไม่ผูกงวด
            </p>
          ) : (
            renderRows(unlinkedDocs, false)
          )}
        </CardContent>
      </Card>

      {editingDoc && (
        <EditDocumentDialog
          document={editingDoc}
          customerId={customerId}
          open={!!editingDoc}
          onOpenChange={(open) => {
            if (!open) setEditingDoc(null)
          }}
        />
      )}

      <UploadDocumentDialog
        customerId={customerId}
        cycle={uploadCycle}
        open={!!uploadCycle}
        onOpenChange={(open) => {
          if (!open) setUploadCycle(null)
        }}
      />

      <ImportDocumentDialog
        customerId={customerId}
        cycle={importCycle}
        unlinkedDocs={unlinkedDocs}
        open={!!importCycle}
        onOpenChange={(open) => {
          if (!open) setImportCycle(null)
        }}
      />

      <ConfirmAlert
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`ลบเอกสาร ${deleteTarget?.docNumber ?? ''}?`}
        message="ตรวจสอบให้แน่ใจก่อนลบ"
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

interface UploadDialogProps {
  customerId: string
  cycle: DocumentCycleOption | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DialogIconHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <DialogHeader className="flex-row items-start gap-3.5">
      <span
        aria-hidden
        className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px] [&_svg]:size-5"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
    </DialogHeader>
  )
}

function UploadDocumentDialog({ customerId, cycle, open, onOpenChange }: UploadDialogProps) {
  const uploadMutation = useUploadCustomerDocument(customerId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<BillingDocumentType>('INVOICE')
  const [fileName, setFileName] = useState('')

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error('กรุณาเลือกไฟล์เอกสาร (.pdf, .doc, .docx) ก่อนอัปโหลด')
      return
    }
    uploadMutation.mutate(
      { file, type, billingCycleId: cycle?.id ?? null },
      {
        onSuccess: (doc) => {
          toast.success(`อัปโหลดเอกสาร ${doc.documentNumber} เรียบร้อย`)
          setFileName('')
          if (fileInputRef.current) fileInputRef.current.value = ''
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogIconHeader
          icon={<FileUp />}
          title="อัปโหลดเอกสารเข้างวด"
          description={
            cycle
              ? `อัปโหลดไฟล์เอกสาร (.pdf, .doc, .docx) เข้างวดที่ ${cycle.cycleNumber}`
              : 'อัปโหลดไฟล์เอกสาร (.pdf, .doc, .docx)'
          }
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="upload-doc-type">ประเภทเอกสาร</Label>
            <Select value={type} onValueChange={(v) => setType(v as BillingDocumentType)}>
              <SelectTrigger id="upload-doc-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DOCUMENT_TYPE_LABELS) as [BillingDocumentType, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="upload-doc-file">ไฟล์เอกสาร</Label>
            <input
              id="upload-doc-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="text-text-secondary file:bg-info-subtle file:text-foreground hover:file:bg-accent/60 border-border block w-full rounded-[12px] border border-dashed bg-white p-2 text-sm file:mr-3 file:h-9 file:rounded-[10px] file:border-0 file:px-3 file:text-[13px] file:font-medium dark:bg-white/5"
            />
            {fileName && <span className="text-text-secondary text-xs">เลือกแล้ว: {fileName}</span>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploadMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending && <Loader2 aria-hidden className="animate-spin" />}
            {uploadMutation.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ImportDialogProps {
  customerId: string
  cycle: DocumentCycleOption | null
  unlinkedDocs: BillingDocument[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ImportDocumentDialog({
  customerId,
  cycle,
  unlinkedDocs,
  open,
  onOpenChange,
}: ImportDialogProps) {
  const assignMutation = useAssignDocumentCycle(customerId)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedDoc = unlinkedDocs.find((doc) => doc.id === selectedId) ?? null
  const amountMismatch =
    !!selectedDoc && !!cycle && Number(selectedDoc.totalAmount) !== Number(cycle.amount)

  const handleImport = () => {
    if (!selectedDoc || !cycle) return
    assignMutation.mutate(
      { documentId: selectedDoc.id, billingCycleId: cycle.id },
      {
        onSuccess: () => {
          toast.success(
            `นำเข้าเอกสาร ${selectedDoc.documentNumber} เข้างวดที่ ${cycle.cycleNumber} แล้ว`,
          )
          setSelectedId(null)
          onOpenChange(false)
        },
      },
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedId(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md" className="max-h-[90dvh] overflow-y-auto">
        <DialogIconHeader
          icon={<Import />}
          title="นำเข้าเอกสารเข้างวด"
          description={
            cycle
              ? `เลือกเอกสารที่ยังไม่ผูกงวด เพื่อผูกเข้างวดที่ ${cycle.cycleNumber} (ยอด ${formatMoney(cycle.amount)} บาท)`
              : 'เลือกเอกสารที่ยังไม่ผูกงวด'
          }
        />

        {unlinkedDocs.length === 0 ? (
          <p className="text-text-secondary border-border rounded-[12px] border border-dashed py-6 text-center text-sm">
            ไม่มีเอกสารที่ยังไม่ผูกงวดให้เลือก — อัปโหลดไฟล์ใหม่เข้างวดนี้แทนได้
          </p>
        ) : (
          <div role="radiogroup" aria-label="เอกสารที่ยังไม่ผูกงวด" className="flex flex-col gap-2">
            {unlinkedDocs.map((doc) => {
              const selected = doc.id === selectedId
              return (
                <button
                  key={doc.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedId(doc.id)}
                  className={cn(
                    'focus-visible:ring-ring/70 flex min-h-14 items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition-colors outline-none focus-visible:ring-[3px]',
                    selected
                      ? 'border-info-strong bg-info-subtle inset-ring-info-strong inset-ring-1'
                      : 'border-border bg-white hover:border-slate-300 dark:bg-white/5',
                  )}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium tabular-nums">{doc.documentNumber}</span>
                    <span className="text-text-secondary text-xs">{typeLabel(doc.type)}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatMoney(doc.totalAmount)} บาท
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {amountMismatch && selectedDoc && cycle && (
          <div
            role="status"
            className="bg-warning-subtle text-warning-text flex items-start gap-2 rounded-[12px] p-3 text-sm"
          >
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              ยอดเอกสาร {formatMoney(selectedDoc.totalAmount)} บาท ไม่ตรงกับยอดงวด{' '}
              {formatMoney(cycle.amount)} บาท — ตรวจสอบก่อนยืนยัน หากแน่ใจสามารถผูกต่อได้
            </span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={assignMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleImport} disabled={!selectedDoc || assignMutation.isPending}>
            {assignMutation.isPending && <Loader2 aria-hidden className="animate-spin" />}
            ยืนยันผูกงวด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
