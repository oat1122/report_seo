import { z } from 'zod'
import { withApiHandler, created, customerAccessGuard } from '@/infrastructure/http'
import { generateDocument, generateDocumentSchema } from '@/features/billing-documents'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: generateDocumentSchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    const doc = await generateDocument({
      customerId: ctx.customer.id,
      ...body,
    })
    return created(doc)
  },
)
