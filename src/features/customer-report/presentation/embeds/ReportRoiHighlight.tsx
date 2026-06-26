'use client'

import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="text-info size-5" />
          สรุปผล SEO ล่าสุด
        </h2>
        <Link
          href="/customer/report"
          className="text-info flex items-center gap-1 text-xs font-medium hover:underline"
        >
          ดูรายงานเต็ม
          <ChevronRight className="size-3" />
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
  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  return <HeroStatusCard />
}
