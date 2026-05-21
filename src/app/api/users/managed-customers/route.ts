import { listManagedCustomers } from "@/features/users";
import { withApiHandler, ok } from "@/infrastructure/http";
import { Role } from "@/types/auth";

export const GET = withApiHandler(
  { roles: [Role.SEO_DEV] },
  async ({ session }) => ok(await listManagedCustomers(session.user.id)),
);
