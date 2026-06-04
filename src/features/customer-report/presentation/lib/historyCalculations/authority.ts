import { OverallMetricsHistory } from '@/types/history'
import type { OverallMetricsForm } from '@/types/metrics'
import { PeriodOption } from '../chartConfig'
import { clamp, getValueAtOrBefore } from './_shared'

// ============================================================
// Authority Radar + Domain Lifecycle + Backlinks ratio
// ============================================================

/** Normalize raw value → 0-100 score */
export const normalizeToScore100 = (
  value: number,
  fullScale: number,
  mode: 'linear' | 'log10',
): number => {
  if (value <= 0 || fullScale <= 0) return 0
  if (mode === 'log10') {
    return clamp((Math.log10(value + 1) / Math.log10(fullScale + 1)) * 100, 0, 100)
  }
  return clamp((value / fullScale) * 100, 0, 100)
}

// Reference scales — tuned for typical SEO ranges
const BACKLINKS_FULL_SCALE = 100_000
const TRAFFIC_FULL_SCALE = 50_000

export type AuthorityAxis = 'DR' | 'Health' | 'Trust' | 'Backlinks' | 'Traffic'

export interface AuthorityRadarPoint {
  axis: AuthorityAxis
  /** 0-100 normalized for chart rendering */
  current: number
  previous: number | null
  /** raw value for tooltip display */
  rawCurrent: number
  rawPrevious: number | null
}

/**
 * Radar 5 axes: DR / Health / Trust(100-spam×10) / Backlinks(log10) / Traffic(log10)
 * - current: ค่าปัจจุบันจาก OverallMetrics
 * - previous: snapshot ใน metricsHistory ที่ N-day-ago (จาก period)
 */
export const computeAuthorityRadar = (
  current: OverallMetricsForm,
  metricsHistory: OverallMetricsHistory[],
  period: PeriodOption,
): AuthorityRadarPoint[] => {
  const prevDr = getValueAtOrBefore(metricsHistory, period, (r) => r.domainRating)
  const prevHealth = getValueAtOrBefore(metricsHistory, period, (r) => r.healthScore)
  const prevSpam = getValueAtOrBefore(metricsHistory, period, (r) => r.spamScore)
  const prevBacklinks = getValueAtOrBefore(metricsHistory, period, (r) => r.backlinks)
  const prevTraffic = getValueAtOrBefore(metricsHistory, period, (r) => r.organicTraffic)

  const trustFromSpam = (spam: number) => clamp(100 - spam * 10, 0, 100)
  const backlinksScore = (v: number) => normalizeToScore100(v, BACKLINKS_FULL_SCALE, 'log10')
  const trafficScore = (v: number) => normalizeToScore100(v, TRAFFIC_FULL_SCALE, 'log10')

  return [
    {
      axis: 'DR',
      current: clamp(current.domainRating, 0, 100),
      previous: prevDr,
      rawCurrent: current.domainRating,
      rawPrevious: prevDr,
    },
    {
      axis: 'Health',
      current: clamp(current.healthScore, 0, 100),
      previous: prevHealth,
      rawCurrent: current.healthScore,
      rawPrevious: prevHealth,
    },
    {
      axis: 'Trust',
      current: trustFromSpam(current.spamScore),
      previous: prevSpam !== null ? trustFromSpam(prevSpam) : null,
      rawCurrent: current.spamScore,
      rawPrevious: prevSpam,
    },
    {
      axis: 'Backlinks',
      current: backlinksScore(current.backlinks),
      previous: prevBacklinks !== null ? backlinksScore(prevBacklinks) : null,
      rawCurrent: current.backlinks,
      rawPrevious: prevBacklinks,
    },
    {
      axis: 'Traffic',
      current: trafficScore(current.organicTraffic),
      previous: prevTraffic !== null ? trafficScore(prevTraffic) : null,
      rawCurrent: current.organicTraffic,
      rawPrevious: prevTraffic,
    },
  ]
}

export type DomainPhase = 'establishing' | 'growing' | 'mature'

export interface DomainPhaseInfo {
  phase: DomainPhase
  label: string
  description: string
  progressWithinPhase: number // 0-100
}

/**
 * Domain lifecycle phase based on age (years + months)
 * - establishing: < 1 year (focus on backlinks foundation)
 * - growing: 1-3 years (focus on content + authority)
 * - mature: 3+ years (focus on retention + new keywords)
 */
export const computeDomainPhase = (years: number, months: number): DomainPhaseInfo => {
  const totalMonths = Math.max(0, years * 12 + months)
  if (totalMonths < 12) {
    return {
      phase: 'establishing',
      label: 'Establishing',
      description: 'ช่วงสร้างฐาน — เน้น backlinks + technical SEO',
      progressWithinPhase: (totalMonths / 12) * 100,
    }
  }
  if (totalMonths < 36) {
    return {
      phase: 'growing',
      label: 'Growing',
      description: 'ช่วงเติบโต — เน้น content + ขยาย keyword',
      progressWithinPhase: ((totalMonths - 12) / 24) * 100,
    }
  }
  return {
    phase: 'mature',
    label: 'Mature',
    description: 'ช่วงคงตำแหน่ง — เน้น retention + niche expansion',
    // Mature has no upper cap — show progress within 3-10 yr range, cap 100
    progressWithinPhase: Math.min(100, ((totalMonths - 36) / 84) * 100),
  }
}

/** Backlinks per referring domain (null if refDomains = 0) */
export const computeBacklinkRatio = (backlinks: number, refDomains: number): number | null => {
  if (refDomains <= 0) return null
  return backlinks / refDomains
}
