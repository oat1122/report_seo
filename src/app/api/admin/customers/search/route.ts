import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { searchCustomers, searchCustomersQuerySchema } from '@/features/billing-documents'

export const GET = withApiHandler(
  { roles: [Role.ADMIN], query: searchCustomersQuerySchema },
  async ({ query }) => {
    const customers = await searchCustomers(query.q)
    return ok(customers)
  },
)
