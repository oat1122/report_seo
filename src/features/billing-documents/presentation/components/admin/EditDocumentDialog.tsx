'use client'

import { useEffect, useState } from 'react'
import { CircleAlert, CircleCheck, FilePen, Loader2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { useUpdateDocument, useCustomerDocumentInfo } from '../../hooks/useDocuments'
import { useUpdateCustomerInfo } from '../../hooks/useUpdateCustomerInfo'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import type { BillingDocument } from '../../../domain/BillingDocument'
import { DocumentItemsEditor, createItemKey, type EditableItem } from './DocumentItemsEditor'
import { CustomerInfoFields } from './CustomerInfoFields'
import { CustomerSyncDialog } from './CustomerSyncDialog'
import { SegmentedRadio } from './SegmentedRadio'
import { DocumentSummaryAside } from './DocumentSummaryAside'
import { formatMoney } from './document-display'
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

const TYPE_OPTIONS = (Object.entries(DOCUMENT_TYPE_LABELS) as [BillingDocumentType, string][]).map(
  ([value, label]) => ({ value, label }),
)

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
        detail: '',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: Number(doc.totalAmount),
      },
    ]
  }

  return doc.items.map((item) => ({
    key: createItemKey(),
    description: item.description,
    detail: item.detail ?? '',
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
  const [includeVat, setIncludeVat] = useState(doc.includeVat)
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
          includeVat,
          note: note || null,
          dueDate: dueDate || null,
          paidDate: paidDate || null,
          customer: toCustomerInfoInput(customer),
          items: items.map((i) => ({
            description: i.description,
            detail: i.detail.trim(),
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
  const matchesCycle = cycleAmount != null && total === cycleAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        size="xl"
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 max-sm:pb-0"
      >
        <header className="flex items-start gap-3.5 px-6 pt-[22px] pb-[18px]">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <FilePen className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle className="text-xl leading-snug font-semibold">
              แก้ไขเอกสาร <span className="tabular-nums">{doc.documentNumber}</span>
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              แก้ไขรายละเอียดเอกสารแล้วสร้าง PDF ใหม่แทนไฟล์เดิม
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="ปิด"
              className="shrink-0"
              disabled={isPending}
            >
              <X aria-hidden />
            </Button>
          </DialogClose>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6">
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-w-0 flex-col gap-[26px]">
              {/* ข้อมูลลูกค้า — แก้ไขได้ */}
              <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
                <legend className="mb-3.5 p-0 text-[15px] font-semibold">ข้อมูลลูกค้า</legend>
                {infoLoading || !customerLoaded ? (
                  <div className="flex items-center justify-center py-6" role="status">
                    <Loader2 aria-hidden className="text-text-secondary size-4 animate-spin" />
                    <span className="sr-only">กำลังโหลดข้อมูลลูกค้า</span>
                  </div>
                ) : (
                  <CustomerInfoFields
                    value={customer}
                    onChange={patchCustomer}
                    email={info?.email}
                  />
                )}
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
                <legend className="mb-3.5 p-0 text-[15px] font-semibold">ตั้งค่าเอกสาร</legend>

                <div className="flex flex-col gap-1.5">
                  <span id="edit-doc-type-label" className="text-sm font-medium">
                    ประเภทเอกสาร
                  </span>
                  <SegmentedRadio
                    value={type}
                    onValueChange={setType}
                    options={TYPE_OPTIONS}
                    labelledBy="edit-doc-type-label"
                    pillId="edit-doc-type-pill"
                    className="grid-cols-2 sm:grid-cols-4"
                  />
                </div>

                {(type === 'INVOICE' || type === 'BILLING_NOTE' || type === 'RECEIPT') && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(type === 'INVOICE' || type === 'BILLING_NOTE') && (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-doc-due-date">กำหนดชำระ</Label>
                        <DatePickerField
                          id="edit-doc-due-date"
                          value={dueDate}
                          onChange={setDueDate}
                          placeholder="เลือกกำหนดชำระ"
                        />
                      </div>
                    )}
                    {type === 'RECEIPT' && (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-doc-paid-date">วันที่ชำระ</Label>
                        <DatePickerField
                          id="edit-doc-paid-date"
                          value={paidDate}
                          onChange={setPaidDate}
                          placeholder="เลือกวันที่ชำระ"
                        />
                      </div>
                    )}
                  </div>
                )}

                {type === 'INVOICE' && (
                  <div className="border-border flex min-h-14 items-center justify-between gap-4 rounded-[14px] border bg-white px-3.5 py-2.5 dark:bg-white/5">
                    <label
                      htmlFor="edit-include-vat"
                      className="flex cursor-pointer flex-col gap-0.5"
                    >
                      <span className="text-sm font-medium">รวม VAT 7%</span>
                      <span className="text-text-secondary text-xs">คำนวณภาษีจากยอดรวมรายการ</span>
                    </label>
                    <Switch
                      id="edit-include-vat"
                      checked={includeVat}
                      onCheckedChange={setIncludeVat}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-doc-note">หมายเหตุ (ถ้ามี)</Label>
                  <Textarea
                    id="edit-doc-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="เช่น เงื่อนไขการชำระเงิน เลขบัญชี"
                  />
                </div>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
                <legend className="mb-3.5 p-0 text-[15px] font-semibold">รายการในเอกสาร</legend>
                <DocumentItemsEditor items={items} onItemsChange={setItems} showTotal={false} />
              </fieldset>
            </div>

            <DocumentSummaryAside
              subtotal={total}
              withVat={type === 'INVOICE' && includeVat}
              typeLabel={DOCUMENT_TYPE_LABELS[type]}
              customerName={customer.name}
            >
              {cycleAmount != null && items.length > 0 && (
                <p
                  className={
                    matchesCycle
                      ? 'bg-secondary/15 flex items-start gap-2 rounded-[12px] px-3 py-2.5 text-[13px]'
                      : 'bg-danger-subtle text-danger-strong flex items-start gap-2 rounded-[12px] px-3 py-2.5 text-[13px]'
                  }
                >
                  {matchesCycle ? (
                    <CircleCheck aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
                  ) : (
                    <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>
                    {matchesCycle
                      ? `ตรงกับยอดตามแผน (${formatMoney(cycleAmount)} บาท)`
                      : `ต่างจากยอดตามแผน ${formatMoney(Math.abs(total - cycleAmount))} บาท (แผน ${formatMoney(cycleAmount)} บาท)`}
                  </span>
                </p>
              )}
            </DocumentSummaryAside>
          </div>
        </div>

        <footer className="border-border bg-muted/40 flex flex-col gap-3 border-t px-6 py-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
          <span className="text-text-secondary text-xs">
            {isValid || !customerLoaded
              ? 'บันทึกแล้วระบบจะสร้าง PDF ใหม่แทนไฟล์เดิม'
              : 'กรอกชื่อลูกค้าและรายละเอียดของทุกรายการก่อนบันทึก'}
          </span>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isPending || !isValid}>
              {isPending && <Loader2 aria-hidden className="animate-spin" />}
              {isPending ? 'กำลังบันทึก...' : 'บันทึกและสร้าง PDF ใหม่'}
            </Button>
          </div>
        </footer>

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
