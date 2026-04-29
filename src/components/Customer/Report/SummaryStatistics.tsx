// src/components/Customer/Report/SummaryStatistics.tsx
"use client";

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
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        background: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 100%)`,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
          borderColor: color,
        },
        "&:active": { transform: "translateY(-2px)" },
      }}
    >
      {/* Decorative Circle — hide on mobile to reduce visual noise */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(color, 0.1),
          display: { xs: "none", sm: "block" },
        }}
      />

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "inline-flex",
            p: { xs: 1, md: 1.5 },
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            mb: { xs: 1.5, md: 2 },
          }}
        >
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
        </Box>

        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            mb: 0.5,
            color: "#2f2f2f",
            fontSize: { xs: "1.5rem", md: "1.75rem" },
          }}
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
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{
          mb: { xs: 2, md: 3 },
          fontSize: { xs: "1.125rem", md: "1.5rem" },
        }}
      >
        Quick Overview
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
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
            color="#ed6c02"
            bgColor="#FFF7E6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<Lightbulb sx={{ fontSize: 28 }} />}
            label="Recommendations"
            value={recommendationsCount}
            color="#6c68e8"
            bgColor="#EEEDFF"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
