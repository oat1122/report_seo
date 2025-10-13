import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";

const scrollToPackages = () => {
  const section = document.querySelector("#packages");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const HeroSection: React.FC = () => {
  return (
    <Box
      component="section"
      sx={{
        py: 15,
        textAlign: "center",
        background: (theme) =>
          `radial-gradient(circle, ${theme.palette.info.main}1A, ${theme.palette.background.default} 70%)`,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h1"
          component="h1"
          sx={{
            background: (theme) =>
              `-webkit-linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
          }}
        >
          ขับเคลื่อนธุรกิจของคุณสู่หน้าแรก ด้วยแพ็คเกจ SEO ที่คุ้มค่าที่สุด
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          เรามีแพ็คเกจที่หลากหลาย ตอบโจทย์ทุกขนาดธุรกิจ
          พร้อมทีมงานมืออาชีพที่จะพาเว็บไซต์ของคุณติดอันดับและเติบโตอย่างยั่งยืน
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={scrollToPackages}
        >
          ดูแพ็คเกจของเรา
        </Button>
      </Container>
    </Box>
  );
};
