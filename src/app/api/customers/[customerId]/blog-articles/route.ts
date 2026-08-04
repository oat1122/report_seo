import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, created } from '@/infrastructure/http'
import {
  createArticle,
  createArticleSchema,
  listArticles,
  listArticlesQuerySchema,
} from '@/features/blog-plan'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler(
  { params: paramsSchema, query: listArticlesQuerySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-read')
    return ok(await listArticles(ctx.customer.id, query))
  },
)

export const POST = withApiHandler(
  { params: paramsSchema, body: createArticleSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
    return created(await createArticle(ctx.customer.id, body, session.user.id))
  },
)
