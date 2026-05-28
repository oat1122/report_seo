import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { listAllDocuments, listAllDocumentsQuerySchema } from '@/features/billing-documents'

export const GET = withApiHandler(
  { roles: [Role.ADMIN], query: listAllDocumentsQuerySchema },
  async ({ query }) => {
    const docs = await listAllDocuments(query)
    return ok(docs)
  },
)
