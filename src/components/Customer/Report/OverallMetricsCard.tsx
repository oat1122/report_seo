// src/components/Customer/Report/OverallMetricsCard.tsx
import React from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { OverallMetrics } from "@/types/metrics";
import {
  Traffic,
  VpnKey,
  Link as LinkIcon,
  Language,
  History,
} from "@mui/icons-material";
import { HistoryModal } from "@/components/shared/users/MetricsModal/HistoryModal";
import { useOverallMetricsCard } from "./hooks/useOverallMetricsCard";
import { getRatingColor, getAgeColor, getSpamColor } from "./lib/utils";

// --- Helper Components ---

// 1. MetricItem สำหรับตัวเลขธรรมดา
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
  <Paper
    variant="outlined"
    sx={{ p: 2, textAlign: "center", borderRadius: 3, height: "100%" }}
  >
    <Box sx={{ color: color || "text.secondary", mb: 1 }}>{icon}</Box>
    <Typography variant="h6" fontWeight={700}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

// 2. Gauge Chart Component ใหม่ (ใช้แทน CircularProgress แบบเดิม)
const GaugeChart = ({ label, value }: { label: string; value: number }) => {
  const color = getRatingColor(value);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        p: 2,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex", mb: 1 }}>
        <CircularProgress
          variant="determinate"
          value={value}
          size={80}
          thickness={6}
          style={{ color }}
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
          <Typography variant="h5" component="div" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6">{label}</Typography>
    </Box>
  );
};

// 3. Custom Linear Progress (ใช้แทน LinearProgress)
const CustomLinearProgress = ({
  label,
  value,
  colorFunc,
  unit = "",
}: {
  label: string;
  value: number;
  colorFunc: (val: number) => string;
  unit?: string;
}) => {
  const color = colorFunc(value);
  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h6">{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <Box
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: "action.disabledBackground",
            }}
          >
            <Box
              sx={{
                width: `${Math.min(value, 100)}%`,
                height: 10,
                borderRadius: 5,
                bgcolor: color,
                transition: "width 0.5s ease-in-out",
              }}
            />
          </Box>
        </Box>
        <Typography variant="body1" fontWeight={600}>
          {value}
          {unit}
        </Typography>
      </Box>
    </Box>
  );
};

// --- Main Component ---

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
          {/* Main metrics with new charts */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GaugeChart label="Domain Rating" value={metrics.domainRating} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GaugeChart label="Health Score" value={metrics.healthScore} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomLinearProgress
              label="Age"
              value={metrics.ageInYears}
              colorFunc={getAgeColor}
              unit=" Y"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomLinearProgress
              label="Spam Score"
              value={metrics.spamScore}
              colorFunc={getSpamColor}
              unit="%"
            />
          </Grid>

          {/* Other metrics (ใช้ MetricItem เดิม) */}
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
