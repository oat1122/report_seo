"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressSummaryCards } from "./ProgressSummaryCards";

const CategoryBreakdownChart = dynamic(
  () => import("./CategoryBreakdownChart"),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const StatusDonutChart = dynamic(
  () => import("./StatusDonutChart"),
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
        <StatusDonutChart userId={userId} planId={planId} />
        <CategoryBreakdownChart userId={userId} planId={planId} />
      </div>
    </div>
  );
}
