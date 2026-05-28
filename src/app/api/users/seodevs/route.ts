import { listSeoDevs } from '@/features/users'
import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'

// อนุญาตทั้ง ADMIN และ SEO_DEV — staff ต้องเห็นกันเองสำหรับ assignee picker ใน work-progress
export const GET = withApiHandler({ roles: [Role.ADMIN, Role.SEO_DEV] }, async () =>
  ok(await listSeoDevs()),
)
