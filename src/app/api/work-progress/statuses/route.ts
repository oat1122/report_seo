import { withApiHandler, ok, created } from '@/infrastructure/http'
import { createStatus, listStatuses, upsertStatusSchema } from '@/features/work-progress'
import { Role } from '@/types/auth'

export const GET = withApiHandler({ auth: true }, async () => {
  return ok(await listStatuses({ onlyActive: false }))
})

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: upsertStatusSchema },
  async ({ body }) => created(await createStatus(body)),
)
