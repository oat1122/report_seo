'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Download,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

function formatCurrency(amount: number): string {
  return Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

  const renderRows = (docs: BillingDocument[], inCycle: boolean) =>
    docs.map((doc) => (
      <TableRow key={doc.id}>
        <TableCell className="font-medium">{doc.documentNumber}</TableCell>
        <TableCell>{DOCUMENT_TYPE_LABELS[doc.type as BillingDocumentType] ?? doc.type}</TableCell>
        <TableCell className="text-right">{formatCurrency(doc.totalAmount)} บาท</TableCell>
        <TableCell>{formatDate(doc.generatedAt)}</TableCell>
        <TableCell>
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="size-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditingDoc(doc)}>
              <Pencil className="size-4" />
            </Button>
            {inCycle && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleUnlink(doc)}
                disabled={assignMutation.isPending}
                title="ถอดออกจากงวด"
              >
                <Unlink className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteTarget({ id: doc.id, docNumber: doc.documentNumber })}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {cycles.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center">
            ยังไม่มีงวด — สร้างแผนชำระเงินก่อนจึงจะจัดการเอกสารแต่ละงวดได้
          </CardContent>
        </Card>
      ) : (
        cycles.map((cycle) => {
          const cycleDocs = docsByCycle.get(cycle.id) ?? []
          return (
            <Card key={cycle.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">งวดที่ {cycle.cycleNumber}</Badge>
                    {cycle.planDescription}
                  </CardTitle>
                  <CardDescription>
                    ครบกำหนด {formatDate(cycle.dueDate)} · ยอด {formatCurrency(cycle.amount)} บาท
                  </CardDescription>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setImportCycle(cycle)}>
                    <Import className="mr-1 size-4" />
                    นำเข้าเอกสาร
                  </Button>
                  <Button
                    size="sm"
                    className="bg-info text-info-foreground hover:bg-info/90"
                    onClick={() => setUploadCycle(cycle)}
                  >
                    <Upload className="mr-1 size-4" />
                    อัปโหลด
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cycleDocs.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    ยังไม่มีเอกสารในงวดนี้
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>เลขที่เอกสาร</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead className="text-right">จำนวนเงิน</TableHead>
                        <TableHead>วันที่สร้าง</TableHead>
                        <TableHead className="w-32" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderRows(cycleDocs, true)}</TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        })
      )}

      <Card>
        <CardHeader>
          <CardTitle>ยังไม่ผูกงวด</CardTitle>
          <CardDescription>
            เอกสารของลูกค้าที่ยังไม่ได้ผูกกับงวด — ใช้ปุ่ม “นำเข้าเอกสาร”
            ในแต่ละงวดเพื่อผูกเอกสารเหล่านี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unlinkedDocs.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              ไม่มีเอกสารที่ยังไม่ผูกงวด
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่เอกสาร</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(unlinkedDocs, false)}</TableBody>
            </Table>
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
        title="ยืนยันการลบเอกสาร"
        message={`ต้องการลบเอกสาร ${deleteTarget?.docNumber ?? ''} ใช่หรือไม่?`}
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

function UploadDocumentDialog({ customerId, cycle, open, onOpenChange }: UploadDialogProps) {
  const uploadMutation = useUploadCustomerDocument(customerId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<BillingDocumentType>('INVOICE')
  const [fileName, setFileName] = useState('')

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error('กรุณาเลือกไฟล์')
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>อัปโหลดเอกสารเข้างวด</DialogTitle>
          <DialogDescription>
            {cycle
              ? `อัปโหลดไฟล์เอกสาร (.pdf, .doc, .docx) เข้างวดที่ ${cycle.cycleNumber}`
              : 'อัปโหลดไฟล์เอกสาร (.pdf, .doc, .docx)'}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label>ประเภทเอกสาร</Label>
            <Select value={type} onValueChange={(v) => setType(v as BillingDocumentType)}>
              <SelectTrigger>
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
          </Field>

          <Field>
            <Label>ไฟล์เอกสาร</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="text-muted-foreground file:bg-muted file:text-foreground hover:file:bg-muted/80 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
            />
            {fileName && <span className="text-muted-foreground text-xs">{fileName}</span>}
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploadMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="bg-info text-info-foreground hover:bg-info/90"
          >
            {uploadMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            อัปโหลด
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>นำเข้าเอกสารเข้างวด</DialogTitle>
          <DialogDescription>
            {cycle
              ? `เลือกเอกสารที่ยังไม่ผูกงวด เพื่อผูกเข้างวดที่ ${cycle.cycleNumber} (ยอด ${formatCurrency(cycle.amount)} บาท)`
              : 'เลือกเอกสารที่ยังไม่ผูกงวด'}
          </DialogDescription>
        </DialogHeader>

        {unlinkedDocs.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            ไม่มีเอกสารที่ยังไม่ผูกงวดให้เลือก
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {unlinkedDocs.map((doc) => {
              const selected = doc.id === selectedId
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={
                    selected
                      ? 'border-info bg-info/10 flex items-center justify-between gap-3 rounded-md border p-3 text-left'
                      : 'border-border hover:bg-muted/50 flex items-center justify-between gap-3 rounded-md border p-3 text-left'
                  }
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{doc.documentNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {DOCUMENT_TYPE_LABELS[doc.type as BillingDocumentType] ?? doc.type}
                    </span>
                  </div>
                  <span className="text-sm">{formatCurrency(doc.totalAmount)} บาท</span>
                </button>
              )
            })}
          </div>
        )}

        {amountMismatch && selectedDoc && cycle && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              ยอดเอกสาร {formatCurrency(selectedDoc.totalAmount)} บาท ไม่ตรงกับยอดงวด{' '}
              {formatCurrency(cycle.amount)} บาท — ตรวจสอบก่อนยืนยัน หากแน่ใจสามารถผูกต่อได้
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
          <Button
            onClick={handleImport}
            disabled={!selectedDoc || assignMutation.isPending}
            className="bg-info text-info-foreground hover:bg-info/90"
          >
            {assignMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            ยืนยันผูกงวด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
