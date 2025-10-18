"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DiamondIcon from "@mui/icons-material/Diamond";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { useState } from "react";

export default function PromotionSection() {
  const [openImage, setOpenImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setOpenImage(imageSrc);
  };

  const handleClose = () => {
    setOpenImage(null);
  };

  return (
    <>
      <Box sx={{ my: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Chip
            icon={<LocalOfferIcon />}
            label="โปรโมชันพิเศษ"
            color="primary"
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              px: 2,
              py: 3,
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "& .MuiChip-icon": {
                color: "white",
                fontSize: "1.5rem",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <CardGiftcardIcon sx={{ fontSize: "2.5rem", color: "#667eea" }} />
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              แพ็กเกจสุดพิเศษสำหรับคุณ
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1.1rem" }}
          >
            เลือกแพ็กเกจที่เหมาะสมกับความต้องการของคุณ
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 4,
            mb: 2,
          }}
        >
          {/* Basic Package */}
          <Card
            elevation={0}
            sx={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "2px solid transparent",
              background:
                "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box",
              "&:hover": {
                transform: "translateY(-12px) scale(1.02)",
                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                border: "2px solid transparent",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() => handleImageClick("/img/Promotion/Basic.png")}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "rgba(102, 126, 234, 0.95)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  zIndex: 2,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <DiamondIcon sx={{ fontSize: "1.2rem" }} />
                BASIC
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  zIndex: 2,
                  bgcolor: "rgba(0, 0, 0, 0.6)",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    opacity: 1,
                  },
                  "parent:hover &": {
                    opacity: 1,
                  },
                }}
              >
                <ZoomInIcon sx={{ color: "white", fontSize: 36 }} />
              </Box>
              <Image
                src="/img/Promotion/Basic.png"
                alt="Basic Promotion - แพ็กเกจสำหรับผู้เริ่มต้น"
                width={500}
                height={300}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#667eea" }}
              >
                แพ็กเกจเริ่มต้น
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เหมาะสำหรับธุรกิจขนาดเล็กที่ต้องการเริ่มต้นทำ SEO
              </Typography>
            </CardContent>
          </Card>

          {/* Business Pro Package */}
          <Card
            elevation={0}
            sx={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "3px solid transparent",
              background:
                "linear-gradient(white, white) padding-box, linear-gradient(135deg, #f093fb 0%, #f5576c 100%) border-box",
              "&:hover": {
                transform: "translateY(-12px) scale(1.02)",
                boxShadow: "0 20px 40px rgba(245, 87, 108, 0.4)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() =>
                handleImageClick("/img/Promotion/Business_Pro.png")
              }
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  zIndex: 2,
                  boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <RocketLaunchIcon sx={{ fontSize: "1.2rem" }} />
                PRO
              </Box>
              <Chip
                label="แนะนำ"
                size="small"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: "#FFD700",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  zIndex: 2,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                  },
                }}
              />
              <Image
                src="/img/Promotion/Business_Pro.png"
                alt="Business Pro Promotion - แพ็กเกจสำหรับธุรกิจ"
                width={500}
                height={300}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#f5576c" }}
              >
                แพ็กเกจมืออาชีพ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                สำหรับธุรกิจที่ต้องการผลลัพธ์ SEO ที่เห็นผลชัดเจน
              </Typography>
            </CardContent>
          </Card>

          {/* Special Number Package */}
          <Card
            elevation={0}
            sx={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "2px solid transparent",
              background:
                "linear-gradient(white, white) padding-box, linear-gradient(135deg, #fa709a 0%, #fee140 100%) border-box",
              "&:hover": {
                transform: "translateY(-12px) scale(1.02)",
                boxShadow: "0 20px 40px rgba(250, 112, 154, 0.3)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #fa709a 0%, #fee140 100%)",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() =>
                handleImageClick("/img/Promotion/Special_number.png")
              }
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  zIndex: 2,
                  boxShadow: "0 4px 12px rgba(250, 112, 154, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: "1.2rem" }} />
                SPECIAL
              </Box>
              <Image
                src="/img/Promotion/Special_number.png"
                alt="Special Number Promotion - แพ็กเกจพิเศษ"
                width={500}
                height={300}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#fa709a" }}
              >
                แพ็กเกจพิเศษ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                แพ็กเกจสุดพิเศษที่ออกแบบมาเพื่อคุณโดยเฉพาะ
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Image Modal */}
      <Dialog
        open={!!openImage}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            bgcolor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            zIndex: 1,
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.9)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
            overflow: "hidden",
          }}
        >
          {openImage && (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={openImage}
                alt="Full size promotion image"
                width={1200}
                height={800}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onClick={handleClose}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
