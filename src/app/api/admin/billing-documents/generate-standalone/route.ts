import { withApiHandler, created } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import {
  generateStandaloneDocument,
  generateStandaloneDocumentSchema,
} from '@/features/billing-documents'

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: generateStandaloneDocumentSchema },
  async ({ body }) => {
    const doc = await generateStandaloneDocument(body)
    return created(doc)
  },
)
