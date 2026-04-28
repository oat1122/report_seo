import { useState, useEffect, useCallback } from "react";
import { SelectChangeEvent } from "@mui/material";
import { KdLevel } from "@/types/kd";
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommend,
  KeywordRecommendForm,
} from "@/types/metrics";

type MetricsField = keyof OverallMetricsForm;
type MetricsState = Record<MetricsField, string | number>;
type ValidationErrors = Partial<Record<MetricsField, string>>;

const createDefaultMetrics = (): MetricsState => ({
  domainRating: "",
  healthScore: "",
  ageInYears: "",
  ageInMonths: 0,
  spamScore: "",
  organicTraffic: "",
  organicKeywords: "",
  backlinks: "",
  refDomains: "",
});

const sanitizeNumericValue = (value: string) => {
  if (value === "") return "";
  const normalized = Number(value);
  return Number.isNaN(normalized) ? value : normalized;
};

const validateMetrics = (metrics: MetricsState): ValidationErrors => {
  const errors: ValidationErrors = {};

  const validateMinZero = (field: MetricsField, label: string) => {
    const value = metrics[field];
    if (value === "") return;

    if (Number(value) < 0) {
      errors[field] = `${label} ต้องเป็น 0 หรือมากกว่า`;
    }
  };

  validateMinZero("domainRating", "Domain Rating");
  validateMinZero("healthScore", "Health Score");
  validateMinZero("ageInYears", "อายุโดเมน (ปี)");
  validateMinZero("ageInMonths", "อายุโดเมน (เดือน)");
  validateMinZero("spamScore", "Spam Score");
  validateMinZero("organicTraffic", "Organic Traffic");
  validateMinZero("organicKeywords", "Organic Keywords");
  validateMinZero("backlinks", "Backlinks");
  validateMinZero("refDomains", "Referring Domains");

  if (
    metrics.healthScore !== "" &&
    (Number(metrics.healthScore) < 0 || Number(metrics.healthScore) > 100)
  ) {
    errors.healthScore = "Health Score ต้องอยู่ระหว่าง 0-100";
  }

  if (
    metrics.spamScore !== "" &&
    (Number(metrics.spamScore) < 0 || Number(metrics.spamScore) > 100)
  ) {
    errors.spamScore = "Spam Score ต้องอยู่ระหว่าง 0-100";
  }

  if (
    metrics.ageInMonths !== "" &&
    (Number(metrics.ageInMonths) < 0 || Number(metrics.ageInMonths) > 11)
  ) {
    errors.ageInMonths = "เดือนต้องอยู่ระหว่าง 0-11";
  }

  return errors;
};

export const useMetricsModal = (metricsData: OverallMetricsForm | null) => {
  const [metrics, setMetrics] = useState<MetricsState>(createDefaultMetrics());
  const [newKeyword, setNewKeyword] = useState<KeywordReportForm>({
    keyword: "",
    position: 0,
    traffic: 0,
    kd: KdLevel.EASY,
    isTopReport: false,
  });
  const [newRecommend, setNewRecommend] = useState<KeywordRecommendForm>({
    keyword: "",
    kd: null,
    isTopReport: false,
    note: "",
  });
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingRecommendId, setEditingRecommendId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (metricsData) {
      setMetrics({
        domainRating: metricsData.domainRating || "",
        healthScore: metricsData.healthScore || "",
        ageInYears: metricsData.ageInYears || "",
        ageInMonths: metricsData.ageInMonths || 0,
        spamScore: metricsData.spamScore || "",
        organicTraffic: metricsData.organicTraffic || "",
        organicKeywords: metricsData.organicKeywords || "",
        backlinks: metricsData.backlinks || "",
        refDomains: metricsData.refDomains || "",
      });
      return;
    }

    setMetrics(createDefaultMetrics());
  }, [metricsData]);

  const handleMetricsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const field = e.target.name as MetricsField;
      setMetrics((prev) => ({
        ...prev,
        [field]: sanitizeNumericValue(e.target.value),
      }));
    },
    [],
  );

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setNewKeyword((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "position" || name === "traffic"
              ? sanitizeNumericValue(value)
              : value,
      }));
    },
    [],
  );

  const handleKeywordSelectChange = useCallback(
    (e: SelectChangeEvent<KdLevel>) => {
      setNewKeyword((prev) => ({
        ...prev,
        kd: e.target.value as KdLevel,
      }));
    },
    [],
  );

  const handleRecommendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setNewRecommend((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value === "" ? null : value,
      }));
    },
    [],
  );

  const handleRecommendSelectChange = useCallback(
    (e: SelectChangeEvent<KdLevel | "">) => {
      setNewRecommend((prev) => ({
        ...prev,
        kd: e.target.value === "" ? null : (e.target.value as KdLevel),
      }));
    },
    [],
  );

  const resetKeywordForm = () => {
    setNewKeyword({
      keyword: "",
      position: 0,
      traffic: 0,
      kd: KdLevel.EASY,
      isTopReport: false,
    });
  };

  const resetRecommendForm = () => {
    setNewRecommend({
      keyword: "",
      kd: null,
      isTopReport: false,
      note: "",
    });
  };

  const handleSetEditingKeyword = (keyword: KeywordReport) => {
    setEditingKeywordId(keyword.id);
    setNewKeyword({
      keyword: keyword.keyword,
      position: keyword.position ?? 0,
      traffic: keyword.traffic,
      kd: keyword.kd,
      isTopReport: keyword.isTopReport,
    });
  };

  const clearEditing = () => {
    setEditingKeywordId(null);
    resetKeywordForm();
  };

  const handleSetEditingRecommend = (keyword: KeywordRecommend) => {
    setEditingRecommendId(keyword.id);
    setNewRecommend({
      keyword: keyword.keyword,
      kd: keyword.kd,
      isTopReport: keyword.isTopReport,
      note: keyword.note || "",
    });
  };

  const clearRecommendEditing = () => {
    setEditingRecommendId(null);
    resetRecommendForm();
  };

  const validationErrors = validateMetrics(metrics);
  const isMetricsValid = Object.keys(validationErrors).length === 0;

  return {
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
    resetKeywordForm,
    resetRecommendForm,
    handleSetEditingKeyword,
    handleSetEditingRecommend,
    clearEditing,
    clearRecommendEditing,
  };
};
