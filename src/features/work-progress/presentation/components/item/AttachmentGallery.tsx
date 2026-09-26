'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ExternalLink, FileText, Link2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { displayFilename } from '@/lib/filename'
import { toast } from 'react-toastify'
import { formatThaiDate } from '../plan/planDisplay'
import {
  useAddLinkAttachment,
  useDeleteAttachment,
  useUploadAttachment,
} from '../../hooks/useAttachmentActions'
import type { WorkProgressAttachment } from '@/features/work-progress'

interface AttachmentGalleryProps {
  userId: string
  planId: string
  itemId: string
  attachments: WorkProgressAttachment[]
  readOnly?: boolean
}

const MAX_SIZE = 5 * 1024 * 1024

function formatSize(bytes: number | null): string | null {
  if (bytes == null) return null
  if (bytes < 1024 * 1024)
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('th-TH')} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function attachmentName(a: WorkProgressAttachment): string {
  return a.caption || (a.filename && displayFilename(a.filename)) || a.url
}

export function AttachmentGallery({
  userId,
  planId,
  itemId,
  attachments,
  readOnly,
}: AttachmentGalleryProps) {
  const uploadMut = useUploadAttachment()
  const linkMut = useAddLinkAttachment()
  const deleteMut = useDeleteAttachment()
  const inputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkCaption, setLinkCaption] = useState('')
  const [pendingDelete, setPendingDelete] = useState<WorkProgressAttachment | null>(null)

  const images = attachments.filter((a) => a.kind === 'IMAGE')
  const others = attachments.filter((a) => a.kind !== 'IMAGE')

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error('ไฟล์ใหญ่เกิน 5MB — ลดขนาดไฟล์หรือแนบเป็นลิงก์แทน')
      return
    }
    await uploadMut.mutateAsync({ userId, planId, itemId, file: f })
  }

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return
    await linkMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: { url: linkUrl.trim(), caption: linkCaption.trim() || null },
    })
    setLinkUrl('')
    setLinkCaption('')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteMut.mutate({
      userId,
      planId,
      itemId,
      attachmentId: pendingDelete.id,
    })
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((a) => (
            <div
              key={a.id}
              className="group border-glass-border bg-muted relative aspect-square overflow-hidden rounded-[12px] border"
            >
              <Image
                src={a.url}
                alt={a.caption ?? (a.filename ? displayFilename(a.filename) : null) ?? 'attachment'}
                fill
                sizes="200px"
                className="object-cover"
              />
              {!readOnly && (
                <Button
                  size="icon-sm"
                  variant="destructive"
                  className="absolute top-1.5 right-1.5 opacity-100 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0"
                  onClick={() => setPendingDelete(a)}
                  aria-label={`ลบรูป ${attachmentName(a)}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {others.map((a) => {
            const name = attachmentName(a)
            const meta = [
              a.kind === 'LINK' ? 'ลิงก์' : 'ไฟล์',
              formatSize(a.sizeBytes),
              formatThaiDate(a.createdAt),
            ].filter(Boolean)
            return (
              <li
                key={a.id}
                className="bg-muted/70 flex items-center gap-2.5 rounded-[12px] px-3 py-2"
              >
                <span
                  aria-hidden
                  className="bg-info-subtle text-info-strong flex size-8 shrink-0 items-center justify-center rounded-[10px]"
                >
                  {a.kind === 'LINK' ? (
                    <Link2 className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate text-[13px] font-medium hover:underline"
                  >
                    {name}
                  </a>
                  <span className="text-text-secondary text-xs">{meta.join(' · ')}</span>
                </span>
                <Button asChild size="icon-sm" variant="ghost">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`เปิด ${name} ในแท็บใหม่`}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                {!readOnly && (
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="text-danger-strong hover:text-danger-strong hover:bg-danger-subtle"
                    onClick={() => setPendingDelete(a)}
                    aria-label={`ลบ ${name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {attachments.length === 0 && (
        <p className="text-text-secondary text-[13px]">ยังไม่มีไฟล์ / ลิงก์</p>
      )}

      {!readOnly && (
        <div className="border-accent flex flex-col gap-3 rounded-[14px] border border-dashed bg-white/60 p-3.5 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePick}
              disabled={uploadMut.isPending}
            >
              <Upload className="size-4" />
              {uploadMut.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
            </Button>
            <span className="text-text-secondary text-xs">
              สูงสุด 5MB · png/jpg/webp/pdf/doc/xls
            </span>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFile}
              aria-label="เลือกไฟล์แนบ"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`att-link-${itemId}`} className="text-[13px]">
              หรือเพิ่มลิงก์
            </Label>
            <Input
              id={`att-link-${itemId}`}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              maxLength={2000}
            />
            <label htmlFor={`att-caption-${itemId}`} className="sr-only">
              คำอธิบายลิงก์
            </label>
            <Input
              id={`att-caption-${itemId}`}
              value={linkCaption}
              onChange={(e) => setLinkCaption(e.target.value)}
              placeholder="คำอธิบาย (ไม่บังคับ)"
              maxLength={500}
            />
            <Button
              type="button"
              size="sm"
              variant="soft"
              onClick={handleAddLink}
              disabled={!linkUrl.trim() || linkMut.isPending}
              className="self-start"
            >
              <Link2 className="size-4" />
              {linkMut.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มลิงก์'}
            </Button>
          </div>
        </div>
      )}

      <ConfirmAlert
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="ลบไฟล์แนบ"
        message={
          pendingDelete
            ? `ลบ “${attachmentName(pendingDelete)}” ออกจาก item นี้ — ไฟล์ที่อัปโหลดจะถูกลบถาวรและย้อนกลับไม่ได้`
            : ''
        }
      />
    </div>
  )
}
