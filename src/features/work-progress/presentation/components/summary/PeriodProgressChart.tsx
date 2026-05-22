"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWorkProgressPlan } from "../../hooks/useWorkProgressPlan";

interface PeriodProgressChartProps {
  userId: string;
  planId: string;
}

const chartConfig = {
  marked: { label: "Marked", color: "var(--chart-1)" },
  empty: { label: "Empty", color: "var(--muted)" },
} satisfies ChartConfig;

export default function PeriodProgressChart({
  userId,
  planId,
}: PeriodProgressChartProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId);

  const rows = useMemo(() => {
    if (!data) return [];
    const periods = data.periods.slice().sort((a, b) => a.seq - b.seq);
    const total = data.items.length;
    return periods.map((p) => {
      const marked = data.items.filter((i) =>
        i.periodMarks.some((m) => m.periodId === p.id),
      ).length;
      return {
        label: p.label,
        marked,
        empty: Math.max(0, total - marked),
      };
    });
  }, [data]);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data || rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">ความคืบหน้าตาม period</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={rows} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="marked"
              stackId="a"
              fill="var(--color-marked)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="empty"
              stackId="a"
              fill="var(--color-empty)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
