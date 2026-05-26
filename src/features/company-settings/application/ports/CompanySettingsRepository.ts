import type { CompanySettings } from "../../domain/CompanySettings";

export interface CompanySettingsInput {
  name: string;
  address: string;
  taxId: string;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export interface CompanySettingsRepository {
  get(): Promise<CompanySettings | null>;
  upsert(data: CompanySettingsInput): Promise<CompanySettings>;
  updateLogoUrl(logoUrl: string | null): Promise<CompanySettings>;
}
