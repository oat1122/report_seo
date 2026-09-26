'use client'

import React from 'react'
import { Check, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { METRIC_GROUPS, type MetricsFieldKey } from './domainMetricFields'

interface DomainMetricsSectionProps {
  metrics: Record<MetricsFieldKey, string | number>
  validationErrors: Partial<Record<MetricsFieldKey, string>>
  isMetricsValid: boolean
  /** กดบันทึกขณะข้อมูลไม่ถูกต้อง → แสดงแถบเตือนรวม */
  showError: boolean
  isDirty: boolean
  hasSavedMetrics: boolean
  isSaving: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
}

/** หมวด "ค่าโดเมน" — ฟอร์มกรอกค่า 3 กลุ่ม + แถบบันทึกลอยเมื่อมีการแก้ไข */
export function DomainMetricsSection({
  metrics,
  validationErrors,
  isMetricsValid,
  showError,
  isDirty,
  hasSavedMetrics,
  isSaving,
  onChange,
  onSave,
}: DomainMetricsSectionProps) {
  return (
    <>
      {showError && !isMetricsValid && (
        <div
          role="alert"
          className="bg-danger-subtle text-danger-strong rounded-2xl px-4 py-3 text-sm"
        >
          ข้อมูลบางช่องไม่ถูกต้อง — แก้ช่องที่มีข้อความสีแดงแล้วกดบันทึกอีกครั้ง
        </div>
      )}

      {METRIC_GROUPS.map((group) => {
        const titleId = `metric-group-${group.num}`
        return (
          <Card key={group.title} role="group" aria-labelledby={titleId}>
            <CardHeader className="flex items-start gap-3">
              <span
                aria-hidden
                className="bg-info-subtle text-info-strong flex size-8 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold"
              >
                {group.num}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 id={titleId} className="text-[17px] leading-snug font-semibold">
                  {group.title}
                </h3>
                <p className="text-text-secondary text-[13px]">{group.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('grid gap-4', group.cols)}>
                {group.fields.map((field) => {
                  const error = validationErrors[field.key]
                  const inputId = `m-${field.key}`
                  const hintId = `${inputId}-hint`
                  return (
                    <Field key={field.key} className="gap-1.5">
                      <Label htmlFor={inputId}>{field.label}</Label>
                      <Input
                        id={inputId}
                        name={field.key}
                        placeholder={field.placeholder}
                        type="number"
                        inputMode="decimal"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={metrics[field.key]}
                        onChange={onChange}
                        aria-invalid={Boolean(error)}
                        aria-describedby={hintId}
                        className="tabular-nums"
                      />
                      <p
                        id={hintId}
                        className={cn(
                          'text-xs',
                          error ? 'text-danger-strong' : 'text-text-secondary',
                        )}
                      >
                        {error || field.helperText}
                      </p>
                    </Field>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {isDirty ? (
        <div className="bg-glass-card border-glass-border shadow-popover sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border px-4 py-3 backdrop-blur-[14px] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-text-secondary inline-flex items-center gap-2 text-sm">
            <span aria-hidden className="bg-warning-accent size-2 shrink-0 rounded-full" />
            มีการแก้ไขที่ยังไม่ได้บันทึก — ลูกค้าจะเห็นค่าใหม่หลังบันทึก
          </span>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกค่าโดเมน'}
          </Button>
        </div>
      ) : (
        hasSavedMetrics && (
          <div className="bg-success-subtle text-success inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium">
            <Check aria-hidden className="size-4" />
            บันทึกข้อมูลล่าสุดเรียบร้อย
          </div>
        )
      )}
    </>
  )
}
