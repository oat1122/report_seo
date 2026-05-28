import { z } from 'zod'
import { WorkProgressPeriodType } from '@prisma/client'

const templateSubtaskSeedSchema = z.object({
  title: z.string().min(1).max(500),
  orderIndex: z.number().int().min(0).optional(),
})

const templateItemBaseSchema = z.object({
  categoryId: z.string().uuid(),
  activity: z.string().min(1).max(2000),
  description: z.string().max(5000).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  weight: z.number().int().min(1).max(100).optional().default(1),
  orderIndex: z.number().int().min(0).optional(),
  defaultPeriods: z.record(z.string(), z.unknown()).optional().nullable(),
  subtasks: z.array(templateSubtaskSeedSchema).max(200).optional(),
})

export const addTemplateItemSchema = templateItemBaseSchema
export type AddTemplateItemInput = z.infer<typeof addTemplateItemSchema>

export const updateTemplateItemSchema = templateItemBaseSchema.partial()
export type UpdateTemplateItemInput = z.infer<typeof updateTemplateItemSchema>

export const upsertTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  periodType: z
    .nativeEnum(WorkProgressPeriodType)
    .optional()
    .default(WorkProgressPeriodType.YEAR_12_MONTHS),
  durationMonths: z.number().int().min(1).max(120).optional().default(12),
  isActive: z.boolean().optional().default(true),
  items: z.array(templateItemBaseSchema).optional(),
})
export type UpsertTemplateInput = z.infer<typeof upsertTemplateSchema>

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  periodType: z.nativeEnum(WorkProgressPeriodType).optional(),
  durationMonths: z.number().int().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
})
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>

export const reorderTemplateItemsSchema = z.object({
  order: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
})
export type ReorderTemplateItemsInput = z.infer<typeof reorderTemplateItemsSchema>

export const listTemplatesQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false),
})
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>

export const templateIdParamSchema = z.object({ id: z.string().uuid() })
