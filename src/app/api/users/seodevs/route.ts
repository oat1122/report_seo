import { listSeoDevs } from "@/features/users";
import { withApiHandler, ok } from "@/infrastructure/http";
import { Role } from "@/types/auth";

export const GET = withApiHandler(
  { roles: [Role.ADMIN] },
  async () => ok(await listSeoDevs()),
);
