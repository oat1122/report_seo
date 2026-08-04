'use client'

import { useState } from 'react'
import { ExternalLink, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatShortDate } from '@/lib/date'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { ArticleFilesPanel } from './ArticleFilesPanel'
import { StageTimeline } from './StageTimeline'
import { FeedbackDialog } from './FeedbackDialog'
import { getStageLabel } from '../../../domain/policies/article-status'
import type {
  BlogArticle,
  BlogFeedbackDecision,
  BlogFileKind,
  BlogStageCode,
} from '../../../domain/BlogArticle'

interface ArticleCardProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  isPending?: boolean
  onEdit?: (article: BlogArticle) => void
  onDelete?: (articleId: string) => void
  onToggleStage: (articleId: string, stageCode: BlogStageCode, submitted: boolean) => void
  onRespond: (
    articleId: string,
    stageCode: BlogStageCode,
    decision: BlogFeedbackDecision,
    comment: string,
  ) => void
  onUploadFile: (articleId: string, file: File, kind: BlogFileKind) => void
  onDeleteFile: (articleId: string, fileId: string) => void
}

export function ArticleCard({
  article,
  canManage,
  canRespond,
  isPending,
  onEdit,
  onDelete,
  onToggleStage,
  onRespond,
  onUploadFile,
  onDeleteFile,
}: ArticleCardProps) {
  const [respondingStage, setRespondingStage] = useState<BlogStageCode | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <ArticleStatusBadge status={article.status} />
            {article.keyFocus && (
              <Badge variant="outline" className="text-muted-foreground">
                {article.keyFocus}
              </Badge>
            )}
          </div>
          <h3 className="text-base font-semibold">{article.title}</h3>
          {article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.keywords.map((keyword) => (
                <Badge key={keyword.id} variant="outline" className="bg-secondary/15 text-xs">
                  {keyword.keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {article.publishedUrl && (
            <Button size="icon" variant="ghost" className="size-8" asChild>
              <a href={article.publishedUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
          {canManage && onEdit && (
            <Button size="icon" variant="ghost" className="size-8" onClick={() => onEdit(article)}>
              <Pencil className="size-4" />
            </Button>
          )}
          {canManage && onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive size-8"
              onClick={() => onDelete(article.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <StageTimeline
          stages={article.stages}
          isPending={isPending}
          onToggleSubmit={
            canManage
              ? (stageCode, submitted) => onToggleStage(article.id, stageCode, submitted)
              : undefined
          }
          onRespond={canRespond ? (stageCode) => setRespondingStage(stageCode) : undefined}
        />

        <Separator />

        <ArticleFilesPanel
          files={article.files}
          canManage={canManage}
          isPending={isPending}
          onUpload={(file, kind) => onUploadFile(article.id, file, kind)}
          onDelete={(fileId) => onDeleteFile(article.id, fileId)}
        />

        {article.feedbacks.length > 0 && (
          <>
            <Separator />
            <ul className="flex flex-col gap-2">
              {article.feedbacks.map((feedback) => (
                <li key={feedback.id} className="bg-muted/40 rounded-md px-3 py-2 text-sm">
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <MessageSquare className="size-3.5" />
                    <span>{getStageLabel(feedback.stageCode)}</span>
                    <Badge
                      variant="outline"
                      className={
                        feedback.decision === 'APPROVED'
                          ? 'bg-success/10 text-success border-success/30 text-[10px]'
                          : 'bg-destructive/10 text-destructive border-destructive/30 text-[10px]'
                      }
                    >
                      {feedback.decision === 'APPROVED' ? 'อนุมัติ' : 'ขอแก้ไข'}
                    </Badge>
                    <span className="ml-auto">
                      {feedback.authorName ?? 'ลูกค้า'} · {formatShortDate(feedback.createdAt)}
                    </span>
                  </div>
                  {feedback.comment && <p className="mt-1">{feedback.comment}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>

      <FeedbackDialog
        stageCode={respondingStage}
        isPending={isPending}
        onOpenChange={(open) => !open && setRespondingStage(null)}
        onSubmit={(decision, comment) => {
          if (!respondingStage) return
          onRespond(article.id, respondingStage, decision, comment)
          setRespondingStage(null)
        }}
      />
    </Card>
  )
}
