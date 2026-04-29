"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import Image from "next/image";
import DiamondIcon from "@mui/icons-material/Diamond";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { PromotionImageDialog } from "./PromotionImageDialog";

type Accent = "info" | "secondary" | "primary";

interface PromotionItem {
  src: string;
  alt: string;
  badge: string;
  badgeIcon: React.ReactNode;
  accent: Accent;
  title: string;
  description: string;
  recommended?: boolean;
}

const PROMOTIONS: PromotionItem[] = [
  {
    src: "/img/Promotion/Basic.png",
    alt: "Basic Promotion - แพ็กเกจสำหรับผู้เริ่มต้น",
    badge: "BASIC",
    badgeIcon: <DiamondIcon sx={{ fontSize: "1.1rem" }} />,
    accent: "info",
    title: "แพ็กเกจเริ่มต้น",
    description: "เหมาะสำหรับธุรกิจขนาดเล็กที่ต้องการเริ่มต้นทำ SEO",
  },
  {
    src: "/img/Promotion/Business_Pro.png",
    alt: "Business Pro Promotion - แพ็กเกจสำหรับธุรกิจ",
    badge: "PRO",
    badgeIcon: <RocketLaunchIcon sx={{ fontSize: "1.1rem" }} />,
    accent: "secondary",
    title: "แพ็กเกจมืออาชีพ",
    description: "สำหรับธุรกิจที่ต้องการผลลัพธ์ SEO ที่เห็นผลชัดเจน",
    recommended: true,
  },
  {
    src: "/img/Promotion/Special_number.png",
    alt: "Special Number Promotion - แพ็กเกจพิเศษ",
    badge: "SPECIAL",
    badgeIcon: <AutoAwesomeIcon sx={{ fontSize: "1.1rem" }} />,
    accent: "primary",
    title: "แพ็กเกจพิเศษ",
    description: "แพ็กเกจสุดพิเศษที่ออกแบบมาเพื่อคุณโดยเฉพาะ",
  },
];

export default function PromotionGrid() {
  const [openImage, setOpenImage] = useState<string | null>(null);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {PROMOTIONS.map((promo) => (
          <PromotionCard
            key={promo.src}
            item={promo}
            onOpen={() => setOpenImage(promo.src)}
          />
        ))}
      </Box>

      <PromotionImageDialog
        src={openImage}
        onClose={() => setOpenImage(null)}
      />
    </>
  );
}

function PromotionCard({
  item,
  onOpen,
}: {
  item: PromotionItem;
  onOpen: () => void;
}) {
  const accentSx = (theme: Theme) => ({
    borderColor: theme.palette[item.accent].main,
    boxShadow: `0 12px 24px ${theme.palette[item.accent].main}33`,
  });

  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        border: "2px solid",
        borderColor: "divider",
        transition:
          "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": accentSx(theme),
        "&:focus-within": accentSx(theme),
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: theme.palette[item.accent].main,
          zIndex: 1,
        },
      })}
    >
      <CardActionArea
        onClick={onOpen}
        aria-label={`ขยายรูปโปรโมชัน ${item.title}`}
        sx={{ display: "block" }}
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio: "5 / 3",
            overflow: "hidden",
            "&:hover .zoom-overlay": { opacity: 1 },
          }}
        >
          <Box
            sx={(theme) => ({
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: theme.palette[item.accent].main,
              color: theme.palette[item.accent].contrastText,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "0.8rem",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              boxShadow: `0 4px 10px ${theme.palette[item.accent].main}66`,
            })}
          >
            {item.badgeIcon}
            {item.badge}
          </Box>

          {item.recommended && (
            <Chip
              label="แนะนำ"
              size="small"
              sx={(theme) => ({
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                fontWeight: 800,
                fontSize: "0.75rem",
                zIndex: 2,
                animation: "promo-pulse 2.4s ease-in-out infinite",
                "@keyframes promo-pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.04)" },
                },
              })}
            />
          )}

          {/* Zoom overlay */}
          <Box
            className="zoom-overlay"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0,
              transition: "opacity 0.25s ease",
              zIndex: 2,
              bgcolor: "rgba(0, 0, 0, 0.55)",
              borderRadius: "50%",
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <ZoomInIcon sx={{ color: "white", fontSize: 32 }} />
          </Box>

          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </Box>
      </CardActionArea>

      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={(theme) => ({
            fontWeight: 700,
            mb: 0.75,
            fontSize: "1.15rem",
            color: theme.palette[item.accent].main,
          })}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.65 }}
        >
          {item.description}
        </Typography>
      </CardContent>
    </Card>
  );
}
