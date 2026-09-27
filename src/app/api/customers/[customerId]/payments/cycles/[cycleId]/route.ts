import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { updateBillingCycle, updateBillingCycleSchema } from '@/features/payments'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  cycleId: z.string().uuid(),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateBillingCycleSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return ok(await updateBillingCycle(ctx.customer.id, params.cycleId, body))
  },
)
