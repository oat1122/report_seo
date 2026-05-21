import {
  CustomerAccessContext,
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
  type CustomerAccessQuery,
} from "@/features/customers";

export type AccessMode = "read" | "manage";

export async function customerAccessGuard(
  query: CustomerAccessQuery,
  mode: AccessMode,
): Promise<CustomerAccessContext> {
  const ctx = await resolveCustomerAccess(query);
  if (mode === "manage") {
    enforceManageAccess(ctx);
  } else {
    enforceReadAccess(ctx);
  }
  return ctx;
}
