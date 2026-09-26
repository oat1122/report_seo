'use client'

import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Shimmer } from '@/components/skeletons'
import { HistoryProvider, useHistoryContext } from '../contexts/HistoryContext'
import { ReportFiltersProvider } from '../contexts/ReportFiltersContext'
import { HeroStatusCard } from '../widgets/HeroStatusCard'

interface ReportRoiHighlightProps {
  customerId: string
}

/**
 * Embed สรุปผล ROI ของ report overview (HeroStatusCard) ลงหน้าอื่น (เช่น customer hub)
 * ห่อ provider จริงของ report ไว้ในตัว → widget ยังอ่านจาก useHistoryContext เท่านั้น (rule 11)
 */
export function ReportRoiHighlight({ customerId }: ReportRoiHighlightProps) {
  return (
    <section aria-labelledby="roi-highlight-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="roi-highlight-title" className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles aria-hidden className="text-info-strong size-5" />
          สรุปผล SEO ล่าสุด
        </h2>
        <Link
          href="/customer/report"
          className="hover:text-info-strong focus-visible:ring-ring/60 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-[13px] font-medium outline-none focus-visible:ring-3 md:min-h-8"
        >
          ดูรายงานเต็ม
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>

      <HistoryProvider customerId={customerId}>
        <ReportFiltersProvider>
          <RoiBody />
        </ReportFiltersProvider>
      </HistoryProvider>
    </section>
  )
}

function RoiBody() {
  const { isLoading } = useHistoryContext()
  if (isLoading) return <Shimmer className="h-40 w-full rounded-[20px]" />
  return <HeroStatusCard />
}
