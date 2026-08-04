import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { BLOG_STAGE_CODES, updateStage, updateStageSchema } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
  stageCode: z.enum(BLOG_STAGE_CODES),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateStageSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
    return ok(await updateStage(params.articleId, ctx.customer.id, params.stageCode, body))
  },
)
