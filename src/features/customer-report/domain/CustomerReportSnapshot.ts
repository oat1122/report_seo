import type { OverallMetrics } from '@/features/metrics'
import type { KeywordReport, KeywordHistoryEntry } from '@/features/keywords'
import type { KeywordRecommend } from '@/features/recommendations'
import type { SerializedAiOverview } from '@/features/ai-overview'
import type { MetricsHistoryEntry } from '@/features/metrics'

export interface CustomerReportSnapshot {
  metrics: OverallMetrics | null
  topKeywords: KeywordReport[]
  otherKeywords: KeywordReport[]
  recommendations: KeywordRecommend[]
  aiOverviews: SerializedAiOverview[]
  customerName: string | null
  domain: string | null
}

export interface CustomerHistoryReport {
  metricsHistory: MetricsHistoryEntry[]
  keywordHistory: KeywordHistoryEntry[]
  currentKeywords: KeywordReport[]
}
