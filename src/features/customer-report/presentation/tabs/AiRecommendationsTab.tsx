'use client'

import { AiOverviewCard } from '../AiOverviewCard'
import { RecommendKeywordTable } from '../RecommendKeywordTable'
import { AiOverviewTimelineBar } from '../widgets/AiOverviewTimelineBar'
import { KdDistributionDonut } from '../widgets/KdDistributionDonut'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

interface AiRecommendationsTabProps {
  recommendations: CustomerReportData['recommendations']
  aiOverviews: CustomerReportData['aiOverviews']
}

// Tab 4: AI & Recommendations — "ต่อไปทำอะไร?"
// desktop: Coverage 2fr + KD Mix 1fr → แกลเลอรี AI Overview → ตารางคำแนะนำ
// มือถือเรียงตาม DOM เดียวกัน — ไม่สลับ order เพื่อให้ลำดับโฟกัสตรงกับที่เห็น
export const AiRecommendationsTab = ({
  recommendations,
  aiOverviews,
}: AiRecommendationsTabProps) => {
  const recsForKd = (recommendations ?? []).map((r) => ({
    kd: r.kd ?? 'MEDIUM',
  }))

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-[18px]">
      <AiOverviewTimelineBar aiOverviews={aiOverviews ?? []} />
      <KdDistributionDonut
        keywords={recsForKd}
        title="Recommend KD Mix"
        description="ความยากของ keyword แนะนำ"
        centerLabel="คำแนะนำ"
        summary="quick-wins"
      />
      <div className="min-w-0 lg:col-span-2">
        <AiOverviewCard aiOverviews={aiOverviews ?? []} />
      </div>
      <div className="min-w-0 lg:col-span-2">
        <RecommendKeywordTable title="Recommended Keywords" keywords={recommendations ?? []} />
      </div>
    </div>
  )
}
