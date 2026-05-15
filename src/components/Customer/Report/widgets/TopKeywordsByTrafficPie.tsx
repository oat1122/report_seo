"use client";

import { useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { buildChartConfig } from "../lib/buildChartConfig";
import { KEYWORD_COLORS } from "../lib/chartConfig";
import { computeTrafficContribution } from "../lib/historyCalculations";

interface TopKeywordsByTrafficPieProps {
  keywords: Array<{ keyword: string; traffic: number }>;
  topN?: number;
}

const OTHER_COLOR = "var(--muted-foreground)";

const formatTraffic = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toString();
};

export const TopKeywordsByTrafficPie = ({
  keywords,
  topN = 5,
}: TopKeywordsByTrafficPieProps) => {
  const data = useMemo(() => {
    const items = computeTrafficContribution(keywords, topN);
    return items.map((item, idx) => ({
      keyword: item.keyword,
      traffic: item.traffic,
      pct: item.pct,
      color: item.isOther ? OTHER_COLOR : KEYWORD_COLORS[idx % KEYWORD_COLORS.length],
    }));
  }, [keywords, topN]);

  const total = data.reduce((sum, d) => sum + d.traffic, 0);

  const chartConfig = useMemo(
    () =>
      buildChartConfig(
        data.map((d) => ({ key: d.keyword, label: d.keyword, color: d.color })),
      ),
    [data],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Top {topN} by Traffic</CardTitle>
        <p className="text-xs text-muted-foreground">
          สัดส่วน traffic ที่มาจาก top keywords + อื่น ๆ
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            ยังไม่มี traffic
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _n, item) => {
                      const p = item.payload as { keyword: string; pct: number };
                      return [
                        `${formatTraffic(Number(value))} (${p.pct.toFixed(1)}%)`,
                        p.keyword,
                      ];
                    }}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="traffic"
                nameKey="keyword"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.keyword} fill={d.color} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      !("cx" in viewBox) ||
                      viewBox.cx == null ||
                      viewBox.cy == null
                    )
                      return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          dy="-0.4em"
                          className="fill-muted-foreground text-xs"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy="1.4em"
                          className="fill-foreground text-lg font-bold"
                        >
                          {formatTraffic(total)}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
