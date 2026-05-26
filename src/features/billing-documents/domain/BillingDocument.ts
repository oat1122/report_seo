import type { BillingDocumentType } from "./DocumentType";

export interface BillingDocument {
  id: string;
  documentNumber: string;
  type: BillingDocumentType;
  pdfUrl: string;
  totalAmount: number;
  note: string | null;
  generatedAt: Date;
  customerId: string;
  billingCycleId: string | null;
}

export interface BillingDocumentWithCustomer extends BillingDocument {
  customer: {
    name: string;
    domain: string;
  };
}
