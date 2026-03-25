"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Tooltip,
  Card,
  Chip,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import {
  Save,
  Close,
  AssessmentOutlined,
  RecommendOutlined,
  AccessTime,
  AutoAwesomeOutlined,
  ArrowBackIosNew,
  ArrowForwardIos,
  Language,
  InsightsOutlined,
  PublicOutlined,
} from "@mui/icons-material";
import { User } from "@/types/user";
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommend,
  KeywordRecommendForm,
  AiOverview,
} from "@/types";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";
import { KeywordReportSection } from "./KeywordReportSection";
import { RecommendKeywordSection } from "./RecommendKeywordSection";
import { useMetricsModal } from "./hook/useMetricsModal";
import { HistoryModal } from "./HistoryModal";
import { KeywordHistoryModal } from "./KeywordHistoryModal";
import {
  AiOverviewSection,
  AiOverviewSectionHandle,
} from "./AiOverviewSection";

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
    data: KeywordReportForm,
  ) => Promise<void>;
  recommendKeywordsData: KeywordRecommend[];
  onAddRecommendKeyword: (data: KeywordRecommendForm) => Promise<void>;
  onUpdateRecommendKeyword: (
    recommendId: string,
    data: KeywordRecommendForm,
  ) => Promise<void>;
  onDeleteRecommendKeyword: (id: string) => Promise<void>;
  onOpenHistory: () => void;
  isHistoryOpen: boolean;
  onCloseHistory: () => void;
  historyData: {
    metricsHistory: OverallMetricsHistory[];
    keywordHistory: KeywordReportHistory[];
  };
  isKeywordHistoryOpen: boolean;
  onOpenKeywordHistory: (keyword: KeywordReport) => void;
  onCloseKeywordHistory: () => void;
  keywordHistoryData: KeywordReportHistory[];
  selectedKeyword: KeywordReport | null;
  isLoadingMetrics?: boolean;
  isLoadingKeywords?: boolean;
  isLoadingRecommend?: boolean;
  isLoadingCombinedHistory?: boolean;
  isLoadingSpecificHistory?: boolean;
  aiOverviews?: AiOverview[];
  isLoadingAiOverviews?: boolean;
  onAddAiOverview?: (formData: FormData) => Promise<void>;
  onUpdateAiOverview?: (id: string, formData: FormData) => Promise<void>;
  onDeleteAiOverview?: (aiOverviewId: string) => Promise<void>;
}

type MetricsFieldKey = keyof OverallMetricsForm;
type MetricsStep = 0 | 1 | 2;

interface MetricFieldConfig {
  key: MetricsFieldKey;
  label: string;
  placeholder: string;
  helperText: string;
  min?: number;
  max?: number;
}

interface MetricSectionConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: MetricFieldConfig[];
  columns?: {
    xs: string;
    sm: string;
    md: string;
  };
}

const normalizeMetricsForSave = (
  metrics: Record<MetricsFieldKey, string | number>,
): Partial<OverallMetricsForm> =>
  Object.entries(metrics).reduce((acc, [key, value]) => {
    if (value === "") return acc;
    return {
      ...acc,
      [key]: Number(value),
    };
  }, {} as Partial<OverallMetricsForm>);

const stepLabels = ["Domain Metrics", "Keyword Data", "AI Overview"];

const metricSections: MetricSectionConfig[] = [
  {
    title: "Authority",
    description: "กรอกค่าความน่าเชื่อถือและคุณภาพล่าสุดของโดเมน",
    icon: <InsightsOutlined color="secondary" />,
    fields: [
      {
        key: "domainRating",
        label: "Domain Rating",
        placeholder: "เช่น 42",
        helperText: "ค่าความแข็งแรงของโดเมน",
        min: 0,
      },
      {
        key: "healthScore",
        label: "Health Score",
        placeholder: "0-100",
        helperText: "คะแนนสุขภาพเว็บไซต์",
        min: 0,
        max: 100,
      },
      {
        key: "spamScore",
        label: "Spam Score",
        placeholder: "0-100",
        helperText: "คะแนนความเสี่ยงของโดเมน",
        min: 0,
        max: 100,
      },
    ],
    columns: {
      xs: "repeat(1, 1fr)",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
    },
  },
  {
    title: "Visibility",
    description: "ใส่ตัวเลขล่าสุดที่ใช้ประเมินการมองเห็นของโดเมน",
    icon: <PublicOutlined color="secondary" />,
    fields: [
      {
        key: "organicTraffic",
        label: "Organic Traffic",
        placeholder: "เช่น 1200",
        helperText: "จำนวนทราฟฟิกจากการค้นหา",
        min: 0,
      },
      {
        key: "organicKeywords",
        label: "Organic Keywords",
        placeholder: "เช่น 350",
        helperText: "จำนวนคีย์เวิร์ดที่ติดอันดับ",
        min: 0,
      },
      {
        key: "backlinks",
        label: "Backlinks",
        placeholder: "เช่น 980",
        helperText: "จำนวนลิงก์ย้อนกลับทั้งหมด",
        min: 0,
      },
      {
        key: "refDomains",
        label: "Referring Domains",
        placeholder: "เช่น 120",
        helperText: "จำนวนโดเมนที่ลิงก์กลับมา",
        min: 0,
      },
    ],
    columns: {
      xs: "repeat(1, 1fr)",
      sm: "repeat(2, 1fr)",
      md: "repeat(2, 1fr)",
    },
  },
  {
    title: "Domain Age",
    description: "ระบุอายุโดเมนเป็นปีและเดือน โดยเดือนต้องอยู่ระหว่าง 0-11",
    icon: <Language color="secondary" />,
    fields: [
      {
        key: "ageInYears",
        label: "อายุโดเมน (ปี)",
        placeholder: "เช่น 2",
        helperText: "จำนวนปีเต็ม",
        min: 0,
      },
      {
        key: "ageInMonths",
        label: "อายุโดเมน (เดือน)",
        placeholder: "0-11",
        helperText: "เดือนเพิ่มเติมจากจำนวนปี",
        min: 0,
        max: 11,
      },
    ],
    columns: {
      xs: "repeat(1, 1fr)",
      sm: "repeat(2, 1fr)",
      md: "repeat(2, 1fr)",
    },
  },
];

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
  onUpdateRecommendKeyword,
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
  isLoadingCombinedHistory = false,
  isLoadingSpecificHistory = false,
  aiOverviews = [],
  isLoadingAiOverviews = false,
  onAddAiOverview,
  onUpdateAiOverview,
  onDeleteAiOverview,
}) => {
  const [activeStep, setActiveStep] = useState<MetricsStep>(0);
  const [aiOverviewDraftState, setAiOverviewDraftState] = useState({
    canSubmit: false,
    isSubmitting: false,
  });
  const aiOverviewRef = useRef<AiOverviewSectionHandle>(null);
  const {
    metrics,
    newKeyword,
    newRecommend,
    editingKeywordId,
    editingRecommendId,
    validationErrors,
    isMetricsValid,
    handleMetricsChange,
    handleKeywordChange,
    handleKeywordSelectChange,
    handleRecommendChange,
    handleRecommendSelectChange,
    handleSetEditingKeyword,
    handleSetEditingRecommend,
    clearEditing,
    clearRecommendEditing,
  } = useMetricsModal(metricsData);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
    }
  }, [open]);

  const metricSummary = useMemo(
    () => [
      {
        label: "DR",
        value: metrics.domainRating === "" ? "-" : metrics.domainRating,
      },
      {
        label: "Health",
        value: metrics.healthScore === "" ? "-" : metrics.healthScore,
      },
      {
        label: "Traffic",
        value: metrics.organicTraffic === "" ? "-" : metrics.organicTraffic,
      },
      {
        label: "Ref Domains",
        value: metrics.refDomains === "" ? "-" : metrics.refDomains,
      },
    ],
    [metrics],
  );

  const handleAddOrUpdateKeyword = async () => {
    if (!newKeyword.keyword.trim()) return;
    if (editingKeywordId) {
      await onUpdateKeyword(editingKeywordId, newKeyword);
    } else {
      await onAddKeyword(newKeyword);
    }
    clearEditing();
  };

  const handleAddRecommend = async () => {
    if (!newRecommend.keyword.trim()) return;
    if (editingRecommendId) {
      await onUpdateRecommendKeyword(editingRecommendId, newRecommend);
    } else {
      await onAddRecommendKeyword(newRecommend);
    }
    clearRecommendEditing();
  };

  const handleNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, 2) as MetricsStep);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0) as MetricsStep);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step as MetricsStep);
  };

  if (!customer) return null;

  return (
    <>
      <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(5px)" }}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "96%", md: 980 },
            maxHeight: "92vh",
            overflow: "hidden",
            borderRadius: 4,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              px: { xs: 2, sm: 3 },
              py: 2.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  จัดการข้อมูล Domain
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  กรอกข้อมูลทีละส่วนเพื่อให้ตรวจทานและบันทึกได้ง่ายขึ้น
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  ลูกค้า: <Box component="span" sx={{ fontWeight: 700 }}>{customer.name}</Box>
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="ดูประวัติการเปลี่ยนแปลง">
                  <IconButton onClick={onOpenHistory}>
                    <AccessTime />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ปิด">
                  <IconButton onClick={onClose}>
                    <Close />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 3 }}>
              {stepLabels.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    onClick={() => handleStepChange(index)}
                    sx={{
                      cursor: "pointer",
                      "& .MuiStepLabel-label": {
                        cursor: "pointer",
                      },
                      "& .MuiStepLabel-iconContainer": {
                        cursor: "pointer",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: "grey.50",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                    <AssessmentOutlined color="secondary" />
                    <Typography variant="h6" fontWeight={700}>
                      ภาพรวมค่าที่สำคัญ
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                    }}
                  >
                    {metricSummary.map((item) => (
                      <Card
                        key={item.label}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2.5, boxShadow: "none" }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                          {item.value}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Paper>

                {metricSections.map((section) => (
                  <Paper key={section.title} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2.5}>
                      {section.icon}
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: section.columns?.xs ?? "repeat(1, 1fr)",
                          sm: section.columns?.sm ?? "repeat(2, 1fr)",
                          md: section.columns?.md ?? "repeat(3, 1fr)",
                        },
                      }}
                    >
                      {section.fields.map((field) => (
                        <TextField
                          key={field.key}
                          name={field.key}
                          label={field.label}
                          placeholder={field.placeholder}
                          type="number"
                          value={metrics[field.key]}
                          onChange={handleMetricsChange}
                          fullWidth
                          size="small"
                          inputProps={{
                            min: field.min,
                            max: field.max,
                          }}
                          error={Boolean(validationErrors[field.key])}
                          helperText={validationErrors[field.key] || field.helperText}
                        />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <RecommendOutlined color="secondary" />
                    <Typography variant="h6" fontWeight={700}>
                      Keyword Data
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    จัดการคีย์เวิร์ดหลักและคีย์เวิร์ดแนะนำแยกเป็นคนละส่วน เพื่อให้กรอกและทบทวนได้เร็วขึ้น
                  </Typography>
                </Paper>

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

                <RecommendKeywordSection
                  newRecommend={newRecommend}
                  recommendKeywordsData={recommendKeywordsData}
                  editingRecommendId={editingRecommendId}
                  onRecommendChange={handleRecommendChange}
                  onRecommendSelectChange={handleRecommendSelectChange}
                  onAddRecommend={handleAddRecommend}
                  onSetEditingRecommend={handleSetEditingRecommend}
                  onClearEditingRecommend={clearRecommendEditing}
                  onDeleteRecommendKeyword={onDeleteRecommendKeyword}
                />
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <AutoAwesomeOutlined color="secondary" />
                    <Typography variant="h6" fontWeight={700}>
                      AI Overview
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    อัปโหลดภาพประกอบและหัวข้อที่ต้องการแสดงผลในรายงาน โดยรองรับสูงสุด 3 รูปต่อรายการ
                  </Typography>
                </Paper>

                <AiOverviewSection
                  ref={aiOverviewRef}
                  aiOverviews={aiOverviews}
                  isLoading={isLoadingAiOverviews}
                  onAdd={onAddAiOverview || (async () => {})}
                  onUpdate={onUpdateAiOverview || (async () => {})}
                  onDelete={onDeleteAiOverview || (async () => {})}
                  showSubmitButton={false}
                  onStateChange={setAiOverviewDraftState}
                />
              </Stack>
            )}
          </Box>

          <Divider />

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Button
                variant="text"
                startIcon={<ArrowBackIosNew />}
                onClick={handlePrevStep}
                disabled={activeStep === 0}
              >
                ย้อนกลับ
              </Button>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {activeStep === 0 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Save />}
                    onClick={() => onSaveMetrics(normalizeMetricsForSave(metrics))}
                    disabled={!isMetricsValid}
                  >
                    บันทึก Metrics
                  </Button>
                )}

                {activeStep === 2 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Save />}
                    onClick={() => aiOverviewRef.current?.submit()}
                    disabled={!aiOverviewDraftState.canSubmit || aiOverviewDraftState.isSubmitting}
                  >
                    บันทึก AI Overview
                  </Button>
                )}

                {activeStep < 2 && (
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIos />}
                    onClick={handleNextStep}
                  >
                    ถัดไป
                  </Button>
                )}

                <Chip
                  label={stepLabels[activeStep]}
                  color="info"
                  variant="outlined"
                  sx={{ alignSelf: "center" }}
                />
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Modal>

      <HistoryModal
        open={isHistoryOpen}
        onClose={onCloseHistory}
        history={historyData.metricsHistory}
        keywordHistory={historyData.keywordHistory}
        customerName={customer.name || ""}
        isLoading={isLoadingCombinedHistory}
      />

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
