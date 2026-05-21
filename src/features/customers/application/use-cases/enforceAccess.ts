import type { CustomerAccessContext } from "../../domain/AccessContext";
import { ForbiddenError } from "@/lib/errors";

export function enforceReadAccess(context: CustomerAccessContext): void {
  if (!context.canRead) {
    throw new ForbiddenError();
  }
}

export function enforceManageAccess(context: CustomerAccessContext): void {
  if (!context.canManage) {
    throw new ForbiddenError();
  }
}
