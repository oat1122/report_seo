'use client'

import { useEffect, useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BlogPlanPageShell } from './BlogPlanPageShell'
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard'
import { BLOG_FILE_KIND_LABELS, getStageDefinition } from '../../../domain/policies/stage-schedule'
import { BLOG_MESSAGE_MAX_LENGTH } from '../../../schemas'
import { normalizeLinkUrl } from './blog-plan-view'
import type { BlogArticle, BlogFileKind, BlogStageCode } from '../../../domain/BlogArticle'

const FILE_KIND_META: Record<BlogFileKind, { accept: string; hint: string }> = {
  COVER_IMAGE: { accept: '.jpg,.jpeg,.png', hint: 'JPG/PNG ไม่เกิน 5MB' },
  ARTICLE_DOC: { accept: '.doc,.docx,.pdf', hint: 'Word/PDF ไม่เกิน 20MB' },
}

export type StageWorkFiles = Partial<Record<BlogFileKind, File>>

interface StageSubmitViewProps {
  article: BlogArticle
  stageCode: BlogStageCode
  isPending?: boolean
  onCancel: () => void
  onSubmit: (payload: { message: string; linkUrl: string; files: StageWorkFiles }) => void
}

export function StageSubmitView({
  article,
  stageCode,
  isPending,
  onCancel,
  onSubmit,
}: StageSubmitViewProps) {
  const [message, setMessage] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [files, setFiles] = useState<StageWorkFiles>({})

  useEffect(() => {
    setMessage('')
    setLinkUrl('')
    setFiles({})
  }, [stageCode, article.id])

  const definition = getStageDefinition(stageCode)
  const missingRequired = definition.requiredFileKinds.filter((kind) => !files[kind])
  const isEmpty = !message.trim() && !linkUrl.trim() && Object.keys(files).length === 0
  const confirmLeave = useUnsavedGuard(!isEmpty)
  const previousRounds = article.submissions.filter((s) => s.stageCode === stageCode).length
  const normalizedLink = normalizeLinkUrl(linkUrl)
  const isLinkInvalid = linkUrl.trim().length > 0 && normalizedLink === null

  const leave = () => {
    if (confirmLeave()) onCancel()
  }

  return (
    <BlogPlanPageShell
      title={previousRounds > 0 ? `ส่งใหม่ (รอบ ${previousRounds + 1})` : 'ส่งงานให้ลูกค้า'}
      description={`${definition.label} · เรื่อง “${article.title}” — ลูกค้าจะเห็นข้อความ ลิงก์ และไฟล์ที่แนบทันทีหลังกดส่ง`}
      contextArticle={article}
      canManage
      onBack={leave}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="submit-message" className="text-[13px] font-medium">
          ข้อความถึงลูกค้า
        </Label>
        <Textarea
          id="submit-message"
          rows={18}
          className="min-h-80 resize-y rounded-[12px] leading-relaxed"
          maxLength={BLOG_MESSAGE_MAX_LENGTH}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="เช่น หัวข้อ / Main Idea ที่เสนอ หรือสรุปสิ่งที่แก้ไขในรอบนี้"
        />
        <div className="text-text-secondary flex flex-wrap justify-between gap-2 text-xs">
          <span>ขึ้นบรรทัดใหม่ได้ตามใจ ลูกค้าเห็นการจัดบรรทัดเหมือนที่พิมพ์</span>
          <span className="tabular-nums">
            {message.length.toLocaleString('th-TH')} /{' '}
            {BLOG_MESSAGE_MAX_LENGTH.toLocaleString('th-TH')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="submit-link" className="text-[13px] font-medium">
          ลิงก์ (ถ้ามี)
        </Label>
        <Input
          id="submit-link"
          type="url"
          className="h-11 rounded-[12px]"
          value={linkUrl}
          aria-invalid={isLinkInvalid}
          aria-describedby={isLinkInvalid ? 'submit-link-error' : undefined}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://docs.google.com/..."
        />
        {isLinkInvalid && (
          <span id="submit-link-error" className="text-danger-strong text-xs">
            ลิงก์นี้ยังใช้ไม่ได้ — ตรวจตัวสะกดอีกที (เช่น https://docs.google.com/...)
          </span>
        )}
      </div>

      {definition.fileKinds.map((kind) => (
        <FilePicker
          key={kind}
          kind={kind}
          file={files[kind] ?? null}
          isRequired={definition.requiredFileKinds.includes(kind)}
          onChange={(file) => setFiles((current) => ({ ...current, [kind]: file ?? undefined }))}
        />
      ))}

      <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
        {missingRequired.length > 0 && (
          <span className="text-text-secondary text-xs sm:mr-auto">
            ต้องแนบ
            {missingRequired.map((kind) => BLOG_FILE_KIND_LABELS[kind]).join(' และ ')}
            ให้ครบก่อนส่ง
          </span>
        )}
        <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
          <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={leave}>
            ยกเลิก
          </Button>
          <Button
            className="h-11 rounded-[12px] px-4"
            disabled={isPending || isEmpty || isLinkInvalid || missingRequired.length > 0}
            onClick={() =>
              onSubmit({ message: message.trim(), linkUrl: normalizedLink ?? '', files })
            }
          >
            <Send aria-hidden className="size-4" />
            ส่งให้ลูกค้า
          </Button>
        </div>
      </div>
    </BlogPlanPageShell>
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
      <Label className="text-[13px] font-medium">
        {label}
        <span className="text-text-secondary font-normal">
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
      <div className="border-border flex flex-wrap items-center gap-3 rounded-[14px] border border-dashed bg-white/60 p-3 dark:bg-white/5">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-[10px] px-3 text-[13px] sm:h-9"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip aria-hidden className="size-3.5" />
          เลือกไฟล์
        </Button>
        {file ? (
          <span className="flex min-w-0 items-center gap-1 text-[13px]">
            <span className="truncate font-medium">{file.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-11 shrink-0 rounded-[10px] sm:size-8"
              aria-label={`ลบ${label}`}
              onClick={() => onChange(null)}
            >
              <X className="size-3.5" />
            </Button>
          </span>
        ) : (
          <span className="text-text-secondary text-xs">{meta.hint}</span>
        )}
      </div>
    </div>
  )
}
