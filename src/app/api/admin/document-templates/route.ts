import { withApiHandler, ok, created } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import {
  listDocumentTemplates,
  createDocumentTemplate,
  listTemplatesQuerySchema,
  createDocumentTemplateSchema,
} from '@/features/billing-documents'

export const GET = withApiHandler(
  { roles: [Role.ADMIN], query: listTemplatesQuerySchema },
  async ({ query }) => {
    return ok(await listDocumentTemplates(query.scope))
  },
)

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: createDocumentTemplateSchema },
  async ({ body }) => {
    return created(await createDocumentTemplate(body))
  },
)
