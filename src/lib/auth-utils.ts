import { getCurrentSession } from '@/infrastructure/auth/session'
import { Role } from '@/types/auth'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { customerAccessGuard, type AccessMode } from '@/infrastructure/http/guards/customerAccess'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/lib/errors'

/**
 * Get server session with type safety
 */
export async function getSession() {
  return getCurrentSession()
}

/**
 * Get authenticated user or redirect to login
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return session
}

/**
 * Check if user has specific role
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Require specific role or redirect to unauthorized page
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return await requireRole([Role.ADMIN])
}

/**
 * Check if user is admin or SEO dev
 */
export async function requireStaff() {
  return await requireRole([Role.ADMIN, Role.SEO_DEV])
}

/**
 * Check if user is customer
 */
export async function requireCustomer() {
  return await requireRole([Role.CUSTOMER])
}

/**
 * Check if user can open the blog writing workspace
 */
export async function requireBlogWriter() {
  return await requireRole([Role.ADMIN, Role.BLOG_WRITER])
}

/**
 * หน้า server ที่รับ [userId] ของลูกค้า — ปิด IDOR (CUSTOMER เห็นแค่ตัวเอง, SEO_DEV เห็นแค่ลูกค้าที่ดูแล)
 * ต้องเรียกในตัว page เอง ไม่ใช่ layout: layout ไม่ re-render ตอน navigate ระหว่างหน้าลูก
 */
export async function requireCustomerPageAccess(userId: string, mode: AccessMode = 'read') {
  if (!z.uuid().safeParse(userId).success) notFound()
  try {
    return await customerAccessGuard({ byUserId: userId }, mode)
  } catch (err) {
    if (err instanceof NotFoundError) notFound()
    if (err instanceof ForbiddenError || err instanceof UnauthorizedError) redirect('/unauthorized')
    throw err
  }
}
