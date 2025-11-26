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
import { OverallMetricsForm, formatDuration } from "@/types/metrics";
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
import { useHistoryContext } from "./contexts/HistoryContext";
import { calculateMetricChange } from "./lib/historyCalculations";
import { MetricChangeIndicator } from "./components/MetricChangeIndicator";

// --- Helper Components ---

// Gauge Chart Component (ใช้แทน CircularProgress แบบเดิม)
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
  displayValue,
  colorFunc,
}: {
  label: string;
  value: number;
  displayValue: string;
  colorFunc: (val: number) => string;
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
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{ whiteSpace: "nowrap" }}
        >
          {displayValue}
        </Typography>
      </Box>
    </Box>
  );
};

// --- Main Component ---

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
  // ใช้ Custom Hook สำหรับจัดการ State และ Logic
  const {
    isHistoryModalOpen,
    historyData,
    isHistoryLoading,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
  } = useOverallMetricsCard(customerId);

  // Get history data from context
  const { metricsHistory } = useHistoryContext();

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

  // Calculate changes for each metric
  const trafficChange = calculateMetricChange(
    metrics.organicTraffic,
    metricsHistory,
    "organicTraffic"
  );
  const keywordsChange = calculateMetricChange(
    metrics.organicKeywords,
    metricsHistory,
    "organicKeywords"
  );
  const backlinksChange = calculateMetricChange(
    metrics.backlinks,
    metricsHistory,
    "backlinks"
  );
  const refDomainsChange = calculateMetricChange(
    metrics.refDomains,
    metricsHistory,
    "refDomains"
  );

  return (
    <>
      <Paper
        sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
        elevation={0}
      >
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
              value={metrics.ageInYears * 12 + (metrics.ageInMonths || 0)}
              displayValue={formatDuration(
                metrics.ageInYears,
                metrics.ageInMonths || 0
              )}
              colorFunc={(totalMonths) =>
                getAgeColor(Math.floor(totalMonths / 12), totalMonths % 12)
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomLinearProgress
              label="Spam Score"
              value={metrics.spamScore}
              displayValue={`${metrics.spamScore}%`}
              colorFunc={getSpamColor}
            />
          </Grid>

          {/* Other metrics (ใช้ MetricChangeIndicator แทน MetricItem) */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricChangeIndicator
              icon={<Traffic />}
              label="Organic Traffic"
              value={metrics.organicTraffic.toLocaleString()}
              changeData={trafficChange}
              color="#31fb4c"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricChangeIndicator
              icon={<VpnKey />}
              label="Organic Keywords"
              value={metrics.organicKeywords.toLocaleString()}
              changeData={keywordsChange}
              color="#9592ff"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricChangeIndicator
              icon={<LinkIcon />}
              label="Backlink"
              value={metrics.backlinks.toLocaleString()}
              changeData={backlinksChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricChangeIndicator
              icon={<Language />}
              label="Ref.Domains"
              value={metrics.refDomains.toLocaleString()}
              changeData={refDomainsChange}
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
        isLoading={isHistoryLoading}
      />
    </>
  );
};
