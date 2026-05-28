export interface WorkProgressItem {
  id: string
  planId: string
  categoryId: string
  statusId: string
  activity: string
  description: string | null
  progressPercent: number
  duration: string | null
  note: string | null
  orderIndex: number
  weight: number
  startDate: Date | null
  dueDate: Date | null
  completedAt: Date | null
  assignedToId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkProgressItemPeriodMark {
  id: string
  itemId: string
  periodId: string
  markTypeId: string
  progressPercent: number | null
  note: string | null
  updatedAt: Date
}
