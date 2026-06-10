import { KeywordReportHistory, OverallMetricsHistory } from '@/types/history'
import { sortByDateDesc } from './_shared'

export type MetricTrend = 'up' | 'down' | 'neutral' | 'new'

export interface TrafficChangeData {
  percentage: number
  trend: MetricTrend
  hasHistory: boolean
  previousValue?: number
  currentValue: number
}

/**
 * Calculate the percentage change between current and previous values
 * @returns Percentage change (Infinity เมื่อ previous = 0 แต่ current > 0 = "new"/massive growth)
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? Infinity : 0
  }
  return ((current - previous) / previous) * 100
}

/** Determine the trend based on percentage change */
export const determineTrend = (percentage: number, hasHistory: boolean): MetricTrend => {
  if (!hasHistory) return 'neutral'
  if (percentage === Infinity) return 'new'
  if (percentage > 0) return 'up'
  if (percentage < 0) return 'down'
  return 'neutral'
}

/**
 * Calculate traffic change for a specific keyword based on history
 * @param reportId - ID of the current keyword report
 */
export const calculateTrafficChange = (
  currentTraffic: number,
  keywordHistory: KeywordReportHistory[],
  reportId: string,
): TrafficChangeData => {
  const keywordHistoryRecords = keywordHistory
    .filter((h) => h.reportId === reportId)
    .sort(sortByDateDesc)

  // If no history exists, it's a new keyword
  if (keywordHistoryRecords.length === 0) {
    return {
      percentage: 0,
      trend: 'new',
      hasHistory: false,
      currentValue: currentTraffic,
    }
  }

  const previousTraffic = keywordHistoryRecords[0].traffic
  const percentage = calculatePercentageChange(currentTraffic, previousTraffic)

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend: determineTrend(percentage, true),
    hasHistory: true,
    previousValue: previousTraffic,
    currentValue: currentTraffic,
  }
}

/**
 * Calculate metric change for overall metrics
 * @param metricKey - Key of the metric to track (e.g., 'organicTraffic')
 */
export const calculateMetricChange = (
  currentValue: number,
  metricsHistory: OverallMetricsHistory[],
  metricKey: keyof Omit<OverallMetricsHistory, 'id' | 'dateRecorded' | 'customerId'>,
): TrafficChangeData => {
  // synthetic current (id='current') = ค่าปัจจุบันเอง — ใช้เป็น baseline ไม่ได้ (จะได้ 0% เสมอ)
  const sortedHistory = metricsHistory.filter((h) => h.id !== 'current').sort(sortByDateDesc)

  if (sortedHistory.length === 0) {
    return {
      percentage: 0,
      trend: 'new',
      hasHistory: false,
      currentValue,
    }
  }

  const previousValue = sortedHistory[0][metricKey] as number
  const percentage = calculatePercentageChange(currentValue, previousValue)

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend: determineTrend(percentage, true),
    hasHistory: true,
    previousValue,
    currentValue,
  }
}
