"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Stack,
} from "@mui/material";
import { Add, Delete, LightbulbOutlined } from "@mui/icons-material";
import { KDLevel } from "@prisma/client";
import { User } from "@/types/user";
import {
  OverallMetrics,
  KeywordReport,
  KeywordReportForm,
  KeywordRecommend,
  KeywordRecommendForm,
} from "@/types/metrics";

interface MetricsModalProps {
  open: boolean;
  onClose: () => void;
  customer: User | null;
  metricsData: OverallMetrics | null;
  keywordsData: KeywordReport[];
  onSaveMetrics: (data: Partial<OverallMetrics>) => Promise<void>;
  onAddKeyword: (data: KeywordReportForm) => Promise<void>;
  onDeleteKeyword: (id: string) => Promise<void>;
  recommendKeywordsData: KeywordRecommend[];
  onAddRecommendKeyword: (data: KeywordRecommendForm) => Promise<void>;
  onDeleteRecommendKeyword: (id: string) => Promise<void>;
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
  recommendKeywordsData,
  onAddRecommendKeyword,
  onDeleteRecommendKeyword,
}) => {
  const [metrics, setMetrics] = useState<Record<string, string | number>>({
    domainRating: "",
    healthScore: "",
    ageInYears: "",
    spamScore: "",
    organicTraffic: "",
    organicKeywords: "",
    backlinks: "",
    refDomains: "",
  });
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

  useEffect(() => {
    if (metricsData) {
      setMetrics({
        domainRating: metricsData.domainRating,
        healthScore: metricsData.healthScore,
        ageInYears: metricsData.ageInYears,
        spamScore: metricsData.spamScore,
        organicTraffic: metricsData.organicTraffic,
        organicKeywords: metricsData.organicKeywords,
        backlinks: metricsData.backlinks,
        refDomains: metricsData.refDomains,
      });
    } else {
      setMetrics({
        domainRating: "",
        healthScore: "",
        ageInYears: "",
        spamScore: "",
        organicTraffic: "",
        organicKeywords: "",
        backlinks: "",
        refDomains: "",
      });
    }
  }, [metricsData]);

  const handleMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetrics({ ...metrics, [e.target.name]: e.target.value });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewKeyword({
      ...newKeyword,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleKeywordSelectChange = (e: SelectChangeEvent<KDLevel>) => {
    setNewKeyword({ ...newKeyword, kd: e.target.value as KDLevel });
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword) return;
    await onAddKeyword(newKeyword);
    setNewKeyword({
      keyword: "",
      position: 0,
      traffic: 0,
      kd: KDLevel.EASY,
      isTopReport: false,
    });
  };

  const handleRecommendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewRecommend((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value === "" ? null : value,
    }));
  };

  const handleRecommendSelectChange = (e: SelectChangeEvent<KDLevel | "">) => {
    setNewRecommend((prev) => ({
      ...prev,
      kd: e.target.value === "" ? null : (e.target.value as KDLevel),
    }));
  };

  const handleAddRecommend = async () => {
    if (!newRecommend.keyword) return;
    await onAddRecommendKeyword(newRecommend);
    setNewRecommend({
      keyword: "",
      kd: null,
      isTopReport: false,
      note: "",
    });
  };

  if (!customer) return null;

  return (
    <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(4px)" }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", md: 900 },
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          จัดการข้อมูล Domain
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          ลูกค้า: <span style={{ fontWeight: 600 }}>{customer.name}</span>
        </Typography>

        {/* Overall Metrics Form */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            คุณภาพ Domain (Overall Metrics)
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <TextField
              name="domainRating"
              label="Domain Rating"
              type="number"
              value={metrics.domainRating}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="healthScore"
              label="Health Score"
              type="number"
              value={metrics.healthScore}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="ageInYears"
              label="Age (Years)"
              type="number"
              value={metrics.ageInYears}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="spamScore"
              label="Spam Score"
              type="number"
              value={metrics.spamScore}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="organicTraffic"
              label="Organic Traffic"
              type="number"
              value={metrics.organicTraffic}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="organicKeywords"
              label="Organic Keywords"
              type="number"
              value={metrics.organicKeywords}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="backlinks"
              label="Backlinks"
              type="number"
              value={metrics.backlinks}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
            <TextField
              name="refDomains"
              label="Ref Domains"
              type="number"
              value={metrics.refDomains}
              onChange={handleMetricsChange}
              fullWidth
              size="small"
            />
          </Box>
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onSaveMetrics(metrics)}
            >
              บันทึก Metrics
            </Button>
          </Box>
        </Paper>

        {/* Keyword Report Section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            รายงานคีย์เวิร์ด (Keyword Report)
          </Typography>
          {/* Add Keyword Form */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
            <TextField
              name="keyword"
              label="Keyword"
              value={newKeyword.keyword}
              onChange={handleKeywordChange}
              size="small"
              sx={{ minWidth: 200, flex: 1 }}
            />
            <TextField
              name="position"
              label="Position"
              type="number"
              value={newKeyword.position}
              onChange={handleKeywordChange}
              size="small"
              sx={{ width: 100 }}
            />
            <TextField
              name="traffic"
              label="Traffic"
              type="number"
              value={newKeyword.traffic}
              onChange={handleKeywordChange}
              size="small"
              sx={{ width: 100 }}
            />
            <FormControl size="small" sx={{ width: 100 }}>
              <InputLabel>KD</InputLabel>
              <Select
                name="kd"
                value={newKeyword.kd}
                label="KD"
                onChange={handleKeywordSelectChange}
              >
                {Object.values(KDLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  name="isTopReport"
                  checked={newKeyword.isTopReport}
                  onChange={handleKeywordChange}
                  size="small"
                />
              }
              label="Top"
            />
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={handleAddKeyword}
              size="small"
            >
              เพิ่ม
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {/* Keywords List */}
          <List dense>
            {keywordsData.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                ยังไม่มีข้อมูลคีย์เวิร์ด
              </Typography>
            ) : (
              keywordsData.map((kw) => (
                <ListItem
                  key={kw.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDeleteKeyword(kw.id)}
                    >
                      <Delete color="error" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={kw.keyword}
                    secondary={`Pos: ${kw.position || "N/A"} - Traffic: ${
                      kw.traffic
                    } - KD: ${kw.kd}${kw.isTopReport ? " - Top Report" : ""}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Keyword Recommend Section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <LightbulbOutlined color="warning" />
            <Typography variant="h6" fontWeight={600}>
              Keyword แนะนำ
            </Typography>
          </Stack>

          {/* Add Form ที่เหมือนกับ Keyword Report */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap" }}
            alignItems="center"
          >
            <TextField
              name="keyword"
              label="Keyword"
              value={newRecommend.keyword}
              onChange={handleRecommendChange}
              size="small"
              sx={{ minWidth: 200, flex: 1 }}
            />
            <FormControl size="small" sx={{ width: 100 }}>
              <InputLabel>KD</InputLabel>
              <Select
                name="kd"
                value={newRecommend.kd || ""}
                label="KD"
                onChange={handleRecommendSelectChange}
              >
                <MenuItem value="">
                  <em>ไม่ระบุ</em>
                </MenuItem>
                {Object.values(KDLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  name="isTopReport"
                  checked={newRecommend.isTopReport}
                  onChange={handleRecommendChange}
                  size="small"
                />
              }
              label="Top"
            />
            <Button
              startIcon={<Add />}
              variant="contained"
              color="warning"
              onClick={handleAddRecommend}
              size="small"
            >
              แนะนำ
            </Button>
          </Stack>
          <TextField
            name="note"
            label="หมายเหตุ (ไม่บังคับ)"
            value={newRecommend.note || ""}
            onChange={handleRecommendChange}
            size="small"
            fullWidth
          />

          <Divider sx={{ my: 2 }} />
          {/* List ที่แสดงข้อมูลใหม่ */}
          <List dense>
            {recommendKeywordsData.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                ยังไม่มี Keyword ที่แนะนำ
              </Typography>
            ) : (
              recommendKeywordsData.map((kw) => (
                <ListItem
                  key={kw.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => onDeleteRecommendKeyword(kw.id)}
                    >
                      <Delete color="error" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={kw.keyword}
                    secondary={`KD: ${kw.kd || "N/A"}${
                      kw.isTopReport ? " - Top" : ""
                    }${kw.note ? ` - Note: ${kw.note}` : ""}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button variant="outlined" onClick={onClose}>
            ปิด
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
