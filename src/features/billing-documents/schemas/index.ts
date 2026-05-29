import { z } from 'zod'

const documentTypeSchema = z.enum(['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE'])

// ข้อมูลลูกค้าบนเอกสาร — ใช้ทั้งตอนสร้าง (standalone) และตอนแก้ไข
export const standaloneCustomerSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อลูกค้า'),
  address: z.string().trim().nullable().optional(),
  taxId: z.string().trim().nullable().optional(),
  contactName: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
})

// --- Document Update (regenerate PDF from manual items) ---

export const updateDocumentItemSchema = z.object({
  description: z.string().trim().min(1, 'กรุณาระบุรายละเอียด'),
  quantity: z.number().int().min(1).default(1),
  unit: z.string().trim().default('รายการ'),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export const updateDocumentSchema = z.object({
  type: documentTypeSchema,
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
  // ข้อมูลลูกค้าที่แก้บนเอกสาร (optional) — ถ้าไม่ส่งจะ render จากข้อมูลใน DB
  customer: standaloneCustomerSchema.optional(),
  items: z.array(updateDocumentItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
})

export const listAllDocumentsQuerySchema = z.object({
  search: z.string().optional(),
  type: documentTypeSchema.optional(),
  customerId: z.string().uuid().optional(),
})

// --- Standalone Document ---

// --- Update Customer Info (sync DB ให้ตรงกับเอกสารที่สร้าง) ---

export const updateCustomerInfoSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อลูกค้า'),
  address: z.string().trim().max(500).nullable(),
  taxId: z.string().trim().max(13).nullable(),
  contactName: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(20).nullable(),
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
  type: documentTypeSchema,
  items: z.array(standaloneItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
  note: z.string().trim().max(500).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
})

// --- Upload Document (file from local machine) ---

export const uploadDocumentSchema = z.object({
  type: documentTypeSchema,
  billingCycleId: z.string().uuid().nullable().optional(),
})

// --- Assign Document to Billing Cycle (ผูก/ถอดเอกสารกับงวด) ---

export const assignDocumentCycleSchema = z.object({
  billingCycleId: z.string().uuid().nullable(),
})

export const searchCustomersQuerySchema = z.object({
  q: z.string().optional().default(''),
})

// --- Inferred Types ---

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type UpdateDocumentItemInput = z.infer<typeof updateDocumentItemSchema>
export type ListAllDocumentsQuery = z.infer<typeof listAllDocumentsQuerySchema>
export type StandaloneCustomerInfo = z.infer<typeof standaloneCustomerSchema>
export type UpdateCustomerInfoInput = z.infer<typeof updateCustomerInfoSchema>
export type GenerateStandaloneDocumentInput = z.infer<typeof generateStandaloneDocumentSchema>
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
export type AssignDocumentCycleInput = z.infer<typeof assignDocumentCycleSchema>
export type SearchCustomersQuery = z.infer<typeof searchCustomersQuerySchema>
