import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Save } from "@mui/icons-material";
import { KdLevel, KD_LEVELS } from "@/types/kd";
import { KeywordRecommend, KeywordRecommendForm } from "@/types/metrics";

interface RecommendKeywordSectionProps {
  newRecommend: KeywordRecommendForm;
  recommendKeywordsData: KeywordRecommend[];
  editingRecommendId: string | null;
  onRecommendChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecommendSelectChange: (e: SelectChangeEvent<KdLevel | "">) => void;
  onAddRecommend: () => void;
  onSetEditingRecommend: (keyword: KeywordRecommend) => void;
  onClearEditingRecommend: () => void;
  onDeleteRecommendKeyword: (id: string) => void;
}

export const RecommendKeywordSection: React.FC<
  RecommendKeywordSectionProps
> = ({
  newRecommend,
  recommendKeywordsData,
  editingRecommendId,
  onRecommendChange,
  onRecommendSelectChange,
  onAddRecommend,
  onSetEditingRecommend,
  onClearEditingRecommend,
  onDeleteRecommendKeyword,
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Keyword Recommend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          บันทึกคีย์เวิร์ดที่แนะนำให้ลูกค้า พร้อมระดับความยากและหมายเหตุสั้น ๆ
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: editingRecommendId ? "warning.50" : "grey.50",
        }}
      >
        <Stack spacing={2}>
          {editingRecommendId && (
            <Alert severity="info">
              กำลังแก้ไข Keyword Recommend รายการเดิม
              สามารถปรับข้อมูลแล้วกดบันทึกการแก้ไขได้ทันที
            </Alert>
          )}

          <TextField
            name="keyword"
            label="Keyword"
            placeholder="เช่น เสื้อ"
            value={newRecommend.keyword}
            onChange={onRecommendChange}
            size="small"
            fullWidth
          />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, minmax(0, 1fr))",
              },
              alignItems: "center",
            }}
          >
            <FormControl
              size="small"
              fullWidth
              sx={{ gridColumn: { xs: "span 2", md: "span 2" } }}
            >
              <InputLabel>KD</InputLabel>
              <Select
                name="kd"
                value={newRecommend.kd || ""}
                label="KD"
                onChange={onRecommendSelectChange}
              >
                <MenuItem value="">
                  <em>ไม่ระบุ</em>
                </MenuItem>
                {KD_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                gridColumn: { xs: "span 2", md: "span 2" },
                minHeight: 40,
                display: "flex",
                alignItems: "center",
                px: 1,
                borderRadius: 1.5,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="isTopReport"
                    checked={newRecommend.isTopReport}
                    onChange={onRecommendChange}
                    size="small"
                  />
                }
                label="แสดงใน Top Report"
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          <TextField
            name="note"
            label="หมายเหตุ"
            placeholder="เช่น ยากมาก"
            value={newRecommend.note || ""}
            onChange={onRecommendChange}
            size="small"
            fullWidth
            multiline
            minRows={3}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            {editingRecommendId && (
              <Button onClick={onClearEditingRecommend}>ยกเลิก</Button>
            )}
            <Button
              startIcon={editingRecommendId ? <Save /> : <Add />}
              variant="contained"
              color="warning"
              onClick={onAddRecommend}
              size="medium"
              disabled={!newRecommend.keyword.trim()}
            >
              {editingRecommendId ? "บันทึกการแก้ไข" : "เพิ่ม Keyword แนะนำ"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          mb={1.5}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            รายการ Keyword แนะนำ
          </Typography>
          <Chip
            label={`${recommendKeywordsData.length} รายการ`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Stack>

        <List dense disablePadding>
          {recommendKeywordsData.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 2.5, textAlign: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                ยังไม่มี Keyword ที่แนะนำ
              </Typography>
            </Paper>
          ) : (
            recommendKeywordsData.map((kw) => (
              <Paper
                key={kw.id}
                variant="outlined"
                sx={{ mb: 1.5, borderRadius: 2.5 }}
              >
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => onSetEditingRecommend(kw)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => onDeleteRecommendKeyword(kw.id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Stack>
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {kw.keyword}
                        </Typography>
                        {kw.isTopReport && (
                          <Chip
                            label="Top Report"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                    secondary={`KD: ${kw.kd || "ไม่ระบุ"}${
                      kw.note ? ` | หมายเหตุ: ${kw.note}` : ""
                    }`}
                  />
                </ListItem>
              </Paper>
            ))
          )}
        </List>
      </Box>
    </Stack>
  </Paper>
);
