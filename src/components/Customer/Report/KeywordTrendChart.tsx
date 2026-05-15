"use client";

import React, { useState, useMemo, useEffect } from "react";
import type { AxisOptions } from "react-charts";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useHistoryContext } from "./contexts/HistoryContext";
import { PeriodSelector } from "./components/PeriodSelector";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { CustomTooltip } from "./components/CustomTooltip";
import {
  TimeSeriesChart,
  type ChartSeries,
  type TimeSeriesDatum,
} from "./components/Chart";
import { DonutChart, type DonutDatum } from "./components/DonutChart";
import {
  DEFAULT_PERIOD,
  PeriodOption,
  MAX_SELECTED_KEYWORDS,
  POSITION_CLIP_THRESHOLD,
  CHART_COLORS,
  getKeywordColor,
} from "./lib/chartConfig";
import { filterHistoryByPeriod } from "./lib/historyCalculations";
import { cn } from "@/lib/utils";

interface KeywordOption {
  keyword: string;
  traffic: number;
  color: string;
}

interface KeywordTrendChartProps {
  title?: string;
}

const formatTrafficValue = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
};

const clampPosition = (position: number | null): number | null => {
  if (position === null) return null;
  return Math.min(position, POSITION_CLIP_THRESHOLD);
};

const KeywordSelector = ({
  options,
  selected,
  onChange,
}: {
  options: KeywordOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(selected);

  const toggle = (keyword: string) => {
    if (selectedSet.has(keyword)) {
      if (selected.length > 1) {
        onChange(selected.filter((k) => k !== keyword));
      }
    } else {
      if (selected.length >= MAX_SELECTED_KEYWORDS) return;
      onChange([...selected, keyword]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate text-muted-foreground">
            {selected.length === 0
              ? "เลือก Keyword..."
              : `เลือก ${selected.length}/${MAX_SELECTED_KEYWORDS} คำ`}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหา keyword..." />
          <CommandList>
            <CommandEmpty>ไม่พบ keyword</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedSet.has(opt.keyword);
                const disabled =
                  !isSelected && selected.length >= MAX_SELECTED_KEYWORDS;
                return (
                  <CommandItem
                    key={opt.keyword}
                    value={opt.keyword}
                    disabled={disabled}
                    onSelect={() => toggle(opt.keyword)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={isSelected} aria-hidden="true" />
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span
                      className={cn(
                        "flex-1 truncate",
                        isSelected && "font-semibold",
                      )}
                    >
                      {opt.keyword}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {opt.traffic.toLocaleString()}
                    </span>
                    {isSelected && <Check className="size-3 text-success" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
  title = "แนวโน้ม Keyword",
}) => {
  const { keywordHistory, currentKeywords, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const keywordOptions: KeywordOption[] = useMemo(() => {
    return currentKeywords.map((k, index) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      color: getKeywordColor(index),
    }));
  }, [currentKeywords]);

  const keywordColorMap = useMemo(() => {
    const map = new Map<string, string>();
    keywordOptions.forEach((opt) => map.set(opt.keyword, opt.color));
    return map;
  }, [keywordOptions]);

  // Auto-select first 3 keywords on load
  useEffect(() => {
    if (keywordOptions.length > 0 && selectedKeywords.length === 0) {
      setSelectedKeywords(keywordOptions.slice(0, 3).map((k) => k.keyword));
    }
  }, [keywordOptions, selectedKeywords.length]);

  // Build series for position + traffic per selected keyword
  const chartSeries = useMemo<ChartSeries[]>(() => {
    if (selectedKeywords.length === 0) return [];
    const filtered = filterHistoryByPeriod(keywordHistory, period);
    const series: ChartSeries[] = [];

    selectedKeywords.forEach((keyword) => {
      const color = keywordColorMap.get(keyword) || CHART_COLORS.primary;
      const records = filtered
        .filter((r) => r.keyword === keyword)
        .map((r) => ({
          date: new Date(r.dateRecorded),
          position: r.position,
          traffic: r.traffic,
        }));

      // Append current keyword data as latest point (if not duplicate)
      const current = currentKeywords.find((c) => c.keyword === keyword);
      if (current) {
        const latestDate = new Date(current.dateRecorded);
        const dateExists = records.some(
          (r) => r.date.toISOString().split("T")[0] === latestDate.toISOString().split("T")[0],
        );
        if (!dateExists) {
          records.push({
            date: latestDate,
            position: current.position,
            traffic: current.traffic,
          });
        }
      }

      records.sort((a, b) => a.date.getTime() - b.date.getTime());

      series.push({
        label: `${keyword} (Position)`,
        color,
        secondaryAxisId: "position",
        data: records
          .filter((r) => r.position !== null)
          .map((r) => ({
            date: r.date,
            value: clampPosition(r.position) ?? POSITION_CLIP_THRESHOLD,
          })),
      });
      series.push({
        label: `${keyword} (Traffic)`,
        color,
        secondaryAxisId: "traffic",
        data: records.map((r) => ({
          date: r.date,
          value: r.traffic,
        })),
      });
    });

    return series;
  }, [keywordHistory, currentKeywords, selectedKeywords, period, keywordColorMap]);

  const hasData = chartSeries.some((s) => s.data.length >= 1);

  const secondaryAxes = useMemo<AxisOptions<TimeSeriesDatum>[]>(
    () => [
      {
        id: "position",
        position: "left",
        scaleType: "linear",
        getValue: (d) => d.value,
        min: 1,
        max: POSITION_CLIP_THRESHOLD,
        invert: true,
        elementType: "line",
        formatters: { scale: (v: number) => `#${v}` },
      },
      {
        id: "traffic",
        position: "right",
        scaleType: "linear",
        getValue: (d) => d.value,
        min: 0,
        elementType: "line",
        formatters: { scale: formatTrafficValue },
      },
    ],
    [],
  );

  // Donut data
  const donutData: DonutDatum[] = useMemo(() => {
    return keywordOptions
      .filter((opt) => selectedKeywords.includes(opt.keyword))
      .map((opt) => ({
        label: opt.keyword,
        value: opt.traffic,
        color: opt.color,
      }));
  }, [keywordOptions, selectedKeywords]);

  const totalTraffic = useMemo(
    () => donutData.reduce((sum, d) => sum + d.value, 0),
    [donutData],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border p-6">
        <Loader2 className="size-4 animate-spin text-info" />
        <span>กำลังโหลดข้อมูล Keyword...</span>
      </div>
    );
  }

  if (keywordOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4 md:p-6">
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <ChartEmptyState message="ยังไม่มีประวัติ Keyword" height="240px" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-4 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="mb-4 max-w-md">
        <KeywordSelector
          options={keywordOptions}
          selected={selectedKeywords}
          onChange={setSelectedKeywords}
        />
      </div>

      {/* Selected keyword chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedKeywords.map((keyword) => {
          const color = keywordColorMap.get(keyword) || CHART_COLORS.primary;
          return (
            <Badge
              key={keyword}
              variant="outline"
              className="gap-1.5 border-2 font-semibold"
              style={{
                borderColor: color,
                color,
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {keyword}
              {selectedKeywords.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedKeywords((prev) =>
                      prev.filter((k) => k !== keyword),
                    )
                  }
                  className="ml-1 hover:opacity-70"
                  aria-label={`ลบ ${keyword}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          );
        })}
      </div>

      {!hasData ? (
        <ChartEmptyState
          message="ยังไม่มีข้อมูลเพียงพอสำหรับ Keywords ที่เลือก"
          height="240px"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {/* Line chart: position + traffic */}
          <div className="rounded-xl border border-border bg-background p-3 md:col-span-2">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">
                Position & Traffic Trend
              </span>
              <span className="text-muted-foreground">
                Position = แกนซ้าย, Traffic = แกนขวา
              </span>
            </div>
            <TimeSeriesChart
              series={chartSeries}
              secondaryAxes={secondaryAxes}
              height={360}
              tooltipRender={({ focusedDatum }) => (
                <CustomTooltip
                  focusedDatum={focusedDatum}
                  formatValue={(v, label) =>
                    label.toLowerCase().includes("position")
                      ? v
                        ? `#${v}`
                        : "-"
                      : v.toLocaleString()
                  }
                />
              )}
            />
          </div>

          {/* Donut: traffic share */}
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              สัดส่วน Traffic
            </p>
            <div className="flex justify-center">
              <DonutChart
                data={donutData}
                size={200}
                thickness={28}
                centerLabel="Total"
                centerValue={
                  totalTraffic >= 1000
                    ? `${(totalTraffic / 1000).toFixed(1)}K`
                    : totalTraffic.toLocaleString()
                }
              />
            </div>
            <ul className="mt-3 space-y-1 border-t border-border pt-2">
              {donutData.map((item) => {
                const pct =
                  totalTraffic > 0 ? (item.value / totalTraffic) * 100 : 0;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="truncate font-medium"
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{item.value.toLocaleString()}</span>
                      <span
                        className="min-w-10 text-right font-semibold"
                        style={{ color: item.color }}
                      >
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-3 text-right text-xs text-muted-foreground">
        ข้อมูลจาก Database
      </p>
    </div>
  );
};

export default KeywordTrendChart;
