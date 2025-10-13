"use client";

import React from "react";
import { ThemeProvider, Box } from "@mui/material";
import { theme } from "@/theme/theme";
import { useMobileDrawer } from "@/components/Home/hooks/useMobileDrawer";
import { Header } from "@/components/Home/subcomponents/Header";
import { HeroSection } from "@/components/Home/subcomponents/HeroSection";
import { ServicesSection } from "@/components/Home/subcomponents/ServicesSection";
import { CTASection } from "@/components/Home/subcomponents/CTASection";
import { StatsSection } from "@/components/Home/subcomponents/StatsSection";
import { FAQSection } from "@/components/Home/subcomponents/FAQSection";
import { Footer } from "@/components/Home/subcomponents/Footer";

const HomePage: React.FC = () => {
  const { mobileOpen, handleDrawerToggle, handleDrawerClose } =
    useMobileDrawer();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ backgroundColor: "background.default", color: "text.primary" }}
      >
        <Header
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          onDrawerClose={handleDrawerClose}
        />

        <main>
          <HeroSection />
          <ServicesSection />
          <CTASection />
          <StatsSection />
          <FAQSection />
        </main>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
