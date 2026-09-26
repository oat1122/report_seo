'use client'

import { formatShortDate } from '@/lib/date'
import { FileAttachment } from './FileAttachment'
import { formatFileSize } from './FilePreviewDialog'
import { collectArticleFiles } from './blog-plan-view'
import { getClientStageLabel, getStageLabel } from '../../../domain/policies/article-status'
import type { BlogArticle, BlogArticleFile } from '../../../domain/BlogArticle'

interface ArticleFilesTabProps {
  article: BlogArticle
  canManage: boolean
  isPending?: boolean
  onPreviewFile: (file: BlogArticleFile) => void
  onDeleteFile: (fileId: string) => void
}

export function ArticleFilesTab({
  article,
  canManage,
  isPending,
  onPreviewFile,
  onDeleteFile,
}: ArticleFilesTabProps) {
  const files = collectArticleFiles(article)

  if (files.length === 0) {
    return (
      <p className="text-text-secondary border-border rounded-2xl border border-dashed bg-white/40 p-6 text-center text-sm dark:bg-white/5">
        ยังไม่มีไฟล์ — ไฟล์บทความและภาพประกอบจะมาโผล่ที่นี่เมื่อทีมส่งในขั้นตอนถัดไป
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-text-secondary text-[13px]">
        ไฟล์ทุกเวอร์ชันของบทความนี้ เรียงจากใหม่ไปเก่า ดาวน์โหลดได้ตลอด
      </p>
      {files.map((file) => (
        <FileAttachment
          key={file.id}
          file={file}
          meta={`เวอร์ชัน ${file.version} · ${file.uploadedByName ?? 'ทีมเขียน'} ส่ง ${formatShortDate(file.createdAt)} · ${formatFileSize(file.sizeBytes)}`}
          subMeta={`อยู่ในขั้นตอน “${canManage ? getStageLabel(file.stageCode) : getClientStageLabel(file.stageCode)}”${file.round === null ? ' · ไฟล์เดิม' : ` · รอบ ${file.round}`}`}
          isPending={isPending}
          onPreview={onPreviewFile}
          onDelete={canManage ? onDeleteFile : undefined}
        />
      ))}
    </div>
  )
}
