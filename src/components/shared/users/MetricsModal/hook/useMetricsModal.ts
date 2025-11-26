import { useState, useEffect, useCallback } from "react";
import { SelectChangeEvent } from "@mui/material";
import { KDLevel } from "@prisma/client";
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommendForm,
} from "@/types/metrics";

// Hook สำหรับจัดการ Logic ของ MetricsModal
export const useMetricsModal = (metricsData: OverallMetricsForm | null) => {
  const [metrics, setMetrics] = useState<Record<string, string | number>>({});
  const [newKeyword, setNewKeyword] = useState<KeywordReportForm>({
    keyword: "",
    position: 0,
    traffic: 0,
    kd: KDLevel.EASY,
    isTopReport: false,
  });
  const [newRecommend, setNewRecommend] = useState<KeywordRecommendForm>({
    keyword: "",
    kd: null,
    isTopReport: false,
    note: "",
  });
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);

  // Effect สำหรับ Sync ข้อมูล Metrics เมื่อมีการเปลี่ยนแปลง
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
    } else {
      // Reset form ถ้าไม่มีข้อมูล
      setMetrics({
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
    }
  }, [metricsData]);

  // Handlers สำหรับฟอร์มต่างๆ
  const handleMetricsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMetrics((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setNewKeyword((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleKeywordSelectChange = useCallback(
    (e: SelectChangeEvent<KDLevel>) => {
      setNewKeyword((prev) => ({
        ...prev,
        kd: e.target.value as KDLevel,
      }));
    },
    []
  );

  const handleRecommendChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setNewRecommend((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value === "" ? null : value,
      }));
    },
    []
  );

  const handleRecommendSelectChange = useCallback(
    (e: SelectChangeEvent<KDLevel | "">) => {
      setNewRecommend((prev) => ({
        ...prev,
        kd: e.target.value === "" ? null : (e.target.value as KDLevel),
      }));
    },
    []
  );

  // Function สำหรับ Reset ฟอร์ม Keyword
  const resetKeywordForm = () => {
    setNewKeyword({
      keyword: "",
      position: 0,
      traffic: 0,
      kd: KDLevel.EASY,
      isTopReport: false,
    });
  };

  // Function สำหรับ Reset ฟอร์ม Recommend Keyword
  const resetRecommendForm = () => {
    setNewRecommend({
      keyword: "",
      kd: null,
      isTopReport: false,
      note: "",
    });
  };

  // Function to set the form for editing a keyword
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

  // Function to clear the editing state
  const clearEditing = () => {
    setEditingKeywordId(null);
    resetKeywordForm();
  };

  return {
    metrics,
    newKeyword,
    newRecommend,
    editingKeywordId,
    handleMetricsChange,
    handleKeywordChange,
    handleKeywordSelectChange,
    handleRecommendChange,
    handleRecommendSelectChange,
    resetKeywordForm,
    resetRecommendForm,
    handleSetEditingKeyword,
    clearEditing,
  };
};
