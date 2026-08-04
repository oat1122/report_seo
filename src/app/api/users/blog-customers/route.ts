import { listBlogAssignedCustomers } from '@/features/users'
import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'

// รายชื่อลูกค้าที่ blog writer คนนี้ถูก assign ให้ดูแล — ใช้เป็นหน้าแรกของ /blog
export const GET = withApiHandler({ roles: [Role.BLOG_WRITER] }, async ({ session }) =>
  ok(await listBlogAssignedCustomers(session.user.id)),
)
