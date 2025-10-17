// src/components/Customer/Report/OverallMetricsCard.tsx
import React from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { OverallMetrics } from "@/types/metrics";
import {
  StarBorder,
  HealthAndSafety,
  AccessTime,
  ReportProblem,
  Traffic,
  VpnKey,
  Link as LinkIcon,
  Language,
  History,
} from "@mui/icons-material";
import { HistoryModal } from "@/components/shared/users/MetricsModal/HistoryModal";
import { useOverallMetricsCard } from "./hooks/useOverallMetricsCard";

// Helper component for each metric item
const MetricItem = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: 3 }}>
    <Box sx={{ color: color || "text.secondary", mb: 1 }}>{icon}</Box>
    <Typography variant="h6" fontWeight={700}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

interface OverallMetricsCardProps {
  metrics: OverallMetrics | null;
  customerId: string;
  customerName: string;
}

export const OverallMetricsCard: React.FC<OverallMetricsCardProps> = ({
  metrics,
  customerId,
  customerName,
}) => {
  // ใช้ Custom Hook สำหรับจัดการ State และ Logic
  const {
    isHistoryModalOpen,
    historyData,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  } = useOverallMetricsCard(customerId);

  if (!metrics) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 4,
          border: "1px dashed #ccc",
        }}
      >
        <Typography color="text.secondary">
          ยังไม่มีข้อมูลภาพรวมของ Domain
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }} elevation={0}>
        {/* Header with History button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Overall Domain Metrics
          </Typography>
          <Tooltip title="ดูประวัติการเปลี่ยนแปลง">
            <IconButton onClick={handleOpenHistoryModal} color="primary">
              <History />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {/* Main metrics with visuals */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                p: 2,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={metrics.domainRating}
                  size={60}
                  color="info"
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" component="div" color="text.primary">
                    {metrics.domainRating}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6">Domain Rating</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                p: 2,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={metrics.healthScore}
                  size={60}
                  color="secondary"
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" component="div" color="text.primary">
                    {metrics.healthScore}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6">Health Score</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6">Age</Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.ageInYears / 10) * 100} // Assuming max age of 10 for visual
                sx={{ my: 1 }}
                color="secondary"
              />
              <Typography variant="body1">{metrics.ageInYears} Y</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6">Spam Score</Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.spamScore}
                color="error"
                sx={{ my: 1 }}
              />
              <Typography variant="body1">{metrics.spamScore}%</Typography>
            </Box>
          </Grid>

          {/* Other metrics */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              icon={<Traffic />}
              label="Organic Traffic"
              value={metrics.organicTraffic.toLocaleString()}
              color="#31fb4c"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              icon={<VpnKey />}
              label="Organic Keywords"
              value={metrics.organicKeywords.toLocaleString()}
              color="#9592ff"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              icon={<LinkIcon />}
              label="Backlink"
              value={metrics.backlinks.toLocaleString()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              icon={<Language />}
              label="Ref.Domains"
              value={metrics.refDomains.toLocaleString()}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* History Modal */}
      <HistoryModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={customerName}
      />
    </>
  );
};
