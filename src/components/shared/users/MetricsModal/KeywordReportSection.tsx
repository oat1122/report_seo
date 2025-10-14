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
import { KeywordReport, KeywordReportForm } from "@/types/metrics";

interface KeywordReportSectionProps {
  newKeyword: KeywordReportForm;
  keywordsData: KeywordReport[];
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeywordSelectChange: (e: SelectChangeEvent<KDLevel>) => void;
  onAddKeyword: () => void;
  onDeleteKeyword: (id: string) => void;
}

export const KeywordReportSection: React.FC<KeywordReportSectionProps> = ({
  newKeyword,
  keywordsData,
  onKeywordChange,
  onKeywordSelectChange,
  onAddKeyword,
  onDeleteKeyword,
}) => (
  <>
    {/* Add Keyword Form */}
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ mb: 2, flexWrap: "wrap" }}
      alignItems="center"
    >
      <TextField
        name="keyword"
        label="Keyword"
        value={newKeyword.keyword}
        onChange={onKeywordChange}
        size="small"
        sx={{ minWidth: 200, flex: 1 }}
      />
      <TextField
        name="position"
        label="Position"
        type="number"
        value={newKeyword.position}
        onChange={onKeywordChange}
        size="small"
        sx={{ width: 100 }}
      />
      <TextField
        name="traffic"
        label="Traffic"
        type="number"
        value={newKeyword.traffic}
        onChange={onKeywordChange}
        size="small"
        sx={{ width: 100 }}
      />
      <FormControl size="small" sx={{ width: 120 }}>
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
      <FormControlLabel
        control={
          <Checkbox
            name="isTopReport"
            checked={newKeyword.isTopReport}
            onChange={onKeywordChange}
            size="small"
          />
        }
        label="Top"
      />
      <Button
        startIcon={<Add />}
        variant="contained"
        onClick={onAddKeyword}
        size="medium"
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
  </>
);
