import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/nextAuthOptions'
import { Role } from '@/types/auth'
import type { SessionUser } from '../domain/AccessContext'
import type { SessionGateway } from '../application/ports/SessionGateway'

export class NextAuthSessionGateway implements SessionGateway {
  async getCurrentUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null
    return {
      id: session.user.id,
      role: session.user.role as Role,
    }
  }
}
