import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'
import { getStageLabel, submitClientFeedback, submitFeedbackSchema } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
  articleId: z.uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: submitFeedbackSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-respond')
    const result = await submitClientFeedback(
      params.articleId,
      ctx.customer.id,
      body,
      session.user.id,
    )

    const isApproved = body.decision === 'APPROVED'
    const recipients = [ctx.customer.blogWriterId, ctx.customer.seoDevId].filter(
      (id): id is string => Boolean(id),
    )
    if (recipients.length > 0) {
      createNotification({
        type: NOTIFICATION_TYPES.BLOG_CLIENT_RESPONDED,
        recipientUserIds: recipients,
        actorId: session.user.id,
        title: isApproved ? 'ลูกค้าอนุมัติบทความ' : 'ลูกค้าขอแก้ไขบทความ',
        body: `${result.articleTitle} — ${getStageLabel(body.stageCode)}`,
        metadata: { url: `/blog/customers/${params.customerId}` },
      }).catch(() => {})
    }

    return created(result)
  },
)
