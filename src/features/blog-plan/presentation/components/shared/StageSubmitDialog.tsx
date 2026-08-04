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
import { getStageDefinition } from '../../../domain/policies/stage-schedule'
import type { BlogStageCode } from '../../../domain/BlogArticle'

const FILE_KIND_META = {
  COVER_IMAGE: { accept: '.jpg,.jpeg,.png', hint: 'JPG/PNG ไม่เกิน 5MB' },
  ARTICLE_DOC: { accept: '.doc,.docx,.pdf', hint: 'Word/PDF ไม่เกิน 20MB' },
}

interface StageSubmitDialogProps {
  stageCode: BlogStageCode | null
  /** รอบก่อนหน้าที่เคยส่งไปแล้วใน stage นี้ — ใช้บอกผู้ใช้ว่ากำลังส่งรอบที่เท่าไร */
  previousRounds: number
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { message: string; linkUrl: string; file: File | null }) => void
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
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (stageCode) {
      setMessage('')
      setLinkUrl('')
      setFile(null)
    }
  }, [stageCode])

  const definition = stageCode ? getStageDefinition(stageCode) : null
  const fileMeta = definition?.fileKind ? FILE_KIND_META[definition.fileKind] : null
  const isEmpty = !message.trim() && !linkUrl.trim() && !file

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

          {fileMeta && (
            <div className="flex flex-col gap-1.5">
              <Label>แนบไฟล์ (ถ้ามี)</Label>
              <input
                ref={inputRef}
                type="file"
                accept={fileMeta.accept}
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
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
                      onClick={() => setFile(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">{fileMeta.hint}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            disabled={isPending || isEmpty}
            onClick={() => onSubmit({ message: message.trim(), linkUrl: linkUrl.trim(), file })}
          >
            ส่งให้ลูกค้า
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
