'use client'

import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/duration'
import { cn } from '@/lib/utils'
import { computeDomainPhase, type DomainPhase } from '../lib/historyCalculations'
import { ReportCardHeader } from '../components/ReportCardHeader'
import type { OverallMetricsForm } from '@/types/metrics'

interface DomainLifecycleCardProps {
  metrics: OverallMetricsForm | null | undefined
  className?: string
}

// ช่วงบนเส้นเวลา (สัดส่วน 1 : 2 : 2 ตาม design) — start/width เป็น % ของแถบ
const PHASES: {
  phase: DomainPhase
  label: string
  range: string
  flex: number
  start: number
  width: number
  fill: string
}[] = [
  {
    phase: 'establishing',
    label: 'Establishing',
    range: '< 1 ปี',
    flex: 1,
    start: 0,
    width: 20,
    fill: 'bg-accent',
  },
  {
    phase: 'growing',
    label: 'Growing',
    range: '1–3 ปี',
    flex: 2,
    start: 20,
    width: 40,
    fill: 'bg-chart-3',
  },
  {
    phase: 'mature',
    label: 'Mature',
    range: '3 ปีขึ้นไป',
    flex: 2,
    start: 60,
    width: 40,
    fill: 'bg-info-strong',
  },
]

/** อายุโดเมน + ช่วงวงจรชีวิต (Establishing → Growing → Mature) */
export const DomainLifecycleCard = ({ metrics, className }: DomainLifecycleCardProps) => {
  if (!metrics) {
    return (
      <Card className={className}>
        <ReportCardHeader title="Domain Lifecycle" icon={<Calendar />} />
        <CardContent>
          <p className="text-text-secondary text-sm">ยังไม่มีข้อมูลอายุโดเมน</p>
        </CardContent>
      </Card>
    )
  }

  const phase = computeDomainPhase(metrics.ageInYears, metrics.ageInMonths)
  const current = PHASES.find((p) => p.phase === phase.phase) ?? PHASES[0]
  const markerPos = current.start + (phase.progressWithinPhase / 100) * current.width
  const ageStr = formatDuration(metrics.ageInYears, metrics.ageInMonths)

  return (
    <Card className={className}>
      <CardContent className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-10 shrink-0 items-center justify-center rounded-xl"
            >
              <Calendar className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-[17px] leading-snug font-semibold">Domain Lifecycle</h2>
              <p className="text-text-secondary text-[13px]">อายุโดเมนบอกว่าควรโฟกัสงานแบบไหน</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl font-semibold tabular-nums">{ageStr}</span>
            <Badge variant="info">
              <span data-dot aria-hidden className="bg-info-strong" />
              {phase.label}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1.5">
          <div
            role="img"
            aria-label={`อายุโดเมน ${ageStr} อยู่ในช่วง ${phase.label}`}
            className="relative"
          >
            <div className="flex h-2.5 gap-1">
              {PHASES.map((p, i) => (
                <div
                  key={p.phase}
                  style={{ flex: `${p.flex} 1 0px` }}
                  className={cn(
                    p.fill,
                    p.phase !== phase.phase && 'opacity-45',
                    i === 0
                      ? 'rounded-l-full rounded-r-[3px]'
                      : i === PHASES.length - 1
                        ? 'rounded-l-[3px] rounded-r-full'
                        : 'rounded-[3px]',
                  )}
                />
              ))}
            </div>
            <span
              aria-hidden
              className="bg-foreground border-background absolute -top-[5px] -ml-2.5 size-5 rounded-full border-4 shadow-sm"
              style={{ left: `${markerPos}%` }}
            />
          </div>
          <div aria-hidden className="text-text-secondary flex gap-1 text-xs">
            {PHASES.map((p) => (
              <span
                key={p.phase}
                style={{ flex: `${p.flex} 1 0px` }}
                className={cn(p.phase === phase.phase && 'text-foreground font-medium')}
              >
                {p.label}
                <br />
                {p.range}
              </span>
            ))}
          </div>
          <p className="text-text-secondary text-[13px]">{phase.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
