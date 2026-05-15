"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { OverallMetricsCard } from "./OverallMetricsCard";
import { KeywordReportTable } from "./KeywordReportTable";
import { RecommendKeywordTable } from "./RecommendKeywordTable";
import { SummaryStatistics } from "./SummaryStatistics";
import { TrendChartsSection } from "./TrendChartsSection";
import { KeywordTrendChart } from "./KeywordTrendChart";
import { useReportPage } from "@/hooks/ui/useReportPage";
import { HistoryProvider } from "./contexts/HistoryContext";
import { AiOverviewCard } from "./AiOverviewCard";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

interface ReportPageProps {
  customerId: string;
  initialData?: CustomerReportData;
}

const ReportPage: React.FC<ReportPageProps> = ({ customerId, initialData }) => {
  const { reportData, isLoading, error } = useReportPage(
    customerId,
    initialData,
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-16 text-center">
        <Loader2 className="mx-auto size-12 animate-spin text-info" />
        <p className="mt-3 text-lg text-muted-foreground">
          Loading report data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive"
        >
          Failed to load report data: {error}
        </div>
      </div>
    );
  }

  const customerName = reportData?.customerName || "Customer";
  const domain = reportData?.domain || "N/A";

  const allKeywords = [
    ...(reportData?.topKeywords || []),
    ...(reportData?.otherKeywords || []),
  ];
  const totalKeywords = allKeywords.length;
  const positionedKeywords = allKeywords.filter(
    (kw): kw is typeof kw & { position: number } =>
      kw.position != null && kw.position > 0,
  );
  const avgPosition =
    positionedKeywords.length > 0
      ? positionedKeywords.reduce((sum, kw) => sum + kw.position, 0) /
        positionedKeywords.length
      : null;
  const top3Count = positionedKeywords.filter((kw) => kw.position <= 3).length;
  const recommendationsCount = reportData?.recommendations?.length || 0;

  return (
    <HistoryProvider customerId={customerId}>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-1 text-3xl font-bold break-words md:text-5xl">
            SEO Report for {customerName}
          </h1>
          <p className="text-lg break-words text-muted-foreground md:text-2xl">
            {domain}
          </p>
        </div>

        <SummaryStatistics
          totalKeywords={totalKeywords}
          avgPosition={avgPosition}
          top3Count={top3Count}
          recommendationsCount={recommendationsCount}
        />

        <div className="mb-6 grid gap-4 md:mb-8 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-7 lg:col-span-8">
            <OverallMetricsCard
              metrics={reportData?.metrics || null}
              customerId={customerId}
              customerName={customerName}
            />
          </div>
          <div className="md:col-span-5 lg:col-span-4">
            <RecommendKeywordTable
              title="Recommended Keywords"
              keywords={reportData?.recommendations || []}
            />
          </div>
        </div>

        <section className="mb-6 md:mb-8">
          <TrendChartsSection title="แนวโน้ม Domain Metrics" />
        </section>

        <section className="mb-6 md:mb-8">
          <KeywordTrendChart title="แนวโน้ม Keyword" />
        </section>

        <section className="mb-6 md:mb-8">
          <KeywordReportTable
            title="Top Keywords Report"
            keywords={reportData?.topKeywords || []}
          />
        </section>

        <div className="grid gap-4 md:grid-cols-12 md:gap-5">
          <div className="md:col-span-6 lg:col-span-7">
            <KeywordReportTable
              title="Other Keywords"
              keywords={reportData?.otherKeywords || []}
            />
          </div>
          <div className="md:col-span-6 lg:col-span-5">
            <AiOverviewCard aiOverviews={reportData?.aiOverviews || []} />
          </div>
        </div>
      </div>
    </HistoryProvider>
  );
};

export default ReportPage;
