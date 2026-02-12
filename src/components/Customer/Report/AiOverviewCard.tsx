"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardMedia,
  Modal,
  IconButton,
  Chip,
} from "@mui/material";
import {
  AutoAwesomeOutlined,
  Close,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { AiOverview } from "@/types/metrics";

interface AiOverviewCardProps {
  aiOverviews: AiOverview[];
}

export const AiOverviewCard: React.FC<AiOverviewCardProps> = ({
  aiOverviews,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <AutoAwesomeOutlined color="primary" />
          <Typography variant="h5" fontWeight={700}>
            AI Overview
          </Typography>
          <Chip
            label={`${aiOverviews.length} รายการ`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack spacing={3}>
          {aiOverviews.map((item) => {
            const imageUrls = item.images.map((img) => img.imageUrl);
            return (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden" }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                    {item.title}
                  </Typography>

                  {/* Image Gallery */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ flexWrap: "wrap", gap: 1.5 }}
                  >
                    {item.images.map((img, imgIndex) => (
                      <CardMedia
                        key={img.id}
                        component="img"
                        image={img.imageUrl}
                        alt={`${item.title} - ${imgIndex + 1}`}
                        onClick={() =>
                          handleOpenLightbox(imageUrls, imgIndex)
                        }
                        sx={{
                          width: { xs: "100%", sm: 280 },
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Card>
            );
          })}
        </Stack>
      </Paper>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        sx={{ backdropFilter: "blur(8px)" }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90vw",
            maxHeight: "90vh",
            outline: "none",
          }}
        >
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
              sx={{
                textAlign: "center",
                mt: 1,
                color: "white",
              }}
            >
              {lightboxIndex + 1} / {lightboxImages.length}
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};
