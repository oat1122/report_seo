"use client";

import React from "react";
import { Trophy, Medal, Award, Search, Flame } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { KeywordReport } from "@/types/metrics";
import { useHistoryContext } from "./contexts/HistoryContext";
import { calculateTrafficChange } from "./lib/historyCalculations";
import { TrafficProgressBar } from "./components/TrafficProgressBar";

interface KeywordReportTableProps {
  keywords: KeywordReport[];
  title?: string;
}

const positionBadgeConfig = [
  { Icon: Trophy, opacity: "" },
  { Icon: Medal, opacity: "/70" },
  { Icon: Award, opacity: "/50" },
] as const;

const getPositionBadge = (position: number | null, rank: number) => {
  if (!position || rank > 2 || position > 3) return null;
  return positionBadgeConfig[rank];
};

const kdConfig: Record<string, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-success/10 text-success" },
  MEDIUM: { label: "Medium", className: "bg-warning/10 text-warning" },
  HARD: { label: "Hard", className: "bg-destructive/10 text-destructive" },
};

const getKdConfig = (kd: string) => kdConfig[kd] || kdConfig.MEDIUM;

const PositionBadge: React.FC<{
  position: number | null;
  rank: number;
}> = ({ position, rank }) => {
  const config = getPositionBadge(position, rank);
  if (!config) {
    return (
      <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold text-muted-foreground">
        {position || "-"}
      </span>
    );
  }
  const { Icon, opacity } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-2 px-2 py-0.5 font-bold",
        `border-warning${opacity} bg-warning${opacity}/20 text-warning`,
      )}
    >
      <Icon className="size-4" />#{position}
    </span>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-info to-info/70 p-4 md:p-5">
    <div className="absolute -top-12 -right-12 hidden size-48 rounded-full bg-white/10 md:block" />
    <div className="relative flex items-center gap-3">
      <Flame className="size-7 text-info-foreground" />
      <h3 className="text-lg font-bold text-info-foreground md:text-2xl">
        {title}
      </h3>
    </div>
  </div>
);

const KeywordCard: React.FC<{
  kw: KeywordReport;
  index: number;
  trafficChangeData: ReturnType<typeof calculateTrafficChange>;
}> = ({ kw, index, trafficChangeData }) => {
  const kd = getKdConfig(kw.kd);

  return (
    <div className="rounded-2xl border border-border bg-background p-4 transition-colors active:border-info">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/40 text-sm font-bold text-info">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-semibold break-words">{kw.keyword}</p>
          {kw.isTopReport && (
            <Badge className="bg-warning/15 text-warning">Top Report</Badge>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PositionBadge position={kw.position} rank={index} />
        <Badge className={cn("min-w-14 justify-center font-semibold", kd.className)}>
          {kd.label}
        </Badge>
      </div>

      <TrafficProgressBar changeData={trafficChangeData} />
    </div>
  );
};

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({
  keywords,
  title,
}) => {
  const { keywordHistory } = useHistoryContext();

  if (keywords.length === 0) return null;

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden">
        {title && (
          <div className="mb-3 overflow-hidden rounded-2xl">
            <SectionHeader title={title} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {keywords.map((kw, index) => {
            const trafficChangeData = calculateTrafficChange(
              kw.traffic,
              keywordHistory,
              kw.id,
            );
            return (
              <KeywordCard
                key={kw.id}
                kw={kw}
                index={index}
                trafficChangeData={trafficChangeData}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-background to-card md:block">
        {title && <SectionHeader title={title} />}

        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-12 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                #
              </TableHead>
              <TableHead className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                Keywords
              </TableHead>
              <TableHead className="w-32 text-center text-xs font-bold tracking-wider uppercase text-muted-foreground">
                Position
              </TableHead>
              <TableHead className="w-72 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                Traffic
              </TableHead>
              <TableHead className="w-24 text-center text-xs font-bold tracking-wider uppercase text-muted-foreground">
                KD
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, index) => {
              const kd = getKdConfig(kw.kd);
              const trafficChangeData = calculateTrafficChange(
                kw.traffic,
                keywordHistory,
                kw.id,
              );
              const positionBadge = getPositionBadge(kw.position, index);

              return (
                <TableRow
                  key={kw.id}
                  className="cursor-pointer transition-all hover:bg-muted/50 hover:shadow-[inset_4px_0_0_var(--info)]"
                >
                  <TableCell>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/40 text-info">
                        <Search className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 font-semibold break-words">
                          {kw.keyword}
                        </p>
                        {kw.isTopReport && (
                          <Badge className="bg-warning/15 text-warning">
                            Top Report
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {positionBadge ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <PositionBadge position={kw.position} rank={index} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Top {kw.position} Position!
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="font-semibold text-muted-foreground">
                        {kw.position || "-"}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <TrafficProgressBar changeData={trafficChangeData} />
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        "min-w-16 justify-center font-semibold",
                        kd.className,
                      )}
                    >
                      {kd.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
