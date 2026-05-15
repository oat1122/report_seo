"use client";

import React from "react";
import { TrendingUp, KeyRound, Trophy, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryStatisticsProps {
  totalKeywords: number;
  avgPosition: number | null;
  top3Count: number;
  recommendationsCount: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  colorClass,
}) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg md:p-6",
        // hover border tint per color
        colorClass,
      )}
    >
      <div className="absolute -top-5 -right-5 hidden size-20 rounded-full opacity-10 sm:block bg-current" />
      <div className="relative">
        <div className={cn("mb-3 inline-flex rounded-lg p-2 md:p-3", "bg-current/10")}>
          <span className="flex">{icon}</span>
        </div>
        <p className="mb-1 text-2xl font-bold text-foreground md:text-3xl">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({
  totalKeywords,
  avgPosition,
  top3Count,
  recommendationsCount,
}) => {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="mb-4 text-lg font-bold md:mb-6 md:text-2xl">
        Quick Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        <StatCard
          icon={<KeyRound className="size-7" />}
          label="Total Keywords"
          value={totalKeywords}
          colorClass="text-info hover:border-info/40"
        />
        <StatCard
          icon={<TrendingUp className="size-7" />}
          label="Avg Position"
          value={avgPosition !== null ? avgPosition.toFixed(1) : "-"}
          colorClass="text-success hover:border-success/40"
        />
        <StatCard
          icon={<Trophy className="size-7" />}
          label="Top 3 Rankings"
          value={top3Count}
          colorClass="text-warning hover:border-warning/40"
        />
        <StatCard
          icon={<Lightbulb className="size-7" />}
          label="Recommendations"
          value={recommendationsCount}
          colorClass="text-info hover:border-info/40"
        />
      </div>
    </div>
  );
};
