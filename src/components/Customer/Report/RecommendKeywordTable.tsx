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
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import {
  Lightbulb,
  Star,
  AutoAwesome,
  InfoOutlined,
} from "@mui/icons-material";
import { KeywordRecommend } from "@/types/metrics";

interface RecommendKeywordTableProps {
  keywords: KeywordRecommend[];
  title?: string;
}

// Helper: Get KD styling
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

// Mobile Card View
const KeywordCard: React.FC<{ kw: KeywordRecommend }> = ({ kw }) => {
  const kdStyle = kw.kd ? getKdStyle(kw.kd) : null;
  const isTopReport = kw.isTopReport;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 3,
        bgcolor: isTopReport ? alpha("#FEF3C7", 0.3) : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha("#9592ff", 0.15)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "start", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: isTopReport ? "#FEF3C7" : "#F3E8FF",
              color: isTopReport ? "#F59E0B" : "#9333EA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isTopReport ? (
              <AutoAwesome sx={{ fontSize: 18 }} />
            ) : (
              <Lightbulb sx={{ fontSize: 18 }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
              {kw.keyword}
            </Typography>
            {isTopReport && (
              <Chip
                icon={<Star sx={{ fontSize: 12 }} />}
                label="Top Pick"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 700,
                  border: "1.5px solid #F59E0B",
                }}
              />
            )}
          </Box>
          {kdStyle && (
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
          )}
        </Box>
        {kw.note && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha("#9592ff", 0.05),
              border: `1px solid ${alpha("#9592ff", 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize="0.85rem"
            >
              {kw.note}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const RecommendKeywordTable: React.FC<RecommendKeywordTableProps> = ({
  keywords,
  title,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (keywords.length === 0) {
    return null;
  }

  // Mobile View: Card Layout
  if (isMobile) {
    return (
      <Box>
        {title && (
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {keywords.map((kw) => (
            <KeywordCard key={kw.id} kw={kw} />
          ))}
        </Box>
      </Box>
    );
  }

  // Desktop View: Compact Mini-Table
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        height: "fit-content",
        maxHeight: 600,
      }}
    >
      {title && (
        <Box
          sx={{
            p: 2.5,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Lightbulb sx={{ color: "#fff", fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700} color="#fff">
              {title}
            </Typography>
          </Box>
        </Box>
      )}

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                fontWeight: 700,
                color: "#475569",
                bgcolor: "#F8F9FA",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                py: 1.5,
                borderBottom: "2px solid #E2E8F0",
              },
            }}
          >
            <TableCell>Keyword</TableCell>
            <TableCell align="center" width="80px">
              KD
            </TableCell>
            <TableCell align="center" width="40px">
              <Tooltip title="Strategic Note">
                <InfoOutlined sx={{ fontSize: 16, color: "#94A3B8" }} />
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw) => {
            const kdStyle = kw.kd ? getKdStyle(kw.kd) : null;
            const isTopReport = kw.isTopReport;

            return (
              <TableRow
                key={kw.id}
                sx={{
                  bgcolor: isTopReport ? alpha("#FEF3C7", 0.2) : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: alpha("#9592ff", 0.08),
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: isTopReport ? "#F59E0B" : "#9592ff",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      fontSize="0.85rem"
                    >
                      {kw.keyword}
                    </Typography>
                    {isTopReport && (
                      <Star
                        sx={{ fontSize: 14, color: "#F59E0B", ml: "auto" }}
                      />
                    )}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  {kdStyle && (
                    <Chip
                      label={kdStyle.label}
                      size="small"
                      sx={{
                        bgcolor: kdStyle.bgcolor,
                        color: kdStyle.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                        minWidth: 60,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell align="center">
                  {kw.note && (
                    <Tooltip title={kw.note} arrow placement="left">
                      <InfoOutlined
                        sx={{
                          fontSize: 18,
                          color: "#9592ff",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Box
        sx={{
          p: 1.5,
          bgcolor: alpha("#9592ff", 0.05),
          borderTop: "1px solid #E2E8F0",
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {keywords.length} recommendations •{" "}
          {keywords.filter((k) => k.isTopReport).length} top priorities
        </Typography>
      </Box>
    </TableContainer>
  );
};
