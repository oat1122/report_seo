'use client'

import { useState } from 'react'
import { Download, Eye, FileText, ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { displayFilename } from '@/lib/filename'
import { cn } from '@/lib/utils'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { getPreviewKind } from './FilePreviewDialog'
import type { BlogArticleFile } from '../../../domain/BlogArticle'

interface FileAttachmentProps {
  file: BlogArticleFile
  /** บรรทัดรองใต้ชื่อไฟล์ — แต่ละที่เล่ารายละเอียดไม่เท่ากัน */
  meta: string
  /** บรรทัดที่สาม เช่น ขั้นตอนที่ไฟล์ถูกส่ง (ใช้ในแท็บไฟล์ทั้งหมด) */
  subMeta?: string
  isPending?: boolean
  onPreview: (file: BlogArticleFile) => void
  onDelete?: (fileId: string) => void
  className?: string
}

export function FileAttachment({
  file,
  meta,
  subMeta,
  isPending,
  onPreview,
  onDelete,
  className,
}: FileAttachmentProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const kind = getPreviewKind(file)
  const Icon = kind === 'image' ? ImageIcon : FileText
  const name = displayFilename(file.filename)

  return (
    <div
      className={cn(
        'border-border flex flex-wrap items-center gap-3 rounded-[14px] border bg-white/80 p-3 dark:bg-white/5',
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[10px]"
      >
        <Icon className="size-4.5" />
      </span>

      <div className="flex min-w-30 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="text-text-secondary text-xs">{meta}</span>
        {subMeta && <span className="text-text-secondary text-xs">{subMeta}</span>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {kind !== 'none' && (
          <Button
            variant="outline"
            className="h-11 rounded-[10px] px-3 text-[13px] sm:h-9"
            onClick={() => onPreview(file)}
          >
            <Eye className="size-3.5" />
            อ่านในหน้านี้
          </Button>
        )}
        <Button variant="outline" className="size-11 rounded-[10px] p-0 sm:size-9" asChild>
          <a href={file.url} download={name} title="ดาวน์โหลด" aria-label={`ดาวน์โหลด ${name}`}>
            <Download className="size-4" />
          </a>
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong size-11 rounded-[10px] p-0 sm:size-9"
            disabled={isPending}
            title="ลบไฟล์"
            aria-label={`ลบ ${name}`}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {onDelete && (
        <ConfirmDeleteDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`ลบไฟล์ “${name}” ?`}
          consequences={[
            'ไฟล์เวอร์ชันนี้จะถูกลบออกจากระบบ ทั้งทีมและลูกค้าจะดาวน์โหลดไม่ได้อีก',
            'ข้อความในการพูดคุยยังอยู่ครบ หายไปเฉพาะไฟล์แนบนี้',
            'ลบแล้วกู้คืนไม่ได้',
          ]}
          confirmLabel="ลบไฟล์"
          onConfirm={() => {
            setConfirmOpen(false)
            onDelete(file.id)
          }}
        />
      )}
    </div>
  )
}
