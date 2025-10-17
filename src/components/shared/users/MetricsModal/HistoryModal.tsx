"use client";

import React, { useState } from "react";
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
  Tabs,
  Tab,
  Chip,
  Divider,
} from "@mui/material";
import { Close, TrendingUp, Assessment } from "@mui/icons-material";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";
import { TabPanel } from "@/components/shared/TabPanel";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: OverallMetricsHistory[];
  keywordHistory?: KeywordReportHistory[];
  customerName: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  open,
  onClose,
  history,
  keywordHistory = [],
  customerName,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Group keyword history by keyword name
  const groupedKeywordHistory = keywordHistory.reduce((acc, record) => {
    if (!acc[record.keyword]) {
      acc[record.keyword] = [];
    }
    acc[record.keyword].push(record);
    return acc;
  }, {} as Record<string, KeywordReportHistory[]>);

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
              ประวัติการเปลี่ยนแปลง
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ลูกค้า: <span style={{ fontWeight: 600 }}>{customerName}</span>
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="history tabs"
          >
            <Tab
              label="Overall Metrics"
              icon={<Assessment />}
              iconPosition="start"
            />
            <Tab
              label="Keywords History"
              icon={<TrendingUp />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Overall Metrics History Tab */}
        <TabPanel value={tabIndex} index={0} prefix="history-tabpanel">
          <TableContainer>
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
                      ไม่พบข้อมูลประวัติ Overall Metrics
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Keywords History Tab */}
        <TabPanel value={tabIndex} index={1} prefix="history-tabpanel">
          {Object.keys(groupedKeywordHistory).length > 0 ? (
            Object.entries(groupedKeywordHistory).map(([keyword, records]) => (
              <Box key={keyword} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  {keyword}
                  {records[0]?.isTopReport && (
                    <Chip label="Top Report" size="small" color="primary" />
                  )}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>วันที่บันทึก</TableCell>
                        <TableCell align="center">Position</TableCell>
                        <TableCell align="center">Traffic</TableCell>
                        <TableCell align="center">KD</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records
                        .sort(
                          (a, b) =>
                            new Date(b.dateRecorded).getTime() -
                            new Date(a.dateRecorded).getTime()
                        )
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {new Date(record.dateRecorded).toLocaleString(
                                "th-TH"
                              )}
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
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                ไม่พบข้อมูลประวัติ Keywords
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Modal>
  );
};
