import { z } from 'zod'

// code: UPPER_SNAKE_CASE — ใช้อ้างอิงทางโปรแกรม (ไม่ใช่ id)
const codeSchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9_]{1,49}$/, 'code ต้องเป็น UPPER_SNAKE_CASE (2-50 ตัว)')

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color ต้องเป็น hex #rrggbb')

// create ใส่ default ได้ — update ต้อง partial จาก fields ที่ไม่มี default
// (zod v4 .partial() ยังเติม default ของ field ข้างใน → PATCH {isActive} จะทับ isTerminal/orderIndex เดิม)

const categoryFields = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  color: hexColorSchema.optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().min(0),
  isActive: z.boolean(),
})

export const upsertCategorySchema = categoryFields.extend({
  orderIndex: categoryFields.shape.orderIndex.default(0),
  isActive: categoryFields.shape.isActive.default(true),
})

export const updateCategorySchema = categoryFields.partial()

export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

const statusFields = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  color: hexColorSchema.optional().nullable(),
  orderIndex: z.number().int().min(0),
  isTerminal: z.boolean(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
})

export const upsertStatusSchema = statusFields.extend({
  orderIndex: statusFields.shape.orderIndex.default(0),
  isTerminal: statusFields.shape.isTerminal.default(false),
  isDefault: statusFields.shape.isDefault.default(false),
  isActive: statusFields.shape.isActive.default(true),
})

export const updateStatusSchema = statusFields.partial()

export type UpsertStatusInput = z.infer<typeof upsertStatusSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

const markTypeFields = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  color: hexColorSchema.optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().min(0),
  isActive: z.boolean(),
})

export const upsertMarkTypeSchema = markTypeFields.extend({
  orderIndex: markTypeFields.shape.orderIndex.default(0),
  isActive: markTypeFields.shape.isActive.default(true),
})

export const updateMarkTypeSchema = markTypeFields.partial()

export type UpsertMarkTypeInput = z.infer<typeof upsertMarkTypeSchema>
export type UpdateMarkTypeInput = z.infer<typeof updateMarkTypeSchema>

export const masterIdParamSchema = z.object({ id: z.string().uuid() })

export const masterKindSchema = z.enum(['category', 'status', 'markType'])
export type MasterKindCode = z.infer<typeof masterKindSchema>
