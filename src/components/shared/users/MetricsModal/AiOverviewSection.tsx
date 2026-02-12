"use client";

import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Close,
  ImageOutlined,
} from "@mui/icons-material";
import { AiOverview } from "@/types/metrics";

interface AiOverviewSectionProps {
  aiOverviews: AiOverview[];
  isLoading: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (aiOverviewId: string) => Promise<void>;
}

export const AiOverviewSection: React.FC<AiOverviewSectionProps> = ({
  aiOverviews,
  isLoading,
  onAdd,
  onDelete,
}) => {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 3) {
      alert("อัปโหลดรูปภาพได้สูงสุด 3 รูป");
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // สร้าง preview URLs
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || files.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      files.forEach((file) => formData.append("files", file));

      await onAdd(formData);

      // Reset form
      setTitle("");
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add AI Overview Form */}
      <Stack spacing={2}>
        <TextField
          label="หัวข้อ AI Overview"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size="small"
          fullWidth
          placeholder="เช่น คีย์เวิร์ด xxx ติด AI Overview"
        />

        {/* File Upload Area */}
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= 3}
            size="small"
          >
            เลือกรูปภาพ ({files.length}/3)
          </Button>

          {/* Preview Selected Files */}
          {previews.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {previews.map((preview, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={preview}
                    alt={`preview-${index}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      p: 0.3,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Button
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <Add />}
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={!title.trim() || files.length === 0 || isSubmitting}
          size="medium"
        >
          {isSubmitting ? "กำลังอัปโหลด..." : "เพิ่ม AI Overview"}
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* AI Overview List */}
      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : aiOverviews.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          ยังไม่มี AI Overview
        </Typography>
      ) : (
        <Stack spacing={2}>
          {aiOverviews.map((item) => (
            <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ImageOutlined color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Chip
                    label={`${item.images.length} รูป`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>

              {/* Image Thumbnails */}
              {item.images.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ px: 2, pb: 1, flexWrap: "wrap" }}
                >
                  {item.images.map((img) => (
                    <CardMedia
                      key={img.id}
                      component="img"
                      image={img.imageUrl}
                      alt={item.title}
                      sx={{
                        width: 120,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ))}
                </Stack>
              )}

              <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(item.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
};
