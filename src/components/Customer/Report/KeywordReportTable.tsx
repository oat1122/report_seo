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
} from "@mui/material";
import { KeywordReport } from "@/types/metrics";
import { KDLevel } from "@prisma/client";

const getKdColor = (kd: KDLevel) => {
  switch (kd) {
    case KDLevel.HARD:
      return "error";
    case KDLevel.MEDIUM:
      return "warning";
    case KDLevel.EASY:
      return "success";
    default:
      return "default";
  }
};

interface KeywordReportTableProps {
  keywords: KeywordReport[];
  title?: string;
}

export const KeywordReportTable: React.FC<KeywordReportTableProps> = ({
  keywords,
  title,
}) => {
  if (keywords.length === 0) {
    return null; // Don't render the table if there are no keywords
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
            <TableCell>Keywords</TableCell>
            <TableCell align="center">Position</TableCell>
            <TableCell align="center">Traffic</TableCell>
            <TableCell align="center">KD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keywords.map((kw, index) => (
            <TableRow key={kw.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography fontWeight={600}>{kw.keyword}</Typography>
              </TableCell>
              <TableCell align="center">{kw.position || "-"}</TableCell>
              <TableCell align="center">
                {kw.traffic.toLocaleString()}
              </TableCell>
              <TableCell align="center">
                <Chip label={kw.kd} color={getKdColor(kw.kd)} size="small" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
