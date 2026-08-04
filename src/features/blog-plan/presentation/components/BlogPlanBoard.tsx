'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ArticleCard } from './shared/ArticleCard'
import { ArticleFormDialog, type ArticleFormValues } from './shared/ArticleFormDialog'
import {
  useBlogArticles,
  useBlogSettings,
  useCreateArticle,
  useDeleteArticle,
  useDeleteArticleFile,
  useSubmitFeedback,
  useUpdateArticle,
  useUpdateStage,
  useUploadArticleFile,
} from '../hooks/useBlogPlan'
import type { BlogArticle } from '../../domain/BlogArticle'

const MONTH_LABELS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

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

  const { data, isLoading } = useBlogArticles(customerId, filter)
  const { data: settings } = useBlogSettings(customerId)

  const createArticle = useCreateArticle(customerId)
  const updateArticle = useUpdateArticle(customerId)
  const deleteArticle = useDeleteArticle(customerId)
  const updateStage = useUpdateStage(customerId)
  const submitFeedback = useSubmitFeedback(customerId)
  const uploadFile = useUploadArticleFile(customerId)
  const deleteFile = useDeleteArticleFile(customerId)

  const isPending =
    createArticle.isPending ||
    updateArticle.isPending ||
    deleteArticle.isPending ||
    updateStage.isPending ||
    submitFeedback.isPending ||
    uploadFile.isPending ||
    deleteFile.isPending

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

  const articles = data?.articles ?? []
  const quota = settings?.articlesPerMonth ?? 0
  const used = data?.monthlyCount ?? articles.length
  const isOverQuota = quota > 0 && used > quota

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="size-8" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center font-medium">
              {MONTH_LABELS[filter.month - 1]} {filter.year}
            </span>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => shiftMonth(1)}>
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
            <Button
              className="ml-auto"
              disabled={isPending}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="mr-1 size-4" />
              เพิ่มบทความ
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            ยังไม่มีบทความในเดือนนี้
          </CardContent>
        </Card>
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            canManage={canManage}
            canRespond={canRespond}
            isPending={isPending}
            onEdit={(target) => {
              setEditing(target)
              setFormOpen(true)
            }}
            onDelete={(articleId) => deleteArticle.mutate(articleId)}
            onToggleStage={(articleId, stageCode, submitted) =>
              updateStage.mutate({ articleId, stageCode, input: { submitted } })
            }
            onRespond={(articleId, stageCode, decision, comment) =>
              submitFeedback.mutate({
                articleId,
                input: { stageCode, decision, comment: comment.trim() || null },
              })
            }
            onUploadFile={(articleId, file, kind) => uploadFile.mutate({ articleId, file, kind })}
            onDeleteFile={(articleId, fileId) => deleteFile.mutate({ articleId, fileId })}
          />
        ))
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
    </div>
  )
}
