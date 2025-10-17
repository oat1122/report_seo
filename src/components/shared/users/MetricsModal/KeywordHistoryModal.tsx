// src/components/shared/users/MetricsModal/KeywordHistoryModal.tsx
"use client";

import React from "react";
import {
  Modal,
  Box,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { KeywordReportHistory } from "@/types/history";

interface KeywordHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: KeywordReportHistory[];
  keywordName: string;
}

export const KeywordHistoryModal: React.FC<KeywordHistoryModalProps> = ({
  open,
  onClose,
  history,
  keywordName,
}) => {
  // เรียงลำดับข้อมูลก่อนแสดงผล - ล่าสุดขึ้นก่อน
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", md: 800 },
          maxHeight: "90vh",
          overflowY: "auto",
          p: 3,
          borderRadius: 4,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            ประวัติการเปลี่ยนแปลง: {keywordName}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>วันที่บันทึก</TableCell>
                <TableCell align="center">Position</TableCell>
                <TableCell align="center">Traffic</TableCell>
                <TableCell align="center">KD</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHistory.length > 0 ? (
                sortedHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.dateRecorded).toLocaleString("th-TH")}
                    </TableCell>
                    <TableCell align="center">
                      {record.position || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {record.traffic.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={record.kd} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    ไม่พบข้อมูลประวัติ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Modal>
  );
};
