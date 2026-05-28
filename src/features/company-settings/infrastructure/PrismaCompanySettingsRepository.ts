import { prisma } from '@/lib/prisma'
import { BadRequestError } from '@/lib/errors'
import type { CompanySettings } from '../domain/CompanySettings'
import type {
  CompanySettingsInput,
  CompanySettingsRepository,
} from '../application/ports/CompanySettingsRepository'

export class PrismaCompanySettingsRepository implements CompanySettingsRepository {
  async get(): Promise<CompanySettings | null> {
    return prisma.companySettings.findFirst()
  }

  async upsert(data: CompanySettingsInput): Promise<CompanySettings> {
    const existing = await prisma.companySettings.findFirst()

    if (existing) {
      return prisma.companySettings.update({
        where: { id: existing.id },
        data,
      })
    }

    return prisma.companySettings.create({ data })
  }

  async updateLogoUrl(logoUrl: string | null): Promise<CompanySettings> {
    const existing = await prisma.companySettings.findFirst()
    if (!existing) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนอัปโหลดโลโก้')
    }

    return prisma.companySettings.update({
      where: { id: existing.id },
      data: { logoUrl },
    })
  }
}
