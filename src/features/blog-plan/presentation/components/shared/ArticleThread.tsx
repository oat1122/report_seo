'use client'

import {
  Check,
  CircleCheckBig,
  ChevronDown,
  Clock,
  Info,
  LinkIcon,
  Pencil,
  Send,
  Undo2,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { FileAttachment } from './FileAttachment'
import { getCurrentStage } from './blog-plan-view'
import { BLOG_STAGES } from '../../../domain/policies/stage-schedule'
import { getClientStageLabel, getStageLabel } from '../../../domain/policies/article-status'
import type {
  BlogArticle,
  BlogArticleFeedback,
  BlogArticleFile,
  BlogArticleSubmission,
  BlogStageCode,
} from '../../../domain/BlogArticle'

type ThreadEntry =
  | { kind: 'submission'; at: Date; data: BlogArticleSubmission }
  | { kind: 'feedback'; at: Date; data: BlogArticleFeedback }

interface ArticleThreadProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  isPending?: boolean
  onPreviewFile: (file: BlogArticleFile) => void
  onApprove: (stageCode: BlogStageCode) => void
  onRequestChanges: (stageCode: BlogStageCode) => void
  onSubmitWork: (stageCode: BlogStageCode) => void
  onUnsubmit: (stageCode: BlogStageCode) => void
}

export function ArticleThread({
  article,
  canManage,
  canRespond,
  isPending,
  onPreviewFile,
  onApprove,
  onRequestChanges,
  onSubmitWork,
  onUnsubmit,
}: ArticleThreadProps) {
  const entries: ThreadEntry[] = [
    ...article.submissions.map(
      (data): ThreadEntry => ({ kind: 'submission', at: new Date(data.createdAt), data }),
    ),
    ...article.feedbacks.map(
      (data): ThreadEntry => ({ kind: 'feedback', at: new Date(data.createdAt), data }),
    ),
  ].sort((a, b) => a.at.getTime() - b.at.getTime())

  const submittedCodes = new Set(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  /** รอบล่าสุดของแต่ละ stage — ปุ่ม "ยกเลิกการส่ง" แปะไว้แค่บับเบิลล่าสุดของ stage นั้น */
  const latestSubmissionId = new Map(
    article.submissions.map((submission) => [submission.stageCode, submission.id]),
  )
  const pendingWriterStages = BLOG_STAGES.filter(
    (stage) => stage.actor === 'WRITER' && !submittedCodes.has(stage.code),
  )
  const current = getCurrentStage(article)
  const awaitsClient = canRespond && article.status === 'WAITING_CLIENT' && current !== null

  return (
    <div className="flex flex-col gap-4">
      {entries.length === 0 && (
        <p className="text-muted-foreground border-border rounded-xl border border-dashed p-6 text-center text-sm">
          ยังไม่มีการพูดคุยในบทความนี้
        </p>
      )}

      {entries.map((entry, index) => (
        <div key={entry.data.id} className="flex flex-col gap-4">
          {isNewDay(entries[index - 1], entry) && <DateDivider date={entry.at} />}
          {entry.kind === 'submission' ? (
            <SubmissionBubble
              submission={entry.data}
              stageLabel={canManage ? getStageLabel(entry.data.stageCode) : undefined}
              canUnsubmit={
                canManage &&
                submittedCodes.has(entry.data.stageCode) &&
                latestSubmissionId.get(entry.data.stageCode) === entry.data.id
              }
              isPending={isPending}
              onPreviewFile={onPreviewFile}
              onUnsubmit={() => onUnsubmit(entry.data.stageCode)}
            />
          ) : (
            <FeedbackBubble feedback={entry.data} isOwnSide={canRespond && !canManage} />
          )}
        </div>
      ))}

      {awaitsClient && current && (
        <div className="border-secondary bg-secondary/6 flex flex-col gap-3.5 rounded-2xl border-[1.5px] p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-secondary text-secondary-foreground flex size-7.5 items-center justify-center rounded-full">
              <UserRound className="size-4" />
            </span>
            <strong className="text-base font-semibold">
              ตาคุณแล้ว — อ่านงานที่ทีมส่งมา แล้วเลือกอย่างใดอย่างหนึ่ง
            </strong>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onApprove(current.definition.code)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex min-h-11 cursor-pointer flex-col items-start gap-1.5 rounded-xl p-4 text-left disabled:opacity-60"
            >
              <span className="flex items-center gap-2 text-base font-semibold">
                <CircleCheckBig className="size-4.5" />
                อนุมัติเลย
              </span>
              <span className="text-sm opacity-75">
                พอใจแล้ว ให้ทีมทำขั้นตอนถัดไปได้เลย · ทีมจะได้รับแจ้งทันที
              </span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => onRequestChanges(current.definition.code)}
              className="border-border bg-card hover:bg-muted flex min-h-11 cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-4 text-left disabled:opacity-60"
            >
              <span className="flex items-center gap-2 text-base font-semibold">
                <Pencil className="text-warning size-4.5" />
                ขอแก้ไข
              </span>
              <span className="text-muted-foreground text-sm">
                ยังไม่โอเค พิมพ์บอกทีมว่าอยากให้แก้ตรงไหน แล้วทีมจะส่งใหม่
              </span>
            </button>
          </div>

          {current.dueDate && (
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              ยังไม่พร้อมตอบตอนนี้ก็ได้ งานจะรอคุณอยู่ตรงนี้ แต่ถ้าเลย{' '}
              {formatShortDate(current.dueDate)} แผนทั้งเดือนจะเลื่อนตามไปด้วย
            </p>
          )}
        </div>
      )}

      {canManage && pendingWriterStages.length > 0 && (
        <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
          <span className="text-muted-foreground mr-auto text-sm">
            ขั้นตอนที่ยังไม่ได้ส่ง {pendingWriterStages.length} ขั้น
          </span>
          <Button
            disabled={isPending}
            onClick={() => onSubmitWork(pendingWriterStages[0].code)}
            className="min-h-11"
          >
            <Send className="mr-1.5 size-4" />
            ส่งงาน: {pendingWriterStages[0].label}
          </Button>
          {pendingWriterStages.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-h-11" disabled={isPending}>
                  ขั้นตอนอื่น
                  <ChevronDown className="ml-1.5 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pendingWriterStages.slice(1).map((stage) => (
                  <DropdownMenuItem key={stage.code} onClick={() => onSubmitWork(stage.code)}>
                    {stage.seq}. {stage.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {!awaitsClient && !canManage && current && (
        <div className="border-border bg-card flex items-center gap-3 rounded-xl border border-dashed p-4">
          <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <Clock className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm font-semibold">
              รอทีมเขียน{current.definition.actor === 'WRITER' ? '' : 'ดำเนินการต่อ'}
            </strong>
            <span className="text-muted-foreground text-sm">
              ตอนนี้คุณยังไม่ต้องทำอะไร พอทีมส่งมา เรื่องนี้จะเด้งขึ้นไปอยู่กลุ่ม “ถึงคิวคุณแล้ว”
              {current.dueDate ? ` · กำหนดส่ง ${formatShortDate(current.dueDate)}` : ''}
            </span>
          </div>
        </div>
      )}

      {!current && (
        <div className="border-success/35 bg-success/8 flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-success text-success-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <Check className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-success text-sm font-semibold">
              ผ่านครบทั้ง 7 ขั้นตอนแล้ว
            </strong>
            <span className="text-muted-foreground text-sm">
              ไฟล์ทุกเวอร์ชันยังเก็บไว้ให้ในแท็บ “ไฟล์ทั้งหมด”
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function isNewDay(previous: ThreadEntry | undefined, entry: ThreadEntry): boolean {
  if (!previous) return true
  return previous.at.toDateString() !== entry.at.toDateString()
}

function DateDivider({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">
        {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  )
}

function Avatar({ name, tone }: { name: string; tone: 'writer' | 'client' }) {
  return (
    <span
      className={cn(
        'flex size-8.5 shrink-0 items-center justify-center rounded-full text-sm font-medium',
        tone === 'writer'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground',
      )}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}

function SubmissionBubble({
  submission,
  stageLabel,
  canUnsubmit,
  isPending,
  onPreviewFile,
  onUnsubmit,
}: {
  submission: BlogArticleSubmission
  stageLabel?: string
  canUnsubmit: boolean
  isPending?: boolean
  onPreviewFile: (file: BlogArticleFile) => void
  onUnsubmit: () => void
}) {
  const author = submission.authorName ?? 'ทีมเขียน'

  return (
    <div className="flex items-start gap-3">
      <Avatar name={author} tone="writer" />
      <div className="flex max-w-160 min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="text-sm font-semibold">{author}</strong>
          <span className="text-muted-foreground text-xs">
            ทีมเขียน ·{' '}
            {new Date(submission.createdAt).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            น.
          </span>
          <Badge variant="outline" className="text-muted-foreground text-[11px]">
            {stageLabel ? `${stageLabel} · ` : ''}รอบ {submission.round}
          </Badge>
          {canUnsubmit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground h-7 px-2 text-xs"
              disabled={isPending}
              onClick={onUnsubmit}
            >
              <Undo2 className="mr-1 size-3.5" />
              ยกเลิกการส่ง
            </Button>
          )}
        </div>

        <div className="border-border bg-card flex flex-col gap-2.5 rounded-[4px_14px_14px_14px] border p-3.5">
          {submission.message && (
            <p className="text-sm leading-6 whitespace-pre-wrap">{submission.message}</p>
          )}

          {submission.linkUrl && (
            <a
              href={submission.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-info flex items-center gap-1.5 text-xs break-all underline"
            >
              <LinkIcon className="size-3.5 shrink-0" />
              {submission.linkUrl}
            </a>
          )}

          {submission.files.map((file) => (
            <FileAttachment
              key={file.id}
              file={file}
              meta={`เวอร์ชัน ${file.version}`}
              className="bg-muted"
              onPreview={onPreviewFile}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedbackBubble({
  feedback,
  isOwnSide,
}: {
  feedback: BlogArticleFeedback
  isOwnSide: boolean
}) {
  const isApproved = feedback.decision === 'APPROVED'
  const author = isOwnSide ? 'คุณ' : (feedback.authorName ?? 'ลูกค้า')

  return (
    <div className="flex items-start justify-end gap-3">
      <div className="flex max-w-160 min-w-0 flex-col items-end gap-1.5">
        <div className="flex flex-wrap items-baseline justify-end gap-2">
          <span className="text-muted-foreground text-xs">
            {new Date(feedback.createdAt).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            น.
          </span>
          <strong className="text-sm font-semibold">{author}</strong>
        </div>

        <div
          className={cn(
            'flex flex-col gap-2 rounded-[14px_4px_14px_14px] border p-3.5',
            isApproved ? 'border-success/35 bg-success/8' : 'border-warning/35 bg-warning/8',
          )}
        >
          <Badge
            className={cn(
              'w-fit',
              isApproved
                ? 'bg-success text-success-foreground'
                : 'bg-warning text-warning-foreground',
            )}
          >
            {isApproved ? 'อนุมัติแล้ว' : 'ขอแก้ไข'}
          </Badge>
          {feedback.comment && (
            <p className="text-sm leading-6 whitespace-pre-wrap">{feedback.comment}</p>
          )}
        </div>

        <span className="text-muted-foreground text-xs">
          {getClientStageLabel(feedback.stageCode)}
        </span>
      </div>
      <Avatar name={author} tone="client" />
    </div>
  )
}
