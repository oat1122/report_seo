"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressSummaryCards } from "./ProgressSummaryCards";
import { ActivityFeed } from "./ActivityFeed";

const PeriodProgressChart = dynamic(
  () => import("./PeriodProgressChart"),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const CategoryBreakdownChart = dynamic(
  () => import("./CategoryBreakdownChart"),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

interface PlanDashboardPanelProps {
  userId: string;
  planId: string;
}

export function PlanDashboardPanel({ userId, planId }: PlanDashboardPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProgressSummaryCards userId={userId} planId={planId} />
      <div className="grid gap-4 lg:grid-cols-2">
        <PeriodProgressChart userId={userId} planId={planId} />
        <CategoryBreakdownChart userId={userId} planId={planId} />
      </div>
      <ActivityFeed userId={userId} planId={planId} />
    </div>
  );
}
