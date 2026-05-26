import type { BillingDocument } from "../../domain/BillingDocument";
import type { DocumentItem } from "../../domain/DocumentItem";
import type { BillingDocumentType } from "../../domain/DocumentType";

export interface DocumentItemInput {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  orderIndex: number;
}

export interface CreateDocumentInput {
  customerId: string;
  documentNumber: string;
  type: BillingDocumentType;
  pdfUrl: string;
  totalAmount: number;
  note?: string | null;
  billingCycleId?: string | null;
}

export interface CustomerForDocument {
  id: string;
  name: string;
  domain: string;
  address: string | null;
  taxId: string | null;
  contactName: string | null;
}

export interface BillingDocumentRepository {
  listDocumentItems(customerId: string): Promise<DocumentItem[]>;
  upsertDocumentItems(
    customerId: string,
    items: DocumentItemInput[],
  ): Promise<DocumentItem[]>;
  deleteDocumentItem(itemId: string): Promise<void>;

  createDocument(input: CreateDocumentInput): Promise<BillingDocument>;
  listDocuments(
    customerId: string,
    type?: BillingDocumentType,
  ): Promise<BillingDocument[]>;
  getDocument(documentId: string): Promise<BillingDocument | null>;
  deleteDocument(documentId: string): Promise<void>;

  getCustomerForDocument(customerId: string): Promise<CustomerForDocument | null>;

  getNextDocumentNumber(
    type: BillingDocumentType,
    year: number,
  ): Promise<string>;
}
