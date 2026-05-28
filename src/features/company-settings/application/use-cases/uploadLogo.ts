import type { CompanySettingsRepository } from '../ports/CompanySettingsRepository'
import type { LogoStorage } from '../ports/LogoStorage'

export function uploadLogoUseCase(repo: CompanySettingsRepository, storage: LogoStorage) {
  return async (file: File) => {
    const existing = await repo.get()
    const saved = await storage.validateAndWrite(file)

    try {
      const updated = await repo.updateLogoUrl(saved.url)

      if (existing?.logoUrl) {
        const oldPath = existing.logoUrl.replace(/^\//, '')
        const path = await import('path')
        const absoluteOld = path.resolve(process.cwd(), 'public', oldPath)
        await storage.removeByAbsolutePath(absoluteOld)
      }

      return updated
    } catch (error) {
      await storage.removeByAbsolutePath(saved.absolutePath)
      throw error
    }
  }
}
