"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Close,
  ImageOutlined,
  Edit,
  Save,
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
  showSubmitButton?: boolean;
  onStateChange?: (state: {
    canSubmit: boolean;
    isSubmitting: boolean;
  }) => void;
}

export interface AiOverviewSectionHandle {
  submit: () => Promise<void>;
  canSubmit: boolean;
  isSubmitting: boolean;
}

export const AiOverviewSection = forwardRef<
  AiOverviewSectionHandle,
  AiOverviewSectionProps
>(function AiOverviewSection(
  {
    aiOverviews,
    isLoading,
    onAdd,
    onUpdate,
    onDelete,
    showSubmitButton = true,
    onStateChange,
  },
  ref,
) {
  const [title, setTitle] = useState("");
  const [displayDate, setDisplayDate] = useState<Dayjs | null>(dayjs());
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const canSubmit =
    title.trim().length > 0 && files.length > 0 && !isSubmitting;

  useEffect(() => {
    onStateChange?.({
      canSubmit,
      isSubmitting,
    });
  }, [canSubmit, isSubmitting, onStateChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > 3) {
      alert("อัปโหลดรูปภาพได้สูงสุด 3 รูป");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || files.length === 0 || isSubmitting) return;

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

      setTitle("");
      setDisplayDate(dayjs());
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    } finally {
      setIsSubmitting(false);
    }
  }, [displayDate, files, isSubmitting, onAdd, previews, title]);

  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmit,
      canSubmit,
      isSubmitting,
    }),
    [canSubmit, handleSubmit, isSubmitting],
  );

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

    setEditFiles((prev) => [...prev, ...selectedFiles]);
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
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              เพิ่ม AI Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              เพิ่มหัวข้อและภาพประกอบสำหรับรายงาน AI Overview
              โดยอัปโหลดได้สูงสุด 3 รูป
            </Typography>
          </Box>

          <TextField
            label="หัวข้อ AI Overview"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            fullWidth
            placeholder="เช่น คีย์เวิร์ด SEO ติด AI Overview แล้ว"
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

          <Box>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= 3}
                size="small"
              >
                เลือกรูปภาพ ({files.length}/3)
              </Button>
              <Typography variant="body2" color="text.secondary">
                รองรับไฟล์ JPG และ PNG
              </Typography>
            </Stack>

            {previews.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.5, flexWrap: "wrap" }}
              >
                {previews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 108,
                      height: 108,
                      borderRadius: 2,
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
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "white",
                        p: 0.4,
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

          {showSubmitButton && (
            <Stack direction="row" justifyContent="flex-end">
              <Button
                startIcon={
                  isSubmitting ? <CircularProgress size={16} /> : <Save />
                }
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="medium"
              >
                {isSubmitting ? "กำลังอัปโหลด..." : "บันทึก AI Overview"}
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : aiOverviews.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 3, textAlign: "center" }}
        >
          <Typography variant="body2" color="text.secondary">
            ยังไม่มี AI Overview
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {aiOverviews.map((item) => (
            <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ pb: 1.5 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ImageOutlined color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        วันที่แสดงผล{" "}
                        {dayjs(item.displayDate).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={`${item.images.length} รูป`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>

              {item.images.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ px: 2, pb: 1.5, flexWrap: "wrap" }}
                >
                  {item.images.map((img) => (
                    <CardMedia
                      key={img.id}
                      component="img"
                      image={img.imageUrl}
                      alt={item.title}
                      sx={{
                        width: 128,
                        height: 88,
                        objectFit: "cover",
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ))}
                </Stack>
              )}

              <CardActions
                sx={{ justifyContent: "flex-end", pt: 0, px: 2, pb: 2 }}
              >
                <Button
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => handleEdit(item)}
                >
                  แก้ไข
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete fontSize="small" />}
                  onClick={() => onDelete(item.id)}
                >
                  ลบ
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      {editingItem && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            px: 2,
          }}
          onClick={handleCloseEdit}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    แก้ไข AI Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ปรับหัวข้อ วันที่แสดงผล และจัดการรูปภาพได้ในหน้าต่างนี้
                  </Typography>
                </Box>
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
                            width: 108,
                            height: 108,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: isMarkedForDeletion
                              ? "error.main"
                              : "divider",
                            opacity: isMarkedForDeletion ? 0.45 : 1,
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
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(76, 175, 80, 0.9)",
                                color: "white",
                                p: 0.4,
                                "&:hover": {
                                  bgcolor: "rgba(76, 175, 80, 1)",
                                },
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
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(244, 67, 54, 0.9)",
                                color: "white",
                                p: 0.4,
                                "&:hover": {
                                  bgcolor: "rgba(244, 67, 54, 1)",
                                },
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

              <Box>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleEditFileChange}
                  style={{ display: "none" }}
                />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
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
                  <Typography variant="body2" color="text.secondary">
                    รวมรูปเดิมและรูปใหม่ได้สูงสุด 3 รูป
                  </Typography>
                </Stack>

                {editPreviews.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1.5, flexWrap: "wrap" }}
                  >
                    {editPreviews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          width: 108,
                          height: 108,
                          borderRadius: 2,
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
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.55)",
                            color: "white",
                            p: 0.4,
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

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
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
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}
    </>
  );
});
