import { z } from 'zod'
import { withApiHandler, ok, noContent } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import {
  getDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
  updateDocumentTemplateSchema,
} from '@/features/billing-documents'

const paramsSchema = z.object({
  templateId: z.string().uuid(),
})

export const GET = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema },
  async ({ params }) => {
    return ok(await getDocumentTemplate(params.templateId))
  },
)

export const PATCH = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema, body: updateDocumentTemplateSchema },
  async ({ params, body }) => {
    return ok(await updateDocumentTemplate(params.templateId, body))
  },
)

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema },
  async ({ params }) => {
    await deleteDocumentTemplate(params.templateId)
    return noContent()
  },
)
