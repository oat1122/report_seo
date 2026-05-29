import { z } from 'zod'

// Recurrence — งานทำซ้ำรายเดือน (เก็บเฉพาะกฎ)
// add: ใส่ default ได้ (สร้างใหม่) — update: optional ล้วน เพื่อไม่ทับค่าเดิมตอน partial update
const recurrenceFieldsForAdd = {
  isRecurring: z.boolean().optional().default(false),
  recurrenceFreq: z.enum(['MONTHLY']).optional().nullable(),
  recurrenceInterval: z.number().int().min(1).max(12).optional().default(1),
  recurrenceDayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
}

const recurrenceFieldsForUpdate = {
  isRecurring: z.boolean().optional(),
  recurrenceFreq: z.enum(['MONTHLY']).optional().nullable(),
  recurrenceInterval: z.number().int().min(1).max(12).optional(),
  recurrenceDayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
}

// ถ้าเปิด isRecurring ต้องระบุ freq + dayOfMonth ให้ครบ
const recurrenceRefinement = (
  val: {
    isRecurring?: boolean
    recurrenceFreq?: string | null
    recurrenceDayOfMonth?: number | null
  },
  ctx: z.RefinementCtx,
) => {
  if (!val.isRecurring) return
  if (!val.recurrenceFreq) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'งานทำซ้ำต้องระบุความถี่',
      path: ['recurrenceFreq'],
    })
  }
  if (val.recurrenceDayOfMonth == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'งานทำซ้ำต้องระบุวันในเดือน',
      path: ['recurrenceDayOfMonth'],
    })
  }
}

export const addItemSchema = z
  .object({
    categoryId: z.string().uuid(),
    statusId: z.string().uuid().optional(), // ถ้าไม่ส่ง → use case ใส่ default status
    activity: z.string().min(1).max(2000),
    description: z.string().max(5000).optional().nullable(),
    duration: z.string().max(100).optional().nullable(),
    note: z.string().max(5000).optional().nullable(),
    weight: z.number().int().min(1).max(100).optional().default(1),
    orderIndex: z.number().int().min(0).optional(),
    startDate: z.coerce.date().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    ...recurrenceFieldsForAdd,
  })
  .superRefine(recurrenceRefinement)

export type AddItemInput = z.infer<typeof addItemSchema>

export const updateItemSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
    activity: z.string().min(1).max(2000).optional(),
    description: z.string().max(5000).optional().nullable(),
    duration: z.string().max(100).optional().nullable(),
    note: z.string().max(5000).optional().nullable(),
    weight: z.number().int().min(1).max(100).optional(),
    progressPercent: z.number().int().min(0).max(100).optional(),
    startDate: z.coerce.date().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    ...recurrenceFieldsForUpdate,
  })
  .superRefine(recurrenceRefinement)

export type UpdateItemInput = z.infer<typeof updateItemSchema>

export const reorderItemsSchema = z.object({
  order: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
})

export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>

// Phase 3: assignee
export const assignItemSchema = z.object({
  assignedToId: z.string().uuid().nullable(),
})

export type AssignItemInput = z.infer<typeof assignItemSchema>

// Phase 6 — Bulk operations
export const bulkUpdateItemStatusSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(200),
  statusId: z.string().uuid(),
})

export type BulkUpdateItemStatusInput = z.infer<typeof bulkUpdateItemStatusSchema>

export const bulkDeleteItemsSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(200),
})

export type BulkDeleteItemsInput = z.infer<typeof bulkDeleteItemsSchema>
