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
import { Add, Delete, Edit, History, Save } from "@mui/icons-material";
import { KDLevel } from "@prisma/client";
import { KeywordReport, KeywordReportForm } from "@/types/metrics";

interface KeywordReportSectionProps {
  newKeyword: KeywordReportForm;
  keywordsData: KeywordReport[];
  editingKeywordId: string | null;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeywordSelectChange: (e: SelectChangeEvent<KDLevel>) => void;
  onAddOrUpdateKeyword: () => void;
  onDeleteKeyword: (id: string) => void;
  onSetEditing: (keyword: KeywordReport) => void;
  onClearEditing: () => void;
  onViewHistory: (keyword: KeywordReport) => void;
}

export const KeywordReportSection: React.FC<KeywordReportSectionProps> = ({
  newKeyword,
  keywordsData,
  editingKeywordId,
  onKeywordChange,
  onKeywordSelectChange,
  onAddOrUpdateKeyword,
  onDeleteKeyword,
  onSetEditing,
  onClearEditing,
  onViewHistory,
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Keyword Report
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          เพิ่มคีย์เวิร์ดหลักที่ต้องการติดตาม พร้อมอันดับ ทราฟฟิก
          และระดับความยาก
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: editingKeywordId ? "warning.50" : "grey.50",
        }}
      >
        <Stack spacing={2}>
          {editingKeywordId && (
            <Alert severity="info">
              กำลังแก้ไขคีย์เวิร์ดรายการเดิม
              สามารถปรับข้อมูลแล้วกดบันทึกการแก้ไขได้ทันที
            </Alert>
          )}

          <TextField
            name="keyword"
            label="Keyword"
            placeholder="เช่น รับทำ SEO สายขาว"
            value={newKeyword.keyword}
            onChange={onKeywordChange}
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
            <TextField
              name="position"
              label="Position"
              type="number"
              value={newKeyword.position}
              onChange={onKeywordChange}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              name="traffic"
              label="Traffic"
              type="number"
              value={newKeyword.traffic}
              onChange={onKeywordChange}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>KD</InputLabel>
              <Select
                name="kd"
                value={newKeyword.kd}
                label="KD"
                onChange={onKeywordSelectChange}
              >
                {Object.values(KDLevel).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
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
                    checked={newKeyword.isTopReport}
                    onChange={onKeywordChange}
                    size="small"
                  />
                }
                label="Top Report"
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            {editingKeywordId && (
              <Button onClick={onClearEditing} size="medium">
                ยกเลิก
              </Button>
            )}
            <Button
              startIcon={editingKeywordId ? <Save /> : <Add />}
              variant="contained"
              onClick={onAddOrUpdateKeyword}
              size="medium"
              color={editingKeywordId ? "secondary" : "primary"}
              disabled={!newKeyword.keyword.trim()}
            >
              {editingKeywordId ? "บันทึกการแก้ไข" : "เพิ่ม Keyword"}
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
            รายการคีย์เวิร์ดที่บันทึกแล้ว
          </Typography>
          <Chip
            label={`${keywordsData.length} รายการ`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>

        <List dense disablePadding>
          {keywordsData.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 2.5, textAlign: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีข้อมูลคีย์เวิร์ดในรายงาน
              </Typography>
            </Paper>
          ) : (
            keywordsData.map((kw) => (
              <Paper
                key={kw.id}
                variant="outlined"
                sx={{ mb: 1.5, borderRadius: 2.5 }}
              >
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <TooltipIconButton
                        label="ดูประวัติ"
                        onClick={() => onViewHistory(kw)}
                      >
                        <History />
                      </TooltipIconButton>
                      <TooltipIconButton
                        label="แก้ไข"
                        onClick={() => onSetEditing(kw)}
                      >
                        <Edit />
                      </TooltipIconButton>
                      <TooltipIconButton
                        label="ลบ"
                        onClick={() => onDeleteKeyword(kw.id)}
                      >
                        <Delete color="error" />
                      </TooltipIconButton>
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
                    secondary={`Position: ${kw.position ?? "-"} | Traffic: ${kw.traffic} | KD: ${kw.kd}`}
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

const TooltipIconButton = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <IconButton edge="end" aria-label={label} onClick={onClick}>
    {children}
  </IconButton>
);
