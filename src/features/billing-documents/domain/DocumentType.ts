export type BillingDocumentType =
  | "BILLING_NOTE"
  | "INVOICE"
  | "RECEIPT"
  | "TAX_INVOICE";

export const DOCUMENT_TYPE_LABELS: Record<BillingDocumentType, string> = {
  BILLING_NOTE: "ใบวางบิล",
  INVOICE: "ใบแจ้งหนี้",
  RECEIPT: "ใบเสร็จรับเงิน",
  TAX_INVOICE: "ใบกำกับภาษี",
};

export const DOCUMENT_TYPE_PREFIXES: Record<BillingDocumentType, string> = {
  BILLING_NOTE: "BN",
  INVOICE: "INV",
  RECEIPT: "RCP",
  TAX_INVOICE: "TI",
};
