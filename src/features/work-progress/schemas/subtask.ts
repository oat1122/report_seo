import { z } from "zod";

export const addSubtaskSchema = z.object({
  title: z.string().min(1).max(500),
  assignedToId: z.string().uuid().nullable().optional(),
  orderIndex: z.number().int().min(0).nullable().optional(),
});

export type AddSubtaskInput = z.infer<typeof addSubtaskSchema>;

export const updateSubtaskSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    isDone: z.boolean().optional(),
    assignedToId: z.string().uuid().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "ต้องระบุอย่างน้อย 1 field ที่จะแก้ไข",
  });

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;

export const reorderSubtasksSchema = z.object({
  order: z
    .array(
      z.object({
        subtaskId: z.string().uuid(),
        orderIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type ReorderSubtasksInput = z.infer<typeof reorderSubtasksSchema>;
