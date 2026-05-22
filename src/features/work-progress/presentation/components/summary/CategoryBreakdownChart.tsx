"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWorkProgressPlan } from "../../hooks/useWorkProgressPlan";

interface CategoryBreakdownChartProps {
  userId: string;
  planId: string;
}

const FALLBACK_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function CategoryBreakdownChart({
  userId,
  planId,
}: CategoryBreakdownChartProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId);

  const rows = useMemo(() => {
    if (!data) return [];
    const buckets = new Map<
      string,
      { id: string; name: string; color: string | null; count: number }
    >();
    for (const item of data.items) {
      const cur = buckets.get(item.categoryId);
      if (cur) cur.count += 1;
      else
        buckets.set(item.categoryId, {
          id: item.categoryId,
          name: item.category.name,
          color: item.category.color,
          count: 1,
        });
    }
    return Array.from(buckets.values());
  }, [data]);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!data || rows.length === 0) return null;

  const config: ChartConfig = Object.fromEntries(
    rows.map((r, i) => [
      r.id,
      {
        label: r.name,
        color: r.color ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length],
      },
    ]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">สัดส่วนตามหมวด</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={rows}
              dataKey="count"
              nameKey="name"
              innerRadius={40}
              outerRadius={80}
              strokeWidth={2}
            >
              {rows.map((r, i) => (
                <Cell
                  key={r.id}
                  fill={r.color ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
