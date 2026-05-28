import { withApiHandler, ok, created } from '@/infrastructure/http'
import {
  createTemplate,
  listTemplates,
  listTemplatesQuerySchema,
  upsertTemplateSchema,
} from '@/features/work-progress'
import { Role } from '@/types/auth'

// อ่านได้ทุก role ที่ login — UI สร้าง plan ต้องใช้รายการ template
export const GET = withApiHandler(
  { auth: true, query: listTemplatesQuerySchema },
  async ({ query }) => {
    return ok(await listTemplates({ includeInactive: query.includeInactive }))
  },
)

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: upsertTemplateSchema },
  async ({ body, session }) => created(await createTemplate(session.user.id, body)),
)
