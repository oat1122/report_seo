import { PrismaCompanySettingsRepository } from "./infrastructure/PrismaCompanySettingsRepository";
import { LocalLogoStorage } from "./infrastructure/LocalLogoStorage";

import { getCompanySettingsUseCase } from "./application/use-cases/getCompanySettings";
import { upsertCompanySettingsUseCase } from "./application/use-cases/upsertCompanySettings";
import { uploadLogoUseCase } from "./application/use-cases/uploadLogo";

const repo = new PrismaCompanySettingsRepository();
const logoStorage = new LocalLogoStorage();

export const getCompanySettings = getCompanySettingsUseCase(repo);
export const upsertCompanySettings = upsertCompanySettingsUseCase(repo);
export const uploadLogo = uploadLogoUseCase(repo, logoStorage);

export { companySettingsSchema } from "./schemas";
export type { CompanySettingsFormInput } from "./schemas";
export type { CompanySettings } from "./domain/CompanySettings";
