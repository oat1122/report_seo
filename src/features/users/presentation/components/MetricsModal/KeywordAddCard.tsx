'use client'

import React, { useRef, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { KdLevel } from '@/types/kd'
import type { KeywordReportForm } from '@/types/metrics'
import { checkboxChangeEvent } from './domainFormat'
import { KD_META, KD_OPTIONS } from './kdMeta'

interface KeywordAddCardProps {
  newKeyword: KeywordReportForm
  /** ชื่อ keyword ที่กำลังแก้ในตาราง (null = โหมดเพิ่ม) */
  editingKeyword: string | null
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeywordSelectChange: (value: KdLevel) => void
  onAdd: () => void
  onCancelEdit: () => void
}

/**
 * การ์ด "เพิ่ม Keyword" — ใช้ state ฟอร์มชุดเดียวกับการแก้ไขในแถว (useMetricsModal)
 * จึงซ่อนฟอร์มระหว่างแก้ไขแถว เพื่อไม่ให้สองฟอร์มแสดงค่าชุดเดียวกัน
 */
export function KeywordAddCard({
  newKeyword,
  editingKeyword,
  onKeywordChange,
  onKeywordSelectChange,
  onAdd,
  onCancelEdit,
}: KeywordAddCardProps) {
  const [showError, setShowError] = useState(false)
  const keywordRef = useRef<HTMLInputElement>(null)
  const keywordMissing = !newKeyword.keyword.trim()
  const keywordError = showError && keywordMissing

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keywordMissing) {
      setShowError(true)
      keywordRef.current?.focus()
      return
    }
    setShowError(false)
    onAdd()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h3>เพิ่ม Keyword</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editingKeyword !== null ? (
          <div className="bg-info-subtle flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm">
              <Pencil aria-hidden className="text-info-strong mt-0.5 size-4 shrink-0" />
              <span>
                กำลังแก้ไข “{editingKeyword}” ในตารางด้านล่าง — บันทึกหรือยกเลิกก่อนเพิ่ม Keyword
                ใหม่
              </span>
            </p>
            <Button variant="outline" onClick={onCancelEdit} className="shrink-0">
              ยกเลิกการแก้ไข
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 items-start gap-3 @3xl:grid-cols-[minmax(0,2fr)_110px_minmax(0,1fr)_150px_auto]">
              <Field className="col-span-2 gap-1.5 @3xl:col-span-1" data-invalid={keywordError}>
                <Label htmlFor="kw-keyword" className="leading-5">
                  Keyword
                  <span aria-hidden className="text-danger-strong">
                    *
                  </span>
                </Label>
                <Input
                  ref={keywordRef}
                  id="kw-keyword"
                  name="keyword"
                  placeholder="เช่น รับทำ seo ราคา"
                  value={newKeyword.keyword}
                  onChange={onKeywordChange}
                  aria-required
                  aria-invalid={keywordError}
                  aria-describedby={keywordError ? 'kw-keyword-error' : undefined}
                />
                {keywordError && (
                  <FieldError id="kw-keyword-error" className="text-danger-strong text-xs">
                    กรอก Keyword ก่อนกดเพิ่ม
                  </FieldError>
                )}
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="kw-position" className="leading-5">
                  Position
                </Label>
                <Input
                  id="kw-position"
                  name="position"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="1–100"
                  value={newKeyword.position ?? ''}
                  onChange={onKeywordChange}
                  className="text-right tabular-nums"
                />
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="kw-traffic" className="leading-5">
                  Traffic
                </Label>
                <Input
                  id="kw-traffic"
                  name="traffic"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="/ เดือน"
                  value={newKeyword.traffic}
                  onChange={onKeywordChange}
                  className="text-right tabular-nums"
                />
              </Field>
              <Field className="col-span-2 gap-1.5 @3xl:col-span-1">
                <Label htmlFor="kw-kd" className="leading-5">
                  KD
                </Label>
                <Select
                  value={newKeyword.kd}
                  onValueChange={(v) => onKeywordSelectChange(v as KdLevel)}
                >
                  <SelectTrigger id="kw-kd" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KD_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {KD_META[level].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Button type="submit" className="col-span-2 @3xl:col-span-1 @3xl:mt-[26px]">
                <Plus />
                เพิ่ม Keyword
              </Button>
            </div>

            <label
              htmlFor="kw-top"
              className="border-border flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[14px] border bg-white/85 px-3.5 py-2.5 dark:bg-white/5"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">แสดงใน Top Report</span>
                <span className="text-text-secondary text-xs">
                  ขึ้นเป็นการ์ดหลักในหน้า Keyword Performance ของลูกค้า
                </span>
              </span>
              <Switch
                id="kw-top"
                checked={newKeyword.isTopReport}
                onCheckedChange={(c) => onKeywordChange(checkboxChangeEvent('isTopReport', c))}
              />
            </label>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
