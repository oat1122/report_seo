'use client'

import { useState } from 'react'
import { Download, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useListDocuments, useDeleteDocument } from '../../hooks/useDocuments'
import { EditDocumentDialog } from './EditDocumentDialog'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument } from '../../../domain/BillingDocument'

interface Props {
  customerId: string
}

export function DocumentList({ customerId }: Props) {
  const { data: documents = [], isLoading } = useListDocuments(customerId)
  const deleteMutation = useDeleteDocument(customerId)
  const [editingDoc, setEditingDoc] = useState<BillingDocument | null>(null)

  const handleDelete = (documentId: string, docNumber: string) => {
    if (!confirm(`ต้องการลบเอกสาร ${docNumber} ใช่หรือไม่?`)) return
    deleteMutation.mutate(documentId, {
      onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>เอกสารที่สร้างแล้ว</CardTitle>
        <CardDescription>รายการเอกสาร PDF ทั้งหมดของลูกค้ารายนี้</CardDescription>
      </CardHeader>
      <CardContent>
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
    </Card>
  )
}
