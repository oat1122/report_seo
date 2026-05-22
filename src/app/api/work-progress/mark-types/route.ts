import { withApiHandler, ok, created } from "@/infrastructure/http";
import {
  createMarkType,
  listMarkTypes,
  upsertMarkTypeSchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

export const GET = withApiHandler({ auth: true }, async () => {
  return ok(await listMarkTypes({ onlyActive: false }));
});

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: upsertMarkTypeSchema },
  async ({ body }) => created(await createMarkType(body)),
);
