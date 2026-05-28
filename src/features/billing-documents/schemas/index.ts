import { z } from 'zod'

// --- Document Template ---

export const documentTemplateItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().trim().min(1, 'กรุณาระบุรายละเอียด'),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().trim().default('รายการ'),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  orderIndex: z.number().int().default(0),
})

export const createDocumentTemplateSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อ template').max(200),
  scope: z.enum(['GENERAL', 'PLAN']).default('GENERAL'),
  isActive: z.boolean().default(true),
  items: z.array(documentTemplateItemSchema).optional(),
})

export const updateDocumentTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  scope: z.enum(['GENERAL', 'PLAN']).optional(),
  isActive: z.boolean().optional(),
})

export const upsertTemplateItemsSchema = z.object({
  items: z.array(documentTemplateItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
})

export const listTemplatesQuerySchema = z.object({
  scope: z.enum(['GENERAL', 'PLAN']).optional(),
})

// --- Document Generation ---

export const generateDocumentSchema = z.object({
  type: z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']),
  templateId: z.string().uuid().nullable().optional(),
  billingCycleId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
})

export const updateDocumentItemSchema = z.object({
  description: z.string().trim().min(1, 'กรุณาระบุรายละเอียด'),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().trim().default('รายการ'),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export const updateDocumentSchema = z.object({
  type: z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']),
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
  items: z.array(updateDocumentItemSchema).min(1).optional(),
})

export const generateAllForCycleSchema = z.object({
  billingCycleId: z.string().uuid(),
  note: z.string().trim().max(500).nullable().optional(),
})

export const listAllDocumentsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']).optional(),
  customerId: z.string().uuid().optional(),
})

// --- Standalone Document ---

export const standaloneCustomerSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อลูกค้า'),
  address: z.string().trim().nullable().optional(),
  taxId: z.string().trim().nullable().optional(),
  contactName: z.string().trim().nullable().optional(),
})

export const standaloneItemSchema = z.object({
  description: z.string().trim().min(1, 'กรุณาระบุรายละเอียด'),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().trim().default('รายการ'),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export const generateStandaloneDocumentSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  customer: standaloneCustomerSchema,
  type: z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']),
  templateId: z.string().uuid(),
  items: z.array(standaloneItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
})

export const searchCustomersQuerySchema = z.object({
  q: z.string().min(1),
})

// --- Inferred Types ---

export type DocumentTemplateItemInput = z.infer<typeof documentTemplateItemSchema>
export type CreateDocumentTemplateInput = z.infer<typeof createDocumentTemplateSchema>
export type UpdateDocumentTemplateInput = z.infer<typeof updateDocumentTemplateSchema>
export type UpsertTemplateItemsInput = z.infer<typeof upsertTemplateItemsSchema>
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type UpdateDocumentItemInput = z.infer<typeof updateDocumentItemSchema>
export type GenerateAllForCycleInput = z.infer<typeof generateAllForCycleSchema>
export type ListAllDocumentsQuery = z.infer<typeof listAllDocumentsQuerySchema>
export type StandaloneCustomerInfo = z.infer<typeof standaloneCustomerSchema>
export type GenerateStandaloneDocumentInput = z.infer<typeof generateStandaloneDocumentSchema>
export type SearchCustomersQuery = z.infer<typeof searchCustomersQuerySchema>
