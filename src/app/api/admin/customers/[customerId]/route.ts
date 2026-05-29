import { z } from 'zod'
import { withApiHandler, noContent } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { updateCustomerInfo, updateCustomerInfoSchema } from '@/features/billing-documents'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const PATCH = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema, body: updateCustomerInfoSchema },
  async ({ params, body }) => {
    await updateCustomerInfo(params.customerId, body)
    return noContent()
  },
)
