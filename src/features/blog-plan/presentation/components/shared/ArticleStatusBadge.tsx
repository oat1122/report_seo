import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BLOG_ARTICLE_STATUS_LABELS } from '../../../domain/policies/article-status'
import type { BlogArticleStatus } from '../../../domain/BlogArticle'

/** คู่สีสถานะของ UI Kit (พื้นอ่อน + ตัวอักษรเข้ม) — ตัวอักษรผ่าน 4.5:1 ทุกคู่ ป้ายบอกด้วยคำเสมอ ไม่พึ่งสีอย่างเดียว */
const STATUS_CLASS: Record<BlogArticleStatus, string> = {
  DRAFT: 'bg-muted text-text-secondary',
  IN_PROGRESS: 'bg-info-subtle text-foreground',
  WAITING_CLIENT: 'bg-muted text-foreground',
  CHANGES_REQUESTED: 'bg-warning-subtle text-warning-text',
  PUBLISHED: 'bg-success-subtle text-success',
}

export function ArticleStatusBadge({
  status,
  className,
}: {
  status: BlogArticleStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full border-transparent px-2.5 text-xs font-medium',
        STATUS_CLASS[status],
        className,
      )}
    >
      {BLOG_ARTICLE_STATUS_LABELS[status]}
    </Badge>
  )
}
