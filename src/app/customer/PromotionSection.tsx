import { Box, Chip, Typography, Stack } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PromotionGrid from "./PromotionGrid";

export default function PromotionSection() {
  return (
    <Box component="section" sx={{ my: 6 }} aria-labelledby="promotion-heading">
      <Stack spacing={1.5} alignItems="center" sx={{ mb: 4, textAlign: "center" }}>
        <Chip
          icon={<LocalOfferIcon />}
          label="โปรโมชันพิเศษ"
          color="info"
          sx={{
            fontSize: "0.95rem",
            fontWeight: 700,
            px: 1,
            py: 2.5,
            "& .MuiChip-icon": { fontSize: "1.25rem" },
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1.5}
        >
          <CardGiftcardIcon sx={{ fontSize: "2rem", color: "#9592ff" }} />
          <Typography
            id="promotion-heading"
            variant="h3"
            component="h2"
            sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            แพ็กเกจสุดพิเศษสำหรับคุณ
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          เลือกแพ็กเกจที่เหมาะสมกับความต้องการของคุณ
        </Typography>
      </Stack>

      <PromotionGrid />
    </Box>
  );
}
