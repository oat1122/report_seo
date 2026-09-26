'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CalendarIcon, ImagePlus, Loader2, Save, Sparkles, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { AiOverview } from '@/types/metrics'
import { MOBILE_SHEET_CLASS, formatThaiDate } from './domainFormat'

const MAX_IMAGES = 3
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

const TILE = 'relative h-36 overflow-hidden rounded-[14px] border sm:h-[150px]'
const TILE_BUTTON =
  'bg-foreground/60 text-background hover:bg-foreground/75 focus-visible:ring-ring/70 absolute top-2 right-2 flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] sm:size-[30px] [&_svg]:size-4'

interface AiOverviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = เพิ่มรายการใหม่ · มีค่า = แก้ไขรายการนี้ */
  item: AiOverview | null
  customerName: string
  onSubmit: (formData: FormData, id: string | null) => Promise<void>
}

/**
 * ฟอร์ม AI Overview (เพิ่ม/แก้ไข) ใน dialog — mount ใหม่ทุกครั้งที่เปิด (parent ส่ง key)
 * state จึงเริ่มจาก item เสมอ · payload FormData เหมือนเดิม: title, displayDate, [imagesToDelete], files
 */
export function AiOverviewFormDialog({
  open,
  onOpenChange,
  item,
  customerName,
  onSubmit,
}: AiOverviewFormDialogProps) {
  const isEdit = item !== null
  const existingImages = item?.images ?? []

  const [title, setTitle] = useState(item?.title ?? '')
  const [displayDate, setDisplayDate] = useState<Date>(() =>
    item ? new Date(item.displayDate) : new Date(),
  )
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewsRef = useRef<string[]>([])

  // เก็บ URL preview ล่าสุดไว้ revoke ตอน unmount
  useEffect(() => {
    previewsRef.current = previews
  }, [previews])
  useEffect(() => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const keptCount = existingImages.length - imagesToDelete.length
  const totalImages = keptCount + files.length
  const titleError = submitted && !title.trim()
  const imagesError = submitted && totalImages === 0

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return
    const valid = incoming.filter((f) => ACCEPTED_TYPES.includes(f.type))
    if (totalImages + valid.length > MAX_IMAGES) {
      setFileError(`อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป — ลบรูปที่ไม่ใช้ออกก่อนแล้วค่อยเพิ่มใหม่`)
      return
    }
    setFileError(valid.length < incoming.length ? 'รองรับเฉพาะไฟล์ JPG และ PNG' : null)
    if (valid.length === 0) return
    setFiles((prev) => [...prev, ...valid])
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))])
  }

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  const toggleExisting = (imageId: string) => {
    const marked = imagesToDelete.includes(imageId)
    if (marked && totalImages + 1 > MAX_IMAGES) {
      setFileError(`รูปครบ ${MAX_IMAGES} รูปแล้ว — ลบรูปใหม่ออกก่อนจึงจะเก็บรูปนี้ไว้ได้`)
      return
    }
    setFileError(null)
    setImagesToDelete((prev) => (marked ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!title.trim() || totalImages === 0 || isSubmitting) return
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('displayDate', displayDate.toISOString())
      if (isEdit) formData.append('imagesToDelete', JSON.stringify(imagesToDelete))
      files.forEach((file) => formData.append('files', file))
      await onSubmit(formData, item?.id ?? null)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className={cn(
          'max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[720px]',
          MOBILE_SHEET_CLASS,
        )}
      >
        <form noValidate onSubmit={handleSubmit}>
          <div className="flex items-start gap-3.5 px-6 pt-[22px] pb-[18px]">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
            >
              <Sparkles className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle>{isEdit ? 'แก้ไข AI Overview' : 'เพิ่ม AI Overview'}</DialogTitle>
              <DialogDescription>
                {customerName ? `${customerName} · ` : ''}
                บันทึกหลักฐานเมื่อเว็บลูกค้าถูก AI Search หยิบไปตอบ
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="ปิด"
                className="max-sm:size-11"
              >
                <X />
              </Button>
            </DialogClose>
          </div>

          <div className="flex flex-col gap-6 px-6 pt-1 pb-6">
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
              <Field className="gap-1.5 sm:col-span-2" data-invalid={titleError}>
                <Label htmlFor="ai-title">
                  หัวข้อ AI Overview
                  <span aria-hidden className="text-danger-strong">
                    *
                  </span>
                </Label>
                <Input
                  id="ai-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น รับทำ seo ราคาเท่าไหร่"
                  aria-required
                  aria-invalid={titleError}
                  aria-describedby={titleError ? 'ai-title-error' : undefined}
                />
                {titleError && (
                  <FieldError id="ai-title-error" className="text-danger-strong text-xs">
                    กรอกหัวข้อ AI Overview
                  </FieldError>
                )}
              </Field>
              <Field className="gap-1.5">
                <Label htmlFor="ai-date">
                  วันที่แสดงผล
                  <span aria-hidden className="text-danger-strong">
                    *
                  </span>
                </Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="ai-date"
                      type="button"
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {formatThaiDate(displayDate)}
                      <CalendarIcon aria-hidden className="text-text-secondary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={displayDate}
                      onSelect={(d) => {
                        if (!d) return
                        setDisplayDate(d)
                        setDateOpen(false)
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>

            <fieldset className="flex min-w-0 flex-col gap-2.5">
              <legend className="mb-2.5 text-sm font-medium">
                รูปภาพ
                <span aria-hidden className="text-danger-strong">
                  *
                </span>{' '}
                <span className="text-text-secondary font-normal tabular-nums">
                  ({totalImages} / {MAX_IMAGES})
                </span>
              </legend>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                tabIndex={-1}
                aria-hidden
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files || []))
                  e.target.value = ''
                }}
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {existingImages.map((img, i) => {
                  const marked = imagesToDelete.includes(img.id)
                  return (
                    <div
                      key={img.id}
                      className={cn(TILE, marked ? 'border-destructive' : 'border-border')}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={`รูปเดิมที่ ${i + 1}`}
                        className={cn('size-full object-cover', marked && 'opacity-40')}
                      />
                      {marked && (
                        <span className="bg-danger-subtle text-danger-strong absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          จะถูกลบเมื่อบันทึก
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleExisting(img.id)}
                        aria-label={
                          marked ? `เก็บรูปเดิมที่ ${i + 1} ไว้` : `ลบรูปเดิมที่ ${i + 1}`
                        }
                        className={TILE_BUTTON}
                      >
                        {marked ? <Undo2 aria-hidden /> : <X aria-hidden />}
                      </button>
                    </div>
                  )
                })}

                {previews.map((src, i) => (
                  <div key={src} className={cn(TILE, 'border-border')}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`รูปใหม่ที่ ${i + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      aria-label={`นำรูปใหม่ที่ ${i + 1} ออก`}
                      className={TILE_BUTTON}
                    >
                      <X aria-hidden />
                    </button>
                  </div>
                ))}

                {totalImages < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      addFiles(Array.from(e.dataTransfer.files))
                    }}
                    aria-describedby={imagesError ? 'ai-images-error' : undefined}
                    className={cn(
                      'focus-visible:ring-ring/70 flex h-36 flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed px-3 text-center outline-none focus-visible:ring-[3px] sm:h-[150px]',
                      imagesError ? 'border-destructive' : 'border-accent',
                      isDragging ? 'bg-info-subtle' : 'bg-info-subtle/50',
                    )}
                  >
                    <span
                      aria-hidden
                      className="text-info-strong dark:bg-background flex size-10 items-center justify-center rounded-xl bg-white"
                    >
                      <ImagePlus className="size-5" />
                    </span>
                    <span className="text-[13px] font-medium">ลากรูปมาวาง หรือเลือกไฟล์</span>
                    <span className="text-text-secondary text-xs">
                      PNG / JPG · สูงสุด {MAX_IMAGES} รูป
                    </span>
                  </button>
                )}
              </div>

              {imagesError && (
                <p id="ai-images-error" role="alert" className="text-danger-strong text-xs">
                  เพิ่มรูปภาพอย่างน้อย 1 รูป
                </p>
              )}
              {fileError && (
                <p role="alert" className="text-danger-strong text-xs">
                  {fileError}
                </p>
              )}
            </fieldset>
          </div>

          <div className="bg-muted/60 border-border sticky bottom-0 flex flex-col gap-3 border-t px-6 py-4 backdrop-blur-[14px] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-text-secondary text-xs">
              <span aria-hidden className="text-danger-strong">
                *
              </span>{' '}
              จำเป็นต้องกรอก
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:flex">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  ยกเลิก
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                {isSubmitting ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'บันทึก AI Overview'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
