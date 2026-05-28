import type { KdLevel } from '@/types/kd'

export interface KeywordReport {
  id: string
  customerId: string
  keyword: string
  position: number | null
  traffic: number
  kd: KdLevel
  isTopReport: boolean
  dateRecorded: Date
}

export interface KeywordHistoryEntry {
  id: string
  reportId: string
  keyword: string
  position: number | null
  traffic: number
  kd: KdLevel
  isTopReport: boolean
  dateRecorded: Date
  isVisible: boolean
}
