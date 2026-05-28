import { z } from 'zod'

// code: UPPER_SNAKE_CASE — ใช้อ้างอิงทางโปรแกรม (ไม่ใช่ id)
const codeSchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9_]{1,49}$/, 'code ต้องเป็น UPPER_SNAKE_CASE (2-50 ตัว)')

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color ต้องเป็น hex #rrggbb')

export const upsertCategorySchema = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  color: hexColorSchema.optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const updateCategorySchema = upsertCategorySchema.partial().extend({
  code: codeSchema.optional(), // อัปเดต code ได้แต่ต้องคง pattern
})

export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export const upsertStatusSchema = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  color: hexColorSchema.optional().nullable(),
  orderIndex: z.number().int().min(0).optional().default(0),
  isTerminal: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

export const updateStatusSchema = upsertStatusSchema.partial().extend({
  code: codeSchema.optional(),
})

export type UpsertStatusInput = z.infer<typeof upsertStatusSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>

export const upsertMarkTypeSchema = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
  color: hexColorSchema.optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

export const updateMarkTypeSchema = upsertMarkTypeSchema.partial().extend({
  code: codeSchema.optional(),
})

export type UpsertMarkTypeInput = z.infer<typeof upsertMarkTypeSchema>
export type UpdateMarkTypeInput = z.infer<typeof updateMarkTypeSchema>

export const masterIdParamSchema = z.object({ id: z.string().uuid() })

export const masterKindSchema = z.enum(['category', 'status', 'markType'])
export type MasterKindCode = z.infer<typeof masterKindSchema>
