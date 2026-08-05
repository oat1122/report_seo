'use client'

import { useEffect, useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
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
import { BLOG_FILE_KIND_LABELS, getStageDefinition } from '../../../domain/policies/stage-schedule'
import type { BlogFileKind, BlogStageCode } from '../../../domain/BlogArticle'

const FILE_KIND_META: Record<BlogFileKind, { accept: string; hint: string }> = {
  COVER_IMAGE: { accept: '.jpg,.jpeg,.png', hint: 'JPG/PNG ไม่เกิน 5MB' },
  ARTICLE_DOC: { accept: '.doc,.docx,.pdf', hint: 'Word/PDF ไม่เกิน 20MB' },
}

export type StageWorkFiles = Partial<Record<BlogFileKind, File>>

interface StageSubmitDialogProps {
  stageCode: BlogStageCode | null
  /** รอบก่อนหน้าที่เคยส่งไปแล้วใน stage นี้ — ใช้บอกผู้ใช้ว่ากำลังส่งรอบที่เท่าไร */
  previousRounds: number
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { message: string; linkUrl: string; files: StageWorkFiles }) => void
}

export function StageSubmitDialog({
  stageCode,
  previousRounds,
  isPending,
  onOpenChange,
  onSubmit,
}: StageSubmitDialogProps) {
  const [message, setMessage] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [files, setFiles] = useState<StageWorkFiles>({})

  useEffect(() => {
    if (stageCode) {
      setMessage('')
      setLinkUrl('')
      setFiles({})
    }
  }, [stageCode])

  const definition = stageCode ? getStageDefinition(stageCode) : null
  const missingRequired = (definition?.requiredFileKinds ?? []).filter((kind) => !files[kind])
  const isEmpty = !message.trim() && !linkUrl.trim() && Object.keys(files).length === 0

  return (
    <Dialog open={Boolean(stageCode)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {previousRounds > 0 ? `ส่งใหม่ (รอบ ${previousRounds + 1})` : 'ส่งงานให้ลูกค้า'}
          </DialogTitle>
          <DialogDescription>
            {definition?.label} — ลูกค้าจะเห็นข้อความ ลิงก์ และไฟล์ที่แนบทันทีหลังกดส่ง
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-message">ข้อความถึงลูกค้า</Label>
            <Textarea
              id="submit-message"
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="เช่น หัวข้อ / Main Idea ที่เสนอ หรือสรุปสิ่งที่แก้ไขในรอบนี้"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-link">ลิงก์ (ถ้ามี)</Label>
            <Input
              id="submit-link"
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://docs.google.com/..."
            />
          </div>

          {definition?.fileKinds.map((kind) => (
            <FilePicker
              key={kind}
              kind={kind}
              file={files[kind] ?? null}
              isRequired={definition.requiredFileKinds.includes(kind)}
              onChange={(file) =>
                setFiles((current) => ({ ...current, [kind]: file ?? undefined }))
              }
            />
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {missingRequired.length > 0 && (
            <span className="text-muted-foreground mr-auto text-xs">
              ต้องแนบ
              {missingRequired.map((kind) => BLOG_FILE_KIND_LABELS[kind]).join(' และ ')}
              ให้ครบก่อนส่ง
            </span>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            disabled={isPending || isEmpty || missingRequired.length > 0}
            onClick={() => onSubmit({ message: message.trim(), linkUrl: linkUrl.trim(), files })}
          >
            ส่งให้ลูกค้า
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilePicker({
  kind,
  file,
  isRequired,
  onChange,
}: {
  kind: BlogFileKind
  file: File | null
  isRequired: boolean
  onChange: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const meta = FILE_KIND_META[kind]
  const label = BLOG_FILE_KIND_LABELS[kind]

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        <span className="text-muted-foreground font-normal">
          {isRequired ? ' (ต้องแนบ)' : ' (ถ้ามี)'}
        </span>
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept={meta.accept}
        className="hidden"
        aria-label={label}
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null)
          event.target.value = ''
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="mr-1 size-3.5" />
          เลือกไฟล์
        </Button>
        {file ? (
          <span className="flex min-w-0 items-center gap-1 text-xs">
            <span className="truncate font-medium">{file.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-6 shrink-0"
              aria-label={`ลบ${label}`}
              onClick={() => onChange(null)}
            >
              <X className="size-3.5" />
            </Button>
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{meta.hint}</span>
        )}
      </div>
    </div>
  )
}
