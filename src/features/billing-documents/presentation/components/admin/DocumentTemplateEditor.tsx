'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
  useDocumentTemplate,
  useUpsertDocumentTemplateItems,
} from '../../hooks/useDocumentTemplates'
import type { DocumentTemplate, DocumentTemplateScope } from '../../../domain/DocumentTemplate'
import type { DocumentTemplateItemInput } from '../../../schemas'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTemplate?: DocumentTemplate | null
}

interface LocalItem extends DocumentTemplateItemInput {
  localKey: string
}

let keyCounter = 0
function nextKey() {
  return `tpl-${++keyCounter}`
}

export function DocumentTemplateEditor({ open, onOpenChange, editTemplate }: Props) {
  const isEdit = !!editTemplate

  const [name, setName] = useState('')
  const [scope, setScope] = useState<DocumentTemplateScope>('GENERAL')
  const [localItems, setLocalItems] = useState<LocalItem[]>([])

  const { data: templateDetail } = useDocumentTemplate(isEdit && open ? editTemplate.id : null)

  const createMutation = useCreateDocumentTemplate()
  const updateMutation = useUpdateDocumentTemplate()
  const upsertItemsMutation = useUpsertDocumentTemplateItems(editTemplate?.id ?? '')

  useEffect(() => {
    if (open && editTemplate && templateDetail) {
      setName(editTemplate.name)
      setScope(editTemplate.scope)
      setLocalItems(
        templateDetail.items.map((item, i) => ({
          localKey: item.id,
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          orderIndex: i,
        })),
      )
    } else if (open && !editTemplate) {
      setName('')
      setScope('GENERAL')
      setLocalItems([])
    }
  }, [open, editTemplate, templateDetail])

  const addRow = () => {
    setLocalItems((prev) => [
      ...prev,
      {
        localKey: nextKey(),
        description: '',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 0,
        orderIndex: prev.length,
      },
    ])
  }

  const removeRow = (localKey: string) => {
    setLocalItems((prev) => prev.filter((i) => i.localKey !== localKey))
  }

  const updateField = (localKey: string, field: keyof LocalItem, value: string | number) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.localKey === localKey ? { ...item, [field]: value } : item)),
    )
  }

  const total = localItems.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0)

  const isSaving =
    createMutation.isPending || updateMutation.isPending || upsertItemsMutation.isPending

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('กรุณาระบุชื่อ template')
      return
    }

    const itemsToSave = localItems.map((item, i) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      orderIndex: i,
    }))

    if (isEdit) {
      updateMutation.mutate(
        { templateId: editTemplate.id, data: { name: name.trim(), scope } },
        {
          onSuccess: () => {
            if (itemsToSave.length > 0) {
              upsertItemsMutation.mutate(itemsToSave, {
                onSuccess: () => {
                  toast.success('บันทึก template เรียบร้อย')
                  onOpenChange(false)
                },
              })
            } else {
              toast.success('บันทึก template เรียบร้อย')
              onOpenChange(false)
            }
          },
        },
      )
    } else {
      createMutation.mutate(
        {
          name: name.trim(),
          scope,
          isActive: true,
          items: itemsToSave.length > 0 ? itemsToSave : undefined,
        },
        {
          onSuccess: () => {
            toast.success('สร้าง template เรียบร้อย')
            onOpenChange(false)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อ Template</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น SEO Standard Package"
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as DocumentTemplateScope)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">กลาง (ใช้ได้ทุกลูกค้า)</SelectItem>
                  <SelectItem value="PLAN">เฉพาะแผนชำระ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>รายการสินค้า/บริการ</Label>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="mr-1 size-3.5" />
                เพิ่มรายการ
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="w-20">จำนวน</TableHead>
                  <TableHead className="w-24">หน่วย</TableHead>
                  <TableHead className="w-32">ราคา/หน่วย</TableHead>
                  <TableHead className="w-28 text-right">รวม</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {localItems.map((item, idx) => (
                  <TableRow key={item.localKey}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updateField(item.localKey, 'description', e.target.value)}
                        placeholder="ค่าทำ SEO"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateField(item.localKey, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateField(item.localKey, 'unit', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateField(item.localKey, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRow(item.localKey)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {localItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                      ยังไม่มีรายการ — กด &quot;เพิ่มรายการ&quot; เพื่อเริ่ม
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <p className="text-muted-foreground text-right text-sm">
              รวมทั้งสิ้น:{' '}
              <span className="text-foreground font-semibold">
                {total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? 'บันทึก' : 'สร้าง Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
