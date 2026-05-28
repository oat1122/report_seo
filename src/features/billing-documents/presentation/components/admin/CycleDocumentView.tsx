'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListDocumentsByCycles,
  useDeleteDocument,
  useGenerateAllForCycle,
} from '../../hooks/useDocuments'
import { useBillingCyclesForDocuments } from '../../hooks/useBillingCyclesForDocuments'
import { EditDocumentDialog } from './EditDocumentDialog'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument, BillingDocumentWithCycle } from '../../../domain/BillingDocument'

interface Props {
  customerId: string
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

interface GroupedCycle {
  cycleId: string
  cycleNumber: number
  dueDate: string
  paidDate: string | null
  amount: number
  planDescription: string
  planId: string
  documents: BillingDocumentWithCycle[]
}

function groupByCycle(
  docs: BillingDocumentWithCycle[],
  cycles: Array<{
    id: string
    cycleNumber: number
    dueDate: string
    paidDate: string | null
    amount: number
    plan: { id: string; description: string }
  }>,
): GroupedCycle[] {
  const cycleMap = new Map<string, GroupedCycle>()

  for (const cycle of cycles) {
    cycleMap.set(cycle.id, {
      cycleId: cycle.id,
      cycleNumber: cycle.cycleNumber,
      dueDate: cycle.dueDate,
      paidDate: cycle.paidDate,
      amount: Number(cycle.amount),
      planDescription: cycle.plan.description,
      planId: cycle.plan.id,
      documents: [],
    })
  }

  for (const doc of docs) {
    if (doc.billingCycle) {
      const key = doc.billingCycleId!
      const group = cycleMap.get(key)
      if (group) {
        group.documents.push(doc)
      }
    }
  }

  return Array.from(cycleMap.values()).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )
}

export function CycleDocumentView({ customerId }: Props) {
  const { data: docs = [], isLoading: docsLoading } = useListDocumentsByCycles(customerId)
  const { data: cycles = [], isLoading: cyclesLoading } = useBillingCyclesForDocuments(customerId)
  const deleteMutation = useDeleteDocument(customerId)
  const generateAllMutation = useGenerateAllForCycle(customerId)
  const [editingDoc, setEditingDoc] = useState<BillingDocument | null>(null)
  const [editingCycleAmount, setEditingCycleAmount] = useState<number | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])

  const isLoading = docsLoading || cyclesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  const groups = groupByCycle(docs, cycles)

  const handleDelete = (documentId: string, docNumber: string) => {
    if (!confirm(`ต้องการลบเอกสาร ${docNumber} ใช่หรือไม่?`)) return
    deleteMutation.mutate(documentId, {
      onSuccess: () => toast.success(`ลบเอกสาร ${docNumber} เรียบร้อย`),
    })
  }

  const handleGenerateAll = (cycleId: string) => {
    if (!confirm('ต้องการสร้างเอกสารทั้ง 4 ประเภทสำหรับรอบจ่ายนี้ใช่หรือไม่?')) return
    generateAllMutation.mutate(
      { billingCycleId: cycleId },
      {
        onSuccess: (newDocs) => toast.success(`สร้างเอกสาร ${newDocs.length} ฉบับเรียบร้อย`),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>เอกสารตามรอบจ่ายเงิน</CardTitle>
        <CardDescription>เอกสาร PDF ที่เชื่อมโยงกับแผนชำระเงินของลูกค้ารายนี้</CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            ยังไม่มีรอบจ่ายเงิน — สร้างแผนชำระเงินก่อนในแท็บ &quot;แผนชำระเงิน&quot;
          </p>
        ) : (
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="w-full"
          >
            {groups.map((group) => (
              <AccordionItem
                key={`${group.cycleId}-${group.documents.length}`}
                value={group.cycleId}
              >
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {group.planDescription} — งวดที่ {group.cycleNumber}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      ครบกำหนด {formatDate(group.dueDate)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {formatAmount(group.amount)} บาท
                    </Badge>
                    {group.documents.length > 0 && (
                      <Badge className="text-xs">{group.documents.length} เอกสาร</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {group.documents.length > 0 ? (
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
                          {group.documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                              <TableCell>
                                {DOCUMENT_TYPE_LABELS[doc.type as BillingDocumentType] ?? doc.type}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatAmount(Number(doc.totalAmount))} บาท
                              </TableCell>
                              <TableCell>{formatDate(doc.generatedAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon-sm" asChild>
                                    <a
                                      href={doc.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                    >
                                      <Download className="size-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setEditingDoc(doc)
                                      setEditingCycleAmount(group.amount)
                                    }}
                                  >
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
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground py-4 text-center text-sm">
                        ยังไม่มีเอกสารสำหรับรอบจ่ายนี้
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateAll(group.cycleId)}
                      disabled={generateAllMutation.isPending}
                      className="w-full"
                    >
                      {generateAllMutation.isPending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 size-4" />
                      )}
                      สร้างเอกสารทั้ง 4 ประเภท
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>

      {editingDoc && (
        <EditDocumentDialog
          document={editingDoc}
          customerId={customerId}
          cycleAmount={editingCycleAmount}
          open={!!editingDoc}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDoc(null)
              setEditingCycleAmount(null)
            }
          }}
        />
      )}
    </Card>
  )
}
