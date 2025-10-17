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
import { useReportPage } from "./hooks/useReportPage";

interface ReportPageProps {
  customerId: string;
}

const ReportPage: React.FC<ReportPageProps> = ({ customerId }) => {
  // ใช้ Custom Hook สำหรับจัดการ Data Fetching และ State
  const { reportData, reportStatus, error } = useReportPage(customerId);

  if (reportStatus === "loading" || reportStatus === "idle") {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading report data...</Typography>
      </Container>
    );
  }

  if (reportStatus === "failed") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load report data: {error || "Unknown error"}
        </Alert>
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
        <KeywordReportTable
          title="Other Keywords"
          keywords={reportData?.otherKeywords || []}
        />
      </Box>
    </Container>
  );
};

export default ReportPage;
