"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { MiniSparkline } from "../components/MiniSparkline";
import { computeSparklineTopN } from "../lib/historyCalculations";
import { useHistoryContext } from "../contexts/HistoryContext";

interface TopKeywordsSparklineGridProps {
  topN?: number;
}

const fmtTraffic = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(0);
};

export const TopKeywordsSparklineGrid = ({
  topN = 8,
}: TopKeywordsSparklineGridProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext();

  const rows = useMemo(
    () => computeSparklineTopN(keywordHistory, currentKeywords, topN),
    [keywordHistory, currentKeywords, topN],
  );

  return (
    <div className="rounded-2xl border border-border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Top Keywords Snapshot</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {topN} keywords อันดับ traffic สูงสุด · trend ของ position
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          ยังไม่มี keyword ที่มี traffic
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {rows.map((row) => {
            const positions = row.positionSpark.map((p) => p.v);
            const DeltaIcon =
              row.delta > 0 ? ArrowUp : row.delta < 0 ? ArrowDown : Minus;
            const deltaClass =
              row.delta > 0
                ? "text-success"
                : row.delta < 0
                  ? "text-destructive"
                  : "text-muted-foreground";
            return (
              <div
                key={row.reportId}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" title={row.keyword}>
                    {row.keyword}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      #{row.currentPosition ?? "—"} · {fmtTraffic(row.current)}
                    </span>
                  </div>
                </div>
                <MiniSparkline
                  data={positions}
                  color="var(--info)"
                  invert
                  width={72}
                  height={28}
                  ariaLabel={`${row.keyword} position trend`}
                />
                <div
                  className={`flex w-14 items-center justify-end gap-0.5 text-xs font-semibold tabular-nums ${deltaClass}`}
                >
                  <DeltaIcon className="size-3" />
                  {row.deltaPct != null
                    ? `${Math.abs(row.deltaPct).toFixed(0)}%`
                    : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
