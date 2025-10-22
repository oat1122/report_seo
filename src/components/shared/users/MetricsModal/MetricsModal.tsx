"use client";

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Divider,
  Stack,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Save,
  Close,
  AssessmentOutlined,
  RecommendOutlined,
  AccessTime,
} from "@mui/icons-material";
import { User } from "@/types/user";
import {
  OverallMetrics,
  OverallMetricsForm,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommend,
  KeywordRecommendForm,
} from "@/types";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";
import { KeywordReportSection } from "./KeywordReportSection";
import { RecommendKeywordSection } from "./RecommendKeywordSection";
import { useMetricsModal } from "./hook/useMetricsModal";
import { HistoryModal } from "./HistoryModal";
import { KeywordHistoryModal } from "./KeywordHistoryModal";
import { TabPanel } from "@/components/shared/TabPanel";

interface MetricsModalProps {
  open: boolean;
  onClose: () => void;
  customer: User | null;
  metricsData: OverallMetricsForm | null;
  keywordsData: KeywordReport[];
  onSaveMetrics: (data: Partial<OverallMetricsForm>) => Promise<void>;
  onAddKeyword: (data: KeywordReportForm) => Promise<void>;
  onDeleteKeyword: (id: string) => Promise<void>;
  onUpdateKeyword: (
    keywordId: string,
    data: KeywordReportForm
  ) => Promise<void>;
  recommendKeywordsData: KeywordRecommend[];
  onAddRecommendKeyword: (data: KeywordRecommendForm) => Promise<void>;
  onDeleteRecommendKeyword: (id: string) => Promise<void>;
  // เพิ่ม props ใหม่สำหรับ History Modal
  onOpenHistory: () => void;
  isHistoryOpen: boolean;
  onCloseHistory: () => void;
  historyData: {
    metricsHistory: OverallMetricsHistory[];
    keywordHistory: KeywordReportHistory[];
  };
  // Props ใหม่สำหรับ Keyword History
  isKeywordHistoryOpen: boolean;
  onOpenKeywordHistory: (keyword: KeywordReport) => void;
  onCloseKeywordHistory: () => void;
  keywordHistoryData: KeywordReportHistory[];
  selectedKeyword: KeywordReport | null;
  // Loading states
  isLoadingMetrics?: boolean;
  isLoadingKeywords?: boolean;
  isLoadingRecommend?: boolean;
  isLoadingCombinedHistory?: boolean;
  isLoadingSpecificHistory?: boolean;
}

export const MetricsModal: React.FC<MetricsModalProps> = ({
  open,
  onClose,
  customer,
  metricsData,
  keywordsData,
  onSaveMetrics,
  onAddKeyword,
  onDeleteKeyword,
  onUpdateKeyword,
  recommendKeywordsData,
  onAddRecommendKeyword,
  onDeleteRecommendKeyword,
  onOpenHistory,
  isHistoryOpen,
  onCloseHistory,
  historyData,
  isKeywordHistoryOpen,
  onOpenKeywordHistory,
  onCloseKeywordHistory,
  keywordHistoryData,
  selectedKeyword,
  isLoadingMetrics = false,
  isLoadingKeywords = false,
  isLoadingRecommend = false,
  isLoadingCombinedHistory = false,
  isLoadingSpecificHistory = false,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const {
    metrics,
    newKeyword,
    newRecommend,
    editingKeywordId,
    handleMetricsChange,
    handleKeywordChange,
    handleKeywordSelectChange,
    handleRecommendChange,
    handleRecommendSelectChange,
    resetRecommendForm,
    handleSetEditingKeyword,
    clearEditing,
  } = useMetricsModal(metricsData);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Handler ที่จะตัดสินใจว่าจะ Add หรือ Update
  const handleAddOrUpdateKeyword = async () => {
    if (!newKeyword.keyword) return;
    if (editingKeywordId) {
      await onUpdateKeyword(editingKeywordId, newKeyword);
    } else {
      await onAddKeyword(newKeyword);
    }
    clearEditing(); // Reset ฟอร์มและ edit state
  };

  const handleAddRecommend = async () => {
    if (!newRecommend.keyword) return;
    await onAddRecommendKeyword(newRecommend);
    resetRecommendForm();
  };

  if (!customer) return null;

  return (
    <>
      {/* Metrics Modal หลัก */}
      <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(5px)" }}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: 950 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                จัดการข้อมูล Domain
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ลูกค้า: <span style={{ fontWeight: 600 }}>{customer.name}</span>
              </Typography>
            </Box>
            <Tooltip title="ปิด">
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Overall Metrics Form */}
          <Box p={3}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <AssessmentOutlined color="secondary" />
                <Typography variant="h6" fontWeight={600}>
                  คุณภาพ Domain (Overall Metrics)
                </Typography>
                {/* เพิ่มปุ่มดูประวัติ */}
                <Tooltip title="ดูประวัติการเปลี่ยนแปลง">
                  <IconButton onClick={onOpenHistory} size="small">
                    <AccessTime />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {Object.keys(metrics).map((key) => (
                  <TextField
                    key={key}
                    name={key}
                    label={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")
                    }
                    type="number"
                    value={metrics[key]}
                    onChange={handleMetricsChange}
                    fullWidth
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Save />}
                  onClick={() => onSaveMetrics(metrics)}
                >
                  บันทึก Metrics
                </Button>
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* Keyword Report & Recommend Section */}
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                aria-label="Keyword sections"
                variant="fullWidth"
              >
                <Tab
                  label="รายงานคีย์เวิร์ด"
                  icon={<AssessmentOutlined />}
                  iconPosition="start"
                />
                <Tab
                  label="Keyword แนะนำ"
                  icon={<RecommendOutlined />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <TabPanel value={tabIndex} index={0} prefix="simple-tabpanel">
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <KeywordReportSection
                  newKeyword={newKeyword}
                  keywordsData={keywordsData}
                  editingKeywordId={editingKeywordId}
                  onKeywordChange={handleKeywordChange}
                  onKeywordSelectChange={handleKeywordSelectChange}
                  onAddOrUpdateKeyword={handleAddOrUpdateKeyword}
                  onDeleteKeyword={onDeleteKeyword}
                  onSetEditing={handleSetEditingKeyword}
                  onClearEditing={clearEditing}
                  onViewHistory={onOpenKeywordHistory}
                />
              </Box>
            </TabPanel>
            <TabPanel value={tabIndex} index={1} prefix="simple-tabpanel">
              <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <RecommendKeywordSection
                  newRecommend={newRecommend}
                  recommendKeywordsData={recommendKeywordsData}
                  onRecommendChange={handleRecommendChange}
                  onRecommendSelectChange={handleRecommendSelectChange}
                  onAddRecommend={handleAddRecommend}
                  onDeleteRecommendKeyword={onDeleteRecommendKeyword}
                />
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Modal>

      {/* History Modal ที่เพิ่มเข้ามา */}
      <HistoryModal
        open={isHistoryOpen}
        onClose={onCloseHistory}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={customer.name || ""}
        isLoading={isLoadingCombinedHistory}
      />

      {/* Keyword History Modal */}
      {selectedKeyword && (
        <KeywordHistoryModal
          open={isKeywordHistoryOpen}
          onClose={onCloseKeywordHistory}
          history={keywordHistoryData}
          keywordName={selectedKeyword.keyword}
          isLoading={isLoadingSpecificHistory}
        />
      )}
    </>
  );
};
