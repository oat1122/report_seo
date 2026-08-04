import { listBlogWriters } from '@/features/users'
import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'

// ADMIN เท่านั้น — ใช้เป็นตัวเลือกตอน assign blog writer ให้ลูกค้า
export const GET = withApiHandler({ roles: [Role.ADMIN] }, async () => ok(await listBlogWriters()))
