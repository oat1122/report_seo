'use client'

import { useRef } from 'react'
import { Download, FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { BlogArticleFile, BlogFileKind } from '../../../domain/BlogArticle'

const KIND_META: Record<BlogFileKind, { label: string; accept: string; hint: string }> = {
  COVER_IMAGE: { label: 'ภาพปก', accept: '.jpg,.jpeg,.png', hint: 'JPG/PNG ไม่เกิน 5MB' },
  ARTICLE_DOC: {
    label: 'ไฟล์บทความ',
    accept: '.doc,.docx,.pdf',
    hint: 'Word/PDF ไม่เกิน 20MB',
  },
}

interface ArticleFilesPanelProps {
  files: BlogArticleFile[]
  canManage: boolean
  isPending?: boolean
  onUpload?: (file: File, kind: BlogFileKind) => void
  onDelete?: (fileId: string) => void
}

export function ArticleFilesPanel({
  files,
  canManage,
  isPending,
  onUpload,
  onDelete,
}: ArticleFilesPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(KIND_META) as BlogFileKind[]).map((kind) => (
        <FileKindColumn
          key={kind}
          kind={kind}
          files={files.filter((file) => file.kind === kind)}
          canManage={canManage}
          isPending={isPending}
          onUpload={onUpload}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function FileKindColumn({
  kind,
  files,
  canManage,
  isPending,
  onUpload,
  onDelete,
}: { kind: BlogFileKind; files: BlogArticleFile[] } & Omit<ArticleFilesPanelProps, 'files'>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const meta = KIND_META[kind]
  const Icon = kind === 'COVER_IMAGE' ? ImageIcon : FileText

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="text-muted-foreground size-4" />
          {meta.label}
        </span>
        {canManage && onUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={meta.accept}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(file, kind)
                event.target.value = ''
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1 size-3.5" />
              อัปโหลด
            </Button>
          </>
        )}
      </div>

      {files.length === 0 ? (
        <p className="text-muted-foreground text-xs">ยังไม่มีไฟล์ · {meta.hint}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={file.id}
              className={cn(
                'flex items-center gap-2 rounded px-2 py-1.5 text-xs',
                index === 0 ? 'bg-success/5' : 'bg-muted/40',
              )}
            >
              <Badge variant="outline" className="shrink-0 text-[10px]">
                v{file.version}
              </Badge>
              <span className="truncate font-medium">{file.filename}</span>
              <span className="text-muted-foreground ml-auto shrink-0">
                {formatShortDate(file.createdAt)}
              </span>
              <Button size="icon" variant="ghost" className="size-7 shrink-0" asChild>
                <a href={file.url} download title="ดาวน์โหลด">
                  <Download className="size-3.5" />
                </a>
              </Button>
              {canManage && onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive size-7 shrink-0"
                  disabled={isPending}
                  onClick={() => onDelete(file.id)}
                  title="ลบไฟล์"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
