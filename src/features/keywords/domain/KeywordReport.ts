import type { KdLevel } from '@/types/kd'

export interface KeywordReportImage {
  id: string
  imageUrl: string
  createdAt: Date
  keywordReportId: string
}

export interface KeywordReport {
  id: string
  customerId: string
  keyword: string
  position: number | null
  traffic: number
  kd: KdLevel
  isTopReport: boolean
  dateRecorded: Date
  images: KeywordReportImage[]
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
