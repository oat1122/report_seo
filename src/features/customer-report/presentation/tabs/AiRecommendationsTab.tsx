"use client";

import { AiOverviewCard } from "../AiOverviewCard";
import { RecommendKeywordTable } from "../RecommendKeywordTable";
import { AiOverviewTimelineBar } from "../widgets/AiOverviewTimelineBar";
import { KdDistributionDonut } from "../widgets/KdDistributionDonut";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

interface AiRecommendationsTabProps {
  recommendations: CustomerReportData["recommendations"];
  aiOverviews: CustomerReportData["aiOverviews"];
}

// Tab 4: AI & Recommendations — "ต่อไปทำอะไร?"
export const AiRecommendationsTab = ({
  recommendations,
  aiOverviews,
}: AiRecommendationsTabProps) => {
  const recsForKd = (recommendations ?? []).map((r) => ({
    kd: r.kd ?? "MEDIUM",
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: AI timeline */}
      <AiOverviewTimelineBar aiOverviews={aiOverviews ?? []} />

      {/* Row 2: AI gallery + Recommend KD Mix */}
      <div className="grid gap-4 md:grid-cols-12 md:gap-5">
        <div className="md:col-span-8">
          <AiOverviewCard aiOverviews={aiOverviews ?? []} />
        </div>
        <div className="md:col-span-4">
          <KdDistributionDonut
            keywords={recsForKd}
            title="Recommend KD Mix"
            description="ความยากของ keyword แนะนำ"
          />
        </div>
      </div>

      {/* Row 3: Recommend table */}
      <RecommendKeywordTable
        title="Recommended Keywords"
        keywords={recommendations ?? []}
      />
    </div>
  );
};
