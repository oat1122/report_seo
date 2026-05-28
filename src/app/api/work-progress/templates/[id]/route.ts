import { withApiHandler, ok, noContent } from '@/infrastructure/http'
import {
  deleteTemplate,
  getTemplate,
  templateIdParamSchema,
  updateTemplate,
  updateTemplateSchema,
} from '@/features/work-progress'
import { Role } from '@/types/auth'

export const GET = withApiHandler(
  { auth: true, params: templateIdParamSchema },
  async ({ params }) => ok(await getTemplate(params.id)),
)

export const PATCH = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: templateIdParamSchema,
    body: updateTemplateSchema,
  },
  async ({ params, body }) => ok(await updateTemplate(params.id, body)),
)

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: templateIdParamSchema },
  async ({ params }) => {
    await deleteTemplate(params.id)
    return noContent()
  },
)
