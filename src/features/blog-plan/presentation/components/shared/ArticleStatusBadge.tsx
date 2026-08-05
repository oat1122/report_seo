import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BLOG_ARTICLE_STATUS_LABELS } from '../../../domain/policies/article-status'
import type { BlogArticleStatus } from '../../../domain/BlogArticle'

const STATUS_CLASS: Record<BlogArticleStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground border-border',
  IN_PROGRESS: 'bg-info/10 text-info border-info/30',
  WAITING_CLIENT: 'bg-warning/10 text-warning border-warning/30',
  CHANGES_REQUESTED: 'bg-destructive/10 text-destructive border-destructive/30',
  PUBLISHED: 'bg-secondary/20 text-secondary-foreground dark:text-secondary border-secondary/40',
}

export function ArticleStatusBadge({
  status,
  className,
}: {
  status: BlogArticleStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status], className)}>
      {BLOG_ARTICLE_STATUS_LABELS[status]}
    </Badge>
  )
}
