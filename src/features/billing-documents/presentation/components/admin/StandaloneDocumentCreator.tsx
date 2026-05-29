'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup } from '@/components/ui/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { CustomerSearchCombobox } from './CustomerSearchCombobox'
import { CustomerInfoFields } from './CustomerInfoFields'
import { CustomerSyncDialog } from './CustomerSyncDialog'
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
}

export function StandaloneDocumentCreator({ lockedCustomer, onSuccess }: Props) {
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
        items: items.map((i) => ({
          description: i.description,
          detail: i.detail.trim() || undefined,
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

  return (
    <div className="flex flex-col gap-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลลูกค้า</CardTitle>
          <CardDescription>
            {isLocked
              ? 'ออกเอกสารให้ลูกค้ารายนี้ — แก้ไขข้อมูลบนเอกสารได้ก่อนสร้าง'
              : 'กรอกข้อมูลเอง หรือเลือกจากลูกค้าที่มีในระบบ'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isLocked && (
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="manual" className="flex-1">
                    กรอกเอง
                  </TabsTrigger>
                  <TabsTrigger value="autofill" className="flex-1">
                    เลือกจากระบบ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {!isLocked && mode === 'autofill' && (
              <Field>
                <Label>ค้นหาลูกค้า</Label>
                <CustomerSearchCombobox
                  selected={selectedCustomer}
                  onSelect={handleCustomerSelect}
                />
              </Field>
            )}

            {(selectedCustomer || lockedCustomer) && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{lockedCustomer?.name ?? selectedCustomer?.name}</Badge>
                <span className="text-muted-foreground text-xs">
                  ข้อมูลจากระบบ — แก้ไขได้ก่อนสร้างเอกสาร
                </span>
              </div>
            )}

            <CustomerInfoFields value={customer} onChange={patchCustomer} email={accountEmail} />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Document Config */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าเอกสาร</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>รายการในเอกสาร</CardTitle>
          <CardDescription>เพิ่ม / แก้ไขรายการสินค้าหรือบริการในเอกสาร</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentItemsEditor items={items} onItemsChange={setItems} />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending || updateCustomerMutation.isPending || !isValid}
        size="lg"
        className="bg-info text-info-foreground hover:bg-info/90 w-full"
      >
        {generateMutation.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <FileText className="mr-2 size-4" />
        )}
        สร้าง PDF ({DOCUMENT_TYPE_LABELS[type]})
        {total > 0 && (
          <span className="ml-2">
            · {total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
          </span>
        )}
      </Button>

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
