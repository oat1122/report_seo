// src/components/Customer/Report/ReportPage.tsx
"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { OverallMetricsCard } from "./OverallMetricsCard";
import { KeywordReportTable } from "./KeywordReportTable";
import { RecommendKeywordTable } from "./RecommendKeywordTable"; // Import component ใหม่
import { useReportPage } from "./hooks/useReportPage";

interface ReportPageProps {
  customerId: string;
}

const ReportPage: React.FC<ReportPageProps> = ({ customerId }) => {
  // ใช้ Custom Hook สำหรับจัดการ Data Fetching และ State
  const { reportData, isLoading, error } = useReportPage(customerId);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading report data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load report data: {error}</Alert>
      </Container>
    );
  }

  // ใช้ customerName และ domain จาก reportData ที่ API ส่งมา
  const customerName = reportData?.customerName || "Customer";
  const domain = reportData?.domain || "N/A";

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h1" gutterBottom>
        SEO Report for {customerName}
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        {domain}
      </Typography>

      <OverallMetricsCard
        metrics={reportData?.metrics || null}
        customerId={customerId}
        customerName={customerName}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
        <KeywordReportTable
          title="Top Keywords Report"
          keywords={reportData?.topKeywords || []}
        />
        {/* เพิ่มตาราง Keyword ที่แนะนำที่นี่ */}
        <RecommendKeywordTable
          title="Recommended Keywords"
          keywords={reportData?.recommendations || []}
        />
        <KeywordReportTable
          title="Other Keywords"
          keywords={reportData?.otherKeywords || []}
        />
      </Box>
    </Container>
  );
};

export default ReportPage;
