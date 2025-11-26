// src/components/Customer/Report/SummaryStatistics.tsx
import React from "react";
import { Box, Paper, Typography, Grid, alpha } from "@mui/material";
import {
  TrendingUp,
  VpnKey,
  EmojiEvents,
  Lightbulb,
} from "@mui/icons-material";

interface SummaryStatisticsProps {
  totalKeywords: number;
  avgPosition: number | null;
  top3Count: number;
  recommendationsCount: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  bgColor,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        background: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 100%)`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          borderColor: color,
        },
      }}
    >
      {/* Decorative Circle */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(color, 0.1),
        }}
      />

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "inline-flex",
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            mb: 2,
          }}
        >
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
        </Box>

        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ mb: 0.5, color: "#2f2f2f" }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({
  totalKeywords,
  avgPosition,
  top3Count,
  recommendationsCount,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Quick Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<VpnKey sx={{ fontSize: 28 }} />}
            label="Total Keywords"
            value={totalKeywords}
            color="#9592ff"
            bgColor="#F5F3FF"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<TrendingUp sx={{ fontSize: 28 }} />}
            label="Avg Position"
            value={avgPosition !== null ? avgPosition.toFixed(1) : "-"}
            color="#31fb4c"
            bgColor="#ECFDF5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<EmojiEvents sx={{ fontSize: 28 }} />}
            label="Top 3 Rankings"
            value={top3Count}
            color="#FFD700"
            bgColor="#FFFBEB"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<Lightbulb sx={{ fontSize: 28 }} />}
            label="Recommendations"
            value={recommendationsCount}
            color="#f5576c"
            bgColor="#FFF1F2"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
