"use client";

import React from "react";
import {
  Modal,
  Box,
  Typography,
  Paper,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface OverallMetricsHistory {
  id: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
  spamScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  dateRecorded: Date;
  customerId: string;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: OverallMetricsHistory[];
  customerName: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  open,
  onClose,
  history,
  customerName,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", md: 1000 },
          maxHeight: "90vh",
          overflowY: "auto",
          p: 3,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              ประวัติการเปลี่ยนแปลง Metrics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ลูกค้า: <span style={{ fontWeight: 600 }}>{customerName}</span>
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <TableContainer sx={{ mt: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>วันที่บันทึก</TableCell>
                <TableCell align="right">DR</TableCell>
                <TableCell align="right">Health</TableCell>
                <TableCell align="right">Age</TableCell>
                <TableCell align="right">Spam</TableCell>
                <TableCell align="right">Traffic</TableCell>
                <TableCell align="right">Keywords</TableCell>
                <TableCell align="right">Backlinks</TableCell>
                <TableCell align="right">Ref Domains</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.dateRecorded).toLocaleString("th-TH")}
                    </TableCell>
                    <TableCell align="right">{record.domainRating}</TableCell>
                    <TableCell align="right">{record.healthScore}</TableCell>
                    <TableCell align="right">{record.ageInYears}</TableCell>
                    <TableCell align="right">{record.spamScore}%</TableCell>
                    <TableCell align="right">
                      {record.organicTraffic.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {record.organicKeywords.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {record.backlinks.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {record.refDomains.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
