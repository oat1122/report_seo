'use client'

import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OverallMetricsForm } from '@/types/metrics'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { SPAM_DANGER_THRESHOLD } from '../lib/chartConfig'
import { getValueAtOrBefore } from '../lib/historyCalculations'
import { deltaMeta, type DeltaTone } from './DeltaChip'

const TONE_TEXT: Record<DeltaTone, string> = {
  good: 'text-success',
  bad: 'text-danger-strong',
  neutral: 'text-text-secondary',
}

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : '±'}${Math.abs(n).toLocaleString()}`

/** แถบสถานะบนสุดของ Domain Health — ตัดสินจากเกณฑ์ Spam Score เดียวกับ timeline (> 2 = อันตราย) */
export function DomainHealthStatus({
  metrics,
  className,
}: {
  metrics: OverallMetricsForm
  className?: string
}) {
  const { metricsHistory } = useHistoryContext()
  const { period } = useReportFilters()

  const risky = metrics.spamScore > SPAM_DANGER_THRESHOLD
  const prevDr = getValueAtOrBefore(metricsHistory, period, (r) => r.domainRating)
  const prevRef = getValueAtOrBefore(metricsHistory, period, (r) => r.refDomains)
  const drDiff = prevDr !== null ? metrics.domainRating - prevDr : null
  const refDiff = prevRef !== null ? metrics.refDomains - prevRef : null
  const growing = (drDiff ?? 0) > 0 || (refDiff ?? 0) > 0

  const title = risky ? 'พบสัญญาณเสี่ยง: Spam Score สูงกว่าเกณฑ์' : 'ไม่พบสัญญาณอันตราย'
  const subtitle = risky
    ? `Spam Score เกิน ${SPAM_DANGER_THRESHOLD}% — ควรตรวจสอบ backlink ที่ไม่มีคุณภาพกับทีมงาน`
    : growing
      ? `Spam Score ต่ำกว่าเกณฑ์ และค่าหลักเพิ่มขึ้นจาก ${period} วันก่อน`
      : `Spam Score ต่ำกว่าเกณฑ์อันตราย (${SPAM_DANGER_THRESHOLD}%)`

  const chips: { label: string; tone: DeltaTone }[] = [
    {
      label: `Spam Score ${metrics.spamScore}% · ${risky ? 'เสี่ยง' : 'ปลอดภัย'}`,
      tone: risky ? 'bad' : 'good',
    },
    {
      label: `DR ${metrics.domainRating}${drDiff !== null ? ` · ${signed(drDiff)}` : ''}`,
      tone: drDiff !== null ? deltaMeta(drDiff).tone : 'neutral',
    },
    {
      label: `Ref. Domains ${metrics.refDomains.toLocaleString()}${refDiff !== null ? ` · ${signed(refDiff)}` : ''}`,
      tone: refDiff !== null ? deltaMeta(refDiff).tone : 'neutral',
    },
  ]

  const Icon = risky ? ShieldAlert : ShieldCheck

  return (
    <Card role="status" className={cn('py-3.5 md:py-4', className)}>
      <CardContent className="flex flex-col gap-3 px-4 md:flex-row md:items-center md:gap-4 md:px-[18px]">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden
            className={cn(
              'flex size-[46px] shrink-0 items-center justify-center rounded-[14px]',
              risky
                ? 'bg-danger-subtle text-danger-strong'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            <Icon className="size-6" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-lg leading-snug font-semibold">{title}</p>
            <p className="text-text-secondary text-[13px]">{subtitle}</p>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2 md:ml-auto md:justify-end">
          {chips.map((chip) => (
            <li
              key={chip.label}
              className="border-border bg-background/85 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] whitespace-nowrap tabular-nums"
            >
              <span
                aria-hidden
                className={cn('size-2 rounded-full bg-current', TONE_TEXT[chip.tone])}
              />
              {chip.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
