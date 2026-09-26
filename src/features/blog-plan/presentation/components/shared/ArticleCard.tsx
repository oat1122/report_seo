'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { ArticleThread, ArticleThreadActions } from './ArticleThread'
import { ArticleFilesTab } from './ArticleFilesTab'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { FilePreviewDialog } from './FilePreviewDialog'
import { collectArticleFiles, daysUntil, getCurrentStage } from './blog-plan-view'
import { getArticleFlow } from '../../../domain/policies/stage-schedule'
import type { BlogArticle, BlogArticleFile, BlogStageCode } from '../../../domain/BlogArticle'

interface ArticleCardProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  /** true = บทความนี้เป็นงานที่ role ปัจจุบันต้องลงมือ จึงตีกรอบเน้นไว้ */
  isActionable: boolean
  isPending?: boolean
  onEdit?: (article: BlogArticle) => void
  onDelete?: (articleId: string) => void
  /** พาไปหน้าส่งงาน / หน้าขอแก้ไข — ฟอร์มยาวอยู่คนละหน้า ไม่ใช่ dialog */
  onOpenSubmit: (articleId: string, stageCode: BlogStageCode) => void
  onOpenFeedback: (articleId: string, stageCode: BlogStageCode) => void
  onUnsubmit: (articleId: string, stageCode: BlogStageCode) => void
  onApprove: (articleId: string, stageCode: BlogStageCode) => void
  onDeleteFile: (articleId: string, fileId: string) => void
}

export function ArticleCard({
  article,
  canManage,
  canRespond,
  isActionable,
  isPending,
  onEdit,
  onDelete,
  onOpenSubmit,
  onOpenFeedback,
  onUnsubmit,
  onApprove,
  onDeleteFile,
}: ArticleCardProps) {
  const [previewFile, setPreviewFile] = useState<BlogArticleFile | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  const current = getCurrentStage(article)
  const fileCount = collectArticleFiles(article).length
  const remainingDays = current?.dueDate ? daysUntil(current.dueDate) : null

  // เปิดเรื่องไหนก็เห็นข้อความล่าสุดก่อนเสมอ เหมือนเปิดห้องแชท
  const entryCount = article.submissions.length + article.feedbacks.length
  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [article.id, entryCount])

  return (
    <Card
      className={cn(
        'flex flex-col gap-0 overflow-hidden p-0 lg:h-[calc(100vh-2rem)]',
        isActionable && 'ring-info/60 ring-2',
      )}
    >
      {/* หัวการ์ด — ค้างไว้ ไม่เลื่อนหายไปกับข้อความ */}
      <div className="flex shrink-0 flex-col gap-4 px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="text-xl leading-snug font-semibold text-pretty">{article.title}</h3>

            <div className="flex flex-wrap items-center gap-2">
              <ArticleStatusBadge status={article.status} />
              {remainingDays !== null && current && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    remainingDays < 0
                      ? 'bg-danger-subtle text-danger-strong'
                      : 'bg-warning-subtle text-warning-text',
                  )}
                >
                  <Clock aria-hidden className="size-3" />
                  {remainingDays < 0
                    ? `เลยกำหนด ${formatShortDate(current.dueDate)} มา ${-remainingDays} วัน`
                    : `กำหนด ${formatShortDate(current.dueDate)} · อีก ${remainingDays} วัน`}
                </span>
              )}
            </div>

            {article.keyFocus && (
              <p className="text-text-secondary text-[13px] leading-relaxed">
                <span className="text-foreground font-medium">Key Focus:</span> {article.keyFocus}
              </p>
            )}

            {article.keywords.length > 0 && (
              <ul aria-label="Keyword ของบทความ" className="flex flex-wrap gap-1.5">
                {article.keywords.map((keyword) => (
                  <li
                    key={keyword.id}
                    className="bg-info-subtle text-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {keyword.keyword}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {article.publishedUrl && (
              <Button
                variant="outline"
                className="h-11 rounded-[10px] px-3 text-[13px] sm:h-9"
                asChild
              >
                <a
                  href={article.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="เปิดหน้าเว็บ"
                >
                  <ExternalLink aria-hidden className="size-3.5" />
                  <span className="hidden sm:inline">เปิดหน้าเว็บ</span>
                </a>
              </Button>
            )}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="size-11 rounded-[10px] p-0 sm:size-9"
                    aria-label="จัดการบทความ"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(article)}>
                      <Pencil className="mr-2 size-4" />
                      แก้ไขบทความ
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                      disabled={isPending}
                    >
                      <Trash2 className="mr-2 size-4" />
                      ลบบทความ
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <StageProgress article={article} canManage={canManage} />
      </div>

      {/* ตัวข้อความ/ไฟล์ = ส่วนเดียวที่เลื่อน */}
      <Tabs defaultValue="thread" className="min-h-0 flex-1 gap-0">
        <TabsList
          variant="line"
          className="border-border mx-5 w-auto shrink-0 justify-start gap-4 border-b sm:mx-6"
        >
          <TabsTrigger value="thread" className="flex-none px-1">
            <MessageSquare aria-hidden className="size-3.5" />
            การพูดคุย
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-none px-1">
            <FileText aria-hidden className="size-3.5" />
            ไฟล์ทั้งหมด
            <span className="bg-muted text-text-secondary rounded-full px-1.5 text-[11px] tabular-nums">
              {fileCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          ref={threadRef}
          value="thread"
          className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6"
        >
          <ArticleThread
            article={article}
            canManage={canManage}
            canRespond={canRespond}
            isPending={isPending}
            onPreviewFile={setPreviewFile}
            onUnsubmit={(stageCode) => onUnsubmit(article.id, stageCode)}
          />
        </TabsContent>

        <TabsContent value="files" className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
          <ArticleFilesTab
            article={article}
            canManage={canManage}
            isPending={isPending}
            onPreviewFile={setPreviewFile}
            onDeleteFile={(fileId) => onDeleteFile(article.id, fileId)}
          />
        </TabsContent>
      </Tabs>

      {/* แถบลงมือ — ค้างท้ายการ์ดเสมอ ไม่ต้องเลื่อนหา */}
      <ArticleThreadActions
        article={article}
        canManage={canManage}
        canRespond={canRespond}
        isPending={isPending}
        onApprove={(stageCode) => onApprove(article.id, stageCode)}
        onRequestChanges={(stageCode) => onOpenFeedback(article.id, stageCode)}
        onSubmitWork={(stageCode) => onOpenSubmit(article.id, stageCode)}
      />

      <FilePreviewDialog
        file={previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />

      {onDelete && (
        <ConfirmDeleteDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`ลบบทความ “${article.title}” ?`}
          consequences={[
            'บทความจะหายจากแผนของเดือนนี้ ทั้งฝั่งทีมเขียนและลูกค้า',
            `ข้อความในการพูดคุยและไฟล์ทุกเวอร์ชัน (${fileCount} ไฟล์) จะถูกลบไปด้วย`,
            'ลบแล้วกู้คืนไม่ได้',
          ]}
          confirmLabel="ลบบทความ"
          onConfirm={() => {
            setConfirmDelete(false)
            onDelete(article.id)
          }}
        />
      )}
    </Card>
  )
}

/** แถบขั้นตอนของบทความ — ผ่านแล้ว = เขียวแบรนด์, ขั้นปัจจุบัน = ม่วงเข้ม, ที่เหลือ = เทา */
function StageProgress({ article, canManage }: { article: BlogArticle; canManage: boolean }) {
  const submitted = new Set(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  const current = getCurrentStage(article)
  const flow = getArticleFlow(article.stages)

  return (
    <div className="flex flex-col gap-2">
      <div className="text-text-secondary flex flex-wrap items-center gap-x-2 text-xs">
        <strong className="text-foreground font-semibold">
          {current ? `ขั้นที่ ${current.step} จาก ${current.total}` : 'ส่งงานครบทุกขั้นแล้ว'}
        </strong>
        {current && (
          <>
            <span aria-hidden>·</span>
            <span>{canManage ? current.definition.label : current.definition.clientLabel}</span>
          </>
        )}
      </div>

      <ol className={cn('grid gap-1.5', flow.length > 1 ? 'grid-cols-5' : 'grid-cols-1')}>
        {flow.map((stage, index) => {
          const isDone = submitted.has(stage.code)
          const isCurrent = current?.definition.code === stage.code

          return (
            <li
              key={stage.code}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex min-w-0 flex-col gap-1.5"
            >
              <span
                aria-hidden
                className={cn(
                  'h-1.5 rounded-full',
                  isDone && 'bg-secondary',
                  isCurrent && 'bg-info-strong',
                  !isDone && !isCurrent && 'bg-border',
                )}
              />
              <span
                className={cn(
                  'text-[11px] leading-snug',
                  isCurrent ? 'text-foreground font-semibold' : 'text-text-secondary',
                )}
              >
                {flow.length > 1 ? `${index + 1}. ` : ''}
                {canManage ? stage.label : stage.clientLabel}
                {isDone && <span className="sr-only"> (ส่งแล้ว)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
