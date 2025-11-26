// src/components/Customer/Report/RecommendKeywordTable.tsx
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
  alpha,
} from "@mui/material";
import {
  Lightbulb,
  Star,
  TipsAndUpdates,
  AutoAwesome,
} from "@mui/icons-material";
import { KeywordRecommend } from "@/types/metrics";

interface RecommendKeywordTableProps {
  keywords: KeywordRecommend[];
  title?: string;
}

// Helper: Get KD styling with semantic colors
const getKdStyle = (kd: string) => {
  const styles = {
    EASY: {
      bgcolor: "#E8F5E9",
      color: "#2E7D32",
      label: "Easy",
      glow: "#4CAF50",
    },
    MEDIUM: {
      bgcolor: "#FFF3E0",
      color: "#E65100",
      label: "Medium",
      glow: "#FF9800",
    },
    HARD: {
      bgcolor: "#FFEBEE",
      color: "#C62828",
      label: "Hard",
      glow: "#F44336",
    },
  };
  return styles[kd as keyof typeof styles] || styles.MEDIUM;
};

export const RecommendKeywordTable: React.FC<RecommendKeywordTableProps> = ({
  keywords,
  title,
}) => {
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
      {/* Enhanced Header with Gradient */}
      {title && (
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Circle */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              position: "relative",
            }}
          >
            <TipsAndUpdates sx={{ color: "#fff", fontSize: 32 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                background: "linear-gradient(to right, #fff, #ffe0e6)",
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
            <TableCell>Recommended Keywords</TableCell>
            <TableCell align="center" width="140px">
              Difficulty
            </TableCell>
            <TableCell width="35%">Strategic Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw, index) => {
            const kdStyle = kw.kd ? getKdStyle(kw.kd) : null;
            const isTopReport = kw.isTopReport;

            return (
              <TableRow
                key={kw.id}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isTopReport ? alpha("#f093fb", 0.08) : "#F1F5F9",
                    transform: "translateX(4px)",
                    boxShadow: isTopReport
                      ? "inset 4px 0 0 #f093fb"
                      : "inset 4px 0 0 #9592ff",
                  },
                  cursor: "pointer",
                  bgcolor: isTopReport ? alpha("#FEF3C7", 0.3) : "transparent",
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

                {/* Keyword with Icon and Badge */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: isTopReport ? "#FEF3C7" : "#F3E8FF",
                        color: isTopReport ? "#F59E0B" : "#9333EA",
                      }}
                    >
                      {isTopReport ? (
                        <AutoAwesome sx={{ fontSize: 18 }} />
                      ) : (
                        <Lightbulb sx={{ fontSize: 18 }} />
                      )}
                    </Avatar>
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography fontWeight={600}>{kw.keyword}</Typography>
                        {isTopReport && (
                          <Tooltip title="High Priority Recommendation">
                            <Chip
                              icon={<Star sx={{ fontSize: 14 }} />}
                              label="Top Pick"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                bgcolor: "#FEF3C7",
                                color: "#92400E",
                                fontWeight: 700,
                                border: "1.5px solid #F59E0B",
                                "& .MuiChip-icon": {
                                  color: "#F59E0B",
                                },
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* KD Badge with Glow Effect */}
                <TableCell align="center">
                  {kdStyle ? (
                    <Chip
                      label={kdStyle.label}
                      size="small"
                      sx={{
                        bgcolor: kdStyle.bgcolor,
                        color: kdStyle.color,
                        fontWeight: 600,
                        borderRadius: 2,
                        minWidth: 80,
                        boxShadow: `0 0 12px ${alpha(kdStyle.glow, 0.3)}`,
                        border: `1px solid ${alpha(kdStyle.color, 0.2)}`,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                {/* Note with Enhanced Styling */}
                <TableCell>
                  {kw.note ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha("#9592ff", 0.05),
                        border: `1px solid ${alpha("#9592ff", 0.1)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: "#9592ff",
                          mt: 0.75,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#475569",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                        }}
                      >
                        {kw.note}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No strategic note
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer with Summary */}
      <Box
        sx={{
          p: 2,
          bgcolor: alpha("#9592ff", 0.05),
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Lightbulb sx={{ color: "#9592ff", fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          <strong>{keywords.length}</strong> keyword recommendations •{" "}
          <strong>{keywords.filter((k) => k.isTopReport).length}</strong> top
          priorities
        </Typography>
      </Box>
    </TableContainer>
  );
};
