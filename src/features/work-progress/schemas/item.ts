import { z } from "zod";

export const addItemSchema = z.object({
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
});

export type AddItemInput = z.infer<typeof addItemSchema>;

export const updateItemSchema = z.object({
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
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const reorderItemsSchema = z.object({
  order: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
