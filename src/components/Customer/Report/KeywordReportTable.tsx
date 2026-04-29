// src/components/Customer/Report/KeywordReportTable.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Avatar,
  Tooltip,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { EmojiEvents, Search, LocalFireDepartment } from "@mui/icons-material";
import { KeywordReport } from "@/types/metrics";
import { useHistoryContext } from "./contexts/HistoryContext";
import { calculateTrafficChange } from "./lib/historyCalculations";
import { TrafficProgressBar } from "./components/TrafficProgressBar";

interface KeywordReportTableProps {
  keywords: KeywordReport[];
  title?: string;
}

// Helper: Get position badge styling (gold/silver/bronze for rank 1-3)
const getPositionBadge = (position: number | null, rank: number) => {
  if (!position) return null;
  if (rank === 0 && position <= 3) {
    return {
      icon: <EmojiEvents sx={{ fontSize: 18 }} />,
      color:
        position === 1 ? "#FFD700" : position === 2 ? "#C0C0C0" : "#CD7F32",
      label: `#${position}`,
    };
  }
  return null;
};

const getKdStyle = (kd: string) => {
  const styles = {
    EASY: { bgcolor: "#E8F5E9", color: "#2E7D32", label: "Easy" },
    MEDIUM: { bgcolor: "#FFF3E0", color: "#E65100", label: "Medium" },
    HARD: { bgcolor: "#FFEBEE", color: "#C62828", label: "Hard" },
  };
  return styles[kd as keyof typeof styles] || styles.MEDIUM;
};

interface KeywordCardProps {
  kw: KeywordReport;
  index: number;
  trafficChangeData: ReturnType<typeof calculateTrafficChange>;
}

const KeywordCard: React.FC<KeywordCardProps> = ({
  kw,
  index,
  trafficChangeData,
}) => {
  const positionBadge = getPositionBadge(kw.position, index);
  const kdStyle = getKdStyle(kw.kd);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        transition: "border-color 0.25s ease",
        "&:active": { borderColor: "#9592ff" },
      }}
    >
      <Stack spacing={1.5}>
        {/* Rank + Keyword */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#EEEDFF",
              color: "#9592ff",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              fontWeight={600}
              sx={{
                mb: 0.5,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: 1.4,
              }}
            >
              {kw.keyword}
            </Typography>
            {kw.isTopReport && (
              <Chip
                label="Top Report"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Stack>

        {/* Metrics row */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {positionBadge ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.25,
                borderRadius: 2,
                bgcolor: `${positionBadge.color}20`,
                border: `2px solid ${positionBadge.color}`,
              }}
            >
              <Box sx={{ color: positionBadge.color, display: "flex" }}>
                {positionBadge.icon}
              </Box>
              <Typography
                fontWeight={700}
                sx={{ color: positionBadge.color, fontSize: "0.85rem" }}
              >
                {positionBadge.label}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: 2,
                bgcolor: "#F1F5F9",
              }}
            >
              <Typography
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: "0.85rem" }}
              >
                Pos: {kw.position || "-"}
              </Typography>
            </Box>
          )}

          <Chip
            label={kdStyle.label}
            size="small"
            sx={{
              bgcolor: kdStyle.bgcolor,
              color: kdStyle.color,
              fontWeight: 600,
              borderRadius: 2,
              minWidth: 60,
            }}
          />
        </Stack>

        {/* Traffic bar — full width on mobile */}
        <Box sx={{ width: "100%" }}>
          <TrafficProgressBar changeData={trafficChangeData} />
        </Box>
      </Stack>
    </Paper>
  );
};

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({
  keywords,
  title,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { keywordHistory } = useHistoryContext();

  if (keywords.length === 0) {
    return null;
  }

  // Mobile: card list
  if (isMobile) {
    return (
      <Box>
        {title && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg, #9592ff 0%, #6c68e8 100%)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <LocalFireDepartment sx={{ color: "#fff", fontSize: 24 }} />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#fff", fontSize: "1.05rem" }}
            >
              {title}
            </Typography>
          </Box>
        )}
        <Stack spacing={1.5}>
          {keywords.map((kw, index) => {
            const trafficChangeData = calculateTrafficChange(
              kw.traffic,
              keywordHistory,
              kw.id,
            );
            return (
              <KeywordCard
                key={kw.id}
                kw={kw}
                index={index}
                trafficChangeData={trafficChangeData}
              />
            );
          })}
        </Stack>
      </Box>
    );
  }

  // Desktop: table
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #FFFFFF, #F8F9FA)",
      }}
    >
      {title && (
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            background: "linear-gradient(135deg, #9592ff 0%, #6c68e8 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              display: { xs: "none", md: "block" },
            }}
          />
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}
          >
            <LocalFireDepartment sx={{ color: "#fff", fontSize: 32 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                background: "linear-gradient(to right, #fff, #e0e7ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.125rem", md: "1.5rem" },
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
      )}

      <Table>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: "#F8F9FA",
              "& th": {
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                py: 2,
              },
            }}
          >
            <TableCell sx={{ width: "8%" }}>#</TableCell>
            <TableCell>Keywords</TableCell>
            <TableCell align="center" sx={{ width: "15%" }}>
              Position
            </TableCell>
            <TableCell sx={{ width: "30%" }}>Traffic</TableCell>
            <TableCell align="center" sx={{ width: "12%" }}>
              KD
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw, index) => {
            const positionBadge = getPositionBadge(kw.position, index);
            const kdStyle = getKdStyle(kw.kd);

            const trafficChangeData = calculateTrafficChange(
              kw.traffic,
              keywordHistory,
              kw.id,
            );

            return (
              <TableRow
                key={kw.id}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: "#F1F5F9",
                    transform: "translateX(4px)",
                    boxShadow: "inset 4px 0 0 #9592ff",
                  },
                  "&:active": { opacity: 0.85 },
                  cursor: "pointer",
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#EEEDFF",
                        color: "#9592ff",
                      }}
                    >
                      <Search sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        fontWeight={600}
                        sx={{
                          mb: 0.5,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {kw.keyword}
                      </Typography>
                      {kw.isTopReport && (
                        <Chip
                          label="Top Report"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: "#FEF3C7",
                            color: "#92400E",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  {positionBadge ? (
                    <Tooltip title={`Top ${kw.position} Position!`}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: `${positionBadge.color}20`,
                          border: `2px solid ${positionBadge.color}`,
                        }}
                      >
                        <Box sx={{ color: positionBadge.color }}>
                          {positionBadge.icon}
                        </Box>
                        <Typography
                          fontWeight={700}
                          sx={{ color: positionBadge.color }}
                        >
                          {positionBadge.label}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography fontWeight={600} color="text.secondary">
                      {kw.position || "-"}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <TrafficProgressBar changeData={trafficChangeData} />
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={kdStyle.label}
                    size="small"
                    sx={{
                      bgcolor: kdStyle.bgcolor,
                      color: kdStyle.color,
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 70,
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
