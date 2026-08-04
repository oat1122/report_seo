import type { CustomerAccessContext } from '../../domain/AccessContext'
import { ForbiddenError } from '@/lib/errors'

export function enforceReadAccess(context: CustomerAccessContext): void {
  if (!context.canRead) {
    throw new ForbiddenError()
  }
}

export function enforceManageAccess(context: CustomerAccessContext): void {
  if (!context.canManage) {
    throw new ForbiddenError()
  }
}

export function enforceBlogPlanReadAccess(context: CustomerAccessContext): void {
  if (!context.canReadBlogPlan) {
    throw new ForbiddenError()
  }
}

export function enforceBlogPlanManageAccess(context: CustomerAccessContext): void {
  if (!context.canManageBlogPlan) {
    throw new ForbiddenError()
  }
}

export function enforceBlogPlanRespondAccess(context: CustomerAccessContext): void {
  if (!context.canRespondToBlogPlan) {
    throw new ForbiddenError()
  }
}
