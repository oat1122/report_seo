import { withApiHandler, ok, created } from "@/infrastructure/http";
import {
  createCategory,
  listCategories,
  upsertCategorySchema,
} from "@/features/work-progress";
import { Role } from "@/types/auth";

// อ่านได้ทุก role ที่ login — UI ของ Plan grid ต้องใช้
export const GET = withApiHandler({ auth: true }, async () => {
  return ok(await listCategories({ onlyActive: false }));
});

export const POST = withApiHandler(
  { roles: [Role.ADMIN], body: upsertCategorySchema },
  async ({ body }) => created(await createCategory(body)),
);
