import { withApiHandler, ok } from "@/infrastructure/http";
import { Role } from "@/types/auth";
import { getAdminHubSummary } from "@/features/admin-hub";

export const GET = withApiHandler(
  { roles: [Role.ADMIN] },
  async () => {
    const summary = await getAdminHubSummary();
    return ok(summary);
  },
);
