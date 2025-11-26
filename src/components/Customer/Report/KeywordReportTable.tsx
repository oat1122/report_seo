// src/components/Customer/Report/KeywordReportTable.tsx
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

// Helper: Get position badge styling
const getPositionBadge = (position: number | null, rank: number) => {
  if (!position) return null;

  // Top 3 positions get special treatment
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

// Helper: Get KD styling with semantic colors
const getKdStyle = (kd: string) => {
  const styles = {
    EASY: { bgcolor: "#E8F5E9", color: "#2E7D32", label: "Easy" },
    MEDIUM: { bgcolor: "#FFF3E0", color: "#E65100", label: "Medium" },
    HARD: { bgcolor: "#FFEBEE", color: "#C62828", label: "Hard" },
  };
  return styles[kd as keyof typeof styles] || styles.MEDIUM;
};

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({
  keywords,
  title,
}) => {
  // Get history data from context
  const { keywordHistory } = useHistoryContext();

  if (keywords.length === 0) {
    return null;
  }

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
      {/* Enhanced Header */}
      {title && (
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LocalFireDepartment sx={{ color: "#fff", fontSize: 32 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                background: "linear-gradient(to right, #fff, #e0e7ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
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
            <TableCell width="60px">#</TableCell>
            <TableCell>Keywords</TableCell>
            <TableCell align="center" width="120px">
              Position
            </TableCell>
            <TableCell width="280px">Traffic</TableCell>
            <TableCell align="center" width="120px">
              KD
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw, index) => {
            const positionBadge = getPositionBadge(kw.position, index);
            const kdStyle = getKdStyle(kw.kd);

            // Calculate traffic change from history
            const trafficChangeData = calculateTrafficChange(
              kw.traffic,
              keywordHistory,
              kw.id
            );

            return (
              <TableRow
                key={kw.id}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: "#F1F5F9",
                    transform: "translateX(4px)",
                    boxShadow: "inset 4px 0 0 #667eea",
                  },
                  cursor: "pointer",
                }}
              >
                {/* Rank Number */}
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {index + 1}
                  </Typography>
                </TableCell>

                {/* Keyword with Icon */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#EEF2FF",
                        color: "#667eea",
                      }}
                    >
                      <Search sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                        {kw.keyword}
                      </Typography>
                      {kw.isTopReport && (
                        <Chip
                          label="Top Report"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            bgcolor: "#FEF3C7",
                            color: "#92400E",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </TableCell>

                {/* Position with Trophy */}
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

                {/* Traffic with Visual Bar */}
                <TableCell>
                  <TrafficProgressBar changeData={trafficChangeData} />
                </TableCell>

                {/* KD Badge */}
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
