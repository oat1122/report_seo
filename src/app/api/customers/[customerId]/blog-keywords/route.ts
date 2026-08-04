import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { listCustomerKeywords } from '@/features/blog-plan'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'blog-read')
  return ok(await listCustomerKeywords(ctx.customer.id))
})
