"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Stack,
  Tooltip,
  Step,
  StepLabel,
  Stepper,
  CircularProgress,
  Alert,
  Skeleton,
  useMediaQuery,
  useTheme,
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
import { KeywordReportSection } from "./KeywordReportSection";
import { RecommendKeywordSection } from "./RecommendKeywordSection";
import { useMetricsModal } from "@/hooks/ui/useMetricsModal";
import type { AiOverviewSectionHandle } from "./AiOverviewSection";
import { ConfirmAlert } from "@/components/shared/ConfirmAlert";

// Dynamic import — AiOverviewSection เป็น heaviest child (image upload + previews)
// โหลดเมื่อเข้า step 2 เท่านั้น ลด initial bundle ของ Modal
const AiOverviewSection = dynamic(
  () => import("./AiOverviewSection").then((m) => m.AiOverviewSection),
  {
    ssr: false,
    loading: () => (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
      </Stack>
    ),
  },
);

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
  onOpenKeywordHistory: (keyword: KeywordReport) => void;
  isLoadingMetrics?: boolean;
  isLoadingKeywords?: boolean;
  isLoadingRecommend?: boolean;
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
  /** step ของ <input type="number"> — undefined = 1 (integer), "0.1" หรือ "any" = ทศนิยม */
  step?: string | number;
}

interface MetricSectionConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: MetricFieldConfig[];
  columns?: { xs: string; sm: string; md: string };
}

const normalizeMetricsForSave = (
  metrics: Record<MetricsFieldKey, string | number>,
): Partial<OverallMetricsForm> =>
  Object.entries(metrics).reduce((acc, [key, value]) => {
    if (value === "") return acc;
    return { ...acc, [key]: Number(value) };
  }, {} as Partial<OverallMetricsForm>);

const stepLabels = ["ค่าโดเมน", "คีย์เวิร์ด", "AI Overview"];

const metricSections: MetricSectionConfig[] = [
  {
    title: "Authority",
    description: "ค่าความน่าเชื่อถือและคุณภาพของโดเมน",
    icon: <InsightsOutlined color="info" />,
    fields: [
      {
        key: "domainRating",
        label: "Domain Rating",
        placeholder: "เช่น 42",
        helperText: "ความแข็งแรงของโดเมน",
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
        helperText: "คะแนนความเสี่ยง (ใส่ทศนิยมได้ เช่น 0.1)",
        min: 0,
        max: 100,
        step: 0.1,
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
    description: "ตัวเลขที่แสดงการมองเห็นของโดเมน",
    icon: <PublicOutlined color="info" />,
    fields: [
      {
        key: "organicTraffic",
        label: "Organic Traffic",
        placeholder: "เช่น 1200",
        helperText: "ทราฟฟิกจากการค้นหา",
        min: 0,
      },
      {
        key: "organicKeywords",
        label: "Organic Keywords",
        placeholder: "เช่น 350",
        helperText: "คีย์เวิร์ดที่ติดอันดับ",
        min: 0,
      },
      {
        key: "backlinks",
        label: "Backlinks",
        placeholder: "เช่น 980",
        helperText: "ลิงก์ย้อนกลับทั้งหมด",
        min: 0,
      },
      {
        key: "refDomains",
        label: "Referring Domains",
        placeholder: "เช่น 120",
        helperText: "โดเมนที่ลิงก์กลับมา",
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
    description: "อายุโดเมนเป็นปีและเดือน (เดือน 0-11)",
    icon: <Language color="info" />,
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
        helperText: "เดือนเพิ่มเติม",
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
  onOpenKeywordHistory,
  aiOverviews = [],
  isLoadingAiOverviews = false,
  onAddAiOverview,
  onUpdateAiOverview,
  onDeleteAiOverview,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState<MetricsStep>(0);
  const [aiOverviewDraftState, setAiOverviewDraftState] = useState({
    canSubmit: false,
    isSubmitting: false,
  });
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showStepError, setShowStepError] = useState(false);

  const aiOverviewRef = useRef<AiOverviewSectionHandle>(null);

  const {
    metrics,
    newKeyword,
    newRecommend,
    editingKeywordId,
    editingRecommendId,
    validationErrors,
    isMetricsValid,
    isDirty,
    markClean,
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
      setShowStepError(false);
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

  const handleSaveMetrics = async () => {
    if (!isMetricsValid) {
      setShowStepError(true);
      return;
    }
    setIsSavingMetrics(true);
    try {
      await onSaveMetrics(normalizeMetricsForSave(metrics));
      markClean();
    } finally {
      setIsSavingMetrics(false);
    }
  };

  const handleNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, 2) as MetricsStep);
    setShowStepError(false);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0) as MetricsStep);
    setShowStepError(false);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step as MetricsStep);
    setShowStepError(false);
  };

  // กัน data loss: ถ้า dirty แล้วจะปิด → confirm ก่อน
  const handleRequestClose = () => {
    if (isDirty || aiOverviewDraftState.canSubmit) {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  if (!customer) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleRequestClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        keepMounted={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: "100vh", sm: "92vh" },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ fontSize: { xs: "1.125rem", md: "1.5rem" } }}
              >
                จัดการข้อมูล Domain
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                ลูกค้า:{" "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {customer.name}
                </Box>
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="ดูประวัติการเปลี่ยนแปลง">
                <IconButton
                  onClick={onOpenHistory}
                  aria-label="ดูประวัติการเปลี่ยนแปลง"
                >
                  <AccessTime />
                </IconButton>
              </Tooltip>
              <Tooltip title="ปิด">
                <IconButton onClick={handleRequestClose} aria-label="ปิด">
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            sx={{ mt: { xs: 2, sm: 3 } }}
          >
            {stepLabels.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  onClick={() => handleStepChange(index)}
                  sx={{
                    cursor: "pointer",
                    "& .MuiStepLabel-label": { cursor: "pointer" },
                    "& .MuiStepLabel-iconContainer": { cursor: "pointer" },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {showStepError && !isMetricsValid && activeStep === 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ข้อมูลไม่ครบหรือไม่ถูกต้อง — โปรดตรวจสอบฟิลด์ที่มีข้อความแดง
            </Alert>
          )}

          {/* Step 0 — Domain Metrics */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  mb={2}
                >
                  <AssessmentOutlined color="info" />
                  <Typography variant="h6" fontWeight={700}>
                    ภาพรวม
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
                    <Box
                      key={item.label}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mt: 0.25,
                          fontSize: { xs: "1rem", md: "1.25rem" },
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* รวม 3 sections เป็น Paper เดียว ลด nesting */}
              <Paper
                variant="outlined"
                sx={{ borderRadius: 3, overflow: "hidden" }}
              >
                {metricSections.map((section, idx) => (
                  <Box
                    key={section.title}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderTop: idx > 0 ? 1 : 0,
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      mb={2}
                    >
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
                            step: field.step,
                          }}
                          error={Boolean(validationErrors[field.key])}
                          helperText={
                            validationErrors[field.key] || field.helperText
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Stack>
          )}

          {/* Step 1 — Keyword Data */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <RecommendOutlined color="info" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    คีย์เวิร์ด
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    คีย์เวิร์ดหลัก + คีย์เวิร์ดแนะนำ
                  </Typography>
                </Box>
              </Stack>

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

          {/* Step 2 — AI Overview (lazy loaded) */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <AutoAwesomeOutlined color="info" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    AI Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    อัปโหลดรูปประกอบ + หัวข้อ (สูงสุด 3 รูปต่อรายการ)
                  </Typography>
                </Box>
              </Stack>

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
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Button
              variant="text"
              startIcon={<ArrowBackIosNew />}
              onClick={handlePrevStep}
              disabled={activeStep === 0}
            >
              ย้อนกลับ
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {activeStep === 0 && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={
                    isSavingMetrics ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  onClick={handleSaveMetrics}
                  disabled={!isMetricsValid || isSavingMetrics || !isDirty}
                >
                  {isSavingMetrics ? "กำลังบันทึก..." : "บันทึก Metrics"}
                </Button>
              )}

              {activeStep === 2 && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={
                    aiOverviewDraftState.isSubmitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  onClick={() => aiOverviewRef.current?.submit()}
                  disabled={
                    !aiOverviewDraftState.canSubmit ||
                    aiOverviewDraftState.isSubmitting
                  }
                >
                  {aiOverviewDraftState.isSubmitting
                    ? "กำลังบันทึก..."
                    : "บันทึก AI Overview"}
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
            </Stack>
          </Stack>
        </DialogActions>
      </Dialog>

      <ConfirmAlert
        open={showCloseConfirm}
        title="ยังไม่ได้บันทึก"
        message="มีข้อมูลที่แก้ไขแต่ยังไม่ได้บันทึก ต้องการปิดและทิ้งการแก้ไขหรือไม่?"
        onConfirm={handleConfirmClose}
        onClose={() => setShowCloseConfirm(false)}
      />
    </>
  );
};
