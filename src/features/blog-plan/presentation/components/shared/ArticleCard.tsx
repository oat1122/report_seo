'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { StageTimeline } from './StageTimeline'
import { StageSubmitDialog } from './StageSubmitDialog'
import { FeedbackDialog } from './FeedbackDialog'
import { BLOG_STAGES } from '../../../domain/policies/stage-schedule'
import { getNextPendingStage, getStageLabel } from '../../../domain/policies/article-status'
import type { BlogArticle, BlogFeedbackDecision, BlogStageCode } from '../../../domain/BlogArticle'

interface ArticleCardProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  /** true = การ์ดใบนี้เป็นงานที่ role ปัจจุบันต้องลงมือ จึงกางไว้ตั้งแต่แรก */
  defaultOpen: boolean
  isPending?: boolean
  onEdit?: (article: BlogArticle) => void
  onDelete?: (articleId: string) => void
  onSubmitWork: (
    articleId: string,
    stageCode: BlogStageCode,
    payload: { message: string; linkUrl: string; file: File | null },
  ) => void
  onUnsubmit: (articleId: string, stageCode: BlogStageCode) => void
  onRespond: (
    articleId: string,
    stageCode: BlogStageCode,
    decision: BlogFeedbackDecision,
    comment: string,
  ) => void
  onDeleteFile: (articleId: string, fileId: string) => void
}

export function ArticleCard({
  article,
  canManage,
  canRespond,
  defaultOpen,
  isPending,
  onEdit,
  onDelete,
  onSubmitWork,
  onUnsubmit,
  onRespond,
  onDeleteFile,
}: ArticleCardProps) {
  const [respondingStage, setRespondingStage] = useState<BlogStageCode | null>(null)
  const [submittingStage, setSubmittingStage] = useState<BlogStageCode | null>(null)

  const submittedCount = article.stages.filter((stage) => stage.submittedAt).length
  const nextStage = getNextPendingStage(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  const previousRounds = submittingStage
    ? article.submissions.filter((s) => s.stageCode === submittingStage).length
    : 0

  return (
    <Card>
      <Accordion type="single" collapsible defaultValue={defaultOpen ? 'article' : undefined}>
        <AccordionItem value="article" className="border-b-0">
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <AccordionTrigger className="min-w-0 flex-1 py-0 hover:no-underline">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ArticleStatusBadge status={article.status} />
                  <Badge variant="outline" className="text-muted-foreground tabular-nums">
                    {submittedCount}/{BLOG_STAGES.length} ขั้นตอน
                  </Badge>
                  {article.keyFocus && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {article.keyFocus}
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-semibold">{article.title}</h3>
                {nextStage && (
                  <p className="text-muted-foreground text-xs">ถัดไป: {getStageLabel(nextStage)}</p>
                )}
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
            </AccordionTrigger>

            <div className="flex shrink-0 items-center gap-1">
              {article.publishedUrl && (
                <Button size="icon" variant="ghost" className="size-8" asChild>
                  <a href={article.publishedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
              {canManage && onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => onEdit(article)}
                >
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

          <AccordionContent className="h-auto pb-0">
            <CardContent className="flex flex-col gap-4">
              <StageTimeline
                stages={article.stages}
                submissions={article.submissions}
                feedbacks={article.feedbacks}
                legacyFiles={article.legacyFiles}
                isPending={isPending}
                onSubmitWork={canManage ? setSubmittingStage : undefined}
                onUnsubmit={
                  canManage ? (stageCode) => onUnsubmit(article.id, stageCode) : undefined
                }
                onDeleteFile={canManage ? (fileId) => onDeleteFile(article.id, fileId) : undefined}
                onRespond={canRespond ? setRespondingStage : undefined}
              />
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
