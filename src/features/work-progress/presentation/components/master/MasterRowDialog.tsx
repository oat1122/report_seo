'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { CircleDot, Stamp, Tags, type LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ColorPickerInput } from './ColorPickerInput'
import {
  upsertCategorySchema,
  upsertStatusSchema,
  upsertMarkTypeSchema,
  type MasterKindCode,
} from '@/features/work-progress/schemas'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'
import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
} from '@/features/work-progress/domain/WorkProgressMaster'

type MasterRow = WorkProgressCategory | WorkProgressStatus | WorkProgressMarkType

type FormState = {
  code: string
  name: string
  description: string
  color: string | null
  icon: string
  orderIndex: number
  isActive: boolean
  isTerminal: boolean
  isDefault: boolean
}

const empty: FormState = {
  code: '',
  name: '',
  description: '',
  color: null,
  icon: '',
  orderIndex: 0,
  isActive: true,
  isTerminal: false,
  isDefault: false,
}

interface MasterRowDialogProps {
  kind: MasterKindCode
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: MasterRow | null
  onSubmit: (body: Record<string, unknown>) => Promise<void> | void
  submitting?: boolean
}

const titleLabel: Record<MasterKindCode, string> = {
  category: 'หมวด (Category)',
  status: 'สถานะ (Status)',
  markType: 'สัญลักษณ์ (Mark Type)',
}

const kindIcon: Record<MasterKindCode, LucideIcon> = {
  category: Tags,
  status: CircleDot,
  markType: Stamp,
}

const kindDescription: Record<MasterKindCode, string> = {
  category: 'ใช้จัดกลุ่มกิจกรรมในแผนงานของลูกค้าทุกคน · code ใช้อ้างอิงในระบบ · ชื่อใช้แสดงผล',
  status: 'ใช้กับ item ในแผนงานของลูกค้าทุกคน · code ใช้อ้างอิงในระบบ · ชื่อใช้แสดงผล',
  markType: 'ใช้ทำเครื่องหมายรายเดือนในตารางแผนงาน · code ใช้อ้างอิงในระบบ · ชื่อใช้แสดงผล',
}

// มือถือ = bottom sheet (Handoff rule 11) · desktop = modal กลางจอ
const SHEET_CLASS =
  'max-h-[92dvh] overflow-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none'

const HEX_OK = /^#[0-9A-Fa-f]{6}$/

const Required = () => (
  <span className="text-danger-strong" aria-hidden>
    *
  </span>
)

export function MasterRowDialog({
  kind,
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: MasterRowDialogProps) {
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setSubmitError(null)
    if (!initial) {
      setForm(empty)
      return
    }
    setForm({
      code: initial.code,
      name: initial.name,
      description: 'description' in initial ? (initial.description ?? '') : '',
      color: initial.color ?? null,
      icon: 'icon' in initial ? (initial.icon ?? '') : '',
      orderIndex: initial.orderIndex,
      isActive: initial.isActive,
      isTerminal: 'isTerminal' in initial ? initial.isTerminal : false,
      isDefault: 'isDefault' in initial ? initial.isDefault : false,
    })
  }, [open, initial])

  const isEdit = Boolean(initial)
  const Icon = kindIcon[kind]

  const handleSubmit = async () => {
    const body: Record<string, unknown> = {
      code: form.code,
      name: form.name,
      color: form.color ?? null,
      orderIndex: form.orderIndex,
      isActive: form.isActive,
    }
    if (kind === 'category') {
      body.description = form.description || null
      body.icon = form.icon || null
    }
    if (kind === 'markType') {
      body.icon = form.icon || null
    }
    if (kind === 'status') {
      body.isTerminal = form.isTerminal
      body.isDefault = form.isDefault
    }

    const schema =
      kind === 'category'
        ? upsertCategorySchema
        : kind === 'status'
          ? upsertStatusSchema
          : upsertMarkTypeSchema

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      setErrors(parseFieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(null)
    try {
      await onSubmit(parsed.data)
    } catch {
      setSubmitError(
        'บันทึกไม่สำเร็จ — ดูสาเหตุในข้อความแจ้งเตือน (เช่น code ซ้ำกับรายการเดิม) แก้ไขแล้วกดบันทึกอีกครั้ง',
      )
    }
  }

  const describe = (field: string, hintId?: string) =>
    errors[field] ? `mrd-${field}-error` : hintId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className={SHEET_CLASS}>
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>
              {isEdit ? 'แก้ไข' : 'เพิ่ม'}
              {titleLabel[kind]}
            </DialogTitle>
            <DialogDescription>{kindDescription[kind]}</DialogDescription>
          </div>
        </DialogHeader>

        <form
          id="mrd-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="flex flex-col gap-6"
        >
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="mrd-code" data-required>
                Code
              </Label>
              <Input
                id="mrd-code"
                value={form.code}
                onChange={(e) => {
                  setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))
                  setErrors((prev) => ({ ...prev, code: '' }))
                }}
                placeholder="เช่น KEYWORD_INTENT"
                maxLength={50}
                className="font-mono tracking-[0.02em]"
                autoFocus={!isEdit}
                aria-required
                aria-invalid={Boolean(errors.code)}
                aria-describedby={describe('code', 'mrd-code-hint')}
              />
              {errors.code ? (
                <div id="mrd-code-error">
                  <FieldError error={errors.code} />
                </div>
              ) : (
                <p id="mrd-code-hint" className="text-text-secondary text-xs">
                  ตัวพิมพ์ใหญ่และ _ (UPPER_SNAKE_CASE) ใช้อ้างอิงในระบบ
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="mrd-name" data-required>
                ชื่อ
              </Label>
              <Input
                id="mrd-name"
                value={form.name}
                onChange={(e) => {
                  setForm((s) => ({ ...s, name: e.target.value }))
                  setErrors((prev) => ({ ...prev, name: '' }))
                }}
                maxLength={100}
                aria-required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describe('name')}
              />
              <div id="mrd-name-error">
                <FieldError error={errors.name} />
              </div>
            </div>
          </div>

          {kind === 'category' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mrd-desc">รายละเอียด</Label>
              <Textarea
                id="mrd-desc"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                rows={2}
                maxLength={2000}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={describe('description')}
              />
              <div id="mrd-description-error">
                <FieldError error={errors.description} />
              </div>
            </div>
          )}

          <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span id="mrd-color-label" className="text-[13px] font-medium">
                สี
              </span>
              <ColorPickerInput
                labelId="mrd-color-label"
                value={form.color}
                invalid={Boolean(errors.color)}
                describedBy={describe('color')}
                onChange={(v) => {
                  setForm((s) => ({ ...s, color: v }))
                  setErrors((prev) => ({ ...prev, color: '' }))
                }}
              />
              <div id="mrd-color-error">
                <FieldError error={errors.color} />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="mrd-order">ลำดับ</Label>
              <Input
                id="mrd-order"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.orderIndex}
                onChange={(e) => {
                  setForm((s) => ({
                    ...s,
                    orderIndex: Number(e.target.value) || 0,
                  }))
                  setErrors((prev) => ({ ...prev, orderIndex: '' }))
                }}
                className="tabular-nums"
                aria-invalid={Boolean(errors.orderIndex)}
                aria-describedby={describe('orderIndex')}
              />
              <div id="mrd-orderIndex-error">
                <FieldError error={errors.orderIndex} />
              </div>
            </div>
          </div>

          {(kind === 'category' || kind === 'markType') && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mrd-icon">Icon (lucide-react name)</Label>
              <Input
                id="mrd-icon"
                value={form.icon}
                onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))}
                placeholder="เช่น Target, Layers"
                maxLength={50}
                aria-invalid={Boolean(errors.icon)}
                aria-describedby={describe('icon')}
              />
              <div id="mrd-icon-error">
                <FieldError error={errors.icon} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {kind === 'status' && (
              <>
                <SwitchTile
                  id="mrd-terminal"
                  label="สถานะปลาย (Terminal)"
                  hint="item ที่อยู่สถานะนี้ถือว่าจบงาน ไม่ดำเนินต่อ เช่น COMPLETED, CANCELLED"
                  checked={form.isTerminal}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, isTerminal: v }))}
                />
                <SwitchTile
                  id="mrd-default"
                  label="เป็นค่าเริ่มต้น"
                  hint="item ใหม่จะได้สถานะนี้อัตโนมัติ — ระบบจัดให้มีได้ 1 สถานะ"
                  checked={form.isDefault}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, isDefault: v }))}
                />
              </>
            )}
            <SwitchTile
              id="mrd-active"
              label="เปิดใช้งาน"
              hint="ปิดเพื่อซ่อนจากตัวเลือก โดยไม่กระทบ item เดิม"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: v }))}
            />
          </div>

          <div className="bg-muted/60 flex flex-wrap items-center gap-3 rounded-[14px] px-3.5 py-3">
            <span className="text-text-secondary text-xs">ตัวอย่างในตาราง</span>
            <span
              className="border-border text-foreground inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={
                form.color && HEX_OK.test(form.color)
                  ? { backgroundColor: `color-mix(in srgb, ${form.color} 18%, transparent)` }
                  : undefined
              }
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    form.color && HEX_OK.test(form.color) ? form.color : 'var(--muted-foreground)',
                }}
              />
              <span className="truncate">{form.name.trim() || 'ชื่อ' + titleLabel[kind]}</span>
            </span>
          </div>

          {submitError && (
            <p
              role="alert"
              className="bg-danger-subtle text-danger-strong rounded-xl px-3.5 py-2.5 text-[13px]"
            >
              {submitError}
            </p>
          )}
        </form>

        <DialogFooter className="sticky bottom-0 z-[1] max-sm:pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <span className="text-text-secondary hidden text-xs sm:mr-auto sm:inline">
            <Required /> จำเป็นต้องกรอก
          </span>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" form="mrd-form" disabled={submitting}>
            {submitting ? 'กำลังบันทึก…' : 'บันทึก'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SwitchTileProps {
  id: string
  label: string
  hint: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function SwitchTile({ id, label, hint, checked, onCheckedChange }: SwitchTileProps) {
  return (
    <label
      htmlFor={id}
      className="border-border flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[14px] border bg-white/85 px-3.5 py-2.5 dark:bg-white/5"
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-text-secondary text-xs">{hint}</span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  )
}
