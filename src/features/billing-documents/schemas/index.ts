import { z } from "zod";

export const documentItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().trim().min(1, "กรุณาระบุรายละเอียด"),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().trim().default("รายการ"),
  unitPrice: z.number().min(0, "ราคาต้องไม่ติดลบ"),
  orderIndex: z.number().int().default(0),
});

export const upsertDocumentItemsSchema = z.object({
  items: z.array(documentItemSchema).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
});

export const generateDocumentSchema = z.object({
  type: z.enum(["BILLING_NOTE", "INVOICE", "RECEIPT", "TAX_INVOICE"]),
  billingCycleId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
});

export type DocumentItemInput = z.infer<typeof documentItemSchema>;
export type UpsertDocumentItemsInput = z.infer<typeof upsertDocumentItemsSchema>;
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
