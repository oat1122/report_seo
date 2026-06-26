import { z } from 'zod'
import { NextStepPriority } from '../domain/NextStep'

export const nextStepSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').nullable().optional(),
  priority: z.enum(NextStepPriority).default(NextStepPriority.MEDIUM),
})

export type NextStepInput = z.infer<typeof nextStepSchema>

// แปลง description ที่ user ส่งมา → null (รองรับทั้ง undefined, "", "  ")
export function normalizeDescription(description: string | null | undefined): string | null {
  if (description == null) return null
  const trimmed = description.trim()
  return trimmed === '' ? null : trimmed
}
