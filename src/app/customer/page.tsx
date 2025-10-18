import { requireCustomer } from "@/lib/auth-utils";
import { CustomerOnly } from "@/components/Login/subcomponents/RoleGuard";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import Link from "next/link";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import LockIcon from "@mui/icons-material/Lock";
import PromotionSection from "./PromotionSection";

export default async function CustomerDashboard() {
  // Server-side protection
  const session = await requireCustomer();

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section - Gradient Hero */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            mb: 5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: "300px",
              height: "300px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -100,
              left: -100,
              width: "400px",
              height: "400px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "3rem" } }}
              >
                ยินดีต้อนรับ!
              </Typography>
              <WavingHandIcon
                sx={{ fontSize: { xs: "2rem", md: "3rem" }, color: "#FFD700" }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{ opacity: 0.95, fontWeight: 600, mb: 1 }}
            >
              {session.user.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontSize: "1.1rem", maxWidth: "800px" }}
            >
              นี่คือแดชบอร์ดของคุณ คุณสามารถดูรายงาน SEO,
              ติดตามประสิทธิภาพเว็บไซต์ และรับโปรโมชันพิเศษได้ที่นี่
            </Typography>
          </Box>
        </Paper>

        {/* Promotion Section - Highlighted */}
        <PromotionSection />

        {/* Quick Actions Section */}
        <Box sx={{ my: 6 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: "2.5rem", color: "#667eea" }} />
              เมนูด่วน
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.1rem" }}
            >
              เข้าถึงฟีเจอร์สำคัญได้อย่างรวดเร็ว
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            {/* SEO Report Card */}
            <Link
              href="/customer/report"
              passHref
              style={{ textDecoration: "none" }}
            >
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "2px solid #E2E8F0",
                  height: "100%",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.25)",
                    borderColor: "#667eea",
                    transform: "translateY(-6px)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "5px",
                    height: "100%",
                    background:
                      "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                    transform: "scaleY(0)",
                    transition: "transform 0.3s ease",
                  },
                  "&:hover::before": {
                    transform: "scaleY(1)",
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                        boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <AssessmentIcon sx={{ color: "white", fontSize: 36 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{ fontWeight: 700, color: "#1a202c", mb: 0.5 }}
                      >
                        รายงาน SEO
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#667eea",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ดูเลย →
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: "1rem", lineHeight: 1.7 }}
                  >
                    ติดตามประสิทธิภาพของคุณด้วยรายงาน Keyword, Domain Rating
                    และข้อมูลเชิงลึกที่ช่วยพัฒนาเว็บไซต์
                  </Typography>
                </CardContent>
              </Card>
            </Link>

            {/* Contact Support Card */}
            <Card
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "2px solid #E2E8F0",
                height: "100%",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 12px 32px rgba(245, 87, 108, 0.25)",
                  borderColor: "#f5576c",
                  transform: "translateY(-6px)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "5px",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, #f093fb 0%, #f5576c 100%)",
                  transform: "scaleY(0)",
                  transition: "transform 0.3s ease",
                },
                "&:hover::before": {
                  transform: "scaleY(1)",
                },
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 3,
                      boxShadow: "0 8px 16px rgba(245, 87, 108, 0.3)",
                    }}
                  >
                    <SupportAgentIcon sx={{ color: "white", fontSize: 36 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 700, color: "#1a202c", mb: 0.5 }}
                    >
                      ติดต่อเจ้าหน้าที่
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#f5576c",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      พร้อมช่วยเหลือ 24/7
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "1rem", lineHeight: 1.7 }}
                >
                  สอบถามหรือขอคำปรึกษาเกี่ยวกับ SEO จากทีมผู้เชี่ยวชาญของเรา
                  พร้อมให้บริการตลอด 24 ชั่วโมง
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Client-side protection example */}
        <CustomerOnly>
          <Box mt={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  bottom: -50,
                  right: -50,
                  width: "250px",
                  height: "250px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -30,
                  left: -30,
                  width: "150px",
                  height: "150px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "50%",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <LockIcon sx={{ fontSize: "1.75rem" }} />
                  ข้อมูลเฉพาะลูกค้า
                </Typography>
                <Typography sx={{ opacity: 0.95, fontSize: "1.1rem" }}>
                  เนื้อหาส่วนตัวที่เฉพาะลูกค้าเท่านั้นที่เห็นได้
                  คุณสามารถเข้าถึงฟีเจอร์พิเศษและข้อมูลส่วนตัวของคุณได้ที่นี่
                </Typography>
              </Box>
            </Paper>
          </Box>
        </CustomerOnly>
      </Container>
    </DashboardLayout>
  );
}
