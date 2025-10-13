import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@/types/auth";
import { redirect } from "next/navigation";

/**
 * Get server session with type safety
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get authenticated user or redirect to login
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Check if user has specific role
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Require specific role or redirect to unauthorized page
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return await requireRole([Role.ADMIN]);
}

/**
 * Check if user is admin or SEO dev
 */
export async function requireStaff() {
  return await requireRole([Role.ADMIN, Role.SEO_DEV]);
}

/**
 * Check if user is customer
 */
export async function requireCustomer() {
  return await requireRole([Role.CUSTOMER]);
}
