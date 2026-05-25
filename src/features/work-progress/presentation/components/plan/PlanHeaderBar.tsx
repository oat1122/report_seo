"use client";

import Link from "next/link";
import { Archive, ArchiveRestore, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useWorkProgressPlan } from "../../hooks/useWorkProgressPlan";
import { useArchivePlan } from "../../hooks/useWorkProgressPlans";
import { calcPlanOverallPercent } from "@/features/work-progress/domain/policies/progress-calculator";

const PERIOD_LABEL: Record<string, string> = {
  YEAR_12_MONTHS: "12 เดือน",
  YEAR_4_QUARTERS: "4 ไตรมาส",
  HALF_2_PERIODS: "ครึ่งปี",
  CUSTOM: "กำหนดเอง",
};

interface PlanHeaderBarProps {
  userId: string;
  planId: string;
  backHref: string;
  readOnly?: boolean;
}

export function PlanHeaderBar({
  userId,
  planId,
  backHref,
  readOnly,
}: PlanHeaderBarProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId);
  const archiveMut = useArchivePlan();

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (!data) return null;

  const overall = calcPlanOverallPercent(data.items);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="กลับ">
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{data.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">
                {PERIOD_LABEL[data.periodType] ?? data.periodType}
              </Badge>
              {data.year && <Badge variant="outline">{data.year}</Badge>}
              {data.packageName && (
                <Badge variant="outline">{data.packageName}</Badge>
              )}
              {data.isArchived && (
                <Badge variant="outline" className="gap-1">
                  <Archive className="size-3" />
                  เก็บถาวร
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                archiveMut.mutate({
                  userId,
                  planId,
                  isArchived: !data.isArchived,
                })
              }
            >
              {data.isArchived ? (
                <>
                  <ArchiveRestore className="size-4" />
                  คืนจากที่เก็บ
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  เก็บถาวร
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">ความคืบหน้ารวม</span>
        <Progress value={overall} className="flex-1" />
        <span className="min-w-12 text-right text-sm font-medium tabular-nums">
          {overall}%
        </span>
      </div>

      {data.note && (
        <p className="text-xs text-muted-foreground">{data.note}</p>
      )}
    </div>
  );
}

