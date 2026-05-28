import type { CompanySettingsRepository } from '../ports/CompanySettingsRepository'

export function getCompanySettingsUseCase(repo: CompanySettingsRepository) {
  return () => repo.get()
}
