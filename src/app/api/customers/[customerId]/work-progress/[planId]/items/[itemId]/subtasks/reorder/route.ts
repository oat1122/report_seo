import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { reorderSubtasks, reorderSubtasksSchema } from '@/features/work-progress'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: reorderSubtasksSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return ok(
      await reorderSubtasks(ctx.customer.id, params.planId, params.itemId, session.user.id, body),
    )
  },
)
