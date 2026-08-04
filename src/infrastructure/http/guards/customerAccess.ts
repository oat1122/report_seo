import {
  CustomerAccessContext,
  enforceBlogPlanManageAccess,
  enforceBlogPlanReadAccess,
  enforceBlogPlanRespondAccess,
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
  type CustomerAccessQuery,
} from '@/features/customers'

export type AccessMode = 'read' | 'manage' | 'blog-read' | 'blog-manage' | 'blog-respond'

const ENFORCERS: Record<AccessMode, (ctx: CustomerAccessContext) => void> = {
  read: enforceReadAccess,
  manage: enforceManageAccess,
  'blog-read': enforceBlogPlanReadAccess,
  'blog-manage': enforceBlogPlanManageAccess,
  'blog-respond': enforceBlogPlanRespondAccess,
}

export async function customerAccessGuard(
  query: CustomerAccessQuery,
  mode: AccessMode,
): Promise<CustomerAccessContext> {
  const ctx = await resolveCustomerAccess(query)
  ENFORCERS[mode](ctx)
  return ctx
}
