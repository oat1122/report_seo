'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileStack, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Stagger, StaggerItem, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { cn } from '@/lib/utils'
import { useCreateTemplate, useDeleteTemplate, useTemplates } from '../../hooks/useTemplates'
import { upsertTemplateSchema, type UpsertTemplateInput } from '@/features/work-progress/schemas'
import type { WorkProgressTemplate } from '@/features/work-progress/domain/WorkProgressTemplate'
import { FieldError, parseFieldErrors, type FieldErrors } from '../FieldError'

interface TemplateListProps {
  basePath: string
}

const DURATION_OPTIONS = [3, 6, 9, 12, 18, 24, 36, 48, 60]

// มือถือ = bottom sheet (Handoff rule 11) · desktop = modal กลางจอ
const SHEET_CLASS =
  'max-h-[92dvh] overflow-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none'

// วันที่แบบ ค.ศ. ตาม Handoff rule 8 — "28 ก.ย. 2026"
const formatUpdated = (date: Date | string) =>
  new Date(date).toLocaleDateString('th-TH-u-ca-gregory', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export function TemplateList({ basePath }: TemplateListProps) {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkProgressTemplate | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useTemplates({ includeInactive })
  const deleteMut = useDeleteTemplate()

  const templates = data ?? []
  const deletingId = deleteMut.isPending ? (deleteMut.variables?.id ?? null) : null

  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-text-secondary text-[13px]" aria-live="polite">
          {isLoading
            ? 'กำลังโหลด template…'
            : `ทั้งหมด ${templates.length.toLocaleString('th-TH')} template${
                includeInactive ? ' (รวมที่ปิดใช้)' : ''
              }`}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Label
            htmlFor="t-incl-inactive"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
          >
            <Switch
              id="t-incl-inactive"
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            />
            แสดง template ที่ปิดใช้
          </Label>
          <Button onClick={() => setCreateOpen(true)} className="max-sm:w-full">
            <Plus className="size-4" aria-hidden />
            สร้าง template
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3" role="status">
          <span className="sr-only">กำลังโหลด template</span>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[184px] rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="border-glass-border bg-glass-card shadow-card flex flex-col items-start gap-3 rounded-[20px] border p-6"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">โหลดรายการ template ไม่สำเร็จ</p>
            <p className="text-text-secondary text-[13px]">
              ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วกด “ลองอีกครั้ง”
            </p>
          </div>
          <Button variant="outline" onClick={() => void refetch()}>
            ลองอีกครั้ง
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="border-border bg-glass-card flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed px-6 py-12 text-center">
          <span className="bg-info-subtle text-info-strong flex size-12 items-center justify-center rounded-[14px]">
            <FileStack className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              {includeInactive ? 'ยังไม่มี template' : 'ยังไม่มี template ที่เปิดใช้'}
            </p>
            <p className="text-text-secondary max-w-[46ch] text-[13px]">
              สร้าง template แรกเพื่อใช้สร้างแผนงานให้ลูกค้าได้ในคลิกเดียว
            </p>
          </div>
          <Button variant="soft" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            สร้าง template
          </Button>
        </div>
      ) : (
        <Stagger className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
          {templates.map((t) => (
            <StaggerItem key={t.id} className="min-w-0">
              <TemplateCard
                tpl={t}
                href={`${basePath}/${t.id}`}
                deleting={deletingId === t.id}
                onDelete={() => {
                  setDeleteTarget(t)
                  setDeleteOpen(true)
                }}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} basePath={basePath} />

      <ConfirmAlert
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (!deleteTarget) return
          const id = deleteTarget.id
          setDeleteOpen(false)
          deleteMut.mutateAsync({ id }).catch(() => {
            // ข้อความ error แสดงผ่าน toast ของ axios interceptor แล้ว
          })
        }}
        title={`ลบ template “${deleteTarget?.name ?? ''}”`}
        message="template นี้จะถูกลบถาวรและกู้คืนไม่ได้ · ถ้าแค่ต้องการซ่อนจากตัวเลือก ให้ปิดใช้งานในหน้าแก้ไข template แทน · system template ลบไม่ได้"
      />
    </div>
  )
}

interface TemplateCardProps {
  tpl: WorkProgressTemplate
  href: string
  deleting: boolean
  onDelete: () => void
}

function TemplateCard({ tpl, href, deleting, onDelete }: TemplateCardProps) {
  const hasDescription = Boolean(tpl.description?.trim())

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      aria-busy={deleting}
      className={cn(
        'group border-glass-border bg-glass-card shadow-card hover:shadow-popover relative flex h-full flex-col gap-3 rounded-[20px] border p-5 backdrop-blur-md transition-shadow',
        deleting && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'bg-info-subtle text-info-strong flex size-[42px] shrink-0 items-center justify-center rounded-[13px]',
              !tpl.isActive && 'opacity-60',
            )}
          >
            <FileStack className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="line-clamp-2 text-base leading-snug font-semibold">
              <Link
                href={href}
                className="focus-visible:after:ring-ring/60 outline-none after:absolute after:inset-0 after:rounded-[20px] focus-visible:after:ring-2"
              >
                {tpl.name}
              </Link>
            </h2>
            <span className="text-text-secondary text-xs tabular-nums">
              {tpl.durationMonths} เดือน
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`ตัวเลือกของ ${tpl.name}`}
              className="text-text-secondary relative z-[1] -mt-1.5 -mr-1.5 sm:size-9"
              disabled={deleting}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={href}>
                <Pencil className="size-4" aria-hidden />
                แก้ไข
              </Link>
            </DropdownMenuItem>
            {!tpl.isSystem && (
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 className="size-4" aria-hidden />
                ลบ
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p
        className={cn(
          'line-clamp-2 min-h-10 text-[13px] leading-relaxed',
          'text-text-secondary',
          !hasDescription && 'italic',
        )}
      >
        {hasDescription ? tpl.description : 'ยังไม่ได้เพิ่มรายละเอียด'}
      </p>

      <div className="border-border/70 mt-auto flex items-center justify-between gap-2 border-t pt-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {tpl.isSystem && <Badge variant="default">system</Badge>}
          {!tpl.isActive && <Badge variant="neutral">ปิดใช้</Badge>}
        </div>
        <span className="text-text-secondary text-xs">อัปเดต {formatUpdated(tpl.updatedAt)}</span>
      </div>
    </motion.article>
  )
}

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  basePath: string
}

function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMonths, setDurationMonths] = useState<number>(12)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createMut = useCreateTemplate()

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setErrors({})
      setSubmitError(null)
    }
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      periodType: 'YEAR_12_MONTHS',
      durationMonths,
      isActive: true,
    }
    const parsed = upsertTemplateSchema.safeParse(body)
    if (!parsed.success) {
      const next = parseFieldErrors(parsed.error)
      if (!body.name) next.name = 'กรุณาระบุชื่อ template'
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitError(null)
    try {
      await createMut.mutateAsync(parsed.data as UpsertTemplateInput)
    } catch {
      setSubmitError('สร้าง template ไม่สำเร็จ — ดูสาเหตุในข้อความแจ้งเตือน แล้วลองอีกครั้ง')
      return
    }
    setName('')
    setDescription('')
    setDurationMonths(12)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={SHEET_CLASS}>
        <DialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]">
            <FileStack className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>สร้าง template</DialogTitle>
            <DialogDescription>
              Template เก็บแค่จำนวนเดือน — เดือนเริ่มจริงจะระบุตอนสร้างแผน
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          id="ct-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ct-name" data-required>
              ชื่อ
            </Label>
            <Input
              id="ct-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              maxLength={200}
              autoFocus
              aria-required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'ct-name-error' : undefined}
            />
            <div id="ct-name-error">
              <FieldError error={errors.name} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ct-desc">รายละเอียด</Label>
            <Textarea
              id="ct-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={5000}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'ct-desc-error' : undefined}
            />
            <div id="ct-desc-error">
              <FieldError error={errors.description} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ct-duration">จำนวนเดือน</Label>
            <Select
              value={String(durationMonths)}
              onValueChange={(v) => setDurationMonths(Number(v))}
            >
              <SelectTrigger id="ct-duration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} เดือน
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <span className="text-danger-strong">*</span> จำเป็นต้องกรอก
          </span>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" form="ct-form" disabled={createMut.isPending}>
            {createMut.isPending ? 'กำลังสร้าง…' : 'สร้าง'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
