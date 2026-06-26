import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, created } from '@/infrastructure/http'
import { addNextStep, listNextSteps, nextStepSchema } from '@/features/next-steps'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await listNextSteps(ctx.customer.id))
})

export const POST = withApiHandler(
  { params: paramsSchema, body: nextStepSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return created(await addNextStep(ctx.customer.id, body))
  },
)
