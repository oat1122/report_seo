import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'
import { messageBlogWriter, messageWriterSchema } from '@/features/blog-plan'

const paramsSchema = z.object({
  customerId: z.uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: messageWriterSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-respond')
    const target = await messageBlogWriter(ctx.customer.id)

    const recipients = [target.blogWriterId, ctx.customer.seoDevId].filter((id): id is string =>
      Boolean(id),
    )
    await createNotification({
      type: NOTIFICATION_TYPES.BLOG_CLIENT_MESSAGE,
      recipientUserIds: recipients,
      actorId: session.user.id,
      title: 'ลูกค้าทักทีมเขียน',
      body: body.message,
      metadata: { url: `/blog/customers/${params.customerId}` },
    })

    return created({ sent: true })
  },
)
