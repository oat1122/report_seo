import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'
import {
  BLOG_STAGE_CODES,
  getStageLabel,
  updateStage,
  updateStageSchema,
} from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
  stageCode: z.enum(BLOG_STAGE_CODES),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateStageSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-manage')
    const result = await updateStage(params.articleId, ctx.customer.id, params.stageCode, body)

    if (result.submitted) {
      createNotification({
        type: NOTIFICATION_TYPES.BLOG_STAGE_SUBMITTED,
        recipientUserIds: [ctx.customer.userId],
        actorId: session.user.id,
        title: 'มีงานบทความส่งมาให้ตรวจ',
        body: `ขั้นตอน "${getStageLabel(params.stageCode)}" ถูกส่งแล้ว`,
        metadata: { url: `/customer/${params.customerId}/blog-plan` },
      }).catch(() => {})
    }

    return ok(result)
  },
)
