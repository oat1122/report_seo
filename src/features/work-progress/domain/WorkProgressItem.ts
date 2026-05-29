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
  // Recurrence — เก็บเฉพาะกฎ (ไม่ materialize) แล้วคำนวณวันของแต่ละเดือนตอนแสดง
  isRecurring: boolean
  recurrenceFreq: string | null
  recurrenceInterval: number
  recurrenceDayOfMonth: number | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkProgressAssignee {
  id: string
  name: string | null
}

export interface WorkProgressItemPeriodMark {
  id: string
  itemId: string
  periodId: string
  markTypeId: string
  progressPercent: number | null
  note: string | null
  scheduledDate: Date | null
  updatedAt: Date
}
