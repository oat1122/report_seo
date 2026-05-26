export interface CompanySettings {
  id: string;
  name: string;
  address: string;
  taxId: string;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
