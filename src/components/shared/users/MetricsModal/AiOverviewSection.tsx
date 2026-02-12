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
  Edit,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { AiOverview } from "@/types/metrics";

interface AiOverviewSectionProps {
  aiOverviews: AiOverview[];
  isLoading: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (aiOverviewId: string) => Promise<void>;
}

export const AiOverviewSection: React.FC<AiOverviewSectionProps> = ({
  aiOverviews,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  // Add form state
  const [title, setTitle] = useState("");
  const [displayDate, setDisplayDate] = useState<Dayjs | null>(dayjs());
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editingItem, setEditingItem] = useState<AiOverview | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDisplayDate, setEditDisplayDate] = useState<Dayjs | null>(null);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<AiOverview["images"]>(
    [],
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
      formData.append(
        "displayDate",
        displayDate?.toISOString() || dayjs().toISOString(),
      );
      files.forEach((file) => formData.append("files", file));

      await onAdd(formData);

      // Reset form
      setTitle("");
      setDisplayDate(dayjs());
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit handlers
  const handleEdit = (item: AiOverview) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDisplayDate(dayjs(item.displayDate));
    setExistingImages(item.images);
    setImagesToDelete([]);
    setEditFiles([]);
    setEditPreviews([]);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setEditTitle("");
    setEditDisplayDate(null);
    setExistingImages([]);
    setImagesToDelete([]);
    setEditFiles([]);
    editPreviews.forEach((url) => URL.revokeObjectURL(url));
    setEditPreviews([]);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remainingImages = existingImages.length - imagesToDelete.length;
    const totalImages =
      remainingImages + editFiles.length + selectedFiles.length;

    if (totalImages > 3) {
      alert("อัปโหลดรูปภาพได้สูงสุด 3 รูป");
      return;
    }

    const newFiles = [...editFiles, ...selectedFiles];
    setEditFiles(newFiles);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setEditPreviews((prev) => [...prev, ...newPreviews]);

    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleRemoveEditFile = (index: number) => {
    URL.revokeObjectURL(editPreviews[index]);
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
    setEditPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleRestoreExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  const handleEditSubmit = async () => {
    if (!editingItem || !editTitle.trim()) return;

    const remainingImages = existingImages.length - imagesToDelete.length;
    const totalImages = remainingImages + editFiles.length;

    if (totalImages === 0) {
      alert("ต้องมีรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append(
        "displayDate",
        editDisplayDate?.toISOString() || dayjs().toISOString(),
      );
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      editFiles.forEach((file) => formData.append("files", file));

      await onUpdate(editingItem.id, formData);
      handleCloseEdit();
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

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <DatePicker
            label="วันที่แสดงผล"
            value={displayDate}
            onChange={(newValue) => setDisplayDate(newValue)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
          />
        </LocalizationProvider>

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
                  color="primary"
                  onClick={() => handleEdit(item)}
                >
                  <Edit fontSize="small" />
                </IconButton>
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

      {/* Edit Dialog */}
      {editingItem && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={handleCloseEdit}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 3,
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={600}>
                  แก้ไข AI Overview
                </Typography>
                <IconButton size="small" onClick={handleCloseEdit}>
                  <Close />
                </IconButton>
              </Stack>

              <TextField
                label="หัวข้อ AI Overview"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                size="small"
                fullWidth
              />

              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="th"
              >
                <DatePicker
                  label="วันที่แสดงผล"
                  value={editDisplayDate}
                  onChange={(newValue) => setEditDisplayDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    รูปภาพปัจจุบัน
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {existingImages.map((img) => {
                      const isMarkedForDeletion = imagesToDelete.includes(
                        img.id,
                      );
                      return (
                        <Box
                          key={img.id}
                          sx={{
                            position: "relative",
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: isMarkedForDeletion
                              ? "error.main"
                              : "divider",
                            opacity: isMarkedForDeletion ? 0.5 : 1,
                          }}
                        >
                          <Box
                            component="img"
                            src={img.imageUrl}
                            alt="existing"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {isMarkedForDeletion ? (
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreExistingImage(img.id)}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "rgba(76,175,80,0.8)",
                                color: "white",
                                p: 0.3,
                                "&:hover": { bgcolor: "rgba(76,175,80,1)" },
                              }}
                            >
                              <Add sx={{ fontSize: 14 }} />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveExistingImage(img.id)}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "rgba(244,67,54,0.8)",
                                color: "white",
                                p: 0.3,
                                "&:hover": { bgcolor: "rgba(244,67,54,1)" },
                              }}
                            >
                              <Close sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* New Images */}
              <Box>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleEditFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={
                    existingImages.length -
                      imagesToDelete.length +
                      editFiles.length >=
                    3
                  }
                  size="small"
                >
                  เพิ่มรูปภาพใหม่ (
                  {existingImages.length -
                    imagesToDelete.length +
                    editFiles.length}
                  /3)
                </Button>

                {editPreviews.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    {editPreviews.map((preview, index) => (
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
                          onClick={() => handleRemoveEditFile(index)}
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

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleCloseEdit}>ยกเลิก</Button>
                <Button
                  variant="contained"
                  onClick={handleEditSubmit}
                  disabled={
                    !editTitle.trim() ||
                    existingImages.length -
                      imagesToDelete.length +
                      editFiles.length ===
                      0 ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
};
