"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CardMedia,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  AutoAwesomeOutlined,
  Close,
  ArrowBack,
  ArrowForward,
  Visibility,
} from "@mui/icons-material";
import { AiOverview } from "@/types/metrics";

interface AiOverviewCardProps {
  aiOverviews: AiOverview[];
}

export const AiOverviewCard: React.FC<AiOverviewCardProps> = ({
  aiOverviews,
}) => {
  // Dialog state: which AI Overview item is being viewed
  const [dialogItem, setDialogItem] = useState<AiOverview | null>(null);

  // Lightbox state for full-size image
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleOpenDialog = (item: AiOverview) => {
    setDialogItem(item);
  };

  const handleCloseDialog = () => {
    setDialogItem(null);
  };

  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrev = () => {
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : lightboxImages.length - 1
    );
  };

  const handleNext = () => {
    setLightboxIndex((prev) =>
      prev < lightboxImages.length - 1 ? prev + 1 : 0
    );
  };

  if (aiOverviews.length === 0) return null;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          background: "linear-gradient(to bottom, #FFFFFF, #F8F9FA)",
        }}
      >
        {/* Header - matching KeywordReportTable style */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AutoAwesomeOutlined sx={{ color: "#fff", fontSize: 32 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                background: "linear-gradient(to right, #fff, #e0e7ff)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Overview
            </Typography>
          </Box>
        </Box>

        {/* List of AI Overview items */}
        <List disablePadding>
          {aiOverviews.map((item, index) => (
            <ListItem
              key={item.id}
              sx={{
                py: 1.5,
                px: 3,
                borderBottom:
                  index < aiOverviews.length - 1
                    ? "1px solid #E2E8F0"
                    : "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "#F1F5F9",
                  transform: "translateX(4px)",
                  boxShadow: "inset 4px 0 0 #667eea",
                },
              }}
            >
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{ fontWeight: 600 }}
                secondary={`${item.images.length} รูปภาพ`}
                secondaryTypographyProps={{
                  variant: "caption",
                  color: "text.secondary",
                }}
              />
              <ListItemSecondaryAction>
                <Tooltip title="ดูรูปภาพ">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    color="primary"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Image Dialog */}
      <Dialog
        open={!!dialogItem}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        {dialogItem && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeOutlined color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight={600}>
                  {dialogItem.title}
                </Typography>
              </Stack>
              <IconButton size="small" onClick={handleCloseDialog}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {dialogItem.images.map((img, imgIndex) => (
                  <CardMedia
                    key={img.id}
                    component="img"
                    image={img.imageUrl}
                    alt={`${dialogItem.title} - ${imgIndex + 1}`}
                    onClick={() =>
                      handleOpenLightbox(
                        dialogItem.images.map((i) => i.imageUrl),
                        imgIndex
                      )
                    }
                    sx={{
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      borderRadius: 2,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "#F8F9FA",
                      transition: "box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Lightbox Modal (full-size image) */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "blur(8px)", bgcolor: "rgba(0,0,0,0.8)" },
          },
        }}
      >
        <Box sx={{ position: "relative", outline: "none" }}>
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: "absolute",
              top: -40,
              right: 0,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <Close />
          </IconButton>

          {lightboxImages.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  left: -50,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowBack />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  right: -50,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowForward />
              </IconButton>
            </>
          )}

          <Box
            component="img"
            src={lightboxImages[lightboxIndex]}
            alt="AI Overview"
            sx={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 2,
            }}
          />

          {lightboxImages.length > 1 && (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", mt: 1, color: "white" }}
            >
              {lightboxIndex + 1} / {lightboxImages.length}
            </Typography>
          )}
        </Box>
      </Dialog>
    </>
  );
};
