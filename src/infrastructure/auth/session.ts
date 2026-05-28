import { getServerSession, type Session } from 'next-auth'
import { authOptions } from './nextAuthOptions'
import { ForbiddenError, UnauthorizedError } from '@/lib/errors'
import { Role } from '@/types/auth'

export async function getCurrentSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function requireSession(): Promise<Session> {
  const session = await getCurrentSession()
  if (!session?.user) {
    throw new UnauthorizedError()
  }
  return session
}

export async function requireRole(allowedRoles: Role[]): Promise<Session> {
  const session = await requireSession()
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError()
  }
  return session
}
