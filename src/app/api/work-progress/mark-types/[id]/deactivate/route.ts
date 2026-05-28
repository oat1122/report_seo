import { withApiHandler, noContent } from '@/infrastructure/http'
import { deactivateMasterRow, masterIdParamSchema } from '@/features/work-progress'
import { Role } from '@/types/auth'

export const POST = withApiHandler(
  { roles: [Role.ADMIN], params: masterIdParamSchema },
  async ({ params }) => {
    await deactivateMasterRow('markType', params.id)
    return noContent()
  },
)
