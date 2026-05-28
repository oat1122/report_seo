import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
  MasterKind,
} from '../../domain/WorkProgressMaster'

export interface UpsertCategoryData {
  code: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  orderIndex: number
  isActive: boolean
}

export interface UpsertStatusData {
  code: string
  name: string
  color: string | null
  orderIndex: number
  isTerminal: boolean
  isDefault: boolean
  isActive: boolean
}

export interface UpsertMarkTypeData {
  code: string
  name: string
  color: string | null
  icon: string | null
  orderIndex: number
  isActive: boolean
}

export interface WorkProgressMasterRepository {
  // List
  listCategories(options: { onlyActive: boolean }): Promise<WorkProgressCategory[]>
  listStatuses(options: { onlyActive: boolean }): Promise<WorkProgressStatus[]>
  listMarkTypes(options: { onlyActive: boolean }): Promise<WorkProgressMarkType[]>

  // Find by id
  findCategoryById(id: string): Promise<WorkProgressCategory | null>
  findStatusById(id: string): Promise<WorkProgressStatus | null>
  findMarkTypeById(id: string): Promise<WorkProgressMarkType | null>

  // Default status (สำหรับ addItem ที่ไม่ระบุ statusId)
  findDefaultStatus(): Promise<WorkProgressStatus | null>

  // Mutate
  createCategory(data: UpsertCategoryData): Promise<WorkProgressCategory>
  updateCategory(id: string, data: Partial<UpsertCategoryData>): Promise<WorkProgressCategory>
  createStatus(data: UpsertStatusData): Promise<WorkProgressStatus>
  // ถ้า isDefault=true ต้อง unset row อื่นใน $transaction ก่อน set
  updateStatus(id: string, data: Partial<UpsertStatusData>): Promise<WorkProgressStatus>
  createMarkType(data: UpsertMarkTypeData): Promise<WorkProgressMarkType>
  updateMarkType(id: string, data: Partial<UpsertMarkTypeData>): Promise<WorkProgressMarkType>

  // Deactivate (soft retire — เช็ค FK ใช้อยู่ใน use case ก่อนเรียก)
  deactivate(kind: MasterKind, id: string): Promise<void>

  // Reference count (ใช้กัน deactivate ขณะมี item อ้างอยู่)
  countReferences(kind: MasterKind, id: string): Promise<number>
}
