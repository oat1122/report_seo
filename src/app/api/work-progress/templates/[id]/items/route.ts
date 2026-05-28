import { withApiHandler, created } from '@/infrastructure/http'
import {
  addTemplateItem,
  addTemplateItemSchema,
  templateIdParamSchema,
} from '@/features/work-progress'
import { Role } from '@/types/auth'

export const POST = withApiHandler(
  {
    roles: [Role.ADMIN],
    params: templateIdParamSchema,
    body: addTemplateItemSchema,
  },
  async ({ params, body }) => created(await addTemplateItem(params.id, body)),
)
