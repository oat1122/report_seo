import { prisma } from "@/lib/prisma";
import type { CompanySettings } from "../domain/CompanySettings";
import type {
  CompanySettingsInput,
  CompanySettingsRepository,
} from "../application/ports/CompanySettingsRepository";

export class PrismaCompanySettingsRepository
  implements CompanySettingsRepository
{
  async get(): Promise<CompanySettings | null> {
    return prisma.companySettings.findFirst();
  }

  async upsert(data: CompanySettingsInput): Promise<CompanySettings> {
    const existing = await prisma.companySettings.findFirst();

    if (existing) {
      return prisma.companySettings.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.companySettings.create({ data });
  }

  async updateLogoUrl(logoUrl: string | null): Promise<CompanySettings> {
    const existing = await prisma.companySettings.findFirst();
    if (!existing) {
      throw new Error("Company settings not found — create settings first");
    }

    return prisma.companySettings.update({
      where: { id: existing.id },
      data: { logoUrl },
    });
  }
}
