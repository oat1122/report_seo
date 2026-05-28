import { z } from 'zod'
import { withApiHandler, noContent } from '@/infrastructure/http'
import { deleteContractFile } from '@/features/payments'
import { Role } from '@/types/auth'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  contractId: z.string().uuid(),
})

export const DELETE = withApiHandler(
  { params: paramsSchema, roles: [Role.ADMIN] },
  async ({ params }) => {
    await deleteContractFile(params.contractId)
    return noContent()
  },
)
