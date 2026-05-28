'use client'

import { useState, useDeferredValue } from 'react'
import { Download, Loader2, Pencil, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { useAllDocuments, useDeleteDocumentAdmin } from '../../hooks/useAllDocuments'
import { EditDocumentDialog } from './EditDocumentDialog'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { AdminBillingDocument } from '../../../domain/BillingDocument'
import type { ListAllDocumentsQuery } from '../../../schemas'

const ALL_TYPES_KEY = '__all__'

function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export function AllDocumentsTable() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES_KEY)
  const deferredSearch = useDeferredValue(search)
  const [editingDoc, setEditingDoc] = useState<AdminBillingDocument | null>(null)

  const filters: ListAllDocumentsQuery = {
    ...(deferredSearch ? { search: deferredSearch } : {}),
    ...(typeFilter !== ALL_TYPES_KEY ? { type: typeFilter as BillingDocumentType } : {}),
  }

  const { data: documents = [], isLoading } = useAllDocuments(filters)
  const deleteMutation = useDeleteDocumentAdmin()

  const handleDelete = (userId: string, documentId: string, docNumber: string) => {
    if (!confirm(`ต้องการลบเอกสาร ${docNumber} ใช่หรือไม่?`)) return
    deleteMutation.mutate(
      { userId, documentId },
      {
        onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            placeholder="ค้นหาเลขที่เอกสาร หรือชื่อลูกค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="ทุกประเภท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES_KEY}>ทุกประเภท</SelectItem>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่เอกสาร</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>แผนชำระ</TableHead>
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
                  <div>
                    <div className="font-medium">
                      {doc.customer?.name ?? doc.customerName ?? 'ลูกค้าภายนอก'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {doc.customer?.domain ?? '—'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {doc.billingCycle ? (
                    <div className="space-y-0.5">
                      <div className="text-sm">{doc.billingCycle.plan.description}</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          งวดที่ {doc.billingCycle.cycleNumber}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatAmount(doc.billingCycle.amount)} บาท
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {DOCUMENT_TYPE_LABELS[doc.type as BillingDocumentType] ?? doc.type}
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(Number(doc.totalAmount))} บาท
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
                    {doc.customer && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingDoc(doc)}>
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        handleDelete(doc.customer?.userId ?? '', doc.id, doc.documentNumber)
                      }
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
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  ไม่พบเอกสาร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

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
    </div>
  )
}
