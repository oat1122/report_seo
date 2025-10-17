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
} from "@mui/material";
import { KeywordRecommend } from "@/types/metrics";
import { getKdColor } from "./lib/utils";

interface RecommendKeywordTableProps {
  keywords: KeywordRecommend[];
  title?: string;
}

export const RecommendKeywordTable: React.FC<RecommendKeywordTableProps> = ({
  keywords,
  title,
}) => {
  if (keywords.length === 0) {
    return null; // ไม่ต้องแสดงผลถ้าไม่มีข้อมูล
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 4, border: "1px solid #E2E8F0" }}
    >
      {title && (
        <Typography variant="h6" sx={{ p: 2 }}>
          {title}
        </Typography>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Recommended Keywords</TableCell>
            <TableCell align="center">KD</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw, index) => (
            <TableRow key={kw.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>{kw.keyword}</Typography>
                  {kw.isTopReport && (
                    <Chip label="Top" size="small" color="info" />
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                {kw.kd ? (
                  <Chip label={kw.kd} color={getKdColor(kw.kd)} size="small" />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {kw.note || "-"}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
