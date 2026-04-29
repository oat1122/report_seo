import type { Metadata } from "next";
import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import Link from "next/link";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PromotionSection from "./PromotionSection";

// Theme palette literal — server components ส่ง function-sx ข้าม RSC boundary ไม่ได้
const INFO_MAIN = "#9592ff";
const INFO_DARK = "#6c68e8";
const SECONDARY_MAIN = "#31fb4c";
const PRIMARY_DARK = "#2f2f2f";

const ACCENT = {
  info: {
    main: INFO_MAIN,
    iconColor: "#FFFFFF",
    shadowAlpha: `${INFO_MAIN}40`,
    hoverShadow: `${INFO_MAIN}33`,
  },
  secondary: {
    main: SECONDARY_MAIN,
    iconColor: PRIMARY_DARK,
    shadowAlpha: `${SECONDARY_MAIN}40`,
    hoverShadow: `${SECONDARY_MAIN}33`,
  },
} as const;

export const metadata: Metadata = {
  title: "Dashboard | SEO Report",
};

export default async function CustomerDashboard() {
  const session = await requireCustomer();

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero — info → info.dark gradient */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            mb: 5,
            background: `linear-gradient(135deg, ${INFO_MAIN} 0%, ${INFO_DARK} 100%)`,
            color: "#FFFFFF",
          }}
        >
          <Stack spacing={1}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "inherit",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              ยินดีต้อนรับ
            </Typography>
            <Typography
              variant="h5"
              sx={{ opacity: 0.95, fontWeight: 600, color: "inherit" }}
            >
              {session.user.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontSize: "1.05rem",
                maxWidth: "640px",
                color: "inherit",
              }}
            >
              ดูรายงาน SEO ติดตามประสิทธิภาพเว็บไซต์ และรับโปรโมชันพิเศษได้ที่นี่
            </Typography>
          </Stack>
        </Paper>

        {/* Promotion */}
        <PromotionSection />

        {/* Quick Actions */}
        <Box sx={{ my: 6 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TrendingUpIcon sx={{ fontSize: "2rem", color: INFO_MAIN }} />
              <Typography
                variant="h3"
                component="h2"
                sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}
              >
                เมนูด่วน
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              เข้าถึงฟีเจอร์สำคัญได้อย่างรวดเร็ว
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            <QuickActionCard
              href="/customer/report"
              accent="info"
              icon={<AssessmentIcon sx={{ color: "#FFFFFF", fontSize: 32 }} />}
              title="รายงาน SEO"
              caption="ดูเลย"
              description="ติดตาม Keyword, Domain Rating และข้อมูลเชิงลึกที่ช่วยพัฒนาเว็บไซต์"
            />
            <QuickActionCard
              accent="secondary"
              icon={
                <SupportAgentIcon
                  sx={{ color: PRIMARY_DARK, fontSize: 32 }}
                />
              }
              title="ติดต่อเจ้าหน้าที่"
              caption="พร้อมช่วยเหลือ 24/7"
              description="ปรึกษา SEO จากทีมผู้เชี่ยวชาญ พร้อมให้บริการตลอด 24 ชั่วโมง"
            />
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
}

interface QuickActionCardProps {
  href?: string;
  accent: "info" | "secondary";
  icon: React.ReactNode;
  title: string;
  caption: string;
  description: string;
}

function QuickActionCard({
  href,
  accent,
  icon,
  title,
  caption,
  description,
}: QuickActionCardProps) {
  const a = ACCENT[accent];

  const card = (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "2px solid",
        borderColor: "divider",
        transition:
          "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${a.hoverShadow}`,
          borderColor: a.main,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          direction="row"
          spacing={2.5}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              backgroundColor: a.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 14px ${a.shadowAlpha}`,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.25 }}>
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: a.main,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              {caption} {href && "→"}
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={title}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {card}
      </Link>
    );
  }

  return card;
}
