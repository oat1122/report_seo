"use client";

import React from "react";
import { History, Globe, KeyRound, Link as LinkIcon, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OverallMetricsForm } from "@/types/metrics";
import { formatDuration } from "@/lib/duration";
import { HistoryModal } from "@/features/users/presentation/components/MetricsModal/HistoryModal";
import { useOverallMetricsCard } from "@/hooks/ui/useOverallMetricsCard";
import { getRatingColor, getAgeColor, getSpamColor } from "./lib/utils";
import { useHistoryContext } from "./contexts/HistoryContext";
import { calculateMetricChange } from "./lib/historyCalculations";
import { MetricChangeIndicator } from "./components/MetricChangeIndicator";
import { GaugeChart } from "./components/GaugeChart";
import { CustomLinearProgress } from "./components/CustomLinearProgress";

interface OverallMetricsCardProps {
  metrics: OverallMetricsForm | null;
  customerId: string;
  customerName: string;
}

export const OverallMetricsCard: React.FC<OverallMetricsCardProps> = ({
  metrics,
  customerId,
  customerName,
}) => {
  const {
    isHistoryModalOpen,
    historyData,
    isHistoryLoading,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  } = useOverallMetricsCard(customerId);
  const { metricsHistory } = useHistoryContext();

  if (!metrics) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">
          ยังไม่มีข้อมูลภาพรวมของ Domain
        </p>
      </div>
    );
  }

  const trafficChange = calculateMetricChange(
    metrics.organicTraffic,
    metricsHistory,
    "organicTraffic",
  );
  const keywordsChange = calculateMetricChange(
    metrics.organicKeywords,
    metricsHistory,
    "organicKeywords",
  );
  const backlinksChange = calculateMetricChange(
    metrics.backlinks,
    metricsHistory,
    "backlinks",
  );
  const refDomainsChange = calculateMetricChange(
    metrics.refDomains,
    metricsHistory,
    "refDomains",
  );
  const totalMonths = metrics.ageInYears * 12 + (metrics.ageInMonths || 0);

  return (
    <>
      <div className="rounded-2xl border border-border bg-background p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Overall Domain Metrics</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="ดูประวัติการเปลี่ยนแปลง"
                onClick={handleOpenHistoryModal}
              >
                <History className="size-4 text-info" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ดูประวัติการเปลี่ยนแปลง</TooltipContent>
          </Tooltip>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <GaugeChart
            label="Domain Rating"
            value={metrics.domainRating}
            color={getRatingColor(metrics.domainRating)}
          />
          <GaugeChart
            label="Health Score"
            value={metrics.healthScore}
            color={getRatingColor(metrics.healthScore)}
          />
          <CustomLinearProgress
            label="Age"
            value={totalMonths}
            displayValue={formatDuration(
              metrics.ageInYears,
              metrics.ageInMonths || 0,
            )}
            colorFunc={(m) => getAgeColor(Math.floor(m / 12), m % 12)}
          />
          <CustomLinearProgress
            label="Spam Score"
            value={metrics.spamScore}
            displayValue={`${metrics.spamScore}%`}
            colorFunc={getSpamColor}
          />

          <MetricChangeIndicator
            icon={<Activity className="size-5" />}
            label="Organic Traffic"
            value={metrics.organicTraffic.toLocaleString()}
            changeData={trafficChange}
            iconClassName="text-success"
          />
          <MetricChangeIndicator
            icon={<KeyRound className="size-5" />}
            label="Organic Keywords"
            value={metrics.organicKeywords.toLocaleString()}
            changeData={keywordsChange}
            iconClassName="text-info"
          />
          <MetricChangeIndicator
            icon={<LinkIcon className="size-5" />}
            label="Backlink"
            value={metrics.backlinks.toLocaleString()}
            changeData={backlinksChange}
          />
          <MetricChangeIndicator
            icon={<Globe className="size-5" />}
            label="Ref.Domains"
            value={metrics.refDomains.toLocaleString()}
            changeData={refDomainsChange}
          />
        </div>
      </div>

      <HistoryModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={customerName}
        isLoading={isHistoryLoading}
      />
    </>
  );
};
