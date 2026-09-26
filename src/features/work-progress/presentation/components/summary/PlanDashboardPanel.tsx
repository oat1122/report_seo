'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import CategoryBreakdownChart from './CategoryBreakdownChart'

// Recharts โหลดฝั่ง client เท่านั้น
const StatusDonutChart = dynamic(() => import('./StatusDonutChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-[20px]" />,
})

interface PlanDashboardPanelProps {
  userId: string
  planId: string
}

// สรุปของแผน: donut สถานะ (1fr) + ความคืบหน้าตามหมวด (2fr)
// ตัวเลขสรุปหลัก (ProgressSummaryCards) อยู่ในการ์ดหัวแผน PlanHeaderBar
export function PlanDashboardPanel({ userId, planId }: PlanDashboardPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-[18px]">
      <StatusDonutChart userId={userId} planId={planId} />
      <CategoryBreakdownChart userId={userId} planId={planId} />
    </div>
  )
}
