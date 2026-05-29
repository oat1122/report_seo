import { z } from 'zod'
import { withApiHandler, ok, customerAccessGuard } from '@/infrastructure/http'
import { assignDocumentToCycle, assignDocumentCycleSchema } from '@/features/billing-documents'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  documentId: z.string().uuid(),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: assignDocumentCycleSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    const doc = await assignDocumentToCycle(params.documentId, ctx.customer.id, body.billingCycleId)
    return ok(doc)
  },
)
