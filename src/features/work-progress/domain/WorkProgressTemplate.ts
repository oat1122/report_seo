// pure TS — ห้าม import @prisma/client / React / Next (rule 09)
import type { PeriodTypeCode } from './types'

export interface WorkProgressTemplate {
  id: string
  name: string
  description: string | null
  periodType: PeriodTypeCode
  durationMonths: number
  isActive: boolean
  isSystem: boolean
  createdById: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkProgressTemplateSubtask {
  id: string
  templateItemId: string
  title: string
  orderIndex: number
}

export interface WorkProgressTemplateItem {
  id: string
  templateId: string
  categoryId: string
  activity: string
  description: string | null
  duration: string | null
  weight: number
  orderIndex: number
  defaultPeriods: Record<string, unknown> | null
  subtasks: WorkProgressTemplateSubtask[]
}

export interface WorkProgressTemplateDetail extends WorkProgressTemplate {
  items: WorkProgressTemplateItem[]
}
