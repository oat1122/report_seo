import { withApiHandler, ok } from "@/infrastructure/http";
import {
  getCompanySettings,
  upsertCompanySettings,
  companySettingsSchema,
} from "@/features/company-settings";
import { Role } from "@/types/auth";

export const GET = withApiHandler(
  { roles: [Role.ADMIN] },
  async () => ok(await getCompanySettings()),
);

export const PUT = withApiHandler(
  { roles: [Role.ADMIN], body: companySettingsSchema },
  async ({ body }) => ok(await upsertCompanySettings(body)),
);
