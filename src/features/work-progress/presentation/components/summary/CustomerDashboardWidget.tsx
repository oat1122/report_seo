"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";

interface CustomerDashboardWidgetProps {
  userId: string;
}

export function CustomerDashboardWidget({ userId }: CustomerDashboardWidgetProps) {
  const { data, isLoading } = useDashboardSummary(userId);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-5 text-info" />
          Work Progress
        </CardTitle>
        <Link
          href={`/customer/${userId}/work-progress`}
          className="flex items-center gap-1 text-xs font-medium text-info hover:underline"
        >
          ดูทั้งหมด
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : !data || data.activePlanCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีแผนงานที่ใช้งานอยู่
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ความคืบหน้ารวม</span>
                <span className="font-semibold tabular-nums">
                  {data.avgProgressPercent}%
                </span>
              </div>
              <Progress value={data.avgProgressPercent} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat
                label="แผนที่ใช้งาน"
                value={String(data.activePlanCount)}
              />
              <Stat
                label="กิจกรรมทั้งหมด"
                value={String(data.totalItems)}
              />
              <Stat
                label="ใกล้กำหนด"
                value={String(data.upcomingDueCount)}
                icon={<CalendarClock className="size-3" />}
              />
            </div>

            {data.overdueCount > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <AlertTriangle className="size-4 text-info" />
                <span className="text-xs text-muted-foreground">
                  มีงานที่เลยกำหนด
                </span>
                <Badge variant="outline" className="ml-auto">
                  {data.overdueCount}
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StatProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function Stat({ label, value, icon }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md bg-muted/40 px-2 py-2">
      <span className="text-base font-semibold tabular-nums">{value}</span>
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </span>
    </div>
  );
}
