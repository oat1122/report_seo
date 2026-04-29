"use client";

import React, { useMemo, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Paper,
  IconButton,
  TableContainer,
  Table,
  CircularProgress,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  Divider,
  Stack,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Close,
  TrendingUp,
  Assessment,
  VisibilityOff,
  Visibility,
} from "@mui/icons-material";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";
import { TabPanel } from "@/components/shared/TabPanel";
import { formatDuration } from "@/lib/duration";

interface VisibilityPayload {
  historyId?: string;
  historyIds?: string[];
  isVisible: boolean;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: OverallMetricsHistory[];
  keywordHistory?: KeywordReportHistory[];
  customerName: string;
  isLoading?: boolean;
  /** เปิดให้ admin/seo_dev จัดการ visibility */
  canManage?: boolean;
  onToggleMetricsVisibility?: (payload: VisibilityPayload) => void;
  onToggleKeywordVisibility?: (payload: VisibilityPayload) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  open,
  onClose,
  history,
  keywordHistory = [],
  customerName,
  isLoading = false,
  canManage = false,
  onToggleMetricsVisibility,
  onToggleKeywordVisibility,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setSelectedMetricIds([]);
    setSelectedKeywordIds([]);
  };

  // Group keyword history by keyword name
  const groupedKeywordHistory = useMemo(
    () =>
      keywordHistory.reduce(
        (acc, record) => {
          if (!acc[record.keyword]) acc[record.keyword] = [];
          acc[record.keyword].push(record);
          return acc;
        },
        {} as Record<string, KeywordReportHistory[]>,
      ),
    [keywordHistory],
  );

  const visibleMetricsCount = history.filter((h) => h.isVisible).length;
  const visibleKeywordCount = keywordHistory.filter((h) => h.isVisible).length;

  const toggleMetricSelected = (id: string) => {
    setSelectedMetricIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleKeywordSelected = (id: string) => {
    setSelectedKeywordIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAllMetrics = () => {
    if (selectedMetricIds.length === history.length) {
      setSelectedMetricIds([]);
    } else {
      setSelectedMetricIds(history.map((h) => h.id));
    }
  };

  const handleBulkSetMetrics = (isVisible: boolean) => {
    if (selectedMetricIds.length === 0) return;
    onToggleMetricsVisibility?.({
      historyIds: selectedMetricIds,
      isVisible,
    });
    setSelectedMetricIds([]);
  };

  const handleBulkSetKeywords = (isVisible: boolean) => {
    if (selectedKeywordIds.length === 0) return;
    onToggleKeywordVisibility?.({
      historyIds: selectedKeywordIds,
      isVisible,
    });
    setSelectedKeywordIds([]);
  };

  const handleToggleSingleMetric = (
    historyId: string,
    nextVisible: boolean,
  ) => {
    onToggleMetricsVisibility?.({ historyId, isVisible: nextVisible });
  };

  const handleToggleSingleKeyword = (
    historyId: string,
    nextVisible: boolean,
  ) => {
    onToggleKeywordVisibility?.({ historyId, isVisible: nextVisible });
  };

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
          <IconButton onClick={onClose} aria-label="ปิด">
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
          {canManage && history.length > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ my: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                แสดงให้ลูกค้าเห็น {visibleMetricsCount} จาก {history.length}{" "}
                รายการ
              </Typography>
              {selectedMetricIds.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<Visibility />}
                    onClick={() => handleBulkSetMetrics(true)}
                  >
                    เปิด ({selectedMetricIds.length})
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<VisibilityOff />}
                    onClick={() => handleBulkSetMetrics(false)}
                  >
                    ซ่อน ({selectedMetricIds.length})
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {canManage && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedMetricIds.length > 0 &&
                            selectedMetricIds.length < history.length
                          }
                          checked={
                            history.length > 0 &&
                            selectedMetricIds.length === history.length
                          }
                          onChange={handleSelectAllMetrics}
                          inputProps={{ "aria-label": "เลือกทั้งหมด" }}
                        />
                      </TableCell>
                    )}
                    {canManage && <TableCell align="center">แสดง</TableCell>}
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
                    history.map((record) => {
                      const isSelected = selectedMetricIds.includes(record.id);
                      const dim = !record.isVisible;
                      return (
                        <TableRow
                          key={record.id}
                          hover
                          selected={isSelected}
                          sx={{ opacity: dim ? 0.55 : 1 }}
                        >
                          {canManage && (
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={() =>
                                  toggleMetricSelected(record.id)
                                }
                                inputProps={{ "aria-label": "เลือกแถว" }}
                              />
                            </TableCell>
                          )}
                          {canManage && (
                            <TableCell align="center">
                              <Tooltip
                                title={
                                  record.isVisible
                                    ? "กดเพื่อซ่อนจากลูกค้า"
                                    : "กดเพื่อเปิดให้ลูกค้าเห็น"
                                }
                              >
                                <Checkbox
                                  checked={record.isVisible}
                                  onChange={(e) =>
                                    handleToggleSingleMetric(
                                      record.id,
                                      e.target.checked,
                                    )
                                  }
                                  inputProps={{
                                    "aria-label": "แสดงในรายงานลูกค้า",
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                          )}
                          <TableCell>
                            {new Date(record.dateRecorded).toLocaleString(
                              "th-TH",
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {record.domainRating}
                          </TableCell>
                          <TableCell align="right">
                            {record.healthScore}
                          </TableCell>
                          <TableCell align="right">
                            {formatDuration(
                              record.ageInYears,
                              record.ageInMonths || 0,
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {record.spamScore}%
                          </TableCell>
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
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={canManage ? 11 : 9}
                        align="center"
                      >
                        ไม่พบข้อมูลประวัติ Overall Metrics
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Keywords History Tab */}
        <TabPanel value={tabIndex} index={1} prefix="history-tabpanel">
          {canManage && keywordHistory.length > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ my: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                แสดงให้ลูกค้าเห็น {visibleKeywordCount} จาก{" "}
                {keywordHistory.length} รายการ
              </Typography>
              {selectedKeywordIds.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<Visibility />}
                    onClick={() => handleBulkSetKeywords(true)}
                  >
                    เปิด ({selectedKeywordIds.length})
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<VisibilityOff />}
                    onClick={() => handleBulkSetKeywords(false)}
                  >
                    ซ่อน ({selectedKeywordIds.length})
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : Object.keys(groupedKeywordHistory).length > 0 ? (
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
                        {canManage && <TableCell padding="checkbox" />}
                        {canManage && (
                          <TableCell align="center">แสดง</TableCell>
                        )}
                        <TableCell>วันที่บันทึก</TableCell>
                        <TableCell align="center">Position</TableCell>
                        <TableCell align="center">Traffic</TableCell>
                        <TableCell align="center">KD</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.dateRecorded).getTime() -
                            new Date(a.dateRecorded).getTime(),
                        )
                        .map((record) => {
                          const isSelected = selectedKeywordIds.includes(
                            record.id,
                          );
                          const dim = !record.isVisible;
                          return (
                            <TableRow
                              key={record.id}
                              hover
                              selected={isSelected}
                              sx={{ opacity: dim ? 0.55 : 1 }}
                            >
                              {canManage && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() =>
                                      toggleKeywordSelected(record.id)
                                    }
                                    inputProps={{ "aria-label": "เลือกแถว" }}
                                  />
                                </TableCell>
                              )}
                              {canManage && (
                                <TableCell align="center">
                                  <Tooltip
                                    title={
                                      record.isVisible
                                        ? "กดเพื่อซ่อนจากลูกค้า"
                                        : "กดเพื่อเปิดให้ลูกค้าเห็น"
                                    }
                                  >
                                    <Checkbox
                                      checked={record.isVisible}
                                      onChange={(e) =>
                                        handleToggleSingleKeyword(
                                          record.id,
                                          e.target.checked,
                                        )
                                      }
                                      inputProps={{
                                        "aria-label": "แสดงในรายงานลูกค้า",
                                      }}
                                    />
                                  </Tooltip>
                                </TableCell>
                              )}
                              <TableCell>
                                {new Date(record.dateRecorded).toLocaleString(
                                  "th-TH",
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
                          );
                        })}
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
