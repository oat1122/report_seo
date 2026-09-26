'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { CustomerSearchCombobox } from './CustomerSearchCombobox'
import { CustomerInfoFields } from './CustomerInfoFields'
import { CustomerSyncDialog } from './CustomerSyncDialog'
import { SegmentedRadio } from './SegmentedRadio'
import { DocumentSummaryAside } from './DocumentSummaryAside'
import {
  emptyCustomerInfo,
  customerInfoFromSnapshot,
  toCustomerInfoInput,
  hasCustomerInfoDiff,
  type CustomerInfoValue,
  type DbCustomerSnapshot,
} from './customer-info'
import { DocumentItemsEditor, createItemKey, type EditableItem } from './DocumentItemsEditor'
import { useGenerateStandaloneDocument } from '../../hooks/useStandaloneDocument'
import { useUpdateCustomerInfo } from '../../hooks/useUpdateCustomerInfo'
import { DOCUMENT_TYPE_LABELS } from '../../../domain/DocumentType'
import type { BillingDocumentType } from '../../../domain/DocumentType'
import { computeVatBreakdown } from '../../../domain/vat'
import { formatMoney } from './document-display'
import type { CustomerForDocument } from '../../../application/ports/BillingDocumentRepository'

type Mode = 'manual' | 'autofill'

export interface LockedCustomer {
  id: string
  name: string
  address: string | null
  taxId: string | null
  contactName: string | null
  phone: string | null
  email: string | null
}

interface Props {
  lockedCustomer?: LockedCustomer
  onSuccess?: () => void
  /** แสดงปุ่ม "ยกเลิก" ในแถบล่าง (เช่น เมื่ออยู่ใน dialog) */
  onCancel?: () => void
}

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'manual', label: 'กรอกเอง' },
  { value: 'autofill', label: 'เลือกจากระบบ' },
]

const TYPE_OPTIONS = (Object.entries(DOCUMENT_TYPE_LABELS) as [BillingDocumentType, string][]).map(
  ([value, label]) => ({ value, label }),
)

function RequiredMark() {
  return (
    <span aria-hidden className="text-danger-strong">
      *
    </span>
  )
}

export function StandaloneDocumentCreator({ lockedCustomer, onSuccess, onCancel }: Props) {
  const generateMutation = useGenerateStandaloneDocument()
  const updateCustomerMutation = useUpdateCustomerInfo()
  const isLocked = !!lockedCustomer

  const [mode, setMode] = useState<Mode>('manual')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerForDocument | null>(null)
  const [syncPromptOpen, setSyncPromptOpen] = useState(false)

  const [customer, setCustomer] = useState<CustomerInfoValue>(
    lockedCustomer ? customerInfoFromSnapshot(lockedCustomer) : emptyCustomerInfo,
  )

  const [type, setType] = useState<BillingDocumentType>('INVOICE')
  const [includeVat, setIncludeVat] = useState(false)
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paidDate, setPaidDate] = useState('')

  const [items, setItems] = useState<EditableItem[]>([
    {
      key: createItemKey(),
      description: 'ค่าบริการ',
      detail: '',
      quantity: 1,
      unit: 'รายการ',
      unitPrice: 0,
    },
  ])

  const patchCustomer = (patch: Partial<CustomerInfoValue>) =>
    setCustomer((prev) => ({ ...prev, ...patch }))

  const handleCustomerSelect = (selected: CustomerForDocument | null) => {
    setSelectedCustomer(selected)
    if (selected) setCustomer(customerInfoFromSnapshot(selected))
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode)
    if (newMode === 'manual') setSelectedCustomer(null)
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const withVat = type === 'INVOICE' && includeVat
  const displayTotal = withVat ? computeVatBreakdown(total).grandTotal : total

  const isValid =
    customer.name.trim().length > 0 && items.length > 0 && items.every((i) => i.description.trim())

  // ลูกค้าที่มาจาก DB (import หรือ locked) — ใช้เทียบว่าข้อมูลในฟอร์มต่างจากในระบบไหม
  const dbCustomer: DbCustomerSnapshot | null = lockedCustomer ?? selectedCustomer
  const customerId = dbCustomer?.id ?? null
  const accountEmail = lockedCustomer?.email ?? selectedCustomer?.email ?? null
  const hasCustomerDiff = !!dbCustomer && hasCustomerInfoDiff(customer, dbCustomer)

  const runGenerate = () => {
    generateMutation.mutate(
      {
        customerId,
        customer: toCustomerInfoInput(customer),
        type,
        includeVat,
        items: items.map((i) => ({
          description: i.description,
          detail: i.detail.trim(),
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
        })),
        note: note.trim() || null,
        dueDate: dueDate || null,
        paidDate: paidDate || null,
      },
      {
        onSuccess: (doc) => {
          toast.success(`สร้าง${DOCUMENT_TYPE_LABELS[type]} ${doc.documentNumber} เรียบร้อย`)
          setNote('')
          onSuccess?.()
        },
      },
    )
  }

  const handleGenerate = () => {
    // ถ้าข้อมูลที่กรอกต่างจากลูกค้าในระบบ → ถามก่อนว่าจะ sync DB ไหม
    if (customerId && hasCustomerDiff) {
      setSyncPromptOpen(true)
      return
    }
    runGenerate()
  }

  const handleUpdateAndGenerate = async () => {
    if (!customerId) return
    try {
      await updateCustomerMutation.mutateAsync({ customerId, info: toCustomerInfoInput(customer) })
      toast.success('อัปเดตข้อมูลลูกค้าในระบบเรียบร้อย')
    } catch {
      // error ถูก toast โดย axios interceptor แล้ว — ยังสร้างเอกสารต่อตามเดิม
    } finally {
      setSyncPromptOpen(false)
      runGenerate()
    }
  }

  const handleGenerateWithoutSync = () => {
    setSyncPromptOpen(false)
    runGenerate()
  }

  const isBusy = generateMutation.isPending || updateCustomerMutation.isPending

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-[26px]">
            {/* Customer Info */}
            <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
              <legend className="mb-3.5 flex flex-col gap-0.5 p-0">
                <span className="text-[15px] font-semibold">ข้อมูลลูกค้า</span>
                <span className="text-text-secondary text-xs">
                  {isLocked
                    ? 'ออกเอกสารให้ลูกค้ารายนี้ — แก้ไขข้อมูลบนเอกสารได้ก่อนสร้าง'
                    : 'กรอกข้อมูลเอง หรือเลือกจากลูกค้าที่มีในระบบ'}
                </span>
              </legend>

              {!isLocked && (
                <div className="flex flex-col gap-1.5">
                  <span id="doc-source-label" className="text-sm font-medium">
                    ที่มาของข้อมูล
                  </span>
                  <SegmentedRadio
                    value={mode}
                    onValueChange={handleModeChange}
                    options={MODE_OPTIONS}
                    labelledBy="doc-source-label"
                    pillId="doc-source-pill"
                    className="grid-cols-2"
                  />
                </div>
              )}

              {!isLocked && mode === 'autofill' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="doc-customer-search">ค้นหาลูกค้า</Label>
                  <CustomerSearchCombobox
                    id="doc-customer-search"
                    selected={selectedCustomer}
                    onSelect={handleCustomerSelect}
                  />
                  <span className="text-text-secondary text-xs">
                    เติมข้อมูลด้านล่างให้อัตโนมัติ แก้ได้ก่อนสร้าง
                  </span>
                </div>
              )}

              {lockedCustomer && (
                <p className="text-text-secondary text-xs">
                  ข้อมูลจากระบบของ{' '}
                  <span className="text-foreground font-medium">{lockedCustomer.name}</span> —
                  แก้ไขได้ก่อนสร้างเอกสาร
                </p>
              )}

              <CustomerInfoFields value={customer} onChange={patchCustomer} email={accountEmail} />
            </fieldset>

            {/* Document Config */}
            <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
              <legend className="mb-3.5 p-0 text-[15px] font-semibold">ตั้งค่าเอกสาร</legend>

              <div className="flex flex-col gap-1.5">
                <span id="doc-type-label" className="text-sm font-medium">
                  ประเภทเอกสาร <RequiredMark />
                </span>
                <SegmentedRadio
                  value={type}
                  onValueChange={setType}
                  options={TYPE_OPTIONS}
                  labelledBy="doc-type-label"
                  pillId="doc-type-pill"
                  className="grid-cols-2 sm:grid-cols-4"
                />
              </div>

              {(type === 'INVOICE' || type === 'BILLING_NOTE' || type === 'RECEIPT') && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(type === 'INVOICE' || type === 'BILLING_NOTE') && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="doc-due-date">กำหนดชำระ</Label>
                      <DatePickerField
                        id="doc-due-date"
                        value={dueDate}
                        onChange={setDueDate}
                        placeholder="เลือกกำหนดชำระ"
                      />
                    </div>
                  )}
                  {type === 'RECEIPT' && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="doc-paid-date">วันที่ชำระ</Label>
                      <DatePickerField
                        id="doc-paid-date"
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
                  <label htmlFor="include-vat" className="flex cursor-pointer flex-col gap-0.5">
                    <span className="text-sm font-medium">รวม VAT 7%</span>
                    <span className="text-text-secondary text-xs">คำนวณภาษีจากยอดรวมรายการ</span>
                  </label>
                  <Switch id="include-vat" checked={includeVat} onCheckedChange={setIncludeVat} />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doc-note">หมายเหตุ (ถ้ามี)</Label>
                <Textarea
                  id="doc-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="เช่น เงื่อนไขการชำระเงิน เลขบัญชี"
                />
              </div>
            </fieldset>

            {/* Line Items */}
            <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
              <legend className="mb-3.5 p-0 text-[15px] font-semibold">รายการในเอกสาร</legend>
              <DocumentItemsEditor items={items} onItemsChange={setItems} showTotal={false} />
            </fieldset>
          </div>

          <DocumentSummaryAside
            subtotal={total}
            withVat={withVat}
            typeLabel={DOCUMENT_TYPE_LABELS[type]}
            customerName={customer.name}
          />
        </div>
      </div>

      <footer className="border-border bg-muted/40 flex flex-col gap-3 border-t px-6 py-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between dark:bg-white/5">
        <span className="text-text-secondary text-xs">
          {isValid ? (
            <>
              <RequiredMark /> จำเป็นต้องกรอก
            </>
          ) : (
            'กรอกชื่อลูกค้าและรายละเอียดของทุกรายการก่อนสร้างเอกสาร'
          )}
        </span>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isBusy}>
              ยกเลิก
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={isBusy || !isValid}>
            {generateMutation.isPending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <FileText aria-hidden />
            )}
            {generateMutation.isPending
              ? 'กำลังสร้าง PDF...'
              : `สร้าง PDF (${DOCUMENT_TYPE_LABELS[type]})`}
            {!generateMutation.isPending && displayTotal > 0 && (
              <span className="tabular-nums">· {formatMoney(displayTotal)} บาท</span>
            )}
          </Button>
        </div>
      </footer>

      <CustomerSyncDialog
        open={syncPromptOpen}
        onOpenChange={setSyncPromptOpen}
        onUpdateAndProceed={handleUpdateAndGenerate}
        onProceedWithoutSync={handleGenerateWithoutSync}
        isPending={updateCustomerMutation.isPending}
        proceedLabel="สร้าง"
      />
    </div>
  )
}
