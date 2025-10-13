import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";

export const CTASection: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8, textAlign: "center" }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          color="primary"
          gutterBottom
        >
          บริการ SEO ช่วยอะไร?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          ช่วยยกระดับเว็บไซต์ของคุณให้เป็นที่รู้จักมากขึ้นในโลกออนไลน์
          ด้วยการปรับปรุงเนื้อหาและโครงสร้างของเว็บไซต์ให้เหมาะสมกับการค้นหา
          เพิ่มการเข้าถึง และทำให้เว็บไซต์ของคุณทำงานได้เต็มประสิทธิภาพ
        </Typography>
        <Button variant="contained" color="secondary" size="large">
          เช็คราคาแพ็คเกจ
        </Button>
      </Container>
    </Box>
  );
};