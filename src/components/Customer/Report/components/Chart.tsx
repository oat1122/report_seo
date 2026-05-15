"use client";

import dynamic from "next/dynamic";
import { useMemo, type ComponentType } from "react";
import type {
  ChartOptions,
  UserSerie,
  AxisOptions,
  TooltipOptions,
} from "react-charts";

// react-charts ใช้ d3-scale + DOM measurement → ต้อง dynamic + ssr:false
// generic ของ Chart ถูก erase ตอน dynamic import — cast กลับเพื่อให้ type checker ทำงาน
const LazyChart = dynamic(
  () => import("react-charts").then((m) => ({ default: m.Chart })),
  { ssr: false },
) as ComponentType<{ options: ChartOptions<TimeSeriesDatum> }>;

export interface TimeSeriesDatum {
  date: Date;
  value: number;
}

export interface ChartSeries extends UserSerie<TimeSeriesDatum> {
  label: string;
  data: TimeSeriesDatum[];
  color?: string;
  secondaryAxisId?: string;
}

type TooltipRender = NonNullable<TooltipOptions<TimeSeriesDatum>["render"]>;

interface ChartProps {
  series: ChartSeries[];
  secondaryAxes: AxisOptions<TimeSeriesDatum>[];
  height?: number | string;
  tooltipRender?: TooltipRender;
  className?: string;
}

// Wrapper รอบ react-charts <Chart> — กำหนด primaryAxis เป็น time + รับ secondaryAxes/tooltip
export const TimeSeriesChart = ({
  series,
  secondaryAxes,
  height = 320,
  tooltipRender,
  className,
}: ChartProps) => {
  const primaryAxis = useMemo<AxisOptions<TimeSeriesDatum>>(
    () => ({
      getValue: (d) => d.date,
      scaleType: "time",
      formatters: {
        scale: (value: Date) =>
          value
            ? value.toLocaleDateString("th-TH", {
                day: "2-digit",
                month: "short",
              })
            : "",
      },
    }),
    [],
  );

  const options = useMemo<ChartOptions<TimeSeriesDatum>>(
    () => ({
      data: series,
      primaryAxis,
      secondaryAxes,
      getSeriesStyle: (s) => ({
        color: (s.originalSeries as ChartSeries).color || undefined,
      }),
      tooltip: tooltipRender ? { render: tooltipRender } : true,
    }),
    [series, primaryAxis, secondaryAxes, tooltipRender],
  );

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height }}
    >
      <LazyChart options={options} />
    </div>
  );
};
