'use client'

import { Download, Eye, FileText, ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  const kind = getPreviewKind(file)
  const Icon = kind === 'image' ? ImageIcon : FileText

  return (
    <div
      className={cn(
        'border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border p-3',
        className,
      )}
    >
      <span
        className={cn(
          'border-border bg-muted flex h-11 w-9 shrink-0 items-center justify-center rounded-md border',
          kind === 'image' ? 'text-secondary-foreground' : 'text-info',
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="flex min-w-30 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{file.filename}</span>
        <span className="text-muted-foreground text-xs">{meta}</span>
        {subMeta && <span className="text-muted-foreground/80 text-xs">{subMeta}</span>}
      </div>

      <div className="flex shrink-0 gap-1.5">
        {kind !== 'none' && (
          <Button size="sm" variant="outline" onClick={() => onPreview(file)}>
            <Eye className="mr-1.5 size-3.5" />
            อ่านในหน้านี้
          </Button>
        )}
        <Button size="icon" variant="outline" className="size-9" asChild>
          <a href={file.url} download title="ดาวน์โหลด" aria-label={`ดาวน์โหลด ${file.filename}`}>
            <Download className="size-3.5" />
          </a>
        </Button>
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive size-9"
            disabled={isPending}
            title="ลบไฟล์"
            aria-label={`ลบ ${file.filename}`}
            onClick={() => onDelete(file.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
