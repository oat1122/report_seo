import React from "react";
import { Box, Container, Typography, Grid, Link } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { contactInfo } from "@/components/Home/constants/data";

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: "#0D1117", color: "#e0e0e0", py: 8 }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h4" color="white" gutterBottom>
              SEO PRIME
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ให้บริการด้านการตลาดออนไลน์ เกี่ยวกับจัดทำ SEO
              ครบวงจรดูแลโดยทีมการตลาดที่มีประสบการณ์
              เราพร้อมแล้วที่จะสร้างทีมที่แข็งแรงเพื่อเป็นหนึ่งในความสำเร็จสำคัญให้กับทุกธุรกิจของคุณ
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h4" color="white" gutterBottom>
              ADDRESS
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {contactInfo.address}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h4" color="white" gutterBottom>
              CONTACT US
            </Typography>
            <Box
              component="ul"
              sx={{
                p: 0,
                listStyle: "none",
                opacity: 0.8,
                "& li": { mb: 1 },
              }}
            >
              <li>
                <MailOutlineIcon sx={{ verticalAlign: "middle", mr: 1 }} />{" "}
                E-MAIL :{" "}
                <Link href={`mailto:${contactInfo.email}`} color="inherit">
                  {contactInfo.email}
                </Link>
              </li>
              <li>
                <ChatBubbleOutlineIcon
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />{" "}
                LINE :{" "}
                <Link href={contactInfo.line} color="inherit">
                  คลิกที่นี่
                </Link>
              </li>
              <li>
                <FacebookIcon sx={{ verticalAlign: "middle", mr: 1 }} />{" "}
                FACEBOOK :{" "}
                <Link href="#" color="inherit">
                  {contactInfo.facebook}
                </Link>
              </li>
              <li>
                <PhoneIcon sx={{ verticalAlign: "middle", mr: 1 }} /> TEL 1 :{" "}
                {contactInfo.phone1}
              </li>
              <li>
                <PhoneIcon sx={{ verticalAlign: "middle", mr: 1 }} /> TEL 2 :{" "}
                {contactInfo.phone2}
              </li>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ bgcolor: "black", py: 2, mt: 6, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Copyright 2025 © SEO Prime
        </Typography>
      </Box>
    </Box>
  );
};
