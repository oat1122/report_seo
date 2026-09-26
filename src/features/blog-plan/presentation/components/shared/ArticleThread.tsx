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
import { getArticleFlow } from '../../../domain/policies/stage-schedule'
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
  /** ไม่ส่ง = อ่านอย่างเดียว (คอลัมน์ประกอบในหน้าฟอร์ม) — ปุ่มยกเลิกการส่งจะไม่ขึ้น */
  onUnsubmit?: (stageCode: BlogStageCode) => void
}

/** เนื้อบทสนทนาล้วน ๆ — ส่วนที่ต้องเลื่อน ปุ่มลงมืออยู่ที่ <ArticleThreadActions> แยกไว้ค้างท้ายการ์ด */
export function ArticleThread({
  article,
  canManage,
  canRespond,
  isPending,
  onPreviewFile,
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

  return (
    <div className="flex flex-col gap-3.5">
      {entries.length === 0 && (
        <p className="text-text-secondary border-border rounded-2xl border border-dashed bg-white/40 p-6 text-center text-sm dark:bg-white/5">
          ยังไม่มีการพูดคุยในบทความนี้
        </p>
      )}

      {entries.map((entry, index) => (
        <div key={entry.data.id} className="flex flex-col gap-3.5">
          {isNewDay(entries[index - 1], entry) && <DateDivider date={entry.at} />}
          {entry.kind === 'submission' ? (
            <SubmissionBubble
              submission={entry.data}
              stageLabel={canManage ? getStageLabel(entry.data.stageCode) : undefined}
              canUnsubmit={
                Boolean(onUnsubmit) &&
                canManage &&
                submittedCodes.has(entry.data.stageCode) &&
                latestSubmissionId.get(entry.data.stageCode) === entry.data.id
              }
              isPending={isPending}
              onPreviewFile={onPreviewFile}
              onUnsubmit={() => onUnsubmit?.(entry.data.stageCode)}
            />
          ) : (
            <FeedbackBubble feedback={entry.data} isOwnSide={canRespond && !canManage} />
          )}
        </div>
      ))}
    </div>
  )
}

interface ArticleThreadActionsProps {
  article: BlogArticle
  canManage: boolean
  canRespond: boolean
  isPending?: boolean
  onApprove?: (stageCode: BlogStageCode) => void
  onRequestChanges?: (stageCode: BlogStageCode) => void
  onSubmitWork?: (stageCode: BlogStageCode) => void
}

/** แถบลงมือท้ายบทสนทนา — แยกจากตัวข้อความเพื่อให้ค้างไว้ท้ายการ์ดได้เหมือนช่องพิมพ์ของแอปแชท */
export function ArticleThreadActions({
  article,
  canManage,
  canRespond,
  isPending,
  onApprove,
  onRequestChanges,
  onSubmitWork,
}: ArticleThreadActionsProps) {
  const submittedCodes = new Set(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  const pendingWriterStages = getArticleFlow(article.stages).filter(
    (stage) => stage.actor === 'WRITER' && !submittedCodes.has(stage.code),
  )
  const current = getCurrentStage(article)
  const awaitsClient = canRespond && article.status === 'WAITING_CLIENT' && current !== null
  const showSubmitBar = canManage && pendingWriterStages.length > 0
  const showWaitingNotice = !awaitsClient && !canManage && current !== null

  // ไม่มีอะไรให้ลงมือ (เช่นทีมส่งครบแล้วรอลูกค้าตอบ) = ไม่ต้องมีแถบท้ายการ์ดเปล่า ๆ
  if (!awaitsClient && !showSubmitBar && !showWaitingNotice && current) return null

  return (
    <div className="border-border/70 flex shrink-0 flex-col gap-3 border-t px-5 pt-4 pb-5 sm:px-6">
      {awaitsClient && current && (
        <div className="bg-info-subtle flex flex-col gap-3.5 rounded-2xl p-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <UserRound className="size-4" />
            </span>
            <strong className="text-[15px] leading-snug font-semibold">
              ตาคุณแล้ว — อ่านงานที่ทีมส่งมา แล้วเลือกอย่างใดอย่างหนึ่ง
            </strong>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onApprove?.(current.definition.code)}
              className="bg-secondary text-secondary-foreground focus-visible:ring-ring/60 flex min-h-11 cursor-pointer flex-col items-start gap-1 rounded-[14px] p-4 text-left transition-[filter] hover:brightness-95 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                <CircleCheckBig aria-hidden className="size-4.5" />
                อนุมัติเลย
              </span>
              <span className="text-[13px] leading-snug">
                พอใจแล้ว ให้ทีมทำขั้นตอนถัดไปได้เลย · ทีมจะได้รับแจ้งทันที
              </span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => onRequestChanges?.(current.definition.code)}
              className="border-border focus-visible:ring-ring/60 flex min-h-11 cursor-pointer flex-col items-start gap-1 rounded-[14px] border bg-white/85 p-4 text-left transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                <Pencil aria-hidden className="text-warning-text size-4.5" />
                ขอแก้ไข
              </span>
              <span className="text-text-secondary text-[13px] leading-snug">
                ยังไม่โอเค พิมพ์บอกทีมว่าอยากให้แก้ตรงไหน แล้วทีมจะส่งใหม่
              </span>
            </button>
          </div>

          {current.dueDate && (
            <p className="text-text-secondary flex items-start gap-2 text-xs leading-relaxed">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              ยังไม่พร้อมตอบตอนนี้ก็ได้ งานจะรอคุณอยู่ตรงนี้ แต่ถ้าเลย{' '}
              {formatShortDate(current.dueDate)} แผนทั้งเดือนจะเลื่อนตามไปด้วย
            </p>
          )}
        </div>
      )}

      {showSubmitBar && (
        <div className="bg-info-subtle flex flex-col gap-3 rounded-[14px] p-3.5 sm:flex-row sm:items-center">
          <span className="text-[13px] sm:mr-auto">
            ถึงคิวทีม — ขั้นตอนที่ยังไม่ได้ส่ง{' '}
            <strong className="font-semibold tabular-nums">{pendingWriterStages.length}</strong>{' '}
            ขั้น
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending}
              onClick={() => onSubmitWork?.(pendingWriterStages[0].code)}
              className="h-11 flex-1 rounded-[12px] px-4 sm:h-10 sm:flex-none"
            >
              <Send aria-hidden className="size-4" />
              ส่งงาน: {pendingWriterStages[0].label}
            </Button>
            {pendingWriterStages.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 rounded-[12px] px-4 sm:h-10"
                    disabled={isPending}
                  >
                    ขั้นตอนอื่น
                    <ChevronDown aria-hidden className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-56">
                  {pendingWriterStages.slice(1).map((stage) => (
                    <DropdownMenuItem key={stage.code} onClick={() => onSubmitWork?.(stage.code)}>
                      {stage.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {showWaitingNotice && current && (
        <div className="border-border flex items-center gap-3 rounded-[14px] border border-dashed bg-white/60 p-3.5 dark:bg-white/5">
          <span
            aria-hidden
            className="bg-muted text-text-secondary flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <Clock className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm font-semibold">
              รอทีมเขียน{current.definition.actor === 'WRITER' ? '' : 'ดำเนินการต่อ'}
            </strong>
            <span className="text-text-secondary text-[13px] leading-snug">
              ตอนนี้คุณยังไม่ต้องทำอะไร พอทีมส่งมา เรื่องนี้จะเด้งขึ้นไปอยู่กลุ่ม “ถึงคิวคุณแล้ว”
              {current.dueDate ? ` · กำหนดส่ง ${formatShortDate(current.dueDate)}` : ''}
            </span>
          </div>
        </div>
      )}

      {!current && (
        <div className="bg-success-subtle flex items-center gap-3 rounded-[14px] p-3.5">
          <span
            aria-hidden
            className="bg-success text-success-foreground flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <Check className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-success text-sm font-semibold">ส่งงานครบทุกขั้นแล้ว</strong>
            <span className="text-foreground text-[13px]">
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
      <span aria-hidden className="bg-border h-px flex-1" />
      <span className="text-text-secondary text-xs">
        {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
      <span aria-hidden className="bg-border h-px flex-1" />
    </div>
  )
}

function Avatar({ name, tone }: { name: string; tone: 'writer' | 'client' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'text-foreground flex size-8.5 shrink-0 items-center justify-center rounded-full border-2 border-white text-[13px] font-semibold dark:border-white/15',
        tone === 'writer' ? 'bg-info-subtle' : 'bg-secondary/30',
      )}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}

function formatTime(date: Date | string): string {
  return `${new Date(date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`
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
    <div className="flex items-start gap-2.5">
      <Avatar name={author} tone="writer" />
      <div className="flex max-w-[min(40rem,85%)] min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-text-secondary text-xs">
            <strong className="text-foreground font-medium">{author}</strong> · ทีมเขียน ·{' '}
            {formatTime(submission.createdAt)}
          </span>
          <span className="bg-muted text-text-secondary rounded-full px-2 py-0.5 text-[11px] font-medium">
            {stageLabel ? `${stageLabel} · ` : ''}รอบ {submission.round}
          </span>
          {canUnsubmit && (
            <Button
              variant="ghost"
              className="text-text-secondary h-11 rounded-[10px] px-2 text-xs sm:h-7"
              disabled={isPending}
              onClick={onUnsubmit}
            >
              <Undo2 aria-hidden className="size-3.5" />
              ยกเลิกการส่ง
            </Button>
          )}
        </div>

        <div className="border-border flex flex-col gap-2.5 rounded-[4px_16px_16px_16px] border bg-white p-3.5 dark:bg-white/5">
          {submission.message && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{submission.message}</p>
          )}

          {submission.linkUrl && (
            <a
              href={submission.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground flex items-center gap-1.5 text-[13px] break-all underline underline-offset-2"
            >
              <LinkIcon aria-hidden className="size-3.5 shrink-0" />
              {submission.linkUrl}
            </a>
          )}

          {submission.files.map((file) => (
            <FileAttachment
              key={file.id}
              file={file}
              meta={`เวอร์ชัน ${file.version}`}
              className="bg-muted/60 dark:bg-white/5"
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
    <div className="flex flex-row-reverse items-start gap-2.5">
      <Avatar name={author} tone="client" />
      <div className="flex max-w-[min(40rem,85%)] min-w-0 flex-col items-end gap-1.5">
        <span className="text-text-secondary text-xs">
          <strong className="text-foreground font-medium">{author}</strong> ·{' '}
          {formatTime(feedback.createdAt)}
        </span>

        <div
          className={cn(
            'flex flex-col gap-2 rounded-[16px_4px_16px_16px] border p-3.5',
            isApproved
              ? 'bg-success-subtle border-success/25'
              : 'bg-warning-subtle border-warning-accent/35',
          )}
        >
          <span
            className={cn(
              'bg-background/80 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold',
              isApproved ? 'text-success' : 'text-warning-text',
            )}
          >
            {isApproved ? 'อนุมัติแล้ว' : 'ขอแก้ไข'}
          </span>
          {feedback.comment && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback.comment}</p>
          )}
        </div>

        <span className="text-text-secondary text-xs">
          {getClientStageLabel(feedback.stageCode)}
        </span>
      </div>
    </div>
  )
}
