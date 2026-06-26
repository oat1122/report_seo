import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, noContent } from '@/infrastructure/http'
import { deleteNextStep, nextStepSchema, updateNextStep } from '@/features/next-steps'

const paramsSchema = z.object({
  customerId: z.uuid(),
  stepId: z.string().min(1),
})

export const PUT = withApiHandler(
  { params: paramsSchema, body: nextStepSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return ok(await updateNextStep(ctx.customer.id, params.stepId, body))
  },
)

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  await deleteNextStep(ctx.customer.id, params.stepId)
  return noContent()
})
