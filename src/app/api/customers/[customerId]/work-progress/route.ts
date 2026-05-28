import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok, created } from '@/infrastructure/http'
import {
  createPlan,
  createPlanSchema,
  listPlans,
  listPlansQuerySchema,
} from '@/features/work-progress'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const GET = withApiHandler(
  { params: paramsSchema, query: listPlansQuerySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
    return ok(await listPlans(ctx.customer.id, query))
  },
)

export const POST = withApiHandler(
  { params: paramsSchema, body: createPlanSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    return created(await createPlan(ctx.customer.id, session.user.id, session.user.role, body))
  },
)
