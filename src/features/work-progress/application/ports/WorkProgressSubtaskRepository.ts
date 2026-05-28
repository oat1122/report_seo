import type { WorkProgressSubtask } from '../../domain/WorkProgressSubtask'

export interface AddSubtaskData {
  itemId: string
  title: string
  assignedToId: string | null
  orderIndex: number | null
}

export interface UpdateSubtaskData {
  title?: string
  isDone?: boolean
  assignedToId?: string | null
  completedAt?: Date | null
}

export interface WorkProgressSubtaskRepository {
  listByItem(itemId: string): Promise<WorkProgressSubtask[]>
  findById(subtaskId: string): Promise<WorkProgressSubtask | null>
  add(data: AddSubtaskData): Promise<WorkProgressSubtask>
  update(subtaskId: string, data: UpdateSubtaskData): Promise<WorkProgressSubtask>
  delete(subtaskId: string): Promise<void>
  reorder(
    itemId: string,
    order: ReadonlyArray<{ subtaskId: string; orderIndex: number }>,
  ): Promise<void>
  isSubtaskInItem(subtaskId: string, itemId: string): Promise<boolean>
}
