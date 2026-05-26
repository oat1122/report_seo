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

export interface BillingDocumentWithCycle extends BillingDocument {
  billingCycle: {
    cycleNumber: number;
    dueDate: Date;
    paidDate: Date | null;
    amount: number;
    plan: {
      id: string;
      description: string;
    };
  } | null;
}

export interface AdminBillingDocument extends BillingDocument {
  customer: {
    id: string;
    userId: string;
    name: string;
    domain: string;
  };
  billingCycle: {
    cycleNumber: number;
    dueDate: Date;
    paidDate: Date | null;
    amount: number;
    plan: {
      id: string;
      description: string;
    };
  } | null;
}
