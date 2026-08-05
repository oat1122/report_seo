'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ArticleCard } from './shared/ArticleCard'
import { ArticleFormDialog, type ArticleFormValues } from './shared/ArticleFormDialog'
import { ActionSummaryCard } from './shared/ActionSummaryCard'
import { BlogPlanEmptyState } from './shared/BlogPlanEmptyState'
import { MonthTimelineCard } from './shared/MonthTimelineCard'
import { WriterMessageDialog } from './shared/WriterMessageDialog'
import { formatMonthLabel, groupArticle, type ArticleGroup } from './shared/blog-plan-view'
import {
  useBlogArticles,
  useBlogSettings,
  useCreateArticle,
  useDeleteArticle,
  useDeleteArticleFile,
  useMessageBlogWriter,
  useSubmitFeedback,
  useSubmitStageWork,
  useUpdateArticle,
  useUpdateStage,
} from '../hooks/useBlogPlan'
import type { BlogArticle } from '../../domain/BlogArticle'

const ACTIONABLE_SECTION_ID = 'blog-plan-actionable'

interface SectionMeta {
  id: ArticleGroup
  title: string
  hint: string
}

function buildSections(canManage: boolean): SectionMeta[] {
  return [
    {
      id: 'mine',
      title: 'ถึงคิวคุณแล้ว',
      hint: canManage
        ? 'ยังไม่ได้ส่งให้ลูกค้า หรือลูกค้าขอแก้ไขกลับมา'
        : 'ทีมส่งงานมาแล้ว รออยู่ว่าคุณจะว่ายังไง',
    },
    {
      id: 'waiting',
      title: canManage ? 'รอลูกค้าตอบ' : 'ทีมกำลังทำอยู่',
      hint: canManage ? 'ส่งไปแล้ว รอฝั่งลูกค้าพิจารณา' : 'ยังไม่ต้องทำอะไร รอทีมส่งงานมาให้ดู',
    },
    { id: 'done', title: 'เสร็จแล้ว', hint: 'ขึ้นเว็บไซต์เรียบร้อย ไฟล์ยังเก็บไว้ให้' },
  ]
}

interface BlogPlanBoardProps {
  customerId: string
  canManage: boolean
  canRespond: boolean
}

export function BlogPlanBoard({ customerId, canManage, canRespond }: BlogPlanBoardProps) {
  const now = new Date()
  const [filter, setFilter] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [editing, setEditing] = useState<BlogArticle | null>(null)
  const [isFormOpen, setFormOpen] = useState(false)
  const [isMessageOpen, setMessageOpen] = useState(false)

  const { data, isLoading } = useBlogArticles(customerId, filter)
  const { data: settings } = useBlogSettings(customerId)

  const createArticle = useCreateArticle(customerId)
  const updateArticle = useUpdateArticle(customerId)
  const deleteArticle = useDeleteArticle(customerId)
  const updateStage = useUpdateStage(customerId)
  const submitFeedback = useSubmitFeedback(customerId)
  const submitStageWork = useSubmitStageWork(customerId)
  const deleteFile = useDeleteArticleFile(customerId)
  const messageWriter = useMessageBlogWriter(customerId)

  const isPending =
    createArticle.isPending ||
    updateArticle.isPending ||
    deleteArticle.isPending ||
    updateStage.isPending ||
    submitFeedback.isPending ||
    submitStageWork.isPending ||
    deleteFile.isPending

  const articles = useMemo(() => data?.articles ?? [], [data])
  const isEmpty = !isLoading && articles.length === 0

  // โหลดเดือนก่อนหน้าเฉพาะตอนเดือนนี้ว่าง — ใช้บอกจำนวนบนปุ่มของ empty state
  const previousMonthDate = new Date(filter.year, filter.month - 2, 1)
  const previousFilter = {
    year: previousMonthDate.getFullYear(),
    month: previousMonthDate.getMonth() + 1,
  }
  const { data: previousData } = useBlogArticles(customerId, previousFilter, isEmpty)

  const grouped = useMemo(() => {
    const buckets: Record<ArticleGroup, BlogArticle[]> = { mine: [], waiting: [], done: [] }
    articles.forEach((article) => {
      buckets[groupArticle(article.status, canManage, canRespond)].push(article)
    })
    return buckets
  }, [articles, canManage, canRespond])

  const shiftMonth = (delta: number) => {
    const next = new Date(filter.year, filter.month - 1 + delta, 1)
    setFilter({ year: next.getFullYear(), month: next.getMonth() + 1 })
  }

  const handleSubmit = (values: ArticleFormValues) => {
    const payload = {
      title: values.title.trim(),
      keyFocus: values.keyFocus.trim() || null,
      startDate: values.startDate ? new Date(values.startDate) : null,
      note: values.note.trim() || null,
      keywords: values.keywords,
    }

    if (editing) {
      updateArticle.mutate(
        { articleId: editing.id, input: payload },
        { onSuccess: () => setFormOpen(false) },
      )
      return
    }
    createArticle.mutate(
      { ...payload, targetYear: filter.year, targetMonth: filter.month },
      { onSuccess: () => setFormOpen(false) },
    )
  }

  const openCreateForm = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const quota = settings?.articlesPerMonth ?? 0
  const used = data?.monthlyCount ?? articles.length
  const isOverQuota = quota > 0 && used > quota

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="border-border bg-muted flex items-center gap-1 rounded-xl border p-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="เดือนก่อนหน้า"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-33 text-center font-semibold">
            {formatMonthLabel(filter.year, filter.month)}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="เดือนถัดไป"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'tabular-nums',
            isOverQuota
              ? 'bg-destructive/10 text-destructive border-destructive/30'
              : 'bg-muted text-muted-foreground border-border',
          )}
        >
          ใช้ไป {used} / โควตา {quota > 0 ? quota : '—'} บทความ
        </Badge>

        {settings?.blogWriterName && (
          <Badge variant="outline" className="bg-info/10 text-info border-info/30">
            ผู้เขียน: {settings.blogWriterName}
          </Badge>
        )}

        {canManage && (
          <Button className="ml-auto" disabled={isPending} onClick={openCreateForm}>
            <Plus className="mr-1 size-4" />
            เพิ่มบทความ
          </Button>
        )}
      </div>

      {isLoading ? (
        <BoardSkeleton />
      ) : isEmpty ? (
        <BlogPlanEmptyState
          year={filter.year}
          month={filter.month}
          canManage={canManage}
          previousMonthCount={previousData?.articles.length ?? null}
          writerName={settings?.blogWriterName ?? null}
          quota={quota}
          onGoPreviousMonth={() => shiftMonth(-1)}
          onMessageWriter={() => setMessageOpen(true)}
          onCreateArticle={openCreateForm}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <MonthTimelineCard
              articles={articles}
              year={filter.year}
              month={filter.month}
              canManage={canManage}
              canRespond={canRespond}
            />
            <ActionSummaryCard
              articles={grouped.mine}
              targetId={ACTIONABLE_SECTION_ID}
              canManage={canManage}
              quota={quota}
              used={used}
              writerName={settings?.blogWriterName ?? null}
            />
          </div>

          {buildSections(canManage).map((section) => {
            const items = grouped[section.id]
            if (items.length === 0) return null

            return (
              <section
                key={section.id}
                id={section.id === 'mine' ? ACTIONABLE_SECTION_ID : undefined}
                className="flex scroll-mt-6 flex-col gap-3.5"
              >
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span
                    className={cn(
                      'flex size-6.5 items-center justify-center rounded-full text-sm font-bold tabular-nums',
                      section.id === 'mine' && 'bg-secondary text-secondary-foreground',
                      section.id === 'waiting' && 'bg-muted text-muted-foreground',
                      section.id === 'done' && 'bg-success/12 text-success',
                    )}
                  >
                    {items.length}
                  </span>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <span className="text-muted-foreground text-sm">{section.hint}</span>
                </div>

                {items.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    canManage={canManage}
                    canRespond={canRespond}
                    isActionable={section.id === 'mine'}
                    isPending={isPending}
                    onEdit={(target) => {
                      setEditing(target)
                      setFormOpen(true)
                    }}
                    onDelete={(articleId) => deleteArticle.mutate(articleId)}
                    onSubmitWork={(articleId, stageCode, payload) =>
                      submitStageWork.mutate({ articleId, stageCode, ...payload })
                    }
                    onUnsubmit={(articleId, stageCode) =>
                      updateStage.mutate({ articleId, stageCode, input: { submitted: false } })
                    }
                    onApprove={(articleId, stageCode) =>
                      submitFeedback.mutate({
                        articleId,
                        input: { stageCode, decision: 'APPROVED', comment: null },
                      })
                    }
                    onRequestChanges={(articleId, stageCode, comment) =>
                      submitFeedback.mutate({
                        articleId,
                        input: {
                          stageCode,
                          decision: 'CHANGES_REQUESTED',
                          comment: comment.trim(),
                        },
                      })
                    }
                    onDeleteFile={(articleId, fileId) => deleteFile.mutate({ articleId, fileId })}
                  />
                ))}
              </section>
            )
          })}
        </>
      )}

      {canManage && (
        <ArticleFormDialog
          customerId={customerId}
          open={isFormOpen}
          onOpenChange={setFormOpen}
          article={editing ?? undefined}
          isPending={isPending}
          onSubmit={handleSubmit}
        />
      )}

      {canRespond && (
        <WriterMessageDialog
          open={isMessageOpen}
          writerName={settings?.blogWriterName ?? null}
          isPending={messageWriter.isPending}
          onOpenChange={setMessageOpen}
          onSubmit={(message) =>
            messageWriter.mutate({ message }, { onSuccess: () => setMessageOpen(false) })
          }
        />
      )}
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-45 w-full rounded-xl" />
        <Skeleton className="h-45 w-full rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  )
}
