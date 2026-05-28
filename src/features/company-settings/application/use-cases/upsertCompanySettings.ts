import type {
  CompanySettingsInput,
  CompanySettingsRepository,
} from '../ports/CompanySettingsRepository'

export function upsertCompanySettingsUseCase(repo: CompanySettingsRepository) {
  return (data: CompanySettingsInput) => repo.upsert(data)
}
