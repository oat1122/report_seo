import { z } from 'zod'
import { withApiHandler, ok, noContent } from '@/infrastructure/http'
import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { Role } from '@/types/auth'
import {
  getUserById,
  softDeleteUser,
  updateUser,
  userSelfUpdateSchema,
  userUpdateSchema,
} from '@/features/users'

const idParamsSchema = z.object({ id: z.uuid() })

export const GET = withApiHandler({ params: idParamsSchema }, async ({ session, params }) => {
  const isOwner = session.user.id === params.id
  const isAdmin = session.user.role === Role.ADMIN
  if (!isOwner && !isAdmin) throw new ForbiddenError()

  const user = await getUserById(params.id, { includeAdminFields: isAdmin })
  if (!user) throw new NotFoundError('User not found')
  return ok(user)
})

export const PUT = withApiHandler({ params: idParamsSchema }, async ({ req, session, params }) => {
  const isOwner = session.user.id === params.id
  const isAdmin = session.user.role === Role.ADMIN
  if (!isOwner && !isAdmin) throw new ForbiddenError()

  const raw = await req.json().catch(() => {
    throw new BadRequestError('Invalid JSON body')
  })
  const input = isAdmin ? userUpdateSchema.parse(raw) : userSelfUpdateSchema.parse(raw)
  await updateUser(params.id, input)
  // applyUpdate คืน admin select เสมอ — อ่านใหม่ตามสิทธิ์เหมือน GET กัน field admin หลุดถึง owner
  return ok(await getUserById(params.id, { includeAdminFields: isAdmin }))
})

export const DELETE = withApiHandler(
  { roles: [Role.ADMIN], params: idParamsSchema },
  async ({ params }) => {
    await softDeleteUser(params.id)
    return noContent()
  },
)
