"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  KeyRound,
  Lightbulb,
  Minus,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./components/MiniSparkline";
import { useHistoryContext } from "./contexts/HistoryContext";
import {
  computeKpiSnapshots,
  type KpiSnapshot,
} from "./lib/historyCalculations";

interface SummaryStatisticsProps {
  /** Recommendations count — ไม่มี delta (static counter, ส่งจาก parent) */
  recommendationsCount: number;
}

interface DeltaInfo {
  /** isImproved = ดีขึ้นในเชิง user (lower-is-better ต้อง flip ก่อนส่งเข้ามา) */
  isImproved: boolean | null;
  isFlat: boolean;
  text: string;
  ariaLabel: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
  snapshot?: KpiSnapshot;
  /** ตีความ delta ทิศไหนคือ "ดีขึ้น" — true = lower-better (เช่น position) */
  lowerIsBetter?: boolean;
  /** เปรียบเทียบกับช่วงไหน (label) */
  vsLabel?: string;
  /** color จาก theme (CSS var) สำหรับ sparkline + delta */
  sparklineColor: string;
}

const formatDeltaNumber = (n: number) => {
  const abs = Math.abs(n);
  if (Number.isInteger(n)) return abs.toLocaleString();
  return abs.toFixed(1);
};

const buildDeltaInfo = (
  snapshot: KpiSnapshot | undefined,
  lowerIsBetter: boolean,
  vsLabel: string,
  label: string,
): DeltaInfo | null => {
  if (!snapshot || snapshot.previous === null) return null;
  const { delta, direction } = snapshot;
  if (direction === "neutral") {
    return {
      isImproved: null,
      isFlat: true,
      text: `ไม่เปลี่ยนแปลง ${vsLabel}`,
      ariaLabel: `${label} ไม่เปลี่ยนแปลง ${vsLabel}`,
    };
  }
  const goingUp = direction === "up";
  const isImproved = lowerIsBetter ? !goingUp : goingUp;
  const sign = goingUp ? "+" : "-";
  const text = `${sign}${formatDeltaNumber(delta)} ${vsLabel}`;
  const ariaLabel = isImproved
    ? `${label} ดีขึ้น ${formatDeltaNumber(delta)} ${vsLabel}`
    : `${label} แย่ลง ${formatDeltaNumber(delta)} ${vsLabel}`;
  return { isImproved, isFlat: false, text, ariaLabel };
};

const DeltaBadge = ({ info }: { info: DeltaInfo }) => {
  if (info.isFlat) {
    return (
      <span
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
        aria-label={info.ariaLabel}
      >
        <Minus className="size-3" aria-hidden="true" />
        {info.text}
      </span>
    );
  }
  const tone = info.isImproved ? "text-success" : "text-destructive";
  const Arrow = info.isImproved ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn("flex items-center gap-1 text-xs font-semibold", tone)}
      aria-label={info.ariaLabel}
    >
      <Arrow className="size-3" aria-hidden="true" />
      {info.text}
    </span>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  colorClass,
  snapshot,
  lowerIsBetter = false,
  vsLabel = "vs สัปดาห์ก่อน",
  sparklineColor,
}) => {
  const deltaInfo = buildDeltaInfo(snapshot, lowerIsBetter, vsLabel, label);
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg md:p-6",
        colorClass,
      )}
    >
      <div className="absolute -top-5 -right-5 hidden size-20 rounded-full bg-current opacity-10 sm:block" />
      <div className="relative">
        <div className={cn("mb-3 inline-flex rounded-lg p-2 md:p-3", "bg-current/10")}>
          <span className="flex">{icon}</span>
        </div>
        <p className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
          {value}
        </p>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {(deltaInfo || snapshot) && (
          <div className="mt-2 flex items-center justify-between gap-2">
            {deltaInfo ? (
              <DeltaBadge info={deltaInfo} />
            ) : (
              <span className="text-xs text-muted-foreground">
                ข้อมูลยังไม่พอเทียบ
              </span>
            )}
            {snapshot && (
              <MiniSparkline
                data={snapshot.sparkline}
                color={sparklineColor}
                invert={lowerIsBetter}
                width={72}
                height={24}
                ariaLabel={`แนวโน้ม ${label} ${snapshot.sparkline.length} จุดล่าสุด`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({
  recommendationsCount,
}) => {
  const { metricsHistory, keywordHistory, currentKeywords } =
    useHistoryContext();

  const kpi = React.useMemo(
    () => computeKpiSnapshots(metricsHistory, keywordHistory, currentKeywords, 7),
    [metricsHistory, keywordHistory, currentKeywords],
  );

  const avgPositionDisplay =
    kpi.avgPosition.current > 0
      ? kpi.avgPosition.current.toFixed(1)
      : "-";

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="mb-4 text-lg font-bold md:mb-6 md:text-2xl">
        Quick Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        <StatCard
          icon={<KeyRound className="size-7" />}
          label="Total Keywords"
          value={kpi.totalKeywords.current}
          colorClass="text-info hover:border-info/40"
          snapshot={kpi.totalKeywords}
          sparklineColor="var(--info)"
        />
        <StatCard
          icon={<TrendingUp className="size-7" />}
          label="Avg Position"
          value={avgPositionDisplay}
          colorClass="text-success hover:border-success/40"
          snapshot={kpi.avgPosition}
          lowerIsBetter
          sparklineColor="var(--success)"
        />
        <StatCard
          icon={<Trophy className="size-7" />}
          label="Top 3 Rankings"
          value={kpi.top3Count.current}
          colorClass="text-warning hover:border-warning/40"
          snapshot={kpi.top3Count}
          sparklineColor="var(--warning)"
        />
        <StatCard
          icon={<Lightbulb className="size-7" />}
          label="Recommendations"
          value={recommendationsCount}
          colorClass="text-info hover:border-info/40"
          sparklineColor="var(--info)"
        />
      </div>
    </div>
  );
};
