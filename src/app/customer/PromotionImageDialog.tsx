"use client";

import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

interface PromotionImageDialogProps {
  src: string | null;
  onClose: () => void;
}

export function PromotionImageDialog({
  src,
  onClose,
}: PromotionImageDialogProps) {
  return (
    <Dialog
      open={!!src}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="promotion-image-dialog"
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
        onClick={onClose}
        aria-label="ปิดรูปภาพ"
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          bgcolor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          zIndex: 1,
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.9)" },
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
        {src && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={src}
              alt="โปรโมชันขนาดเต็ม"
              width={1200}
              height={800}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                cursor: "zoom-out",
              }}
              onClick={onClose}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
