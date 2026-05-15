"use client";

import { useMemo } from "react";
import { Activity, Clock } from "lucide-react";
import { useHistoryContext } from "../contexts/HistoryContext";
import { computeCoverageStats } from "../lib/historyCalculations";

interface CoverageSnapshotCardProps {
  topKeywords: Array<unknown>;
  otherKeywords: Array<unknown>;
}

const fmtRelativeOrDate = (date: Date | null): string => {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return "ไม่กี่นาทีที่แล้ว";
  if (diffHours < 24) return `${Math.floor(diffHours)} ชั่วโมงที่แล้ว`;
  return date.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const CoverageSnapshotCard = ({
  topKeywords,
  otherKeywords,
}: CoverageSnapshotCardProps) => {
  const { metricsHistory } = useHistoryContext();
  const stats = useMemo(
    () => computeCoverageStats(topKeywords, otherKeywords, metricsHistory),
    [topKeywords, otherKeywords, metricsHistory],
  );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-info" />
        <span className="text-sm font-medium">
          ติดตาม{" "}
          <span className="font-bold tabular-nums">{stats.trackedKeywords}</span>{" "}
          keywords
        </span>
      </div>
      <span className="hidden text-muted-foreground/40 md:inline">·</span>
      <span className="text-sm text-muted-foreground">
        Top{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {stats.topKeywordsCount}
        </span>{" "}
        + Other{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {stats.otherKeywordsCount}
        </span>
      </span>
      <span className="hidden text-muted-foreground/40 md:inline">·</span>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="size-3.5" />
        <span>อัปเดต {fmtRelativeOrDate(stats.lastUpdated)}</span>
      </div>
    </div>
  );
};
