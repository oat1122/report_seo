'use client'

import { useRef, useState } from 'react'
import { Download, FilePlus, Loader2, Pencil, Trash2, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
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
  useCustomerDocumentInfo,
} from '../../hooks/useDocuments'
import { EditDocumentDialog } from './EditDocumentDialog'
import { StandaloneDocumentCreator } from './StandaloneDocumentCreator'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument } from '../../../domain/BillingDocument'

interface Props {
  customerId: string
}

function documentsQueryKey(customerId: string) {
  return ['customer', customerId, 'billing-documents'] as const
}

export function DocumentList({ customerId }: Props) {
  const { data: documents = [], isLoading } = useListDocuments(customerId)
  const deleteMutation = useDeleteDocument(customerId)
  const [editingDoc, setEditingDoc] = useState<BillingDocument | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const handleDelete = (documentId: string, docNumber: string) => {
    if (!confirm(`ต้องการลบเอกสาร ${docNumber} ใช่หรือไม่?`)) return
    deleteMutation.mutate(documentId, {
      onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>เอกสารของลูกค้า</CardTitle>
          <CardDescription>อัปโหลดไฟล์เอกสาร หรือสร้างเอกสาร PDF ใหม่ให้ลูกค้ารายนี้</CardDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-1 size-4" />
            อัปโหลดเอกสาร
          </Button>
          <Button
            size="sm"
            className="bg-info text-info-foreground hover:bg-info/90"
            onClick={() => setCreateOpen(true)}
          >
            <FilePlus className="mr-1 size-4" />
            สร้างเอกสารใหม่
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่เอกสาร</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                  <TableCell>
                    {DOCUMENT_TYPE_LABELS[doc.type as BillingDocumentType] ?? doc.type}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(doc.totalAmount).toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    บาท
                  </TableCell>
                  <TableCell>
                    {new Date(doc.generatedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                          <Download className="size-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingDoc(doc)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(doc.id, doc.documentNumber)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    ยังไม่มีเอกสาร
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

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
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <CreateDocumentDialog
        customerId={customerId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </Card>
  )
}

interface DialogProps {
  customerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UploadDocumentDialog({ customerId, open, onOpenChange }: DialogProps) {
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
      { file, type },
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
          <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
          <DialogDescription>
            อัปโหลดไฟล์เอกสารจากเครื่อง (.pdf, .doc, .docx) ให้ลูกค้ารายนี้
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

function CreateDocumentDialog({ customerId, open, onOpenChange }: DialogProps) {
  const qc = useQueryClient()
  const { data: info, isLoading } = useCustomerDocumentInfo(customerId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>สร้างเอกสารใหม่</DialogTitle>
          <DialogDescription>สร้างเอกสาร PDF ให้ลูกค้ารายนี้</DialogDescription>
        </DialogHeader>

        {isLoading || !info ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <StandaloneDocumentCreator
            lockedCustomer={{
              id: info.id,
              name: info.name,
              address: info.address,
              taxId: info.taxId,
              contactName: info.contactName,
            }}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: documentsQueryKey(customerId) })
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
