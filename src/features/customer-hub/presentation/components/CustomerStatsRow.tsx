"use client";

import { Globe, HeartPulse, TrendingUp, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerHubSummary } from "../../domain/CustomerHubSummary";

interface CustomerStatsRowProps {
  metrics: CustomerHubSummary["metrics"] | undefined;
  isLoading: boolean;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const stats = [
  {
    key: "domainRating" as const,
    label: "Domain Rating",
    icon: Globe,
    color: "text-info bg-info/10",
    format: false,
  },
  {
    key: "healthScore" as const,
    label: "Health Score",
    icon: HeartPulse,
    color: "text-success bg-success/10",
    format: false,
  },
  {
    key: "organicTraffic" as const,
    label: "Organic Traffic",
    icon: TrendingUp,
    color: "text-primary bg-primary/10",
    format: true,
  },
  {
    key: "organicKeywords" as const,
    label: "Organic Keywords",
    icon: KeyRound,
    color: "text-info bg-info/10",
    format: true,
  },
] as const;

export function CustomerStatsRow({ metrics, isLoading }: CustomerStatsRowProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, color, format }) => (
        <Card key={key} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="size-5" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="mb-1 h-6 w-12" />
              ) : (
                <p className="text-2xl font-bold">
                  {metrics
                    ? format
                      ? formatNumber(metrics[key])
                      : metrics[key]
                    : "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
