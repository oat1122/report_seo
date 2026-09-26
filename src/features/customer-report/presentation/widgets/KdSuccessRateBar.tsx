'use client'

import { useMemo } from 'react'
import { GrowBar } from '@/components/motion'
import { computeKdSuccessRate, type KdLevelString } from '../lib/historyCalculations'
import { KdBadge } from '../keywords/KdBadge'
import { ReportCard } from '../keywords/ReportCard'
import { SummaryNote } from '../keywords/SummaryNote'
import { kdSuccessSummary } from '../keywords/keyword-view'

interface KdItem {
  kd: KdLevelString | string
  position: number | null
}

interface KdSuccessRateBarProps {
  keywords: KdItem[]
  topN?: number
}

// % keyword ที่ติด Top N แยกตามความยาก — แถบ progress + ตัวเลข (ไม่พึ่งสีอย่างเดียว)
export const KdSuccessRateBar = ({ keywords, topN = 10 }: KdSuccessRateBarProps) => {
  const rows = useMemo(
    () =>
      computeKdSuccessRate(keywords, topN).map((r) => ({
        ...r,
        pct: Math.round(r.rate * 100),
      })),
    [keywords, topN],
  )

  const hasAny = rows.some((r) => r.total > 0)
  const summary = kdSuccessSummary(rows, topN)

  return (
    <ReportCard title="KD Success Rate" description={`% keyword ที่ติด Top ${topN} แยกตามความยาก`}>
      {!hasAny ? (
        <p className="text-text-secondary py-8 text-center text-sm">ยังไม่มี keyword</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3.5">
            {rows.map((r, idx) => (
              <li key={r.level} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <KdBadge kd={r.level} />
                  <span className="text-text-secondary text-[13px] tabular-nums">
                    {r.inTopN}/{r.total} คำ ·{' '}
                    <strong className="text-foreground text-[15px] font-semibold">{r.pct}%</strong>
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="bg-info-subtle h-2.5 overflow-hidden rounded-full"
                >
                  <GrowBar
                    value={r.pct}
                    delay={idx * 0.08}
                    className="bg-info-strong h-full rounded-full"
                  />
                </div>
              </li>
            ))}
          </ul>
          {summary && <SummaryNote>{summary}</SummaryNote>}
        </>
      )}
    </ReportCard>
  )
}
