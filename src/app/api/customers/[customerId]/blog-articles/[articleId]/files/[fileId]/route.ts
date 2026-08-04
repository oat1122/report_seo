import { z } from 'zod'
import { withApiHandler, customerAccessGuard, noContent } from '@/infrastructure/http'
import { deleteArticleFile } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
  fileId: z.uuid(),
})

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
  await deleteArticleFile(params.articleId, ctx.customer.id, params.fileId)
  return noContent()
})
