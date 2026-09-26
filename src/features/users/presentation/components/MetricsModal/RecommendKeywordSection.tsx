'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Lightbulb, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import type { KdLevel } from '@/types/kd'
import type { KeywordRecommend, KeywordRecommendForm } from '@/types/metrics'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { KdBadge } from './KdBadge'
import { checkboxChangeEvent } from './domainFormat'
import { KD_META, KD_OPTIONS } from './kdMeta'

const NONE_KD = '__none__'

interface RecommendKeywordSectionProps {
  newRecommend: KeywordRecommendForm
  recommendKeywordsData: KeywordRecommend[]
  isLoading?: boolean
  editingRecommendId: string | null
  onRecommendChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRecommendSelectChange: (value: KdLevel | '') => void
  onAddRecommend: () => void
  onSetEditingRecommend: (keyword: KeywordRecommend) => void
  onClearEditingRecommend: () => void
  onDeleteRecommendKeyword: (id: string) => void
}

/** หมวด Keyword แนะนำ — ฟอร์มเพิ่ม/แก้ไข + รายการ */
export const RecommendKeywordSection: React.FC<RecommendKeywordSectionProps> = ({
  newRecommend,
  recommendKeywordsData,
  isLoading = false,
  editingRecommendId,
  onRecommendChange,
  onRecommendSelectChange,
  onAddRecommend,
  onSetEditingRecommend,
  onClearEditingRecommend,
  onDeleteRecommendKeyword,
}) => {
  const [showError, setShowError] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KeywordRecommend | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const keywordRef = useRef<HTMLInputElement>(null)
  const isEditing = editingRecommendId !== null
  const keywordError = showError && !newRecommend.keyword.trim()

  // กดแก้ไขจากรายการ → ย้ายโฟกัสขึ้นฟอร์ม (เลื่อนจอให้เห็นอัตโนมัติ)
  useEffect(() => {
    if (editingRecommendId) keywordRef.current?.focus()
  }, [editingRecommendId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecommend.keyword.trim()) {
      setShowError(true)
      keywordRef.current?.focus()
      return
    }
    setShowError(false)
    onAddRecommend()
  }

  const handleCancel = () => {
    setShowError(false)
    onClearEditingRecommend()
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (editingRecommendId === deleteTarget.id) onClearEditingRecommend()
    onDeleteRecommendKeyword(deleteTarget.id)
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className={cn(isEditing && 'bg-info-subtle')}>
        <CardHeader>
          <CardTitle>
            <h3>{isEditing ? 'แก้ไข Keyword แนะนำ' : 'เพิ่ม Keyword แนะนำ'}</h3>
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'ปรับข้อมูลแล้วกดบันทึกการแก้ไข หรือยกเลิกเพื่อกลับไปเพิ่มรายการใหม่'
              : 'บันทึก Keyword ที่แนะนำให้ลูกค้า พร้อมระดับความยากและหมายเหตุสั้น ๆ'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 items-start gap-3 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field className="gap-1.5" data-invalid={keywordError}>
                <Label htmlFor="rec-keyword">
                  Keyword
                  <span aria-hidden className="text-danger-strong">
                    *
                  </span>
                </Label>
                <Input
                  ref={keywordRef}
                  id="rec-keyword"
                  name="keyword"
                  placeholder="เช่น เสื้อ"
                  value={newRecommend.keyword}
                  onChange={onRecommendChange}
                  aria-required
                  aria-invalid={keywordError}
                  aria-describedby={keywordError ? 'rec-keyword-error' : undefined}
                />
                {keywordError && (
                  <FieldError id="rec-keyword-error" className="text-danger-strong text-xs">
                    กรอก Keyword ก่อนบันทึก
                  </FieldError>
                )}
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="rec-kd">KD</Label>
                <Select
                  value={newRecommend.kd ?? NONE_KD}
                  onValueChange={(v) =>
                    onRecommendSelectChange(v === NONE_KD ? '' : (v as KdLevel))
                  }
                >
                  <SelectTrigger id="rec-kd" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_KD}>ไม่ระบุ</SelectItem>
                    {KD_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {KD_META[level].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field className="gap-1.5">
              <Label htmlFor="rec-note">หมายเหตุ</Label>
              <Textarea
                id="rec-note"
                name="note"
                placeholder="เช่น ยากมาก"
                value={newRecommend.note || ''}
                onChange={
                  onRecommendChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>
                }
                rows={3}
              />
            </Field>

            <label
              htmlFor="rec-top"
              className="border-border flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[14px] border bg-white/85 px-3.5 py-2.5 dark:bg-white/5"
            >
              <span className="text-sm font-medium">แสดงใน Top Report</span>
              <Switch
                id="rec-top"
                checked={newRecommend.isTopReport}
                onCheckedChange={(c) => onRecommendChange(checkboxChangeEvent('isTopReport', c))}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end">
              {isEditing && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  ยกเลิก
                </Button>
              )}
              <Button type="submit" className={cn(!isEditing && 'col-span-2')}>
                {isEditing ? <Save /> : <Plus />}
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่ม Keyword แนะนำ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h3>รายการ Keyword แนะนำ ({recommendKeywordsData.length.toLocaleString('en-US')})</h3>
          </CardTitle>
          <CardDescription>
            Keyword ที่บันทึกไว้เพื่อแนะนำลูกค้า · กดดินสอเพื่อแก้ไขในฟอร์มด้านบน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex flex-col gap-2"
              aria-busy="true"
              aria-label="กำลังโหลด Keyword แนะนำ"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : recommendKeywordsData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
              <Lightbulb aria-hidden className="text-info-strong size-6" />
              <p className="font-medium">ยังไม่มี Keyword แนะนำ</p>
              <p className="text-text-secondary text-[13px]">
                เพิ่มรายการแรกจากฟอร์มด้านบน เพื่อบอกลูกค้าว่าควรทำ Keyword ไหนต่อ
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {recommendKeywordsData.map((kw) => (
                  <motion.li
                    key={kw.id}
                    layout="position"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                    className={cn(
                      'border-glass-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between',
                      kw.id === editingRecommendId ? 'bg-info-subtle' : 'bg-glass-tile',
                    )}
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium break-words">{kw.keyword}</span>
                        <KdBadge kd={kw.kd} />
                        {kw.isTopReport && (
                          <span className="text-text-secondary inline-flex items-center gap-1 text-xs">
                            <Star
                              aria-hidden
                              className="fill-warning-accent text-warning-text size-3.5"
                            />
                            Top Report
                          </span>
                        )}
                      </div>
                      {kw.note && (
                        <p className="text-text-secondary text-[13px] break-words">{kw.note}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`แก้ไข ${kw.keyword}`}
                        onClick={() => {
                          setShowError(false)
                          onSetEditingRecommend(kw)
                        }}
                        className="max-sm:size-11"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive-subtle"
                        size="icon-sm"
                        aria-label={`ลบ ${kw.keyword}`}
                        onClick={() => {
                          setDeleteTarget(kw)
                          setDeleteOpen(true)
                        }}
                        className="max-sm:size-11"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`ลบ Keyword แนะนำ “${deleteTarget?.keyword ?? ''}”?`}
        consequences={['ลูกค้าจะไม่เห็นคำแนะนำนี้ในรายงานอีก', 'ลบแล้วกู้คืนไม่ได้']}
        onConfirm={confirmDelete}
      />
    </>
  )
}
