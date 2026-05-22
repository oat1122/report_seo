"use client";

import {
  CheckCircle2,
  Clock,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkProgressPlan } from "../../hooks/useWorkProgressPlan";

interface ProgressSummaryCardsProps {
  userId: string;
  planId: string;
}

function calcOverall(items: { weight: number; progressPercent: number }[]) {
  if (!items.length) return 0;
  const totalW = items.reduce((s, i) => s + i.weight, 0);
  if (!totalW) return 0;
  return Math.round(
    items.reduce((s, i) => s + i.progressPercent * i.weight, 0) / totalW,
  );
}

export function ProgressSummaryCards({
  userId,
  planId,
}: ProgressSummaryCardsProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const overall = calcOverall(data.items);
  const totalItems = data.items.length;
  const completed = data.items.filter(
    (i) => i.status.isTerminal && i.progressPercent === 100,
  ).length;
  const inProgress = totalItems - completed;
  const totalMarks = data.items.reduce(
    (s, i) => s + i.periodMarks.length,
    0,
  );

  const cards = [
    {
      label: "ความคืบหน้ารวม",
      value: `${overall}%`,
      icon: TrendingUp,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "Item ทั้งหมด",
      value: String(totalItems),
      icon: ListChecks,
      tint: "bg-info/10 text-info",
    },
    {
      label: "เสร็จแล้ว",
      value: `${completed}/${totalItems}`,
      icon: CheckCircle2,
      tint: "bg-secondary/30 text-secondary-foreground",
    },
    {
      label: "Marks · กำลังทำ",
      value: `${totalMarks} · ${inProgress}`,
      icon: Clock,
      tint: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={
                  "flex size-10 items-center justify-center rounded-md " +
                  c.tint
                }
              >
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <span className="text-lg font-semibold tabular-nums">
                  {c.value}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
