"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2, LayoutDashboard, Activity, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportPage } from "@/hooks/ui/useReportPage";
import { HistoryProvider } from "./contexts/HistoryContext";
import { ReportFiltersProvider } from "./contexts/ReportFiltersContext";
import { OverviewTab } from "./tabs/OverviewTab";
import { DomainHealthTab } from "./tabs/DomainHealthTab";
import { KeywordPerformanceTab } from "./tabs/KeywordPerformanceTab";
import { AiRecommendationsTab } from "./tabs/AiRecommendationsTab";
import type { CustomerReportData } from "@/hooks/api/useCustomersApi";

interface ReportPageProps {
  customerId: string;
  initialData?: CustomerReportData;
}

type TabValue = "overview" | "health" | "keywords" | "ai";
const TAB_VALUES: readonly TabValue[] = [
  "overview",
  "health",
  "keywords",
  "ai",
] as const;
const isTabValue = (v: string | null): v is TabValue =>
  v !== null && (TAB_VALUES as readonly string[]).includes(v);

const ReportTabs = ({ reportData, customerId, customerName }: {
  reportData: CustomerReportData | undefined;
  customerId: string;
  customerName: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabValue = isTabValue(rawTab) ? rawTab : "overview";

  const handleTabChange = (val: string) => {
    if (!isTabValue(val)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const recommendationsCount = reportData?.recommendations?.length || 0;

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="w-full"
    >
      <div className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-6">
        {/* Sidebar (desktop) + sticky horizontal tabs (mobile) */}
        <aside className="md:contents">
          <div className="sticky top-16 z-20 -mx-4 bg-background/80 px-4 py-2 backdrop-blur md:top-20 md:mx-0 md:self-start md:rounded-xl md:border md:border-border md:bg-card md:p-3 md:backdrop-blur-none">
            <TabsList
              aria-label="SEO Report sections"
              className="flex w-full gap-1 overflow-x-auto bg-muted md:flex-col md:overflow-visible md:bg-transparent md:p-0"
            >
              <TabsTrigger value="overview" className="gap-1.5 md:w-full md:justify-start">
                <LayoutDashboard className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-1.5 md:w-full md:justify-start">
                <Activity className="size-4" />
                Domain Health
              </TabsTrigger>
              <TabsTrigger value="keywords" className="gap-1.5 md:w-full md:justify-start">
                <Search className="size-4" />
                Keyword Performance
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 md:w-full md:justify-start">
                <Sparkles className="size-4" />
                AI &amp; Recommendations
              </TabsTrigger>
            </TabsList>
          </div>
        </aside>

        {/* Content area */}
        <div className="min-w-0">
          <TabsContent value="overview" className="mt-0">
            <OverviewTab
              recommendationsCount={recommendationsCount}
              topKeywords={reportData?.topKeywords ?? []}
              otherKeywords={reportData?.otherKeywords ?? []}
              currentTraffic={reportData?.metrics?.organicTraffic ?? null}
            />
          </TabsContent>
          <TabsContent value="health" className="mt-0">
            <DomainHealthTab
              customerId={customerId}
              customerName={customerName}
              metrics={reportData?.metrics}
            />
          </TabsContent>
          <TabsContent value="keywords" className="mt-0">
            <KeywordPerformanceTab
              topKeywords={reportData?.topKeywords ?? []}
              otherKeywords={reportData?.otherKeywords ?? []}
            />
          </TabsContent>
          <TabsContent value="ai" className="mt-0">
            <AiRecommendationsTab
              recommendations={reportData?.recommendations ?? []}
              aiOverviews={reportData?.aiOverviews ?? []}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

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

  return (
    <HistoryProvider customerId={customerId}>
      <ReportFiltersProvider>
        <div className="mx-auto w-full max-w-screen-xl px-4 py-4 md:px-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-1 text-2xl font-bold break-words md:text-4xl">
              SEO Report for {customerName}
            </h1>
            <p className="text-base break-words text-muted-foreground md:text-xl">
              {domain}
            </p>
          </div>

          <Suspense fallback={null}>
            <ReportTabs
              reportData={reportData ?? undefined}
              customerId={customerId}
              customerName={customerName}
            />
          </Suspense>
        </div>
      </ReportFiltersProvider>
    </HistoryProvider>
  );
};

export default ReportPage;
