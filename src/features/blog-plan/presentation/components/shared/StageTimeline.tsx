'use client'

import { Check, CircleDashed, Clock, Download, LinkIcon, MessageSquare, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { BLOG_STAGES, LEGACY_FILE_STAGE } from '../../../domain/policies/stage-schedule'
import type {
  BlogArticleFeedback,
  BlogArticleFile,
  BlogArticleStage,
  BlogArticleSubmission,
  BlogStageCode,
} from '../../../domain/BlogArticle'

interface StageTimelineProps {
  stages: BlogArticleStage[]
  submissions: BlogArticleSubmission[]
  feedbacks: BlogArticleFeedback[]
  legacyFiles: BlogArticleFile[]
  /** writer/admin ส่งงาน–ยกเลิกส่งได้เฉพาะ stage ของฝั่งตัวเอง */
  onSubmitWork?: (stageCode: BlogStageCode) => void
  onUnsubmit?: (stageCode: BlogStageCode) => void
  onDeleteFile?: (fileId: string) => void
  /** ลูกค้า/admin ตอบ stage ของฝั่งลูกค้า */
  onRespond?: (stageCode: BlogStageCode) => void
  isPending?: boolean
}

export function StageTimeline({
  stages,
  submissions,
  feedbacks,
  legacyFiles,
  onSubmitWork,
  onUnsubmit,
  onDeleteFile,
  onRespond,
  isPending,
}: StageTimelineProps) {
  const byCode = new Map(stages.map((stage) => [stage.stageCode, stage]))

  return (
    <ol className="flex flex-col gap-2">
      {BLOG_STAGES.map((definition) => {
        const stage = byCode.get(definition.code)
        const isDone = Boolean(stage?.submittedAt)
        const isClientStage = definition.actor === 'CLIENT'
        const isOverdue =
          !isDone && stage?.dueDate ? new Date(stage.dueDate).getTime() < Date.now() : false

        const stageSubmissions = submissions.filter((s) => s.stageCode === definition.code)
        const stageFeedbacks = feedbacks.filter((f) => f.stageCode === definition.code)
        const stageLegacyFiles = legacyFiles.filter(
          (file) => LEGACY_FILE_STAGE[file.kind] === definition.code,
        )
        const thread = [...stageSubmissions, ...stageFeedbacks].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )

        return (
          <li
            key={definition.code}
            className={cn(
              'flex flex-col gap-2 rounded-md border px-3 py-2 text-sm',
              isDone ? 'border-success/30 bg-success/5' : 'border-border bg-card',
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">
                {definition.seq}
              </span>

              {isDone ? (
                <Check className="text-success size-4 shrink-0" />
              ) : isOverdue ? (
                <Clock className="text-destructive size-4 shrink-0" />
              ) : (
                <CircleDashed className="text-muted-foreground size-4 shrink-0" />
              )}

              <span className="min-w-40 flex-1 font-medium">{definition.label}</span>

              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 text-xs',
                  isClientStage
                    ? 'bg-info/10 text-info border-info/30'
                    : 'bg-muted text-muted-foreground border-border',
                )}
              >
                {isClientStage ? 'ลูกค้า' : 'ทีมเขียน'}
              </Badge>

              <span
                className={cn(
                  'shrink-0 text-xs tabular-nums',
                  isOverdue ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                กำหนด: {formatShortDate(stage?.dueDate)}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                ส่งจริง: {formatShortDate(stage?.submittedAt)}
              </span>

              {!isClientStage && onSubmitWork && !isDone && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => onSubmitWork(definition.code)}
                >
                  {stageSubmissions.length > 0 ? 'ส่งใหม่' : 'ส่งให้ลูกค้า'}
                </Button>
              )}

              {!isClientStage && onUnsubmit && isDone && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => onUnsubmit(definition.code)}
                >
                  ยกเลิกการส่ง
                </Button>
              )}

              {isClientStage && onRespond && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => onRespond(definition.code)}
                >
                  {isDone ? 'ตอบใหม่' : 'ให้ความเห็น'}
                </Button>
              )}
            </div>

            {(thread.length > 0 || stageLegacyFiles.length > 0) && (
              <ol className="border-border ml-5 flex flex-col gap-2 border-l pl-3">
                {stageLegacyFiles.length > 0 && (
                  <li className="bg-muted/40 flex flex-col gap-1.5 rounded-md px-3 py-2">
                    <span className="text-muted-foreground text-xs">ไฟล์เดิม</span>
                    <FileList
                      files={stageLegacyFiles}
                      isPending={isPending}
                      onDelete={onDeleteFile}
                    />
                  </li>
                )}
                {thread.map((entry) =>
                  'round' in entry ? (
                    <SubmissionEntry
                      key={entry.id}
                      submission={entry}
                      isPending={isPending}
                      onDeleteFile={onDeleteFile}
                    />
                  ) : (
                    <FeedbackEntry key={entry.id} feedback={entry} />
                  ),
                )}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function SubmissionEntry({
  submission,
  isPending,
  onDeleteFile,
}: {
  submission: BlogArticleSubmission
  isPending?: boolean
  onDeleteFile?: (fileId: string) => void
}) {
  return (
    <li className="bg-muted/40 flex flex-col gap-1.5 rounded-md px-3 py-2">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" className="bg-card text-[10px]">
          ส่งรอบ {submission.round}
        </Badge>
        <span className="ml-auto">
          {submission.authorName ?? 'ทีมเขียน'} · {formatShortDate(submission.createdAt)}
        </span>
      </div>

      {submission.message && <p className="whitespace-pre-wrap">{submission.message}</p>}

      {submission.linkUrl && (
        <a
          href={submission.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info flex items-center gap-1 text-xs break-all underline"
        >
          <LinkIcon className="size-3.5 shrink-0" />
          {submission.linkUrl}
        </a>
      )}

      {submission.files.length > 0 && (
        <FileList files={submission.files} isPending={isPending} onDelete={onDeleteFile} />
      )}
    </li>
  )
}

function FeedbackEntry({ feedback }: { feedback: BlogArticleFeedback }) {
  const isApproved = feedback.decision === 'APPROVED'

  return (
    <li className="bg-info/5 border-info/20 flex flex-col gap-1 rounded-md border px-3 py-2">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <MessageSquare className="size-3.5" />
        <Badge
          variant="outline"
          className={cn(
            'text-[10px]',
            isApproved
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-destructive/10 text-destructive border-destructive/30',
          )}
        >
          {isApproved ? 'ลูกค้าอนุมัติ' : 'ลูกค้าขอแก้ไข'}
        </Badge>
        <span className="ml-auto">
          {feedback.authorName ?? 'ลูกค้า'} · {formatShortDate(feedback.createdAt)}
        </span>
      </div>
      {feedback.comment && <p className="whitespace-pre-wrap">{feedback.comment}</p>}
    </li>
  )
}

function FileList({
  files,
  isPending,
  onDelete,
}: {
  files: BlogArticleFile[]
  isPending?: boolean
  onDelete?: (fileId: string) => void
}) {
  return (
    <ul className="flex flex-col gap-1">
      {files.map((file) => (
        <li key={file.id} className="bg-card flex items-center gap-2 rounded px-2 py-1.5 text-xs">
          <Badge variant="outline" className="shrink-0 text-[10px]">
            v{file.version}
          </Badge>
          <span className="truncate font-medium">{file.filename}</span>
          <Button size="icon" variant="ghost" className="ml-auto size-7 shrink-0" asChild>
            <a href={file.url} download title="ดาวน์โหลด">
              <Download className="size-3.5" />
            </a>
          </Button>
          {onDelete && (
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
  )
}
