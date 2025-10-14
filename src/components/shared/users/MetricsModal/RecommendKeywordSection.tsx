import React from "react";
import {
  TextField,
  Button,
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
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { KDLevel } from "@prisma/client";
import { KeywordRecommend, KeywordRecommendForm } from "@/types/metrics";

interface RecommendKeywordSectionProps {
  newRecommend: KeywordRecommendForm;
  recommendKeywordsData: KeywordRecommend[];
  onRecommendChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecommendSelectChange: (e: SelectChangeEvent<KDLevel | "">) => void;
  onAddRecommend: () => void;
  onDeleteRecommendKeyword: (id: string) => void;
}

export const RecommendKeywordSection: React.FC<
  RecommendKeywordSectionProps
> = ({
  newRecommend,
  recommendKeywordsData,
  onRecommendChange,
  onRecommendSelectChange,
  onAddRecommend,
  onDeleteRecommendKeyword,
}) => (
  <>
    {/* Add Recommend Form */}
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ flexWrap: "wrap" }}
        alignItems="center"
      >
        <TextField
          name="keyword"
          label="Keyword"
          value={newRecommend.keyword}
          onChange={onRecommendChange}
          size="small"
          sx={{ minWidth: 200, flex: 1 }}
        />
        <FormControl size="small" sx={{ width: 120 }}>
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
              onChange={onRecommendChange}
              size="small"
            />
          }
          label="Top"
        />
        <Button
          startIcon={<Add />}
          variant="contained"
          color="warning"
          onClick={onAddRecommend}
          size="medium"
        >
          แนะนำ
        </Button>
      </Stack>
      <TextField
        name="note"
        label="หมายเหตุ (ไม่บังคับ)"
        value={newRecommend.note || ""}
        onChange={onRecommendChange}
        size="small"
        fullWidth
      />
    </Stack>

    <Divider sx={{ my: 2 }} />

    {/* Recommend Keywords List */}
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
  </>
);
