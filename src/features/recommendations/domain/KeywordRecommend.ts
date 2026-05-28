import type { KdLevel } from '@/types/kd'

export interface KeywordRecommend {
  id: string
  customerId: string
  keyword: string
  kd: KdLevel | null
  isTopReport: boolean
  note: string | null
  createdAt: Date
}
