'use client'

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Pencil,
  Save,
  Loader2,
  CalendarIcon,
} from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/th'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { AiOverview } from '@/types/metrics'

interface AiOverviewSectionProps {
  aiOverviews: AiOverview[]
  isLoading: boolean
  onAdd: (formData: FormData) => Promise<void>
  onUpdate: (id: string, formData: FormData) => Promise<void>
  onDelete: (aiOverviewId: string) => Promise<void>
  showSubmitButton?: boolean
  onStateChange?: (state: { canSubmit: boolean; isSubmitting: boolean }) => void
}

export interface AiOverviewSectionHandle {
  submit: () => Promise<void>
  canSubmit: boolean
  isSubmitting: boolean
}

const MAX_IMAGES = 3

const DatePickerField = ({
  value,
  onChange,
  id,
}: {
  value: Dayjs | null
  onChange: (date: Dayjs | null) => void
  id?: string
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn('w-full justify-start font-normal', !value && 'text-muted-foreground')}
      >
        <CalendarIcon className="size-4" />
        {value ? value.format('DD/MM/YYYY') : 'เลือกวันที่'}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value?.toDate()}
        onSelect={(d) => onChange(d ? dayjs(d) : null)}
        autoFocus
      />
    </PopoverContent>
  </Popover>
)

const ImagePreviewTile = ({
  src,
  alt,
  onRemove,
  removeIcon = 'x',
  variant = 'default',
}: {
  src: string
  alt: string
  onRemove: () => void
  removeIcon?: 'x' | 'plus'
  variant?: 'default' | 'marked-for-deletion'
}) => (
  <div
    className={cn(
      'relative size-28 overflow-hidden rounded-lg border',
      variant === 'marked-for-deletion' ? 'border-destructive opacity-45' : 'border-border',
    )}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt} className="size-full object-cover" />
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        'text-background absolute top-1 right-1 flex size-6 items-center justify-center rounded-full',
        removeIcon === 'plus'
          ? 'bg-success/90 hover:bg-success'
          : variant === 'marked-for-deletion'
            ? 'bg-success/90 hover:bg-success'
            : 'bg-foreground/55 hover:bg-foreground/70',
      )}
    >
      {removeIcon === 'plus' ? <Plus className="size-3.5" /> : <X className="size-3.5" />}
    </button>
  </div>
)

export const AiOverviewSection = forwardRef<AiOverviewSectionHandle, AiOverviewSectionProps>(
  function AiOverviewSection(
    { aiOverviews, isLoading, onAdd, onUpdate, onDelete, showSubmitButton = true, onStateChange },
    ref,
  ) {
    // Create form state
    const [title, setTitle] = useState('')
    const [displayDate, setDisplayDate] = useState<Dayjs | null>(dayjs())
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Edit modal state
    const [editingItem, setEditingItem] = useState<AiOverview | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDisplayDate, setEditDisplayDate] = useState<Dayjs | null>(null)
    const [editFiles, setEditFiles] = useState<File[]>([])
    const [editPreviews, setEditPreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<AiOverview['images']>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
    const editFileInputRef = useRef<HTMLInputElement>(null)

    const canSubmit = title.trim().length > 0 && files.length > 0 && !isSubmitting

    useEffect(() => {
      onStateChange?.({ canSubmit, isSubmitting })
    }, [canSubmit, isSubmitting, onStateChange])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      if (files.length + selectedFiles.length > MAX_IMAGES) {
        alert(`อัปโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`)
        return
      }
      setFiles((prev) => [...prev, ...selectedFiles])
      setPreviews((prev) => [...prev, ...selectedFiles.map((f) => URL.createObjectURL(f))])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemoveFile = (index: number) => {
      URL.revokeObjectURL(previews[index])
      setFiles((prev) => prev.filter((_, i) => i !== index))
      setPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = useCallback(async () => {
      if (!title.trim() || files.length === 0 || isSubmitting) return
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('title', title.trim())
        formData.append('displayDate', displayDate?.toISOString() || dayjs().toISOString())
        files.forEach((file) => formData.append('files', file))
        await onAdd(formData)

        setTitle('')
        setDisplayDate(dayjs())
        setFiles([])
        previews.forEach((url) => URL.revokeObjectURL(url))
        setPreviews([])
      } finally {
        setIsSubmitting(false)
      }
    }, [displayDate, files, isSubmitting, onAdd, previews, title])

    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
        canSubmit,
        isSubmitting,
      }),
      [canSubmit, handleSubmit, isSubmitting],
    )

    const handleEdit = (item: AiOverview) => {
      setEditingItem(item)
      setEditTitle(item.title)
      setEditDisplayDate(dayjs(item.displayDate))
      setExistingImages(item.images)
      setImagesToDelete([])
      setEditFiles([])
      setEditPreviews([])
    }

    const handleCloseEdit = () => {
      setEditingItem(null)
      setEditTitle('')
      setEditDisplayDate(null)
      setExistingImages([])
      setImagesToDelete([])
      setEditFiles([])
      editPreviews.forEach((url) => URL.revokeObjectURL(url))
      setEditPreviews([])
    }

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      const remainingImages = existingImages.length - imagesToDelete.length
      if (remainingImages + editFiles.length + selectedFiles.length > MAX_IMAGES) {
        alert(`อัปโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`)
        return
      }
      setEditFiles((prev) => [...prev, ...selectedFiles])
      setEditPreviews((prev) => [...prev, ...selectedFiles.map((f) => URL.createObjectURL(f))])
      if (editFileInputRef.current) editFileInputRef.current.value = ''
    }

    const handleRemoveEditFile = (index: number) => {
      URL.revokeObjectURL(editPreviews[index])
      setEditFiles((prev) => prev.filter((_, i) => i !== index))
      setEditPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleEditSubmit = async () => {
      if (!editingItem || !editTitle.trim()) return
      const remainingImages = existingImages.length - imagesToDelete.length
      if (remainingImages + editFiles.length === 0) {
        alert('ต้องมีรูปภาพอย่างน้อย 1 รูป')
        return
      }
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('title', editTitle.trim())
        formData.append('displayDate', editDisplayDate?.toISOString() || dayjs().toISOString())
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete))
        editFiles.forEach((file) => formData.append('files', file))
        await onUpdate(editingItem.id, formData)
        handleCloseEdit()
      } finally {
        setIsSubmitting(false)
      }
    }

    const editTotalImages = existingImages.length - imagesToDelete.length + editFiles.length

    return (
      <>
        <div className="border-border rounded-2xl border p-4 sm:p-6">
          <FieldGroup>
            <div>
              <h3 className="text-lg font-bold">เพิ่ม AI Overview</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                เพิ่มหัวข้อและภาพประกอบสำหรับรายงาน AI Overview โดยอัปโหลดได้สูงสุด {MAX_IMAGES} รูป
              </p>
            </div>

            <Field>
              <Label htmlFor="ai-title">หัวข้อ AI Overview</Label>
              <Input
                id="ai-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น คีย์เวิร์ด SEO ติด AI Overview แล้ว"
              />
            </Field>

            <Field>
              <Label htmlFor="ai-date">วันที่แสดงผล</Label>
              <DatePickerField id="ai-date" value={displayDate} onChange={setDisplayDate} />
            </Field>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_IMAGES}
                >
                  <Upload className="size-4" />
                  เลือกรูปภาพ ({files.length}/{MAX_IMAGES})
                </Button>
                <p className="text-muted-foreground text-sm">รองรับไฟล์ JPG และ PNG</p>
              </div>

              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((preview, index) => (
                    <ImagePreviewTile
                      key={index}
                      src={preview}
                      alt={`preview-${index}`}
                      onRemove={() => handleRemoveFile(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {showSubmitButton && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                  {isSubmitting ? 'กำลังอัปโหลด...' : 'บันทึก AI Overview'}
                </Button>
              </div>
            )}
          </FieldGroup>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="text-info size-8 animate-spin" />
          </div>
        ) : aiOverviews.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-2xl border p-6 text-center text-sm">
            ยังไม่มี AI Overview
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {aiOverviews.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="text-info size-4" />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-muted-foreground text-xs">
                          วันที่แสดงผล {dayjs(item.displayDate).format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-info/40 text-info">
                      {item.images.length} รูป
                    </Badge>
                  </div>

                  {item.images.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {item.images.map((img) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt={item.title}
                          className="border-border h-22 w-32 rounded-md border object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Pencil className="size-4" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit dialog */}
        <Dialog open={!!editingItem} onOpenChange={(o) => !o && handleCloseEdit()}>
          {editingItem && (
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto sm:max-w-[min(92vw,820px)]">
              <DialogHeader>
                <DialogTitle>แก้ไข AI Overview</DialogTitle>
                <DialogDescription>
                  ปรับหัวข้อ วันที่แสดงผล และจัดการรูปภาพได้ในหน้าต่างนี้
                </DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <Label htmlFor="edit-title">หัวข้อ AI Overview</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </Field>

                <Field>
                  <Label htmlFor="edit-date">วันที่แสดงผล</Label>
                  <DatePickerField
                    id="edit-date"
                    value={editDisplayDate}
                    onChange={setEditDisplayDate}
                  />
                </Field>

                {existingImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">รูปภาพปัจจุบัน</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img) => {
                        const marked = imagesToDelete.includes(img.id)
                        return (
                          <ImagePreviewTile
                            key={img.id}
                            src={img.imageUrl}
                            alt="existing"
                            variant={marked ? 'marked-for-deletion' : 'default'}
                            removeIcon={marked ? 'plus' : 'x'}
                            onRemove={() =>
                              setImagesToDelete((prev) =>
                                marked ? prev.filter((id) => id !== img.id) : [...prev, img.id],
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={editTotalImages >= MAX_IMAGES}
                    >
                      <Upload className="size-4" />
                      เพิ่มรูปภาพใหม่ ({editTotalImages}/{MAX_IMAGES})
                    </Button>
                    <p className="text-muted-foreground text-sm">
                      รวมรูปเดิมและรูปใหม่ได้สูงสุด {MAX_IMAGES} รูป
                    </p>
                  </div>

                  {editPreviews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editPreviews.map((preview, index) => (
                        <ImagePreviewTile
                          key={index}
                          src={preview}
                          alt={`preview-${index}`}
                          onRemove={() => handleRemoveEditFile(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FieldGroup>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseEdit}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={!editTitle.trim() || editTotalImages === 0 || isSubmitting}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </>
    )
  },
)
