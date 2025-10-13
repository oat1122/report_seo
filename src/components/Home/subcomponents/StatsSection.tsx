import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { stats } from "@/components/Home/constants/data";

export const StatsSection: React.FC = () => {
  return (
    <Box
      component="section"
      sx={{
        py: 8,
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} textAlign="center">
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Typography variant="h2" component="p" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
