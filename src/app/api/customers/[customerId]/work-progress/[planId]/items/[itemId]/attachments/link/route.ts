import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { addLinkAttachment, addLinkAttachmentSchema } from '@/features/work-progress'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: addLinkAttachmentSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return created(
      await addLinkAttachment(ctx.customer.id, params.planId, params.itemId, session.user.id, body),
    )
  },
)
