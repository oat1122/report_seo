import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { getPaymentPlan, updatePaymentPlan, updatePaymentPlanSchema } from '@/features/payments'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
})

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await getPaymentPlan(params.planId))
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updatePaymentPlanSchema },
  async ({ params, body }) => {
    await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return ok(await updatePaymentPlan(params.planId, body))
  },
)
