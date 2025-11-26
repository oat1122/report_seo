// src/components/Customer/Report/ReportPage.tsx
"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { OverallMetricsCard } from "./OverallMetricsCard";
import { KeywordReportTable } from "./KeywordReportTable";
import { RecommendKeywordTable } from "./RecommendKeywordTable";
import { SummaryStatistics } from "./SummaryStatistics";
import { useReportPage } from "./hooks/useReportPage";
import { HistoryProvider } from "./contexts/HistoryContext";

interface ReportPageProps {
  customerId: string;
}

const ReportPage: React.FC<ReportPageProps> = ({ customerId }) => {
  const { reportData, isLoading, error } = useReportPage(customerId);

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 3 }} variant="h6" color="text.secondary">
          Loading report data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load report data: {error}</Alert>
      </Container>
    );
  }

  const customerName = reportData?.customerName || "Customer";
  const domain = reportData?.domain || "N/A";

  // Calculate summary statistics
  const allKeywords = [
    ...(reportData?.topKeywords || []),
    ...(reportData?.otherKeywords || []),
  ];
  const totalKeywords = allKeywords.length;
  const avgPosition =
    allKeywords.length > 0
      ? allKeywords.reduce((sum, kw) => sum + (kw.position || 0), 0) /
        allKeywords.filter((kw) => kw.position).length
      : null;
  const top3Count = allKeywords.filter(
    (kw) => kw.position && kw.position <= 3
  ).length;
  const recommendationsCount = reportData?.recommendations?.length || 0;

  return (
    <HistoryProvider customerId={customerId}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            SEO Report for {customerName}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {domain}
          </Typography>
        </Box>

        {/* Summary Statistics */}
        <SummaryStatistics
          totalKeywords={totalKeywords}
          avgPosition={avgPosition}
          top3Count={top3Count}
          recommendationsCount={recommendationsCount}
        />

        {/* Main Content Grid: Overall Metrics + Recommendations */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <OverallMetricsCard
              metrics={reportData?.metrics || null}
              customerId={customerId}
              customerName={customerName}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <RecommendKeywordTable
              title="Recommended Keywords"
              keywords={reportData?.recommendations || []}
            />
          </Grid>
        </Grid>

        {/* Keyword Tables */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <KeywordReportTable
            title="Top Keywords Report"
            keywords={reportData?.topKeywords || []}
          />

          <KeywordReportTable
            title="Other Keywords"
            keywords={reportData?.otherKeywords || []}
          />
        </Box>
      </Container>
    </HistoryProvider>
  );
};

export default ReportPage;
