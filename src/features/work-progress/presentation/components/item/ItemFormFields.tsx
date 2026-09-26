'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldError, type FieldErrors } from '../FieldError'
import { useCategories, useStatuses } from '../../hooks/useMasterTables'
import type { ItemFormState } from './itemForm'

interface ItemFormFieldsProps {
  form: ItemFormState
  onChange: (patch: Partial<ItemFormState>) => void
  errors: FieldErrors
  onClearError: (key: keyof ItemFormState) => void
  isEdit: boolean
  // กัน id ชนกันเมื่อฟอร์มถูกใช้หลายที่ (dialog / sheet)
  idPrefix: string
}

function Required() {
  return (
    <span className="text-danger-strong" aria-hidden>
      *
    </span>
  )
}

export function ItemFormFields({
  form,
  onChange,
  errors,
  onClearError,
  isEdit,
  idPrefix,
}: ItemFormFieldsProps) {
  const { data: categories } = useCategories()
  const { data: statuses } = useStatuses()
  const activeCategories = (categories ?? []).filter((c) => c.isActive)
  const activeStatuses = (statuses ?? []).filter((s) => s.isActive)
  const id = (name: string) => `${idPrefix}-${name}`
  const errId = (name: string) => (errors[name] ? `${idPrefix}-${name}-err` : undefined)

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <Label htmlFor={id('activity')} className="text-[13px]">
          กิจกรรม <Required />
        </Label>
        <Input
          id={id('activity')}
          value={form.activity}
          onChange={(e) => {
            onChange({ activity: e.target.value })
            onClearError('activity')
          }}
          maxLength={2000}
          aria-required
          aria-invalid={errors.activity ? true : undefined}
          aria-describedby={errId('activity')}
          autoFocus={!isEdit}
        />
        <FieldError error={errors.activity} id={errId('activity')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <Label htmlFor={id('category')} className="text-[13px]">
            หมวด <Required />
          </Label>
          <Select
            value={form.categoryId}
            onValueChange={(v) => {
              onChange({ categoryId: v })
              onClearError('categoryId')
            }}
          >
            <SelectTrigger
              id={id('category')}
              className="w-full"
              aria-required
              aria-invalid={errors.categoryId ? true : undefined}
              aria-describedby={errId('categoryId')}
            >
              <SelectValue placeholder="เลือกหมวด" />
            </SelectTrigger>
            <SelectContent>
              {activeCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span
                    aria-hidden
                    className="bg-muted-foreground inline-block size-2 shrink-0 rounded-[3px]"
                    style={c.color ? { backgroundColor: c.color } : undefined}
                  />
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError error={errors.categoryId} id={errId('categoryId')} />
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor={id('status')} className="text-[13px]">
            สถานะ
          </Label>
          <Select value={form.statusId} onValueChange={(v) => onChange({ statusId: v })}>
            <SelectTrigger id={id('status')} className="w-full">
              <SelectValue placeholder="ใช้ค่าเริ่มต้น" />
            </SelectTrigger>
            <SelectContent>
              {activeStatuses.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  <span
                    aria-hidden
                    className="bg-muted-foreground inline-block size-2 shrink-0 rounded-full"
                    style={st.color ? { backgroundColor: st.color } : undefined}
                  />
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={id('desc')} className="text-[13px]">
          รายละเอียด
        </Label>
        <Textarea
          id={id('desc')}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          maxLength={5000}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="grid content-start gap-1.5">
          <Label htmlFor={id('duration')} className="text-[13px]">
            ระยะ
          </Label>
          <Input
            id={id('duration')}
            value={form.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
            placeholder="เช่น 2 สัปดาห์"
            maxLength={100}
          />
        </div>
        <div className="grid content-start gap-1.5">
          <Label htmlFor={id('weight')} className="text-[13px]">
            น้ำหนัก
          </Label>
          <Input
            id={id('weight')}
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={form.weight}
            onChange={(e) => {
              onChange({ weight: Math.max(1, Number(e.target.value) || 1) })
              onClearError('weight')
            }}
            aria-invalid={errors.weight ? true : undefined}
            aria-describedby={errors.weight ? errId('weight') : id('weight-hint')}
          />
          {errors.weight ? (
            <FieldError error={errors.weight} id={errId('weight')} />
          ) : (
            <span id={id('weight-hint')} className="text-text-secondary text-xs">
              ผลต่อ % รวมของแผน
            </span>
          )}
        </div>
        {isEdit && (
          <div className="grid content-start gap-1.5">
            <Label htmlFor={id('pct')} className="text-[13px]">
              % ตอนนี้
            </Label>
            <div className="relative">
              <Input
                id={id('pct')}
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={form.progressPercent}
                onChange={(e) => {
                  onChange({
                    progressPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                  onClearError('progressPercent')
                }}
                className="pr-9"
                aria-invalid={errors.progressPercent ? true : undefined}
                aria-describedby={errId('progressPercent')}
              />
              <span
                aria-hidden
                className="text-text-secondary pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px]"
              >
                %
              </span>
            </div>
            <FieldError error={errors.progressPercent} id={errId('progressPercent')} />
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <div className="border-border flex min-h-14 items-center justify-between gap-4 rounded-[14px] border bg-white/70 px-3.5 py-2.5 dark:bg-white/5">
          <div className="grid gap-0.5">
            <Label htmlFor={id('recurring')} className="text-sm font-medium">
              ทำซ้ำทุกเดือน
            </Label>
            <span className="text-text-secondary text-xs">
              เช่น อัพเดทบทความทุกวันที่ 14 ของทุกเดือน
            </span>
          </div>
          <Switch
            id={id('recurring')}
            checked={form.isRecurring}
            onCheckedChange={(v) => onChange({ isRecurring: v })}
          />
        </div>

        {form.isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div className="grid content-start gap-1.5">
              <Label htmlFor={id('rec-day')} className="text-[13px]">
                วันที่ในเดือน
              </Label>
              <Input
                id={id('rec-day')}
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                value={form.recurrenceDayOfMonth}
                onChange={(e) =>
                  onChange({
                    recurrenceDayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
              />
            </div>
            <div className="grid content-start gap-1.5">
              <Label htmlFor={id('rec-interval')} className="text-[13px]">
                ทุกกี่เดือน
              </Label>
              <div className="relative">
                <Input
                  id={id('rec-interval')}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  value={form.recurrenceInterval}
                  onChange={(e) =>
                    onChange({
                      recurrenceInterval: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                  className="pr-14"
                />
                <span
                  aria-hidden
                  className="text-text-secondary pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px]"
                >
                  เดือน
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={id('note')} className="text-[13px]">
          หมายเหตุ
        </Label>
        <Textarea
          id={id('note')}
          value={form.note}
          onChange={(e) => onChange({ note: e.target.value })}
          rows={2}
          maxLength={5000}
        />
      </div>
    </div>
  )
}
