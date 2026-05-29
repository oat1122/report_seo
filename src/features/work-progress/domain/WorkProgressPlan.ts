import type { PeriodTypeCode } from './types'
import type { WorkProgressPeriod } from './WorkProgressPeriod'
import type {
  WorkProgressAssignee,
  WorkProgressItem,
  WorkProgressItemPeriodMark,
} from './WorkProgressItem'
import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
} from './WorkProgressMaster'
import type { WorkProgressSubtask } from './WorkProgressSubtask'
import type { WorkProgressAttachment } from './WorkProgressAttachment'

export interface WorkProgressPlan {
  id: string
  customerId: string
  title: string
  periodType: PeriodTypeCode
  year: number | null
  startDate: Date | null
  endDate: Date | null
  packageName: string | null
  note: string | null
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

// Detail view สำหรับ getPlanDetail use case — รวม nested rows ที่ UI ต้องใช้
export interface WorkProgressPlanDetail extends WorkProgressPlan {
  periods: WorkProgressPeriod[]
  items: WorkProgressItemWithMarks[]
}

export interface WorkProgressItemWithMarks extends WorkProgressItem {
  category: WorkProgressCategory
  status: WorkProgressStatus
  assignedTo: WorkProgressAssignee | null
  periodMarks: WorkProgressPeriodMarkWithType[]
  subtasks: WorkProgressSubtask[]
  attachments: WorkProgressAttachment[]
}

export interface WorkProgressPeriodMarkWithType extends WorkProgressItemPeriodMark {
  markType: WorkProgressMarkType
}
