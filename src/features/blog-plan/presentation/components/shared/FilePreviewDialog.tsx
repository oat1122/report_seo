'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/date'
import { displayFilename } from '@/lib/filename'
import type { BlogArticleFile } from '../../../domain/BlogArticle'

/**
 * ชนิดที่ browser เปิดในหน้าได้เอง — .doc/.docx ต้องดาวน์โหลด (ไม่พึ่ง viewer ภายนอก)
 * ใช้นามสกุลไฟล์เป็นเกณฑ์รอง เพราะ mimeType ของไฟล์เก่าบางตัวเป็น application/octet-stream
 */
export function getPreviewKind(file: Pick<BlogArticleFile, 'mimeType' | 'filename'>) {
  const name = file.filename.toLowerCase()
  if (file.mimeType.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif)$/.test(name))
    return 'image'
  if (file.mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  return 'none' as const
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface FilePreviewDialogProps {
  file: BlogArticleFile | null
  onOpenChange: (open: boolean) => void
}

export function FilePreviewDialog({ file, onOpenChange }: FilePreviewDialogProps) {
  const kind = file ? getPreviewKind(file) : 'none'
  const name = file ? displayFilename(file.filename) : ''

  return (
    <Dialog open={Boolean(file)} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4 rounded-3xl p-5 sm:max-w-3xl sm:p-6">
        <DialogHeader className="gap-1 pr-10">
          <DialogTitle className="truncate text-lg font-semibold">{name}</DialogTitle>
          <DialogDescription className="text-text-secondary text-[13px]">
            เวอร์ชัน {file?.version} · {file?.uploadedByName ?? 'ทีมเขียน'} ส่ง{' '}
            {formatShortDate(file?.createdAt)} · {file ? formatFileSize(file.sizeBytes) : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted flex min-h-64 flex-1 items-center justify-center overflow-auto rounded-2xl p-4">
          {file && kind === 'image' && (
            <Image
              src={file.url}
              alt={name}
              width={1200}
              height={630}
              unoptimized
              className="h-auto max-h-[60vh] w-auto max-w-full rounded-lg object-contain"
            />
          )}
          {file && kind === 'pdf' && (
            <iframe src={file.url} title={name} className="h-[60vh] w-full rounded-lg" />
          )}
          {kind === 'none' && (
            <p className="text-text-secondary max-w-sm px-6 text-center text-sm leading-relaxed">
              ไฟล์ชนิดนี้เปิดอ่านในหน้าเว็บไม่ได้ กดดาวน์โหลดเพื่อเปิดด้วยโปรแกรมในเครื่องนะครับ
            </p>
          )}
        </div>

        <Button asChild className="h-11 w-full rounded-[12px] px-4 sm:w-fit sm:self-end">
          <a href={file?.url} download={name}>
            <Download className="size-4" />
            ดาวน์โหลด
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
