'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { useUpdateDocument, useCustomerDocumentInfo } from '../../hooks/useDocuments'
import { useUpdateCustomerInfo } from '../../hooks/useUpdateCustomerInfo'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument } from '../../../domain/BillingDocument'
import { DocumentItemsEditor, createItemKey, type EditableItem } from './DocumentItemsEditor'
import { CustomerInfoFields } from './CustomerInfoFields'
import { CustomerSyncDialog } from './CustomerSyncDialog'
import {
  emptyCustomerInfo,
  customerInfoFromSnapshot,
  toCustomerInfoInput,
  hasCustomerInfoDiff,
  type CustomerInfoValue,
} from './customer-info'

interface Props {
  document: BillingDocument
  customerId: string
  cycleAmount?: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatAmount(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

// แปลงค่าวันที่จากเอกสาร (ISO string หรือ Date) เป็น 'YYYY-MM-DD' สำหรับ date picker
function isoDateOnly(value: string | Date | null): string {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function buildInitialItems(doc: BillingDocument): EditableItem[] {
  // เอกสารเก่า (ก่อนมี field items) เก็บแค่ยอดรวม — fallback เป็นรายการเดียว
  if (!doc.items || doc.items.length === 0) {
    return [
      {
        key: createItemKey(),
        description: 'ค่าบริการ',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: Number(doc.totalAmount),
      },
    ]
  }

  return doc.items.map((item) => ({
    key: createItemKey(),
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
  }))
}

export function EditDocumentDialog({
  document: doc,
  customerId,
  cycleAmount,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdateDocument(customerId)
  const updateCustomerMutation = useUpdateCustomerInfo()
  const { data: info, isLoading: infoLoading } = useCustomerDocumentInfo(customerId)

  const [type, setType] = useState<BillingDocumentType>(doc.type)
  const [note, setNote] = useState(doc.note ?? '')
  const [dueDate, setDueDate] = useState(() => isoDateOnly(doc.dueDate))
  const [paidDate, setPaidDate] = useState(() => isoDateOnly(doc.paidDate))
  const [items, setItems] = useState<EditableItem[]>(() => buildInitialItems(doc))
  const [syncPromptOpen, setSyncPromptOpen] = useState(false)

  const [customer, setCustomer] = useState<CustomerInfoValue>(emptyCustomerInfo)
  const [customerLoaded, setCustomerLoaded] = useState(false)

  // prefill ข้อมูลลูกค้าจากระบบเมื่อโหลดเสร็จ (ครั้งแรก)
  useEffect(() => {
    if (info && !customerLoaded) {
      setCustomer(customerInfoFromSnapshot(info))
      setCustomerLoaded(true)
    }
  }, [info, customerLoaded])

  const patchCustomer = (patch: Partial<CustomerInfoValue>) =>
    setCustomer((prev) => ({ ...prev, ...patch }))

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const isValid =
    customerLoaded &&
    customer.name.trim().length > 0 &&
    items.length > 0 &&
    items.every((i) => i.description.trim())

  const hasCustomerDiff = !!info && hasCustomerInfoDiff(customer, info)

  const runSave = () => {
    updateMutation.mutate(
      {
        documentId: doc.id,
        input: {
          type,
          note: note || null,
          dueDate: dueDate || null,
          paidDate: paidDate || null,
          customer: toCustomerInfoInput(customer),
          items: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
          })),
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(`แก้ไขเอกสาร ${updated.documentNumber} เรียบร้อย (PDF สร้างใหม่แล้ว)`)
          onOpenChange(false)
        },
      },
    )
  }

  const handleSave = () => {
    if (info && hasCustomerDiff) {
      setSyncPromptOpen(true)
      return
    }
    runSave()
  }

  const handleUpdateAndSave = async () => {
    if (!info) return
    try {
      await updateCustomerMutation.mutateAsync({
        customerId: info.id,
        info: toCustomerInfoInput(customer),
      })
      toast.success('อัปเดตข้อมูลลูกค้าในระบบเรียบร้อย')
    } catch {
      // error ถูก toast โดย axios interceptor แล้ว — ยังบันทึกเอกสารต่อ
    } finally {
      setSyncPromptOpen(false)
      runSave()
    }
  }

  const handleSaveWithoutSync = () => {
    setSyncPromptOpen(false)
    runSave()
  }

  const isPending = updateMutation.isPending || updateCustomerMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>แก้ไขเอกสาร {doc.documentNumber}</DialogTitle>
          <DialogDescription>แก้ไขรายละเอียดเอกสารแล้วสร้าง PDF ใหม่</DialogDescription>
        </DialogHeader>

        {cycleAmount != null && (
          <div className="border-border bg-muted/50 flex items-center gap-2 rounded-md border px-3 py-2">
            <span className="text-muted-foreground text-sm">ยอดตามแผนชำระ:</span>
            <Badge variant="secondary" className="text-sm">
              {formatAmount(cycleAmount)} บาท
            </Badge>
            {total !== cycleAmount && items.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                ต่างจากแผน {formatAmount(Math.abs(total - cycleAmount))} บาท
              </Badge>
            )}
          </div>
        )}

        {/* ข้อมูลลูกค้า — แก้ไขได้ */}
        <div>
          <p className="text-info mb-2 text-sm font-semibold">ข้อมูลลูกค้า</p>
          {infoLoading || !customerLoaded ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : (
            <FieldGroup>
              <CustomerInfoFields value={customer} onChange={patchCustomer} email={info?.email} />
            </FieldGroup>
          )}
        </div>

        <Separator />

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

          {(type === 'INVOICE' || type === 'BILLING_NOTE') && (
            <Field>
              <Label>กำหนดชำระ</Label>
              <DatePickerField value={dueDate} onChange={setDueDate} placeholder="เลือกกำหนดชำระ" />
            </Field>
          )}

          {type === 'RECEIPT' && (
            <Field>
              <Label>วันที่ชำระ</Label>
              <DatePickerField value={paidDate} onChange={setPaidDate} placeholder="เลือกวันที่ชำระ" />
            </Field>
          )}

          <Field>
            <Label>หมายเหตุ (ถ้ามี)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </Field>
        </FieldGroup>

        <DocumentItemsEditor items={items} onItemsChange={setItems} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !isValid}
            className="bg-info text-info-foreground hover:bg-info/90"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            บันทึกและสร้าง PDF ใหม่
          </Button>
        </DialogFooter>

        <CustomerSyncDialog
          open={syncPromptOpen}
          onOpenChange={setSyncPromptOpen}
          onUpdateAndProceed={handleUpdateAndSave}
          onProceedWithoutSync={handleSaveWithoutSync}
          isPending={updateCustomerMutation.isPending}
          proceedLabel="บันทึก"
        />
      </DialogContent>
    </Dialog>
  )
}
