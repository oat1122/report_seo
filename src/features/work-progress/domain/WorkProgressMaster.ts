export interface WorkProgressCategory {
  id: string
  code: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  orderIndex: number
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkProgressStatus {
  id: string
  code: string
  name: string
  color: string | null
  orderIndex: number
  isTerminal: boolean
  isDefault: boolean
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkProgressMarkType {
  id: string
  code: string
  name: string
  color: string | null
  icon: string | null
  orderIndex: number
  isActive: boolean
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export type MasterKind = 'category' | 'status' | 'markType'
