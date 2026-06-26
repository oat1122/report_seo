// Pure domain — ห้าม import React/Next/Prisma (rule 09)

export const NextStepPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const

export type NextStepPriority = (typeof NextStepPriority)[keyof typeof NextStepPriority]

export const NEXT_STEP_PRIORITIES: readonly NextStepPriority[] = [
  NextStepPriority.HIGH,
  NextStepPriority.MEDIUM,
  NextStepPriority.LOW,
]

export interface NextStepImage {
  id: string
  imageUrl: string
  createdAt: Date
  nextStepId: string
}

export interface NextStep {
  id: string
  customerId: string
  title: string
  description: string | null
  priority: NextStepPriority
  createdAt: Date
  updatedAt: Date
  images: NextStepImage[]
}
