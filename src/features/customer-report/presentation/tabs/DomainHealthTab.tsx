"use client";

import { OverallMetricsCard } from "../OverallMetricsCard";
import { TrendChartsSection } from "../TrendChartsSection";
import { DomainAuthorityRadar } from "../widgets/DomainAuthorityRadar";
import { SpamScoreTimeline } from "../widgets/SpamScoreTimeline";
import { BacklinksVsRefDomains } from "../widgets/BacklinksVsRefDomains";
import { DomainLifecycleCard } from "../widgets/DomainLifecycleCard";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

interface DomainHealthTabProps {
  customerId: string;
  customerName: string;
  metrics: CustomerReportData["metrics"] | null | undefined;
}

// Tab 2: Domain Health — "เว็บสุขภาพดีไหม?" (Phase C complete)
export const DomainHealthTab = ({
  customerId,
  customerName,
  metrics,
}: DomainHealthTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Radar (col-5) | AuthorityCard + Lifecycle stacked (col-7) */}
      <div className="grid gap-4 md:grid-cols-12 md:gap-5">
        <div className="md:col-span-5">
          <DomainAuthorityRadar metrics={metrics} />
        </div>
        <div className="flex flex-col gap-4 md:col-span-7">
          <OverallMetricsCard
            metrics={metrics ?? null}
            customerId={customerId}
            customerName={customerName}
          />
          <DomainLifecycleCard metrics={metrics} />
        </div>
      </div>

      {/* Row 2 */}
      <SpamScoreTimeline />

      {/* Row 3 */}
      <BacklinksVsRefDomains />

      {/* Row 4: existing trend chart */}
      <TrendChartsSection title="แนวโน้ม Domain Metrics" />
    </div>
  );
};
