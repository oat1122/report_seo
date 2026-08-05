'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { ArticleThread } from './ArticleThread'
import { ArticleFilesTab } from './ArticleFilesTab'
import { StageSubmitDialog, type StageWorkFiles } from './StageSubmitDialog'
import { FeedbackDialog } from './FeedbackDialog'
import { FilePreviewDialog } from './FilePreviewDialog'
import { collectArticleFiles, daysUntil, getCurrentStage } from './blog-plan-view'
import { getArticleFlow } from '../../../domain/policies/stage-schedule'
import type { BlogArticle, BlogArticleFile, BlogStageCode } from '../../../domain/BlogArticle'

interface ArticleCardProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  /** true = การ์ดใบนี้เป็นงานที่ role ปัจจุบันต้องลงมือ จึงกางไว้ตั้งแต่แรกและตีกรอบเน้น */
  isActionable: boolean
  isPending?: boolean
  onEdit?: (article: BlogArticle) => void
  onDelete?: (articleId: string) => void
  onSubmitWork: (
    articleId: string,
    stageCode: BlogStageCode,
    payload: { message: string; linkUrl: string; files: StageWorkFiles },
  ) => void
  onUnsubmit: (articleId: string, stageCode: BlogStageCode) => void
  onApprove: (articleId: string, stageCode: BlogStageCode) => void
  onRequestChanges: (articleId: string, stageCode: BlogStageCode, comment: string) => void
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
  onSubmitWork,
  onUnsubmit,
  onApprove,
  onRequestChanges,
  onDeleteFile,
}: ArticleCardProps) {
  const [isOpen, setOpen] = useState(isActionable)
  const [submittingStage, setSubmittingStage] = useState<BlogStageCode | null>(null)
  const [respondingStage, setRespondingStage] = useState<BlogStageCode | null>(null)
  const [previewFile, setPreviewFile] = useState<BlogArticleFile | null>(null)

  const current = getCurrentStage(article)
  const fileCount = collectArticleFiles(article).length
  const previousRounds = submittingStage
    ? article.submissions.filter((s) => s.stageCode === submittingStage).length
    : 0
  const remainingDays = current?.dueDate ? daysUntil(current.dueDate) : null

  return (
    <Card
      className={cn('gap-0 overflow-hidden p-0', isActionable && 'ring-secondary shadow-md ring-2')}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-65 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <ArticleStatusBadge status={article.status} />
              {remainingDays !== null && current && (
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1.5',
                    remainingDays < 0
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : 'bg-warning/10 text-warning border-warning/30',
                  )}
                >
                  <Clock className="size-3" />
                  {remainingDays < 0
                    ? `เลยกำหนด ${formatShortDate(current.dueDate)} มา ${-remainingDays} วัน`
                    : `กำหนด ${formatShortDate(current.dueDate)} · อีก ${remainingDays} วัน`}
                </Badge>
              )}
              {article.keyFocus && (
                <Badge variant="outline" className="text-muted-foreground">
                  {article.keyFocus}
                </Badge>
              )}
            </div>

            <h3 className="text-lg leading-7 font-semibold text-pretty">{article.title}</h3>

            {article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {article.keywords.map((keyword) => (
                  <Badge
                    key={keyword.id}
                    variant="outline"
                    className="text-muted-foreground bg-muted text-xs"
                  >
                    {keyword.keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {article.publishedUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={article.publishedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 size-3.5" />
                  เปิดหน้าเว็บ
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={isOpen}
            >
              {isOpen ? 'ย่อ' : 'ดูรายละเอียด'}
              {isOpen ? (
                <ChevronUp className="ml-1.5 size-3.5" />
              ) : (
                <ChevronDown className="ml-1.5 size-3.5" />
              )}
            </Button>
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="size-9" aria-label="จัดการบทความ">
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
                      onClick={() => onDelete(article.id)}
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

      {isOpen && (
        <div className="border-border bg-muted/40 border-t">
          <Tabs defaultValue="thread" className="gap-0">
            <TabsList className="mx-5 mt-3">
              <TabsTrigger value="thread">
                <MessageSquare className="mr-1.5 size-3.5" />
                การพูดคุย
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="mr-1.5 size-3.5" />
                ไฟล์ทั้งหมด
                <Badge variant="secondary" className="ml-1.5 tabular-nums">
                  {fileCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="p-5">
              <ArticleThread
                article={article}
                canManage={canManage}
                canRespond={canRespond}
                isPending={isPending}
                onPreviewFile={setPreviewFile}
                onApprove={(stageCode) => onApprove(article.id, stageCode)}
                onRequestChanges={setRespondingStage}
                onSubmitWork={setSubmittingStage}
                onUnsubmit={(stageCode) => onUnsubmit(article.id, stageCode)}
              />
            </TabsContent>

            <TabsContent value="files" className="p-5">
              <ArticleFilesTab
                article={article}
                canManage={canManage}
                isPending={isPending}
                onPreviewFile={setPreviewFile}
                onDeleteFile={(fileId) => onDeleteFile(article.id, fileId)}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <StageSubmitDialog
        stageCode={submittingStage}
        previousRounds={previousRounds}
        isPending={isPending}
        onOpenChange={(open) => !open && setSubmittingStage(null)}
        onSubmit={(payload) => {
          if (!submittingStage) return
          onSubmitWork(article.id, submittingStage, payload)
          setSubmittingStage(null)
        }}
      />

      <FeedbackDialog
        stageCode={respondingStage}
        articleTitle={article.title}
        isPending={isPending}
        onOpenChange={(open) => !open && setRespondingStage(null)}
        onSubmit={(comment) => {
          if (!respondingStage) return
          onRequestChanges(article.id, respondingStage, comment)
          setRespondingStage(null)
        }}
      />

      <FilePreviewDialog
        file={previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </Card>
  )
}

/** แถบขั้นตอนของบทความ — ผ่านแล้ว = เข้ม, ขั้นปัจจุบัน = เขียวมีวงแหวน, ที่เหลือ = จาง */
function StageProgress({ article, canManage }: { article: BlogArticle; canManage: boolean }) {
  const submitted = new Set(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  const current = getCurrentStage(article)
  const flow = getArticleFlow(article.stages)

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <strong className="text-foreground font-semibold">
          {current ? `ขั้นที่ ${current.step} จาก ${current.total}` : 'ส่งงานครบทุกขั้นแล้ว'}
        </strong>
        {current && (
          <>
            <span>·</span>
            <span>{canManage ? current.definition.label : current.definition.clientLabel}</span>
          </>
        )}
      </div>

      <ol className="flex gap-1.5">
        {flow.map((stage) => {
          const isDone = submitted.has(stage.code)
          const isCurrent = current?.definition.code === stage.code

          return (
            <li key={stage.code} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  'h-1.5 rounded-full',
                  isDone && 'bg-primary',
                  isCurrent && 'bg-secondary ring-secondary/35 ring-2',
                  !isDone && !isCurrent && 'bg-muted-foreground/20',
                )}
              />
              <span
                className={cn(
                  'truncate text-center text-[10.5px]',
                  isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground',
                )}
              >
                {canManage ? stage.label : stage.clientLabel}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
