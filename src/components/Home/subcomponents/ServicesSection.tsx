import React from "react";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { services } from "@/components/Home/constants/data";

export const ServicesSection: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8, bgcolor: "background.paper" }}>
      <Container maxWidth="lg" sx={{ textAlign: "center" }}>
        <Typography variant="h2" component="h2" color="primary" gutterBottom>
          บริการ SEO ของเรา
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
          เราทำอะไรบ้างเพื่อขับเคลื่อนธุรกิจของคุณสู่หน้าแรก
        </Typography>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card sx={{ textAlign: "center", p: 3, height: "100%" }}>
                <CardMedia sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}>
                  <Image
                    src={service.icon}
                    alt={`${service.title} icon`}
                    width={80}
                    height={80}
                  />
                </CardMedia>
                <CardContent>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
