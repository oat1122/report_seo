'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, FolderOpen, Plus, UserRound } from 'lucide-react'
import { AnimatePresence, FadeSwap, GrowBar, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { ArticleCard } from './shared/ArticleCard'
import { ArticleStatusBadge } from './shared/ArticleStatusBadge'
import { ArticleFormView, type ArticleFormValues } from './shared/ArticleFormView'
import { ActionSummaryCard } from './shared/ActionSummaryCard'
import { BlogPlanEmptyState } from './shared/BlogPlanEmptyState'
import { FeedbackView } from './shared/FeedbackView'
import { FilesHubView } from './shared/FilesHubView'
import { MonthTimelineCard } from './shared/MonthTimelineCard'
import { StageSubmitView } from './shared/StageSubmitView'
import { WriterMessageView } from './shared/WriterMessageView'
import {
  daysUntil,
  formatMonthLabel,
  getCurrentStage,
  groupArticle,
  type ArticleGroup,
} from './shared/blog-plan-view'
import { useBlogPlanRoute } from '../hooks/useBlogPlanRoute'
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
    { id: 'done', title: 'เสร็จแล้ว', hint: 'ส่งไฟล์ final ครบแล้ว ไฟล์ยังเก็บไว้ให้' },
  ]
}

interface BlogPlanBoardProps {
  customerId: string
  canManage: boolean
  canRespond: boolean
}

/** useSearchParams ต้องอยู่ใต้ Suspense เสมอ — ตาม pattern เดียวกับ ReportPage */
export function BlogPlanBoard(props: BlogPlanBoardProps) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BlogPlanBoardInner {...props} />
    </Suspense>
  )
}

function BlogPlanBoardInner({ customerId, canManage, canRespond }: BlogPlanBoardProps) {
  const route = useBlogPlanRoute()
  const filter = { year: route.year, month: route.month }

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

  // คลังไฟล์รวมทุกเดือน — ไม่ส่ง y/m แปลว่าเอาทุกบทความ, โหลดเฉพาะตอนเปิดหน้านั้น
  const { data: allData, isLoading: isLoadingAll } = useBlogArticles(
    customerId,
    {},
    route.view === 'files',
  )

  const grouped = useMemo(() => {
    const buckets: Record<ArticleGroup, BlogArticle[]> = { mine: [], waiting: [], done: [] }
    articles.forEach((article) => {
      buckets[groupArticle(article.status, canManage, canRespond)].push(article)
    })
    return buckets
  }, [articles, canManage, canRespond])

  const shiftMonth = (delta: number) => {
    const next = new Date(filter.year, filter.month - 1 + delta, 1)
    route.setMonth(next.getFullYear(), next.getMonth() + 1)
  }

  const handleSubmit = (values: ArticleFormValues) => {
    const payload = {
      title: values.title.trim(),
      keyFocus: values.keyFocus.trim() || null,
      startDate: values.startDate ? new Date(values.startDate) : null,
      note: values.note.trim() || null,
      keywords: values.keywords,
    }

    if (route.articleId) {
      updateArticle.mutate(
        { articleId: route.articleId, input: payload },
        { onSuccess: route.closeView },
      )
      return
    }
    createArticle.mutate(
      { ...payload, targetYear: filter.year, targetMonth: filter.month },
      { onSuccess: route.closeView },
    )
  }

  const quota = settings?.articlesPerMonth ?? 0
  const used = data?.monthlyCount ?? articles.length
  const isOverQuota = quota > 0 && used > quota

  const selectedArticle = articles.find((item) => item.id === route.articleId) ?? null
  /**
   * แผงขวาต้องมีเรื่องอยู่เสมอบนจอใหญ่ — ยังไม่ได้เลือกก็หยิบงานที่ถึงคิวเราใบแรกให้
   * ค่า fallback ไม่เขียนลง URL เพื่อให้จอเล็กยังเปิดมาเจอ "ลิสต์" ก่อนเหมือนแอปแชท
   */
  const detailArticle = selectedArticle ?? grouped.mine[0] ?? articles[0] ?? null

  // เลือกค้างไว้จากเดือนก่อน / บทความถูกลบ → ล้าง param ทิ้ง ไม่งั้นจอเล็กค้างหน้ารายละเอียดของเรื่องอื่น
  const isStaleSelection = !route.view && !isLoading && Boolean(route.articleId) && !selectedArticle
  useEffect(() => {
    if (isStaleSelection) route.selectArticle(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- route ถูกสร้างใหม่ทุก render
  }, [isStaleSelection])

  // ยังโหลดลิสต์ไม่เสร็จ = ยังตัดสินไม่ได้ว่าบทความมีจริงไหม จึงยังไม่ render หน้าย่อย
  const view =
    route.view && !isLoading
      ? renderView({
          route,
          article: selectedArticle,
          allArticles: allData?.articles ?? [],
          isLoadingAll,
          canManage,
          canRespond,
          customerId,
          isPending,
          writerName: settings?.blogWriterName ?? null,
          messageWriter,
          submitFeedback,
          submitStageWork,
          onSubmitArticleForm: handleSubmit,
          onDeleteFile: (articleId, fileId) => deleteFile.mutate({ articleId, fileId }),
        })
      : null

  // URL ชี้ไปหน้าที่เปิดไม่ได้ (ไม่มีสิทธิ์ / หาบทความไม่เจอ) → ล้าง query กลับมาที่บอร์ด
  const isDeadView = Boolean(route.view) && !isLoading && view === null
  useEffect(() => {
    if (isDeadView) route.closeView()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- route ถูกสร้างใหม่ทุก render
  }, [isDeadView])

  if (route.view) return view ?? <BoardSkeleton />

  const quotaPercent = quota > 0 ? (used / quota) * 100 : 0

  return (
    <div className="flex flex-col gap-5">
      {/* แถบเครื่องมือ: เดือน · โควตา · ผู้เขียน · ปุ่มหลัก */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="border-glass-border flex items-center gap-1 rounded-[14px] border bg-white/60 p-1 dark:bg-white/5">
            <Button
              variant="ghost"
              className="size-11 rounded-[10px] p-0 sm:size-9"
              aria-label="เดือนก่อนหน้า"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-[15px] font-semibold">
              {formatMonthLabel(filter.year, filter.month)}
            </span>
            <Button
              variant="ghost"
              className="size-11 rounded-[10px] p-0 sm:size-9"
              aria-label="เดือนถัดไป"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div
            className={cn(
              'flex items-center gap-2.5 rounded-full px-3 py-1.5',
              isOverQuota
                ? 'bg-danger-subtle text-danger-strong'
                : 'bg-info-subtle text-foreground',
            )}
          >
            <span className="text-xs font-medium tabular-nums">
              ใช้ไป {used} / โควตา {quota > 0 ? quota : '—'} บทความ
            </span>
            {quota > 0 && (
              <span
                aria-hidden
                className="h-1.5 w-14 overflow-hidden rounded-full bg-white/80 dark:bg-white/10"
              >
                <GrowBar
                  value={quotaPercent}
                  className={cn(
                    'h-full rounded-full',
                    isOverQuota ? 'bg-destructive' : 'bg-info-strong',
                  )}
                />
              </span>
            )}
          </div>

          {settings?.blogWriterName && (
            <span className="border-glass-border inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1.5 text-xs font-medium dark:bg-white/5">
              <UserRound aria-hidden className="text-text-secondary size-3.5" />
              ผู้เขียน: {settings.blogWriterName}
            </span>
          )}
        </div>

        <div
          className={cn('grid gap-2 sm:flex lg:ml-auto', canManage ? 'grid-cols-2' : 'grid-cols-1')}
        >
          <Button
            variant="outline"
            className="h-11 rounded-[12px] px-4"
            onClick={() => route.openView('files')}
          >
            <FolderOpen className="size-4" />
            คลังไฟล์
          </Button>

          {canManage && (
            <Button
              className="h-11 rounded-[12px] px-4"
              disabled={isPending}
              onClick={() => route.openView('article-form')}
            >
              <Plus className="size-4" />
              เพิ่มบทความ
            </Button>
          )}
        </div>
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
          onMessageWriter={() => route.openView('writer-message')}
          onCreateArticle={() => route.openView('article-form')}
        />
      ) : (
        <>
          <MonthTimelineCard
            articles={articles}
            year={filter.year}
            month={filter.month}
            canManage={canManage}
            canRespond={canRespond}
          />

          {/* ลิสต์เรื่องซ้าย + รายละเอียดขวา แบบหน้าต่างแชท — จอเล็กสลับกันทีละฝั่ง */}
          <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
            <Card
              role="region"
              aria-label="รายการบทความ"
              className={cn(
                'gap-4 p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto',
                route.articleId && 'hidden lg:flex',
              )}
            >
              <ActionSummaryCard
                articles={grouped.mine}
                targetId={ACTIONABLE_SECTION_ID}
                canManage={canManage}
                quota={quota}
                used={used}
                writerName={settings?.blogWriterName ?? null}
              />

              {buildSections(canManage).map((section) => {
                const items = grouped[section.id]
                if (items.length === 0) return null
                const headingId = `blog-section-${section.id}`

                return (
                  <section
                    key={section.id}
                    id={section.id === 'mine' ? ACTIONABLE_SECTION_ID : undefined}
                    aria-labelledby={headingId}
                    className="flex scroll-mt-6 flex-col gap-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <h2 id={headingId} className="text-text-secondary text-xs font-medium">
                          {section.title}
                        </h2>
                        <span className="bg-info-subtle text-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums">
                          {items.length}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs">{section.hint}</p>
                    </div>

                    <ul className="flex flex-col gap-2">
                      <AnimatePresence initial={false}>
                        {items.map((article) => (
                          <motion.li
                            key={article.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <ArticleListItem
                              article={article}
                              canManage={canManage}
                              isActionable={section.id === 'mine'}
                              isSelected={detailArticle?.id === article.id}
                              onSelect={() => route.selectArticle(article.id)}
                            />
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </section>
                )
              })}
            </Card>

            {detailArticle && (
              <div
                className={cn(
                  'min-w-0 flex-col gap-3 lg:sticky lg:top-4',
                  route.articleId ? 'flex' : 'hidden lg:flex',
                )}
              >
                <Button
                  variant="ghost"
                  className="h-11 w-fit rounded-[12px] px-3 lg:hidden"
                  onClick={() => route.selectArticle(null)}
                >
                  <ArrowLeft className="size-4" />
                  กลับรายการ
                </Button>

                <FadeSwap key={detailArticle.id} className="min-w-0">
                  <ArticleCard
                    article={detailArticle}
                    canManage={canManage}
                    canRespond={canRespond}
                    isActionable={
                      groupArticle(detailArticle.status, canManage, canRespond) === 'mine'
                    }
                    isPending={isPending}
                    onEdit={(target) => route.openView('article-form', { articleId: target.id })}
                    onDelete={(articleId) => deleteArticle.mutate(articleId)}
                    onOpenSubmit={(articleId, stageCode) =>
                      route.openView('submit', { articleId, stageCode })
                    }
                    onOpenFeedback={(articleId, stageCode) =>
                      route.openView('feedback', { articleId, stageCode })
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
                    onDeleteFile={(articleId, fileId) => deleteFile.mutate({ articleId, fileId })}
                  />
                </FadeSwap>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** แถวเลือกเรื่องในลิสต์ซ้าย — อ่านได้ในบรรทัดเดียวว่าเรื่องอะไร key ไหน ค้างอยู่ขั้นไหน */
function ArticleListItem({
  article,
  canManage,
  isActionable,
  isSelected,
  onSelect,
}: {
  article: BlogArticle
  canManage: boolean
  isActionable: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const current = getCurrentStage(article)
  const dueDate = current?.dueDate ?? null
  const remainingDays = dueDate ? daysUntil(dueDate) : null
  const keywordLine =
    article.keywords.map((keyword) => keyword.keyword).join(' · ') || article.keyFocus

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'focus-visible:ring-ring/60 flex min-h-11 w-full flex-col gap-1.5 rounded-[14px] px-3.5 py-3 text-left transition-[background-color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-none',
        isSelected
          ? 'shadow-card ring-info bg-white ring-2 dark:bg-white/10'
          : 'bg-white/55 hover:bg-white/85 dark:bg-white/5 dark:hover:bg-white/10',
      )}
    >
      <span className="flex items-start gap-2">
        {/* จุดเน้นแบบลิสต์แชท — งานที่ถึงคิวเราแล้วต้องสะดุดตาก่อน */}
        {isActionable && (
          <span aria-hidden className="bg-secondary mt-1.5 size-2 shrink-0 rounded-full" />
        )}
        <span className="line-clamp-2 text-sm font-medium">{article.title}</span>
      </span>

      {keywordLine && <span className="text-text-secondary truncate text-xs">{keywordLine}</span>}

      <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <ArticleStatusBadge status={article.status} />
        {current && (
          <span className="text-text-secondary min-w-0 truncate text-xs">
            ขั้นที่ {current.step}/{current.total} ·{' '}
            {canManage ? current.definition.label : current.definition.clientLabel}
          </span>
        )}
      </span>

      {dueDate && remainingDays !== null && (
        <span
          className={cn(
            'text-xs',
            remainingDays < 0 ? 'text-danger-strong font-medium' : 'text-text-secondary',
          )}
        >
          {remainingDays < 0
            ? `เลยกำหนดมา ${-remainingDays} วัน`
            : `กำหนด ${formatShortDate(dueDate)} · อีก ${remainingDays} วัน`}
        </span>
      )}
    </button>
  )
}

interface RenderViewArgs {
  route: ReturnType<typeof useBlogPlanRoute>
  article: BlogArticle | null
  /** บทความทุกเดือน — ใช้เฉพาะหน้าคลังไฟล์ */
  allArticles: BlogArticle[]
  isLoadingAll: boolean
  canManage: boolean
  canRespond: boolean
  customerId: string
  isPending: boolean
  writerName: string | null
  messageWriter: ReturnType<typeof useMessageBlogWriter>
  submitFeedback: ReturnType<typeof useSubmitFeedback>
  submitStageWork: ReturnType<typeof useSubmitStageWork>
  onSubmitArticleForm: (values: ArticleFormValues) => void
  onDeleteFile: (articleId: string, fileId: string) => void
}

/** null = เปิดหน้านี้ไม่ได้ (ไม่มีสิทธิ์ / หาบทความไม่เจอ / ไม่มี stage) → ผู้เรียกจะเด้งกลับบอร์ด */
function renderView({
  route,
  article,
  allArticles,
  isLoadingAll,
  canManage,
  canRespond,
  customerId,
  isPending,
  writerName,
  messageWriter,
  submitFeedback,
  submitStageWork,
  onSubmitArticleForm,
  onDeleteFile,
}: RenderViewArgs) {
  const { stageCode, closeView } = route

  switch (route.view) {
    case 'files':
      if (isLoadingAll) return <BoardSkeleton />
      return (
        <FilesHubView
          articles={allArticles}
          canManage={canManage}
          isPending={isPending}
          onBack={closeView}
          onDeleteFile={onDeleteFile}
        />
      )

    case 'submit':
      if (!canManage || !article || !stageCode) return null
      return (
        <StageSubmitView
          article={article}
          stageCode={stageCode}
          isPending={isPending}
          onCancel={closeView}
          onSubmit={(payload) =>
            submitStageWork.mutate(
              { articleId: article.id, stageCode, ...payload },
              { onSuccess: closeView },
            )
          }
        />
      )

    case 'feedback':
      if (!canRespond || !article || !stageCode) return null
      return (
        <FeedbackView
          article={article}
          stageCode={stageCode}
          isPending={isPending}
          onCancel={closeView}
          onSubmit={(comment) =>
            submitFeedback.mutate(
              {
                articleId: article.id,
                input: { stageCode, decision: 'CHANGES_REQUESTED', comment: comment.trim() },
              },
              { onSuccess: closeView },
            )
          }
        />
      )

    case 'writer-message':
      if (!canRespond) return null
      return (
        <WriterMessageView
          writerName={writerName}
          isPending={messageWriter.isPending}
          onCancel={closeView}
          onSubmit={(message) => messageWriter.mutate({ message }, { onSuccess: closeView })}
        />
      )

    case 'article-form':
      // แก้ไข = ต้องหาบทความเจอ, เพิ่มใหม่ = ไม่ต้องมี article
      if (!canManage || (route.articleId && !article)) return null
      return (
        <ArticleFormView
          customerId={customerId}
          article={article ?? undefined}
          isPending={isPending}
          onCancel={closeView}
          onSubmit={onSubmitArticleForm}
        />
      )

    default:
      return null
  }
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="กำลังโหลดแผนบทความ">
      <Skeleton className="h-44 w-full rounded-[20px]" />
      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        <Skeleton className="h-96 w-full rounded-[20px]" />
        <Skeleton className="hidden h-[28rem] w-full rounded-[20px] lg:block" />
      </div>
    </div>
  )
}
