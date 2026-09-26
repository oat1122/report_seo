'use client'

import React from 'react'
import { History, Globe, KeyRound, Link as LinkIcon, Activity } from 'lucide-react'
import { AnimatedNumber } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { OverallMetricsForm } from '@/types/metrics'
import { HistoryModal } from '@/features/users/presentation/components/MetricsModal/HistoryModal'
import { useOverallMetricsCard } from '@/hooks/ui/useOverallMetricsCard'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { calculateMetricChange } from './lib/historyCalculations'
import { SPAM_DANGER_THRESHOLD } from './lib/chartConfig'
import { MetricChangeIndicator } from './components/MetricChangeIndicator'
import { GaugeChart } from './components/GaugeChart'
import { DeltaChip, deltaMeta } from './components/DeltaChip'
import { ReportCardHeader } from './components/ReportCardHeader'

interface OverallMetricsCardProps {
  metrics: OverallMetricsForm | null
  customerId: string
  customerName: string
}

const SPAM_SCALE_MAX = 10

const fmtAbs = (n: number) => (Number.isInteger(n) ? `${Math.abs(n)}` : Math.abs(n).toFixed(1))

/** delta แบบค่าจริง (DR/Health/Spam) เทียบการอัปเดตครั้งก่อน */
const AbsDelta = ({
  current,
  previous,
  lowerIsBetter = false,
  wordy = false,
}: {
  current: number
  previous: number | undefined
  lowerIsBetter?: boolean
  wordy?: boolean
}) => {
  if (previous === undefined) return null
  const diff = current - previous
  const meta = deltaMeta(diff, lowerIsBetter)
  const text =
    diff === 0
      ? 'เท่าเดิม'
      : wordy
        ? `${diff < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${fmtAbs(diff)}`
        : fmtAbs(diff)
  return (
    <DeltaChip direction={meta.direction} tone={meta.tone}>
      {text}
    </DeltaChip>
  )
}

export const OverallMetricsCard: React.FC<OverallMetricsCardProps> = ({
  metrics,
  customerId,
  customerName,
}) => {
  const {
    isHistoryModalOpen,
    historyData,
    isHistoryLoading,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  } = useOverallMetricsCard(customerId)
  const { metricsHistory } = useHistoryContext()

  if (!metrics) {
    return (
      <Card>
        <ReportCardHeader title="Overall Domain Metrics" />
        <CardContent>
          <p className="bg-glass-tile text-text-secondary rounded-2xl px-4 py-8 text-center text-sm">
            ยังไม่มีข้อมูลภาพรวมของ Domain — ทีมจะอัปเดตหลังดึงข้อมูลจาก Ahrefs รอบแรก
          </p>
        </CardContent>
      </Card>
    )
  }

  const trafficChange = calculateMetricChange(
    metrics.organicTraffic,
    metricsHistory,
    'organicTraffic',
  )
  const keywordsChange = calculateMetricChange(
    metrics.organicKeywords,
    metricsHistory,
    'organicKeywords',
  )
  const backlinksChange = calculateMetricChange(metrics.backlinks, metricsHistory, 'backlinks')
  const refDomainsChange = calculateMetricChange(metrics.refDomains, metricsHistory, 'refDomains')
  const drChange = calculateMetricChange(metrics.domainRating, metricsHistory, 'domainRating')
  const healthChange = calculateMetricChange(metrics.healthScore, metricsHistory, 'healthScore')
  const spamChange = calculateMetricChange(metrics.spamScore, metricsHistory, 'spamScore')

  const spamRisky = metrics.spamScore > SPAM_DANGER_THRESHOLD
  const spamPos = Math.min(100, (metrics.spamScore / SPAM_SCALE_MAX) * 100)
  const thresholdPos = (SPAM_DANGER_THRESHOLD / SPAM_SCALE_MAX) * 100

  return (
    <>
      <Card>
        <ReportCardHeader
          title="Overall Domain Metrics"
          description="ภาพรวมโดเมน เทียบกับการอัปเดตครั้งก่อน"
          action={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="ดูประวัติการเปลี่ยนแปลง"
                  onClick={handleOpenHistoryModal}
                  className="md:size-10"
                >
                  <History />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ดูประวัติการเปลี่ยนแปลง</TooltipContent>
            </Tooltip>
          }
        />
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <GaugeChart
              label="Domain Rating"
              value={metrics.domainRating}
              color="var(--chart-1)"
              delta={<AbsDelta current={metrics.domainRating} previous={drChange.previousValue} />}
            />
            <GaugeChart
              label="Health Score"
              value={metrics.healthScore}
              color="var(--chart-2)"
              delta={
                <AbsDelta current={metrics.healthScore} previous={healthChange.previousValue} />
              }
            />

            {/* Spam Score — ยิ่งน้อยยิ่งดี · แถบโซนปลอดภัย/อันตราย */}
            <div className="bg-glass-tile border-glass-border col-span-2 flex flex-col gap-2.5 rounded-2xl border px-4 py-3.5 sm:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium">Spam Score</span>
                <AbsDelta
                  current={metrics.spamScore}
                  previous={spamChange.previousValue}
                  lowerIsBetter
                  wordy
                />
              </div>
              <AnimatedNumber
                value={metrics.spamScore}
                format={(n) => `${n.toFixed(Number.isInteger(metrics.spamScore) ? 0 : 1)}%`}
                className="text-[26px] leading-none font-semibold tabular-nums"
              />
              <div
                role="img"
                aria-label={`Spam Score ${metrics.spamScore}% จากสเกล 0–${SPAM_SCALE_MAX} เกณฑ์อันตรายคือ ${SPAM_DANGER_THRESHOLD}`}
                className="relative pt-1"
              >
                <div className="flex h-2 overflow-hidden rounded-full">
                  <div className="bg-success-subtle" style={{ flex: `${thresholdPos} 1 0px` }} />
                  <div
                    className="bg-danger-subtle"
                    style={{ flex: `${100 - thresholdPos} 1 0px` }}
                  />
                </div>
                <span
                  aria-hidden
                  className={cn(
                    'border-background absolute top-0 -ml-2 size-4 rounded-full border-[3px] shadow-sm',
                    spamRisky ? 'bg-destructive' : 'bg-success',
                  )}
                  style={{ left: `${spamPos}%` }}
                />
                <span
                  aria-hidden
                  className="bg-danger-strong absolute top-0 h-4 w-0.5"
                  style={{ left: `${thresholdPos}%` }}
                />
              </div>
              <div aria-hidden className="text-text-secondary relative h-3.5 text-[11px]">
                <span className="absolute left-0">0</span>
                <span
                  className="text-danger-strong absolute -translate-x-1/2 font-medium"
                  style={{ left: `${thresholdPos}%` }}
                >
                  {SPAM_DANGER_THRESHOLD}
                </span>
                <span className="absolute right-0">{SPAM_SCALE_MAX}</span>
              </div>
              <span className="text-text-secondary text-xs">
                {spamRisky
                  ? `สูงกว่าเกณฑ์อันตราย (${SPAM_DANGER_THRESHOLD}) · ควรตรวจ backlink ที่ไม่มีคุณภาพ`
                  : `ต่ำกว่าเกณฑ์อันตราย (${SPAM_DANGER_THRESHOLD}) · ปลอดภัย`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricChangeIndicator
              icon={<Activity />}
              label="Organic Traffic"
              value={metrics.organicTraffic.toLocaleString()}
              changeData={trafficChange}
              iconClassName="text-info-strong"
            />
            <MetricChangeIndicator
              icon={<KeyRound />}
              label="Organic Keywords"
              value={metrics.organicKeywords.toLocaleString()}
              changeData={keywordsChange}
              iconClassName="text-info-strong"
            />
            <MetricChangeIndicator
              icon={<LinkIcon />}
              label="Backlinks"
              value={metrics.backlinks.toLocaleString()}
              changeData={backlinksChange}
              iconClassName="text-info-strong"
            />
            <MetricChangeIndicator
              icon={<Globe />}
              label="Ref. Domains"
              value={metrics.refDomains.toLocaleString()}
              changeData={refDomainsChange}
              iconClassName="text-info-strong"
            />
          </div>
        </CardContent>
      </Card>

      <HistoryModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={customerName}
        isLoading={isHistoryLoading}
      />
    </>
  )
}
