import { z } from 'zod'
import { withApiHandler, customerAccessGuard, noContent } from '@/infrastructure/http'
import { deleteArticle, updateArticle, updateArticleSchema } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateArticleSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
    await updateArticle(params.articleId, ctx.customer.id, body)
    return noContent()
  },
)

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
  await deleteArticle(params.articleId, ctx.customer.id)
  return noContent()
})
