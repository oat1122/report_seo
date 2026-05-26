import type { BillingDocumentType } from "../DocumentType";
import { DOCUMENT_TYPE_PREFIXES } from "../DocumentType";

export interface TransactionClient {
  documentSequence: {
    upsert: (args: {
      where: { prefix_year: { prefix: string; year: number } };
      create: { prefix: string; year: number; lastSeq: number };
      update: { lastSeq: { increment: number } };
    }) => Promise<{ lastSeq: number }>;
  };
}

export async function getNextDocumentNumber(
  tx: TransactionClient,
  type: BillingDocumentType,
  year: number,
): Promise<string> {
  const prefix = DOCUMENT_TYPE_PREFIXES[type];
  const seq = await tx.documentSequence.upsert({
    where: { prefix_year: { prefix, year } },
    create: { prefix, year, lastSeq: 1 },
    update: { lastSeq: { increment: 1 } },
  });
  const padded = String(seq.lastSeq).padStart(4, "0");
  return `${prefix}-${year}-${padded}`;
}
